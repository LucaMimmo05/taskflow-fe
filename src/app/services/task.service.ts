import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, CreateTaskRequest, UpdateTaskRequest } from '../models/task.model';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

/**
 * Servizio per la gestione dei task
 * Comunica con il backend per operazioni CRUD sui task
 */
@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private readonly apiUrl = `${environment.apiUrl}/task`;

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
   * Ottiene tutti i task di un progetto
   * @param projectId ID del progetto
   * @returns Observable con array di task
   */
  getTasksByProject(projectId: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/${projectId}`, {
      headers: this.getHeaders(),
    });
  }

  /**
   * Crea un nuovo task
   * @param projectId ID del progetto
   * @param task Dati del task da creare
   * @returns Observable con il task creato
   */
  createTask(projectId: string, task: CreateTaskRequest): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}/${projectId}`, task, {
      headers: this.getHeaders(),
    });
  }

  /**
   * Aggiorna un task esistente
   * @param taskId ID del task da aggiornare
   * @param updates Campi da aggiornare
   * @returns Observable con il task aggiornato
   */
  updateTask(taskId: string, updates: UpdateTaskRequest): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${taskId}`, updates, {
      headers: this.getHeaders(),
    });
  }

  /**
   * Elimina un task
   * @param taskId ID del task da eliminare
   * @returns Observable con messaggio di conferma
   */
  deleteTask(taskId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${taskId}`, {
      headers: this.getHeaders(),
    });
  }
}
