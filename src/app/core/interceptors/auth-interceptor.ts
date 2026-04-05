import { AuthService } from '@/core/services/auth.service';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const _AuthService = inject(AuthService);
  const _MessageService = inject(MessageService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !router.url.includes('login')) {
        _MessageService.add({
          severity: 'error',
          summary: 'Unauthenticated',
          detail: 'your session ended or you are Unauthenticated',
        });
        _AuthService.logout();
      }
      return throwError(() => error);
    }),
  );
};
