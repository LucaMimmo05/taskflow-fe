/**
 * Collaboratore di un progetto
 */
export interface Collaborator {
  userId: string;
  displayName: string;
  role: 'creator' | 'admin' | 'member';
  joinedAt?: string;
}

/**
 * Fase del progetto (colonna Kanban)
 */
export interface Phase {
  id: string;
  title: string;
  position: number;
}

/**
 * Etichetta del progetto
 */
export interface Label {
  id: string;
  title: string;
  color: string;
}

/**
 * Progetto completo
 */
export interface Project {
  id: string;
  title: string;
  creatorName: string;
  collaborators: Collaborator[];
  phases: Phase[];
  labels: Label[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Request per creare un nuovo progetto
 */
export interface CreateProjectRequest {
  title: string;
  collaborators?: {
    userId: string;
    role: 'admin' | 'member';
  }[];
  phases: Phase[];
  labels?: Label[];
}

/**
 * Request per aggiornare un progetto
 */
export interface UpdateProjectRequest {
  title?: string;
  phases?: Phase[];
  labels?: Label[];
}

/**
 * Request per aggiungere un collaboratore
 */
export interface AddCollaboratorRequest {
  userId: string;
}

/**
 * Request per rimuovere un collaboratore
 */
export interface RemoveCollaboratorRequest {
  userId: string;
}
