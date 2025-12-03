import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard per proteggere le route che richiedono autenticazione
 * Verifica se l'utente è autenticato, altrimenti reindirizza al login
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Reindirizza al login salvando l'URL di destinazione
  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url },
  });
  return false;
};
