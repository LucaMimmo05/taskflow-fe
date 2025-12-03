import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserResponse, UpdateUserRequest, UpdateSettingsRequest } from '../models/user.model';
import { AuthService } from './auth.service';

/**
 * Servizio per la gestione del profilo utente
 * Comunica con il backend per operazioni sul profilo
 */
@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly apiUrl = 'http://localhost:8080/api/user';

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
   * Aggiorna il profilo dell'utente corrente
   * @param updates Dati da aggiornare
   * @returns Observable con i dati utente aggiornati
   */
  updateProfile(updates: UpdateUserRequest): Observable<UserResponse> {
    return this.http.put<UserResponse>(this.apiUrl, updates, {
      headers: this.getHeaders(),
    });
  }

  /**
   * Aggiorna le impostazioni dell'utente corrente
   * @param settings Impostazioni da aggiornare
   * @returns Observable con messaggio di conferma
   */
  updateSettings(settings: UpdateSettingsRequest): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/settings`, settings, {
      headers: this.getHeaders(),
    });
  }

  /**
   * Elimina l'account dell'utente corrente
   * @returns Observable con messaggio di conferma
   */
  deleteAccount(): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(this.apiUrl, {
      headers: this.getHeaders(),
    });
  }

  /**
   * Cerca un utente per email
   * @param email Email dell'utente da cercare
   * @returns Observable con i dati dell'utente
   */
  getUserByEmail(email: string): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/search`, {
      headers: this.getHeaders(),
      params: { email },
    });
  }
}
