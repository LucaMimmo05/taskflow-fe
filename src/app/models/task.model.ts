import { Label } from './project.model';

/**
 * Assegnatario di un task
 */
export interface TaskAssignee {
  userId: string;
  displayName: string;
}

/**
 * Task completo
 */
export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  phaseId: string;
  labels: Label[];
  assignees: TaskAssignee[];
  createdBy: string;
  createdByName: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Request per creare un nuovo task
 */
export interface CreateTaskRequest {
  title: string;
  description?: string;
  phaseId: string;
  labelIds?: string[];
  assignees?: string[];
  dueDate?: string;
}

/**
 * Request per aggiornare un task
 */
export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  phaseId?: string;
  labelIds?: string[];
  assignees?: string[];
  dueDate?: string;
}
