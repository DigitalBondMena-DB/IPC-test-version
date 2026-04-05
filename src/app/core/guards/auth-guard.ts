import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const _AuthService = inject(AuthService);
  if (_AuthService.isAuthenticated()) {
    return true;
  }
  _AuthService.logout();
  return false;
};
