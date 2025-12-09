import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../../services/project.service';
import { TaskService } from '../../../services/task.service';
import { Project, Phase, Label, Collaborator } from '../../../models/project.model';
import { Task, CreateTaskRequest, UpdateTaskRequest } from '../../../models/task.model';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { OrderByPipe } from '../../../pipes/order-by.pipe';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, OrderByPipe],
  templateUrl: './project-detail.html',
  styleUrl: './project-detail.scss',
})
export class ProjectDetailComponent implements OnInit {
  project: Project | null = null;
  tasks: Task[] = [];
  loading = true;
  error: string | null = null;
  currentUserId: string | null = null;

  // Filters
  filterLabel: string | null = null;
  filterAssignee: string | null = null;

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
  phaseTitle = '';
  savingPhase = false;

  // Delete Phase Confirmation
  showDeletePhaseConfirm = false;
  phaseToDelete: Phase | null = null;
  deletingPhase = false;

  // Labels Modal
  showLabelsModal = false;
  labelTitle = '';
  labelColor = '#6C63FF';
  savingLabel = false;
  presetColors = [
    '#6C63FF',
    '#F43F5E',
    '#10B981',
    '#F59E0B',
    '#3B82F6',
    '#8B5CF6',
    '#EC4899',
    '#14B8A6',
    '#EF4444',
    '#84CC16',
  ];

  // Edit Label Modal
  showEditLabelModal = false;
  editingLabel: Label | null = null;
  // Use same properties for edit since we can reuse the logic or keep separate if we want 
  // but simpler to just use labelTitle/Color for both if we manage state correctly.
  // actually, let's keep it simple.

  // Delete Label Confirmation
  showDeleteLabelConfirm = false;
  labelToDelete: Label | null = null;
  deletingLabel = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private taskService: TaskService,
    private userService: UserService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.currentUserId = user ? user.id : null;

