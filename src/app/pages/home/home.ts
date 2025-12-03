import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { TaskService } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { Project } from '../../models/project.model';
import { Task } from '../../models/task.model';
import { forkJoin } from 'rxjs';

interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  upcomingTasks: number;
}

interface RecentTask extends Task {
  projectTitle?: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  userName: string = '';
  loading = true;
  stats: DashboardStats = {
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    upcomingTasks: 0,
  };
  recentProjects: Project[] = [];
  upcomingTasks: RecentTask[] = [];
  overdueTasks: RecentTask[] = [];

  constructor(
    private projectService: ProjectService,
    private taskService: TaskService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserName();
    this.loadDashboardData();
  }

  loadUserName(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userName = user.displayName || user.email?.split('@')[0] || 'Utente';
    }
  }

  loadDashboardData(): void {
    this.projectService.getProjects().subscribe({
      next: (projects) => {
        this.stats.totalProjects = projects.length;
        this.recentProjects = projects.slice(0, 4);

        if (projects.length === 0) {
          this.loading = false;
          return;
        }

        // Load tasks for all projects
        const taskRequests = projects.map((p) => this.taskService.getTasksByProject(p.id));
        forkJoin(taskRequests).subscribe({
          next: (results) => {
            const allTasks: RecentTask[] = [];
            results.forEach((tasks, index) => {
              tasks.forEach((task) => {
                allTasks.push({ ...task, projectTitle: projects[index].title });
              });
            });

            this.processTaskStats(allTasks, projects);
            this.loading = false;
          },
          error: () => {
            this.loading = false;
          },
        });
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  processTaskStats(tasks: RecentTask[], projects: Project[]): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    this.stats.totalTasks = tasks.length;

    // Count completed tasks (tasks in last phase of their project)
    this.stats.completedTasks = tasks.filter((t) => {
      const project = projects.find((p) => p.id === t.projectId);
      if (!project || !project.phases || project.phases.length === 0) return false;
      const lastPhaseId = project.phases[project.phases.length - 1].id;
      return t.phaseId === lastPhaseId;
    }).length;

    // Overdue tasks
    this.overdueTasks = tasks
      .filter((t) => {
        if (!t.dueDate) return false;
        const due = new Date(t.dueDate);
        due.setHours(0, 0, 0, 0);
        return due < today;
      })
      .slice(0, 5);
    this.stats.overdueTasks = this.overdueTasks.length;

    // Upcoming tasks (next 7 days)
    this.upcomingTasks = tasks
      .filter((t) => {
        if (!t.dueDate) return false;
        const due = new Date(t.dueDate);
        due.setHours(0, 0, 0, 0);
        return due >= today && due <= nextWeek;
      })
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
      .slice(0, 5);
    this.stats.upcomingTasks = this.upcomingTasks.length;
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buongiorno';
    if (hour < 18) return 'Buon pomeriggio';
    return 'Buonasera';
  }

  getCompletionRate(): number {
    if (this.stats.totalTasks === 0) return 0;
    return Math.round((this.stats.completedTasks / this.stats.totalTasks) * 100);
  }

  goToProject(project: Project): void {
    this.router.navigate(['/projects', project.id]);
  }

  goToProjects(): void {
    this.router.navigate(['/projects']);
  }

  goToCalendar(): void {
    this.router.navigate(['/calendar']);
  }

  formatDate(date: string): string {
    const d = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDate = new Date(d);
    taskDate.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((taskDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Oggi';
    if (diffDays === 1) return 'Domani';
    if (diffDays === -1) return 'Ieri';
    if (diffDays < -1) return `${Math.abs(diffDays)} giorni fa`;
    if (diffDays <= 7) return `Tra ${diffDays} giorni`;

    return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
  }

  isOverdue(date: string): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDate = new Date(date);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate < today;
  }
}
