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

  // Phase Modal
  showPhaseModal = false;
  editingPhase: Phase | null = null;
  phaseForm = { title: '' };
  savingPhase = false;

  // Delete Phase Confirmation
  showDeletePhaseConfirm = false;
  phaseToDelete: Phase | null = null;
  deletingPhase = false;

  // Labels Modal
  showLabelsModal = false;
  labelForm = { title: '', color: '#6C63FF' };
  savingLabel = false;

  // Edit Label Modal
  showEditLabelModal = false;
  editingLabel: Label | null = null;
  editLabelForm = { title: '', color: '' };

  // Delete Label Confirmation
  showDeleteLabelConfirm = false;
  labelToDelete: Label | null = null;
  deletingLabel = false;

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

    // Convert date format from YYYY-MM-DD to YYYY-MM-DDTHH:mm:ss for backend
    const formatDueDate = (date: string | undefined): string | undefined => {
      if (!date) return undefined;
      return `${date}T23:59:59`;
    };

    if (this.editingTask) {
      // Update existing task
      const updates: UpdateTaskRequest = {
        title: this.taskForm.title.trim(),
        description: this.taskForm.description?.trim(),
        phaseId: this.taskForm.phaseId,
        labelIds: this.taskForm.labelIds,
        assignees: this.taskForm.assignees,
        dueDate: formatDueDate(this.taskForm.dueDate),
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
        dueDate: formatDueDate(this.taskForm.dueDate),
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

  // Phase Management
  openEditPhaseModal(phase: Phase): void {
    this.editingPhase = phase;
    this.phaseForm.title = phase.title;
    this.error = null;
    this.showPhaseModal = true;
  }

  closePhaseModal(): void {
    if (this.savingPhase) return;
    this.showPhaseModal = false;
    this.editingPhase = null;
    this.phaseForm.title = '';
  }

  submitPhase(): void {
    if (!this.project || !this.editingPhase) return;
    if (!this.phaseForm.title.trim()) {
      this.error = 'Il nome della fase è obbligatorio';
      return;
    }

    this.savingPhase = true;
    this.error = null;

    const updatedPhases = this.project.phases.map((p) =>
      p.id === this.editingPhase!.id ? { ...p, title: this.phaseForm.title.trim() } : p
    );

    this.projectService.updateProject(this.project.id, { phases: updatedPhases }).subscribe({
      next: (updated) => {
        this.project = updated;
        this.savingPhase = false;
        this.showPhaseModal = false;
        this.editingPhase = null;
      },
      error: (err) => {
        this.error = 'Errore aggiornamento fase';
        this.savingPhase = false;
        console.error(err);
      },
    });
  }

  confirmDeletePhase(phase: Phase): void {
    if (!this.project || this.project.phases.length <= 1) return;
    this.phaseToDelete = phase;
    this.showDeletePhaseConfirm = true;
  }

  cancelDeletePhase(): void {
    this.phaseToDelete = null;
    this.showDeletePhaseConfirm = false;
  }

  deletePhase(): void {
    if (!this.project || !this.phaseToDelete) return;

    this.deletingPhase = true;
    const phaseIdToDelete = this.phaseToDelete.id;
    const updatedPhases = this.project.phases.filter((p) => p.id !== phaseIdToDelete);

    // Find first available phase to move tasks to
    const targetPhaseId = updatedPhases[0]?.id;

    this.projectService.updateProject(this.project.id, { phases: updatedPhases }).subscribe({
      next: (updated) => {
        this.project = updated;
        // Move tasks from deleted phase to first available phase
        if (targetPhaseId) {
          this.tasks = this.tasks.map((t) =>
            t.phaseId === phaseIdToDelete ? { ...t, phaseId: targetPhaseId } : t
          );
        }
        this.deletingPhase = false;
        this.showDeletePhaseConfirm = false;
        this.phaseToDelete = null;
      },
      error: (err) => {
        this.error = 'Errore eliminazione fase';
        this.deletingPhase = false;
        console.error(err);
      },
    });
  }

  // Labels Management
  openLabelsModal(): void {
    this.labelForm = { title: '', color: '#6C63FF' };
    this.error = null;
    this.showLabelsModal = true;
  }

  closeLabelsModal(): void {
    if (this.savingLabel) return;
    this.showLabelsModal = false;
    this.labelForm = { title: '', color: '#6C63FF' };
    this.error = null;
  }

  addLabel(): void {
    if (!this.project) return;
    if (!this.labelForm.title.trim()) {
      this.error = "Il nome dell'etichetta è obbligatorio";
      return;
    }

    this.savingLabel = true;
    this.error = null;

    const newLabel: Label = {
      id: crypto.randomUUID(),
      title: this.labelForm.title.trim(),
      color: this.labelForm.color,
    };

    const updatedLabels = [...this.project.labels, newLabel];

    this.projectService.updateProject(this.project.id, { labels: updatedLabels }).subscribe({
      next: (updated) => {
        this.project = updated;
        this.labelForm = { title: '', color: '#6C63FF' };
        this.savingLabel = false;
      },
      error: (err) => {
        this.error = 'Errore creazione etichetta';
        this.savingLabel = false;
        console.error(err);
      },
    });
  }

  openEditLabelModal(label: Label): void {
    this.editingLabel = label;
    this.editLabelForm = { title: label.title, color: label.color };
    this.error = null;
    this.showEditLabelModal = true;
  }

  closeEditLabelModal(): void {
    if (this.savingLabel) return;
    this.showEditLabelModal = false;
    this.editingLabel = null;
    this.editLabelForm = { title: '', color: '' };
  }

  submitEditLabel(): void {
    if (!this.project || !this.editingLabel) return;
    if (!this.editLabelForm.title.trim()) {
      this.error = "Il nome dell'etichetta è obbligatorio";
      return;
    }

    this.savingLabel = true;
    this.error = null;

    const updatedLabels = this.project.labels.map((l) =>
      l.id === this.editingLabel!.id
        ? { ...l, title: this.editLabelForm.title.trim(), color: this.editLabelForm.color }
        : l
    );

    this.projectService.updateProject(this.project.id, { labels: updatedLabels }).subscribe({
      next: (updated) => {
        this.project = updated;
        this.savingLabel = false;
        this.showEditLabelModal = false;
        this.editingLabel = null;
      },
      error: (err) => {
        this.error = 'Errore aggiornamento etichetta';
        this.savingLabel = false;
        console.error(err);
      },
    });
  }

  confirmDeleteLabel(label: Label): void {
    this.labelToDelete = label;
    this.showDeleteLabelConfirm = true;
  }

  cancelDeleteLabel(): void {
    this.labelToDelete = null;
    this.showDeleteLabelConfirm = false;
  }

  deleteLabel(): void {
    if (!this.project || !this.labelToDelete) return;

    this.deletingLabel = true;
    const labelIdToDelete = this.labelToDelete.id;
    const updatedLabels = this.project.labels.filter((l) => l.id !== labelIdToDelete);

    this.projectService.updateProject(this.project.id, { labels: updatedLabels }).subscribe({
      next: (updated) => {
        this.project = updated;
        // Remove label from tasks locally
        this.tasks = this.tasks.map((t) => ({
          ...t,
          labels: t.labels.filter((l) => l.id !== labelIdToDelete),
        }));
        this.deletingLabel = false;
        this.showDeleteLabelConfirm = false;
        this.labelToDelete = null;
      },
      error: (err) => {
        this.error = 'Errore eliminazione etichetta';
        this.deletingLabel = false;
        console.error(err);
      },
    });
  }
}
