import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { TaskService } from '../../services/task.service';
import { Project } from '../../models/project.model';
import { Task } from '../../models/task.model';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

interface NewPhaseForm {
  id: string;
  title: string;
  position: number;
}

interface NewLabelForm {
  id: string;
  title: string;
  color: string;
}

interface ProjectWithStats extends Project {
  taskCount?: number;
  tasks?: Task[];
  completedTasks?: number;
  overdueTasks?: number;
  upcomingTasks?: number;
}

@Component({
  selector: 'app-projects-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './projects.html',
  styleUrl: './projects.scss',
})
export class ProjectsPage implements OnInit {
  projects: ProjectWithStats[] = [];
  loading = true;
  error: string | null = null;

  // Modal state
  showCreateModal = false;
  creating = false;

  // Edit Modal state
  showEditModal = false;
  editingProject: Project | null = null;
  editing = false;

  // Delete Confirmation
  showDeleteConfirm = false;
  projectToDelete: Project | null = null;
  deleting = false;

  // Form state
  projectTitle = '';
  phases: NewPhaseForm[] = [this.makePhase('To Do', 0)];
  labels: NewLabelForm[] = [];

  // Edit form state
  editTitle = '';
  editPhases: NewPhaseForm[] = [];
  editLabels: NewLabelForm[] = [];

  constructor(
    private projectService: ProjectService,
    private taskService: TaskService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchProjects();
  }

  fetchProjects(): void {
    this.loading = true;
    this.projectService.getProjects().subscribe({
      next: (data) => {
        this.projects = data;
        this.loading = false;
      },
      error: (err) => {
        this.handleError('Errore nel caricamento progetti', err);
      },
    });
  }

  private handleError(message: string, err: any): void {
    this.error = message;
    this.loading = false;
    console.error(err);
  }

