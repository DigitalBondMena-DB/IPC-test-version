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
    const requireSupervisor = route.data?.['requireSupervisor'] as boolean;
    if (requireSupervisor && userRole === 'facility' && !authService.isSupervisor()) {
      messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: `Access denied. Facility users must be supervisors to access this route.`,
      });
      return false;
    }
    return true;
  }
  messageService.add({
    severity: 'error',
    summary: 'Error',
    detail: `Access denied. User role '${userRole}' is not authorized for this route.`,
  });
  return false;
};
