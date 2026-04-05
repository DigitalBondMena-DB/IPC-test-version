import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const unAuthGuard: CanActivateFn = (route, state) => {
  const _AuthService = inject(AuthService);
  const router = inject(Router);
  if (_AuthService.isAuthenticated()) {
    router.navigate(['/']);
    return false;
  }
  return true;
};
