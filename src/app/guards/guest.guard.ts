import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard per le pagine pubbliche (login, register)
 * Se l'utente è già autenticato, reindirizza alla home
 */
export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    // Utente già autenticato, reindirizza alla home
    router.navigate(['/home']);
    return false;
  }

  return true;
};
