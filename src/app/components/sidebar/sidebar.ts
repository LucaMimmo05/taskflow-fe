import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ProjectService } from '../../services/project.service';
import { UserResponse } from '../../models/user.model';
import { Project } from '../../models/project.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar implements OnInit {
  user: UserResponse | null = null;
  projects: Project[] = [];
  loadingProjects = true;

  menuItems = [
    { icon: 'home', label: 'Home', route: '/home' },
    { icon: 'folder', label: 'Progetti', route: '/projects' },
    { icon: 'check-square', label: 'Task', route: '/tasks' },
    { icon: 'calendar', label: 'Calendario', route: '/calendar' },
  ];

  // Colori per i progetti
  projectColors = ['#8b5cf6', '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4'];

  constructor(
    private authService: AuthService,
    private projectService: ProjectService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    this.loadProjects();
  }

  loadProjects(): void {
    this.loadingProjects = true;
    this.projectService.getProjects().subscribe({
      next: (projects) => {
        this.projects = projects;
        this.loadingProjects = false;
      },
      error: () => {
        this.loadingProjects = false;
      },
    });
  }

  getProjectColor(index: number): string {
    return this.projectColors[index % this.projectColors.length];
  }

  goToProject(project: Project): void {
    this.router.navigate(['/projects', project.id]);
  }

  goToAllProjects(): void {
    this.router.navigate(['/projects']);
  }

  getInitials(): string {
    if (!this.user?.displayName) return 'U';
    return this.user.displayName
      .split(' ')
      .map((name) => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}
