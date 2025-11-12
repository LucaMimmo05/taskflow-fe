import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserRequest, LoginRequest, LoginResponse } from '../models/user.model';

/**
 * Servizio per la gestione dell'autenticazione
 * Comunica con il backend Quarkus
 */
@Injectable({
  providedIn: 'root'
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
}

