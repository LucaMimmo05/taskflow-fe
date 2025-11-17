import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { UserRequest, LoginRequest, LoginResponse, UserResponse } from '../models/user.model';

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
   * Registra un nuovo utente e salva automaticamente i dati
   * @param userRequest Dati utente per la registrazione
   * @returns Observable con token e dati utente
   */
  register(userRequest: UserRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/register`, userRequest).pipe(
      tap(response => this.saveAuthData(response))
    );
  }

  /**
   * Effettua il login e salva automaticamente i dati
   * @param loginRequest Credenziali di accesso
   * @returns Observable con token e dati utente
   */
  login(loginRequest: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, loginRequest).pipe(
      tap(response => this.saveAuthData(response))
    );
  }

  /**
   * Salva i dati di autenticazione nel localStorage
   * @param response Risposta dal backend con token e user
   */
  private saveAuthData(response: LoginResponse | any): void {
    const token: string | undefined = response?.token ?? response?.accessToken;

    if (token && token !== 'undefined' && token !== 'null') {
      localStorage.setItem('access_token', token);
    } else {
      localStorage.removeItem('access_token');
    }

    // refresh_token non più usato
    localStorage.removeItem('refresh_token');

    if (response?.user) {
      localStorage.setItem('user', JSON.stringify(response.user));
    }
  }

  /**
   * Verifica se l'utente è autenticato
   * @returns true se il token è presente, false altrimenti
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    if (!token) return false;
    if (token === 'undefined' || token === 'null') return false;
    return true;
  }

  /**
   * Ottiene il token di accesso
   * @returns Il token salvato o null
   */
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * Ottiene i dati dell'utente corrente
   * @returns I dati dell'utente o null
   */
  getCurrentUser(): UserResponse | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Effettua il logout
   * Rimuove token e dati utente dal localStorage
   */
  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  }
}
