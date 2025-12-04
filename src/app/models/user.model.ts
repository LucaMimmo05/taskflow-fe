/**
 * DTO per la richiesta di registrazione utente
 * Allineato con il backend Quarkus UserRequest
 */
export interface UserRequest {
  displayName: string;
  email: string;
  password: string;
  notifyOnDue?: boolean;
}

/**
 * DTO per la richiesta di login
 * Allineato con il backend Quarkus LoginRequest
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * DTO per la risposta di autenticazione
 * Allineato con il backend Quarkus LoginResponse
 */
export interface LoginResponse {
  token: string;
  user: UserResponse;
}

/**
 * DTO per la risposta utente
 * Allineato con il backend Quarkus UserResponse
 */
export interface UserResponse {
  id: string;
  displayName: string;
  email: string;
  notifyOnDue: boolean;
  avatarUrl?: string;
}

/**
 * Request per aggiornare il profilo utente
 */
export interface UpdateUserRequest {
  displayName: string;
  email: string;
  password: string;
  notifyOnDue?: boolean;
}

/**
 * Request per aggiornare le impostazioni
 */
export interface UpdateSettingsRequest {
  notifyOnDue: boolean;
}