    // Subscribe to route params to handle project switching
    this.route.paramMap.subscribe((params) => {
      const projectId = params.get('id');
      if (projectId) {
        this.resetState();
        this.loadProject(projectId);
      } else {
        this.error = 'ID progetto non valido';
        this.loading = false;
      }
    });
  }

  resetState(): void {
    this.project = null;
    this.tasks = [];
    this.error = null;
    this.showTaskModal = false;
    this.showDeleteConfirm = false;
    this.showEditProjectModal = false;
    this.showDeleteProjectConfirm = false;
    this.showCollaboratorsModal = false;
    this.showPhaseModal = false;
    this.showDeletePhaseConfirm = false;
    this.showLabelsModal = false;
    this.showEditLabelModal = false;
    this.showDeleteLabelConfirm = false;
    this.labelTitle = '';
    this.labelColor = '#6C63FF';
  }

  loadProject(projectId: string): void {
    this.loading = true;
    this.projectService.getProject(projectId).subscribe({
      next: (project) => {
        console.log('Project loaded:', project);
        console.log('Collaborators:', project.collaborators);
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

  getFilteredTasksByPhase(phaseId: string): Task[] {
    return this.tasks.filter((t) => {
      // Phase check
      if (t.phaseId !== phaseId) return false;

      // Label check
      if (this.filterLabel && !t.labels.some((l) => l.id === this.filterLabel)) return false;

      // Assignee check
      if (this.filterAssignee) {
        if (this.filterAssignee === 'unassigned') {
          if (t.assignees.length > 0) return false;
        } else {
          if (!t.assignees.some((a) => a.userId === this.filterAssignee)) return false;
        }
      }

      return true;
    });
  }

  removeFilter(type: 'label' | 'assignee'): void {
    if (type === 'label') this.filterLabel = null;
    if (type === 'assignee') this.filterAssignee = null;
  }

  clearFilters(): void {
    this.filterLabel = null;
    this.filterAssignee = null;
  }

  isCurrentUserCreator(): boolean {
    if (!this.project || !this.currentUserId) return false;
    // Assuming creator is stored in project.creatorId or we check collaborators with role 'creator'
    const creator = this.project.collaborators.find((c) => c.role === 'creator');
    return creator?.userId === this.currentUserId;
  }

  canEditTask(task: Task): boolean {
    // Implement logic: creator, admin, or assignee can edit?
    // For now, simplify: if user is creator/admin or if task has no assignees or if user is assignee
    if (!this.project || !this.currentUserId) return false;

    // Project owner/admin can always edit
    const myRole = this.project.collaborators.find(c => c.userId === this.currentUserId)?.role;
    if (myRole === 'creator' || myRole === 'admin') return true;

    // If I am assigned to the task
    return task.assignees.some(a => a.userId === this.currentUserId);
  }

  confirmLeaveProject(): void {
    if (!this.project) return;
    if (confirm('Sei sicuro di voler lasciare questo progetto?')) {
      this.projectService.removeCollaborator(this.project.id, { userId: this.currentUserId! })
        .subscribe({
          next: () => this.router.navigate(['/projects']),
          error: (err) => {
            console.error(err);
            this.error = "Errore durante l'uscita dal progetto";
          }
        });
    }
  }

  // Task Assignee Management implementation
  isAssigneeSelected(userId: string): boolean {
    return this.taskForm.assignees?.includes(userId) ?? false;
  }

  toggleAssignee(userId: string): void {
    if (!this.taskForm.assignees) this.taskForm.assignees = [];

    const index = this.taskForm.assignees.indexOf(userId);
    if (index >= 0) {
      this.taskForm.assignees.splice(index, 1);
    } else {
      this.taskForm.assignees.push(userId);
    }
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
  readonly MAX_PHASES = 3;

  openCreatePhaseModal(): void {
    if (this.project && this.project.phases.length >= this.MAX_PHASES) {
      this.error = `Puoi avere massimo ${this.MAX_PHASES} fasi`;
      return;
    }
    this.editingPhase = null;
    this.phaseTitle = ''; // Create new object to ensure binding updates
    this.error = null;
    this.showPhaseModal = true;
  }

  openEditPhaseModal(phase: Phase): void {
    this.editingPhase = phase;
    this.phaseTitle = phase.title;
    this.error = null;
    this.showPhaseModal = true;
  }

  closePhaseModal(): void {
    if (this.savingPhase) return;
    this.showPhaseModal = false;
    this.editingPhase = null;
    this.phaseTitle = '';
  }

  submitPhase(): void {
    if (!this.project) return;
    if (!this.phaseTitle.trim()) {
      this.error = 'Il nome della fase è obbligatorio';
      return;
    }

    this.savingPhase = true;
    this.error = null;

    if (this.editingPhase) {
      // Update existing phase
      const updatedPhases = this.project.phases.map((p) =>
        p.id === this.editingPhase!.id ? { ...p, title: this.phaseTitle.trim() } : p
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
    } else {
      // Create new phase
      const maxPosition = this.project.phases.reduce((max, p) => Math.max(max, p.position), 0);
      const newPhase: Phase = {
        id: crypto.randomUUID(),
        title: this.phaseTitle.trim(),
        position: maxPosition + 1,
      };

      const updatedPhases = [...this.project.phases, newPhase];

      this.projectService.updateProject(this.project.id, { phases: updatedPhases }).subscribe({
        next: (updated) => {
          this.project = updated;
          this.savingPhase = false;
          this.showPhaseModal = false;
        },
        error: (err) => {
          this.error = 'Errore creazione fase';
          this.savingPhase = false;
          console.error(err);
        },
      });
    }
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

  movePhaseLeft(phase: Phase): void {
    if (!this.project) return;
    const sortedPhases = [...this.project.phases].sort((a, b) => a.position - b.position);
    const currentIndex = sortedPhases.findIndex((p) => p.id === phase.id);
    if (currentIndex <= 0) return;

    // Swap positions
    const temp = sortedPhases[currentIndex].position;
    sortedPhases[currentIndex].position = sortedPhases[currentIndex - 1].position;
    sortedPhases[currentIndex - 1].position = temp;

    this.updatePhasesOrder(sortedPhases);
  }

  movePhaseRight(phase: Phase): void {
    if (!this.project) return;
    const sortedPhases = [...this.project.phases].sort((a, b) => a.position - b.position);
    const currentIndex = sortedPhases.findIndex((p) => p.id === phase.id);
    if (currentIndex >= sortedPhases.length - 1) return;

    // Swap positions
    const temp = sortedPhases[currentIndex].position;
    sortedPhases[currentIndex].position = sortedPhases[currentIndex + 1].position;
    sortedPhases[currentIndex + 1].position = temp;

    this.updatePhasesOrder(sortedPhases);
  }

  updatePhasesOrder(phases: Phase[]): void {
    if (!this.project) return;
    this.projectService.updateProject(this.project.id, { phases }).subscribe({
      next: (updated) => {
        this.project = updated;
      },
      error: (err) => {
        this.error = 'Errore riordinamento fasi';
        console.error(err);
      },
    });
  }

  getPhaseIndex(phase: Phase): number {
    if (!this.project) return -1;
    const sortedPhases = [...this.project.phases].sort((a, b) => a.position - b.position);
    return sortedPhases.findIndex((p) => p.id === phase.id);
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
    this.labelTitle = '';
    this.labelColor = '#6C63FF';
    this.error = null;
    this.showLabelsModal = true;
  }

  closeLabelsModal(): void {
    if (this.savingLabel) return;
    this.showLabelsModal = false;
    this.labelTitle = '';
    this.labelColor = '#6C63FF';
    this.error = null;
  }

  addLabel(inputValue?: string): void {
    if (!this.project) return;

    // Use input value if provided (bypassing potentially broken ngModel), otherwise fallback to bound property
    const titleToUse = inputValue !== undefined ? inputValue : this.labelTitle;

    if (!titleToUse.trim()) {
      this.error = "Il nome dell'etichetta è obbligatorio";
      return;
    }

    this.savingLabel = true;
    this.error = null;

    const newLabel: Label = {
      id: crypto.randomUUID(),
      title: titleToUse.trim(),
      color: this.labelColor,
    };

    const updatedLabels = [...this.project.labels, newLabel];

    this.projectService.updateProject(this.project.id, { labels: updatedLabels }).subscribe({
      next: (updated) => {
        this.project = updated;
        this.labelTitle = '';
        this.labelColor = '#6C63FF';
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
    this.labelTitle = label.title;
    this.labelColor = label.color;
    this.error = null;
    this.showEditLabelModal = true;
  }

  closeEditLabelModal(): void {
    if (this.savingLabel) return;
    this.showEditLabelModal = false;
    this.editingLabel = null;
    this.labelTitle = '';
    this.labelColor = '';
  }

  submitEditLabel(): void {
    if (!this.project || !this.editingLabel) return;
    if (!this.labelTitle.trim()) {
      this.error = "Il nome dell'etichetta è obbligatorio";
      return;
    }

    this.savingLabel = true;
    this.error = null;

    const updatedLabels = this.project.labels.map((l) =>
      l.id === this.editingLabel!.id
        ? { ...l, title: this.labelTitle.trim(), color: this.labelColor }
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
    const updatedLabels = this.project.labels.filter(l => l.id !== labelIdToDelete);

    this.projectService.updateProject(this.project.id, { labels: updatedLabels }).subscribe({
      next: (updated) => {
        this.project = updated;
        // Remove label from tasks locally
        this.tasks = this.tasks.map(t => ({
          ...t,
          labels: t.labels ? t.labels.filter(l => l.id !== labelIdToDelete) : []
        }));
        this.deletingLabel = false;
        this.showDeleteLabelConfirm = false;
        this.labelToDelete = null;
      },
      error: (err) => {
        this.error = 'Errore eliminazione etichetta';
        this.deletingLabel = false;
        console.error(err);
      }
    });
  }
}
