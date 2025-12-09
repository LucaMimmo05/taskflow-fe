import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { ProjectService } from '../../services/project.service';
import { AuthService } from '../../services/auth.service';
import { Task } from '../../models/task.model';
import { Project } from '../../models/project.model';
import { MatDialog, MatDialogModule, MatDialogConfig } from '@angular/material/dialog';
import { TaskDetailDialogComponent } from '../../components/task-detail-dialog/task-detail-dialog.component';
import { forkJoin, Observable, catchError } from 'rxjs';

interface TaskWithProject extends Task {
  projectTitle?: string;
  projectColor?: string;
}

@Component({
  selector: 'app-tasks-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatDialogModule],
  templateUrl: './tasks.html',
  styleUrl: './tasks.scss',
})
export class TasksPage implements OnInit {
  allTasks: TaskWithProject[] = [];
  filteredTasks: TaskWithProject[] = [];
  projects: Project[] = [];
  loading = true;
  error: string | null = null;

  // Filters
  searchQuery = '';
  selectedProject = '';
  selectedStatus = '';
  selectedLabel = '';

  // Colors for projects
  projectColors = ['#8b5cf6', '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4'];

  constructor(
    private taskService: TaskService,
    private projectService: ProjectService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    // Check for search query param from topbar search
    this.route.queryParams.subscribe((params) => {
      if (params['search']) {
        this.searchQuery = params['search'];
      }
    });
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = null;

    // Get current user ID
    const currentUser = this.authService.getCurrentUser();
    const currentUserId = currentUser?.id;

    this.projectService.getProjects().subscribe({
      next: (projects) => {
        this.projects = projects;

        if (projects.length === 0) {
          this.loading = false;
          this.allTasks = [];
          this.filteredTasks = [];
          return;
        }

        // Load tasks for all projects with error handling per project
        const taskRequests = projects.map((p) =>
          this.taskService.getTasksByProject(p.id).pipe(
            catchError(() => {
              console.warn(`Errore nel caricamento delle task per il progetto ${p.id}`);
              return new Observable<Task[]>(subscriber => subscriber.next([]));
            })
          )
        );

        forkJoin(taskRequests).subscribe({
          next: (results) => {
            this.allTasks = [];
            results.forEach((tasks, index) => {
              const project = projects[index];
              if (Array.isArray(tasks)) {
                tasks.forEach((task) => {
                  // Filter: show only tasks assigned to current user OR unassigned tasks
                  const isAssignedToMe = currentUserId && task.assignees?.some(a => a.userId === currentUserId);
                  const isUnassigned = !task.assignees || task.assignees.length === 0;

                  if (isAssignedToMe || isUnassigned) {
                    this.allTasks.push({
                      ...task,
                      projectTitle: project.title,
                      projectColor: this.projectColors[index % this.projectColors.length],
                    });
                  }
                });
              }
            });
            // Sort by due date (upcoming first)
            this.allTasks.sort((a, b) => {
              if (!a.dueDate && !b.dueDate) return 0;
              if (!a.dueDate) return 1;
              if (!b.dueDate) return -1;
              return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            });
            this.filteredTasks = [...this.allTasks];
            this.loading = false;
          },
          error: (err) => {
            console.error('Errore nel caricamento delle task:', err);
            this.error = 'Errore nel caricamento delle task';
            this.loading = false;
          },
        });
      },
      error: (err) => {
        console.error('Errore nel caricamento dei progetti:', err);
        this.error = 'Errore nel caricamento dei progetti';
        this.loading = false;
      },
    });
  }

  applyFilters(): void {
    this.filteredTasks = this.allTasks.filter((task) => {
      // Search query
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesDesc = task.description?.toLowerCase().includes(query);
        const matchesProject = task.projectTitle?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesProject) return false;
      }

      // Project filter
      if (this.selectedProject && task.projectId !== this.selectedProject) {
        return false;
      }

      // Label filter
      if (this.selectedLabel) {
        const hasLabel = task.labels?.some(l => l.id === this.selectedLabel);
        if (!hasLabel) return false;
      }

      return true;
    });
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedProject = '';
    this.selectedStatus = '';
    this.selectedLabel = '';
    this.filteredTasks = [...this.allTasks];
  }

  get allLabels(): { id: string; title: string; color: string }[] {
    const labelMap = new Map<string, { id: string; title: string; color: string }>();
    this.projects.forEach(p => {
      p.labels?.forEach(l => {
        if (!labelMap.has(l.id)) {
          labelMap.set(l.id, l);
        }
      });
    });
    return Array.from(labelMap.values());
  }

  goToTask(task: TaskWithProject): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '600px';
    dialogConfig.maxWidth = '90vw';
    dialogConfig.maxHeight = '90vh';
    dialogConfig.data = task;
    dialogConfig.autoFocus = false; // Prevent auto-focusing the first button
    dialogConfig.panelClass = 'glass-dialog-panel';

    this.dialog.open(TaskDetailDialogComponent, dialogConfig);
  }

  isOverdue(dueDate: string | undefined): boolean {
    if (!dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today;
  }

  isUpcoming(dueDate: string | undefined): boolean {
    if (!dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return due >= today && due <= nextWeek;
  }

  formatDate(date: string | undefined): string {
    if (!date) return 'Nessuna scadenza';
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

    return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  getPriorityClass(priority: string | undefined): string {
    if (!priority) return '';
    return `priority-${priority.toLowerCase()}`;
  }

  getPriorityLabel(priority: string | undefined): string {
    if (!priority) return '';
    const labels: { [key: string]: string } = {
      LOW: 'Bassa',
      MEDIUM: 'Media',
      HIGH: 'Alta',
    };
    return labels[priority] || priority;
  }

  get overdueCount(): number {
    return this.allTasks.filter((t) => this.isOverdue(t.dueDate)).length;
  }

  get upcomingCount(): number {
    return this.allTasks.filter((t) => this.isUpcoming(t.dueDate)).length;
  }

  get totalCount(): number {
    return this.allTasks.length;
  }
}
