import { Component, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, forkJoin, debounceTime, distinctUntilChanged } from 'rxjs';
import { TaskService } from '../../services/task.service';
import { ProjectService } from '../../services/project.service';
import { Task } from '../../models/task.model';
import { Project } from '../../models/project.model';

interface SearchResult {
  type: 'task' | 'project';
  id: string;
  title: string;
  subtitle: string;
  projectId?: string;
  color?: string;
}

interface Notification {
  id: string;
  type: 'project' | 'task' | 'info';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './topbar.html',
  styleUrl: './topbar.scss',
})
export class Topbar implements OnInit, OnDestroy {
  searchQuery = '';
  searchResults: SearchResult[] = [];
  showResults = false;
  isSearching = false;

  // Notifications
  notifications: Notification[] = [];
  showNotifications = false;

  private searchSubject = new Subject<string>();
  private allTasks: Task[] = [];
  private allProjects: Project[] = [];
  private dataLoaded = false;

  constructor(
    private taskService: TaskService,
    private projectService: ProjectService,
    private router: Router,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    // Setup debounced search
    this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe((query) => {
      this.performSearch(query);
    });

    // Preload data
    this.loadData();
  }

  ngOnDestroy(): void {
    this.searchSubject.complete();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showResults = false;
      this.showNotifications = false;
    }
  }

  loadData(): void {
    this.projectService.getProjects().subscribe({
      next: (projects) => {
        this.allProjects = projects;

        // Load tasks from all projects
        if (projects.length > 0) {
          const taskRequests = projects.map((p) => this.taskService.getTasksByProject(p.id));
          forkJoin(taskRequests).subscribe({
            next: (results) => {
              this.allTasks = results.flat();
              this.dataLoaded = true;
            },
            error: () => {
              this.dataLoaded = false;
            },
          });
        } else {
          this.dataLoaded = true;
        }
      },
      error: () => {
        this.dataLoaded = false;
      },
    });
  }

  onSearchInput(): void {
    this.searchSubject.next(this.searchQuery);
  }

  onSearchFocus(): void {
    if (this.searchQuery.length > 0 && this.searchResults.length > 0) {
      this.showResults = true;
    }
  }

  performSearch(query: string): void {
    if (!query || query.length < 2) {
      this.searchResults = [];
      this.showResults = false;
      return;
    }

    this.isSearching = true;
    const lowerQuery = query.toLowerCase();

    const projectResults: SearchResult[] = this.allProjects
      .filter((p) => p.title.toLowerCase().includes(lowerQuery))
      .slice(0, 3)
      .map((p, i) => ({
        type: 'project' as const,
        id: p.id!,
        title: p.title,
        subtitle: `${p.phases?.length || 0} fasi`,
        color: this.getProjectColor(i),
      }));

    const taskResults: SearchResult[] = this.allTasks
      .filter(
        (t) =>
          t.title.toLowerCase().includes(lowerQuery) ||
          (t.description && t.description.toLowerCase().includes(lowerQuery))
      )
      .slice(0, 5)
      .map((t) => {
        const project = this.allProjects.find((p) => p.id === t.projectId);
        return {
          type: 'task' as const,
          id: t.id!,
          title: t.title,
          subtitle: project?.title || 'Progetto',
          projectId: t.projectId,
          color: this.getProjectColorById(t.projectId),
        };
      });

    this.searchResults = [...projectResults, ...taskResults];
    this.showResults = true;
    this.isSearching = false;
  }

  selectResult(result: SearchResult): void {
    this.showResults = false;
    this.searchQuery = '';

    if (result.type === 'project') {
      this.router.navigate(['/projects', result.id]);
    } else if (result.type === 'task' && result.projectId) {
      this.router.navigate(['/projects', result.projectId]);
    }
  }

  goToAllTasks(): void {
    this.showResults = false;
    this.router.navigate(['/tasks'], {
      queryParams: { search: this.searchQuery },
    });
    this.searchQuery = '';
  }

  onSearchKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && this.searchQuery.length > 0) {
      this.goToAllTasks();
    }
    if (event.key === 'Escape') {
      this.showResults = false;
    }
  }

  private projectColors = [
    '#8b5cf6',
    '#10b981',
    '#3b82f6',
    '#f59e0b',
    '#ef4444',
    '#ec4899',
    '#06b6d4',
  ];

  private getProjectColor(index: number): string {
    return this.projectColors[index % this.projectColors.length];
  }

  private getProjectColorById(projectId: string): string {
    const index = this.allProjects.findIndex((p) => p.id === projectId);
    return this.getProjectColor(index >= 0 ? index : 0);
  }

  // Notifications management
  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }

  clearNotifications(): void {
    this.notifications = [];
    this.showNotifications = false;
  }

  formatTime(date: Date | string): string {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now.getTime() - notifDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Proprio ora';
    if (diffMins < 60) return `${diffMins}m fa`;
    if (diffHours < 24) return `${diffHours}h fa`;
    if (diffDays < 7) return `${diffDays}d fa`;
    
    return notifDate.toLocaleDateString('it-IT');
  }

  // Add mock notifications for demo (will be replaced with backend data)
  addMockNotifications(): void {
    this.notifications = [
      {
        id: '1',
        type: 'project',
        title: 'Nuovo progetto condiviso',
        message: 'Marco ha condiviso il progetto "TaskFlow" con te',
        read: false,
        createdAt: new Date(Date.now() - 5 * 60000), // 5 minutes ago
      },
      {
        id: '2',
        type: 'task',
        title: 'Task assegnata',
        message: 'Ti è stata assegnata la task "Implementare login"',
        read: false,
        createdAt: new Date(Date.now() - 30 * 60000), // 30 minutes ago
      },
      {
        id: '3',
        type: 'info',
        title: 'Aggiornamento',
        message: 'Sono disponibili nuove funzionalità nell\'app',
        read: true,
        createdAt: new Date(Date.now() - 2 * 3600000), // 2 hours ago
      },
    ];
  }
}
