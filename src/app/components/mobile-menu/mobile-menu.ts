import { Component, OnInit, OnDestroy, HostListener, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { Subject, forkJoin, debounceTime, distinctUntilChanged } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { ProjectService } from '../../services/project.service';
import { TaskService } from '../../services/task.service';
import { UserResponse } from '../../models/user.model';
import { Project } from '../../models/project.model';
import { Task } from '../../models/task.model';

interface SearchResult {
  type: 'task' | 'project';
  id: string;
  title: string;
  subtitle: string;
  projectId?: string;
  color?: string;
}

@Component({
  selector: 'app-mobile-menu',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './mobile-menu.html',
  styleUrl: './mobile-menu.scss',
})
export class MobileMenu implements OnInit, OnDestroy {
  @Input() isOpen = false;
  @Output() closeMenu = new EventEmitter<void>();

  user: UserResponse | null = null;
  projects: Project[] = [];
  loadingProjects = true;
  searchQuery = '';
  searchResults: SearchResult[] = [];
  showResults = false;
  isSearching = false;

  menuItems = [
    { icon: 'home', label: 'Home', route: '/' },
    { icon: 'folder', label: 'Progetti', route: '/projects' },
    { icon: 'check-square', label: 'Task', route: '/tasks' },
    { icon: 'calendar', label: 'Calendario', route: '/calendar' },
  ];

  projectColors = ['#8b5cf6', '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4'];

  private searchSubject = new Subject<string>();
  private allTasks: Task[] = [];
  private allProjects: Project[] = [];
  private dataLoaded = false;

  constructor(
    private authService: AuthService,
    private projectService: ProjectService,
    private taskService: TaskService,
    private router: Router,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    this.loadProjects();
    this.loadData();

    // Setup debounced search
    this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe((query) => {
      this.performSearch(query);
    });

    // Close menu on navigation
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.closeMenu.emit();
      });
  }

  ngOnDestroy(): void {
    this.searchSubject.complete();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showResults = false;
    }
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

  loadData(): void {
    this.projectService.getProjects().subscribe({
      next: (projects) => {
        this.allProjects = projects;

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
      this.closeMenu.emit();
    } else if (result.type === 'task' && result.projectId) {
      this.router.navigate(['/projects', result.projectId]);
      this.closeMenu.emit();
    }
  }

  goToAllTasks(): void {
    this.showResults = false;
    this.router.navigate(['/tasks'], {
      queryParams: { search: this.searchQuery },
    });
    this.searchQuery = '';
    this.closeMenu.emit();
  }

  onSearchKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && this.searchQuery.length > 0) {
      this.goToAllTasks();
    }
    if (event.key === 'Escape') {
      this.showResults = false;
    }
  }

  getProjectColor(index: number): string {
    return this.projectColors[index % this.projectColors.length];
  }

  getProjectColorById(projectId: string): string {
    const index = this.allProjects.findIndex((p) => p.id === projectId);
    return this.getProjectColor(index >= 0 ? index : 0);
  }

  goToProject(project: Project): void {
    this.router.navigate(['/projects', project.id]);
    this.closeMenu.emit();
  }

  goToAllProjects(): void {
    this.router.navigate(['/projects']);
    this.closeMenu.emit();
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