  loadTaskStats(): void {
    if (this.projects.length === 0) {
      this.loading = false;
      return;
    }

    const taskRequests = this.projects.map((p) => this.taskService.getTasksByProject(p.id));
    forkJoin(taskRequests).subscribe({
      next: (results) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);

        results.forEach((tasks, index) => {
          this.projects[index].tasks = tasks;
          this.projects[index].taskCount = tasks.length;

          // Count overdue tasks
          this.projects[index].overdueTasks = tasks.filter((t) => {
            if (!t.dueDate) return false;
            const due = new Date(t.dueDate);
            due.setHours(0, 0, 0, 0);
            return due < today;
          }).length;

          // Count upcoming tasks (due within next 7 days)
          this.projects[index].upcomingTasks = tasks.filter((t) => {
            if (!t.dueDate) return false;
            const due = new Date(t.dueDate);
            due.setHours(0, 0, 0, 0);
            return due >= today && due <= nextWeek;
          }).length;
        });
        this.loading = false;
      },
      error: () => {
        // If task loading fails, still show projects
        this.loading = false;
      },
    });
  }

  getProgressPercent(project: ProjectWithStats): number {
    if (!project.taskCount || project.taskCount === 0) return 0;
    // Calcola in base alle task nella ultima fase (completate)
    if (!project.tasks || !project.phases || project.phases.length === 0) return 0;
    const lastPhaseId = project.phases[project.phases.length - 1].id;
    const completedCount = project.tasks.filter((t) => t.phaseId === lastPhaseId).length;
    return Math.round((completedCount / project.taskCount) * 100);
  }

  openCreateModal(): void {
    this.resetForm();
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    if (this.creating) return;
    this.showCreateModal = false;
  }

  addPhase(): void {
    if (this.phases.length >= 3) return;
    this.phases.push(this.makePhase('', this.phases.length));
  }

  removePhase(index: number): void {
    this.phases.splice(index, 1);
    // Recompute positions
    this.phases.forEach((p, i) => (p.position = i));
  }

  addLabel(): void {
    this.labels.push({ id: this.genId('lbl'), title: '', color: '#6C63FF' });
  }

  removeLabel(index: number): void {
    this.labels.splice(index, 1);
  }

  submitCreate(): void {
    this.error = null;
    if (!this.projectTitle.trim()) {
      this.error = 'Titolo obbligatorio';
      return;
    }
    if (this.phases.length === 0) {
      this.error = 'Almeno una fase necessaria';
      return;
    }
    if (this.phases.some((p) => !p.title.trim())) {
      this.error = 'Tutte le fasi devono avere un titolo';
      return;
    }

    const request = {
      title: this.projectTitle.trim(),
      phases: this.phases.map((p) => ({ id: p.id, title: p.title.trim(), position: p.position })),
      labels: this.labels
        .filter((l) => l.title.trim())
        .map((l) => ({ id: l.id, title: l.title.trim(), color: l.color })),
    };

    this.creating = true;
    this.projectService.createProject(request).subscribe({
      next: (created) => {
        this.projects.push({ ...created, taskCount: 0 });
        this.creating = false;
        this.showCreateModal = false;
      },
      error: (err) => {
        this.error = 'Errore creazione progetto';
        this.creating = false;
        console.error(err);
      },
    });
  }

  // Edit Project
  openEditModal(project: Project, event: Event): void {
    event.stopPropagation();
    this.editingProject = project;
    this.editTitle = project.title;
    this.editPhases = project.phases.map((p) => ({ ...p }));
    this.editLabels = project.labels.map((l) => ({ ...l }));
    this.showEditModal = true;
  }

  closeEditModal(): void {
    if (this.editing) return;
    this.showEditModal = false;
    this.editingProject = null;
  }

  addEditPhase(): void {
    if (this.editPhases.length >= 3) return;
    this.editPhases.push(this.makePhase('', this.editPhases.length));
  }

  removeEditPhase(index: number): void {
    this.editPhases.splice(index, 1);
    this.editPhases.forEach((p, i) => (p.position = i));
  }

  addEditLabel(): void {
    this.editLabels.push({ id: this.genId('lbl'), title: '', color: '#6C63FF' });
  }

  removeEditLabel(index: number): void {
    this.editLabels.splice(index, 1);
  }

  submitEdit(): void {
    if (!this.editingProject) return;
    this.error = null;
    if (!this.editTitle.trim()) {
      this.error = 'Titolo obbligatorio';
      return;
    }

    const request = {
      title: this.editTitle.trim(),
    };

    this.editing = true;
    this.projectService.updateProject(this.editingProject.id, request).subscribe({
      next: (updated) => {
        const index = this.projects.findIndex((p) => p.id === updated.id);
        if (index >= 0) {
          const taskCount = this.projects[index].taskCount;
          this.projects[index] = { ...updated, taskCount };
        }
        this.editing = false;
        this.showEditModal = false;
        this.editingProject = null;
      },
      error: (err) => {
        this.error = 'Errore aggiornamento progetto';
        this.editing = false;
        console.error(err);
      },
    });
  }

  // Delete Project
  confirmDelete(project: Project, event: Event): void {
    event.stopPropagation();
    this.projectToDelete = project;
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.projectToDelete = null;
  }

  deleteProject(): void {
    if (!this.projectToDelete) return;

    this.deleting = true;
    this.projectService.deleteProject(this.projectToDelete.id).subscribe({
      next: () => {
        this.projects = this.projects.filter((p) => p.id !== this.projectToDelete!.id);
        this.deleting = false;
        this.showDeleteConfirm = false;
        this.projectToDelete = null;
      },
      error: (err) => {
        this.error = 'Errore eliminazione progetto';
        this.deleting = false;
        console.error(err);
      },
    });
  }

  goToProject(project: Project): void {
    this.router.navigate(['/projects', project.id]);
  }

  private resetForm(): void {
    this.projectTitle = '';
    this.phases = [this.makePhase('To Do', 0)];
    this.labels = [];
    this.error = null;
    this.creating = false;
  }

  private makePhase(title: string, position: number): NewPhaseForm {
    return { id: this.genId('ph'), title, position };
  }

  private genId(prefix: string): string {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }
}
