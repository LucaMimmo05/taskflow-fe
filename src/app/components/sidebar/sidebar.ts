import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TaskService } from '../../services/task.service';
import { ProjectService } from '../../services/project.service';
import { SidebarService } from '../../services/sidebar.service';
import { UserResponse } from '../../models/user.model';
import { Project } from '../../models/project.model';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar implements OnInit {
  isCollapsed = false;
  user: UserResponse | null = null;
  projects: Project[] = [];
  loadingProjects = true;
  showSettingsPopup = false;
  showNotificationsPopup = false;
  notificationsEnabled = false;
  
  // Mock notifications
  notifications = [
    { id: 1, type: 'info', message: 'Nuovo commento su "Design System"', time: '5m fa', read: false },
    { id: 2, type: 'warning', message: 'Task "Homepage" in scadenza domani', time: '2h fa', read: false },
    { id: 3, type: 'success', message: 'Progetto "Mobile App" completato', time: '1g fa', read: true }
  ];
  unreadNotificationsCount = 2;

  menuItems = [
    { icon: 'home', label: 'Home', route: '/' },
    { icon: 'folder', label: 'Progetti', route: '/projects' },
    { icon: 'check-square', label: 'Le mie task', route: '/tasks' },
    { icon: 'calendar', label: 'Calendario', route: '/calendar' },
  ];

  constructor(
    private authService: AuthService,
    private taskService: TaskService,
    private projectService: ProjectService,
    private router: Router,
    private sidebarService: SidebarService,
    private elementRef: ElementRef,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    if (this.user) {
      this.notificationsEnabled = this.user.notifyOnDue;
    }
    this.loadProjects();
    this.sidebarService.isCollapsed$.subscribe((collapsed) => {
      this.isCollapsed = collapsed;
    });
  }

  toggleCollapse(): void {
    this.sidebarService.toggle();
  }

  loadProjects(): void {
    this.loadingProjects = true;
    this.projectService.getProjects().subscribe({
      next: (projects) => {
        this.projects = projects;
        this.loadingProjects = false;
      },
      error: (err) => {
        console.error('Errore caricamento progetti', err);
        this.projects = [];
        this.loadingProjects = false;
      },
    });
  }

  getProjectColor(index: number): string {
    const colors = ['#6C63FF', '#F43F5E', '#10B981', '#F59E0B', '#3B82F6'];
    return colors[index % colors.length];
  }

  getTaskCount(projectId: string): number {
    // In a real app, this would come from the backend with the project list
    return Math.floor(Math.random() * 10);
  }

  getInitials(): string {
    if (!this.user || !this.user.displayName) return 'U';
    return this.user.displayName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  toggleSettingsPopup(event: Event): void {
    event.stopPropagation();
    this.showSettingsPopup = !this.showSettingsPopup;
    if (this.showSettingsPopup) {
      this.showNotificationsPopup = false;
    }
  }

  toggleNotificationsPopup(event: Event): void {
    event.stopPropagation();
    this.showNotificationsPopup = !this.showNotificationsPopup;
    if (this.showNotificationsPopup) {
      this.showSettingsPopup = false;
    }
  }

  closeSettingsPopup(): void {
    this.showSettingsPopup = false;
    this.showNotificationsPopup = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeSettingsPopup();
    }
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
    this.closeSettingsPopup();
  }

  toggleNotifications(): void {
    this.notificationsEnabled = !this.notificationsEnabled;
    this.userService.updateSettings({ notifyOnDue: this.notificationsEnabled }).subscribe({
      next: () => {
        if (this.user) {
          this.user.notifyOnDue = this.notificationsEnabled;
        }
      },
      error: (err) => {
        console.error('Errore aggiornamento notifiche', err);
        this.notificationsEnabled = !this.notificationsEnabled; // Revert
      }
    });
  }

  markAllAsRead(): void {
    this.notifications = this.notifications.map(n => ({ ...n, read: true }));
    this.unreadNotificationsCount = 0;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.closeSettingsPopup();
  }
}
