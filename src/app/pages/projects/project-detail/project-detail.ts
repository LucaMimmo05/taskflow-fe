import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../../services/project.service';
import { TaskService } from '../../../services/task.service';
import { Project, Phase, Label, Collaborator } from '../../../models/project.model';
import { Task, CreateTaskRequest, UpdateTaskRequest } from '../../../models/task.model';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './project-detail.html',
  styleUrl: './project-detail.scss',
})
export class ProjectDetailComponent implements OnInit {
  project: Project | null = null;
  tasks: Task[] = [];
  loading = true;
  error: string | null = null;

  // Task Modal
  showTaskModal = false;
  editingTask: Task | null = null;
  taskForm: CreateTaskRequest = {
    title: '',
    description: '',
    phaseId: '',
    labelIds: [],
    assignees: [],
    dueDate: '',
  };
  savingTask = false;

  // Delete Confirmation
  showDeleteConfirm = false;
  taskToDelete: Task | null = null;
  deletingTask = false;

  // Edit Project Modal
  showEditProjectModal = false;
  editProjectForm = {
    title: '',
  };
  savingProject = false;

  // Delete Project Confirmation
  showDeleteProjectConfirm = false;
  deletingProject = false;

  // Collaborators Modal
  showCollaboratorsModal = false;
  collaboratorEmail = '';
  addingCollaborator = false;
  removingCollaboratorId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private taskService: TaskService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    const projectId = this.route.snapshot.paramMap.get('id');
    if (projectId) {
      this.loadProject(projectId);
    } else {
      this.error = 'ID progetto non valido';
      this.loading = false;
    }
  }

  loadProject(projectId: string): void {
    this.loading = true;
    this.projectService.getProject(projectId).subscribe({
      next: (project) => {
        this.project = project;
        this.loadTasks(projectId);
      },
      error: (err) => {
        this.error = 'Errore nel caricamento del progetto';
        this.loading = false;
        console.error(err);
      },
    });
  }

  loadTasks(projectId: string): void {
    this.taskService.getTasksByProject(projectId).subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.loading = false;
      },
      error: (err) => {
        console.error('Errore caricamento task:', err);
        this.tasks = [];
        this.loading = false;
      },
    });
  }

  getTasksByPhase(phaseId: string): Task[] {
    return this.tasks.filter((t) => t.phaseId === phaseId);
  }

  // Task CRUD Operations
  openCreateTaskModal(phaseId: string): void {
    this.editingTask = null;
    this.taskForm = {
      title: '',
      description: '',
      phaseId: phaseId,
      labelIds: [],
      assignees: [],
      dueDate: '',
    };
    this.showTaskModal = true;
  }

  openEditTaskModal(task: Task): void {
    this.editingTask = task;
    this.taskForm = {
      title: task.title,
      description: task.description || '',
      phaseId: task.phaseId,
      labelIds: task.labels.map((l) => l.id),
      assignees: task.assignees.map((a) => a.userId),
      dueDate: task.dueDate || '',
    };
    this.showTaskModal = true;
  }

  closeTaskModal(): void {
    if (this.savingTask) return;
    this.showTaskModal = false;
    this.editingTask = null;
  }

  submitTask(): void {
    if (!this.project) return;
    if (!this.taskForm.title.trim()) {
      this.error = 'Il titolo è obbligatorio';
      return;
    }

    this.savingTask = true;
    this.error = null;

    if (this.editingTask) {
      // Update existing task
      const updates: UpdateTaskRequest = {
        title: this.taskForm.title.trim(),
        description: this.taskForm.description?.trim(),
        phaseId: this.taskForm.phaseId,
        labelIds: this.taskForm.labelIds,
        assignees: this.taskForm.assignees,
        dueDate: this.taskForm.dueDate || undefined,
      };

      this.taskService.updateTask(this.editingTask.id, updates).subscribe({
        next: (updated) => {
          const index = this.tasks.findIndex((t) => t.id === updated.id);
          if (index >= 0) this.tasks[index] = updated;
          this.savingTask = false;
          this.showTaskModal = false;
        },
        error: (err) => {
          this.error = 'Errore aggiornamento task';
          this.savingTask = false;
          console.error(err);
        },
      });
    } else {
      // Create new task
      const request: CreateTaskRequest = {
        title: this.taskForm.title.trim(),
        description: this.taskForm.description?.trim(),
        phaseId: this.taskForm.phaseId,
        labelIds: this.taskForm.labelIds,
        assignees: this.taskForm.assignees,
        dueDate: this.taskForm.dueDate || undefined,
      };

      this.taskService.createTask(this.project.id, request).subscribe({
        next: (created) => {
          this.tasks.push(created);
          this.savingTask = false;
          this.showTaskModal = false;
        },
        error: (err) => {
          this.error = 'Errore creazione task';
          this.savingTask = false;
          console.error(err);
        },
      });
    }
  }

  confirmDeleteTask(task: Task): void {
    this.taskToDelete = task;
    this.showDeleteConfirm = true;
  }

  cancelDeleteTask(): void {
    this.taskToDelete = null;
    this.showDeleteConfirm = false;
  }

  deleteTask(): void {
    if (!this.taskToDelete) return;

    this.deletingTask = true;
    this.taskService.deleteTask(this.taskToDelete.id).subscribe({
      next: () => {
        this.tasks = this.tasks.filter((t) => t.id !== this.taskToDelete!.id);
        this.deletingTask = false;
        this.showDeleteConfirm = false;
        this.taskToDelete = null;
      },
      error: (err) => {
        this.error = 'Errore eliminazione task';
        this.deletingTask = false;
        console.error(err);
      },
    });
  }

  // Project Edit/Delete
  openEditProjectModal(): void {
    if (!this.project) return;
    this.editProjectForm.title = this.project.title;
    this.showEditProjectModal = true;
  }

  closeEditProjectModal(): void {
    if (this.savingProject) return;
    this.showEditProjectModal = false;
  }

  submitEditProject(): void {
    if (!this.project) return;
    if (!this.editProjectForm.title.trim()) {
      this.error = 'Il titolo è obbligatorio';
      return;
    }

    this.savingProject = true;
    this.error = null;

    this.projectService
      .updateProject(this.project.id, {
        title: this.editProjectForm.title.trim(),
      })
      .subscribe({
        next: (updated) => {
          this.project = updated;
          this.savingProject = false;
          this.showEditProjectModal = false;
        },
        error: (err) => {
          this.error = 'Errore aggiornamento progetto';
          this.savingProject = false;
          console.error(err);
        },
      });
  }

  confirmDeleteProject(): void {
    this.showDeleteProjectConfirm = true;
  }

  cancelDeleteProject(): void {
    this.showDeleteProjectConfirm = false;
  }

  deleteProject(): void {
    if (!this.project) return;

    this.deletingProject = true;
    this.projectService.deleteProject(this.project.id).subscribe({
      next: () => {
        this.router.navigate(['/projects']);
      },
      error: (err) => {
        this.error = 'Errore eliminazione progetto';
        this.deletingProject = false;
        console.error(err);
      },
    });
  }

  // Label Management
  toggleLabel(labelId: string): void {
    const index = this.taskForm.labelIds?.indexOf(labelId) ?? -1;
    if (index >= 0) {
      this.taskForm.labelIds?.splice(index, 1);
    } else {
      this.taskForm.labelIds?.push(labelId);
    }
  }

  isLabelSelected(labelId: string): boolean {
    return this.taskForm.labelIds?.includes(labelId) ?? false;
  }

  getLabel(labelId: string): Label | undefined {
    return this.project?.labels.find((l) => l.id === labelId);
  }

  goBack(): void {
    this.router.navigate(['/projects']);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short',
    });
  }

  isOverdue(dueDate: string): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today;
  }

  // Collaborators Management
  openCollaboratorsModal(): void {
    this.collaboratorEmail = '';
    this.error = null;
    this.showCollaboratorsModal = true;
  }

  closeCollaboratorsModal(): void {
    if (this.addingCollaborator || this.removingCollaboratorId) return;
    this.showCollaboratorsModal = false;
    this.collaboratorEmail = '';
    this.error = null;
  }

  addCollaborator(): void {
    if (!this.project || !this.collaboratorEmail.trim()) {
      this.error = "Inserisci l'email del collaboratore";
      return;
    }

    this.addingCollaborator = true;
    this.error = null;

    // First find user by email
    this.userService.getUserByEmail(this.collaboratorEmail.trim()).subscribe({
      next: (user) => {
        // Then add as collaborator
        this.projectService.addCollaborator(this.project!.id, { userId: user.id }).subscribe({
          next: (updated) => {
            this.project = updated;
            this.collaboratorEmail = '';
            this.addingCollaborator = false;
          },
          error: (err) => {
            this.error = err.error?.message || 'Errore aggiunta collaboratore';
            this.addingCollaborator = false;
          },
        });
      },
      error: (err) => {
        this.error = 'Utente non trovato con questa email';
        this.addingCollaborator = false;
      },
    });
  }

  removeCollaborator(collaborator: Collaborator): void {
    if (!this.project || collaborator.role === 'creator') return;

    this.removingCollaboratorId = collaborator.userId;

    this.projectService
      .removeCollaborator(this.project.id, { userId: collaborator.userId })
      .subscribe({
        next: (updated) => {
          this.project = updated;
          this.removingCollaboratorId = null;
        },
        error: (err) => {
          this.error = err.error?.message || 'Errore rimozione collaboratore';
          this.removingCollaboratorId = null;
        },
      });
  }

  isCreator(collaborator: Collaborator): boolean {
    return collaborator.role === 'creator';
  }
}
