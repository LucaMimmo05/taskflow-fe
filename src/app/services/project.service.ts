import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  AddCollaboratorRequest,
  RemoveCollaboratorRequest,
} from '../models/project.model';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

/**
 * Servizio per la gestione dei progetti
 * Comunica con il backend per operazioni CRUD sui progetti
 */
@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private readonly apiUrl = `${environment.apiUrl}/projects`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  /**
   * Crea gli headers HTTP con il token di autenticazione
   * @returns HttpHeaders con Authorization Bearer token
   */
  private getHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token && token !== 'undefined' && token !== 'null') {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  /**
   * Ottiene tutti i progetti dell'utente corrente
   * @returns Observable con array di progetti
   */
  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.apiUrl, {
      headers: this.getHeaders(),
    });
  }

  /**
   * Ottiene un singolo progetto per ID
   * @param projectId ID del progetto
   * @returns Observable con il progetto
   */
  getProject(projectId: string): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/${projectId}`, {
      headers: this.getHeaders(),
    });
  }

  /**
   * Crea un nuovo progetto
   * @param project Dati del progetto da creare
   * @returns Observable con il progetto creato
   */
  createProject(project: CreateProjectRequest): Observable<Project> {
    return this.http.post<Project>(this.apiUrl, project, {
      headers: this.getHeaders(),
    });
  }

  /**
   * Aggiorna un progetto esistente
   * @param projectId ID del progetto da aggiornare
   * @param updates Campi da aggiornare
   * @returns Observable con il progetto aggiornato
   */
  updateProject(projectId: string, updates: UpdateProjectRequest): Observable<Project> {
    return this.http.put<Project>(`${this.apiUrl}/${projectId}`, updates, {
      headers: this.getHeaders(),
    });
  }

  /**
   * Elimina un progetto
   * @param projectId ID del progetto da eliminare
   * @returns Observable con messaggio di conferma
   */
  deleteProject(projectId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${projectId}`, {
      headers: this.getHeaders(),
    });
  }

  /**
   * Aggiunge un collaboratore al progetto
   * @param projectId ID del progetto
   * @param request Dati del collaboratore da aggiungere
   * @returns Observable con il progetto aggiornato
   */
  addCollaborator(projectId: string, request: AddCollaboratorRequest): Observable<Project> {
    return this.http.post<Project>(`${this.apiUrl}/${projectId}/collaborators`, request, {
      headers: this.getHeaders(),
    });
  }

  /**
   * Rimuove un collaboratore dal progetto
   * @param projectId ID del progetto
   * @param request Dati del collaboratore da rimuovere
   * @returns Observable con il progetto aggiornato
   */
  removeCollaborator(projectId: string, request: RemoveCollaboratorRequest): Observable<Project> {
    return this.http.request<Project>('delete', `${this.apiUrl}/${projectId}/collaborators`, {
      headers: this.getHeaders(),
      body: request,
    });
  }
}
