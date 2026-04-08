import { inject } from '@angular/core';
import { CanMatchFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '@/shared/models/users-role.model';
import { MessageService } from 'primeng/api';

export const roleGuard: CanMatchFn = (route, segments) => {
  const authService = inject(AuthService);
  const messageService = inject(MessageService);
  const allowedRoles = route.data?.['roles'] as Role[];

  const userRole = authService.role();

  if (userRole && allowedRoles.includes(userRole)) {
    return true;
  }
  messageService.add({
    severity: 'error',
    summary: 'Error',
    detail: `Access denied. User role '${userRole}' is not authorized for this route.`,
  });
  return false;
};
