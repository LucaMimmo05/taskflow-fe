import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserRequest, LoginRequest, LoginResponse } from '../models/user.model';

/**
 * Servizio per la gestione dell'autenticazione
 * Comunica con il backend Quarkus
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  /**
   * Registra un nuovo utente
   * @param userRequest Dati utente per la registrazione
   * @returns Observable con token e dati utente
   */
  register(userRequest: UserRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/register`, userRequest);
  }

  /**
   * Effettua il login
   * @param loginRequest Credenziali di accesso
   * @returns Observable con token e dati utente
   */
  login(loginRequest: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, loginRequest);
  }

  /**
   * Verifica se l'utente è autenticato
   * @returns true se il token è presente, false altrimenti
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    return !!token;
  }

  /**
   * Ottiene il token di accesso
   * @returns Il token salvato o null
   */
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * Ottiene il refresh token
   * @returns Il refresh token salvato o null
   */
  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  /**
   * Ottiene i dati dell'utente corrente
   * @returns I dati dell'utente o null
   */
  getCurrentUser(): any {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Effettua il logout
   * Rimuove token e dati utente dal localStorage
   */
  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }
}
