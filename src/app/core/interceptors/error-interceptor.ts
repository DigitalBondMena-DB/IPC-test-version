import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

// Throttle auth error notifications to prevent toast storms on parallel request failures
let lastAuthErrorTime = 0;
const AUTH_ERROR_THROTTLE_MS = 3000;

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const _MessageService = inject(MessageService);
  const _AuthService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const isLoginPath = router.url.includes('login');

      // 1. Handle Unauthenticated (401) or Forbidden (403)
      if ((error.status === 401 || error.status === 403) && !isLoginPath) {
        const now = Date.now();
        if (now - lastAuthErrorTime > AUTH_ERROR_THROTTLE_MS) {
          lastAuthErrorTime = now;

          const summary = error.status === 401 ? 'Unauthenticated' : 'Forbidden';
          const detail =
            error.status === 401
              ? 'Your session has ended. Please login again.'
              : 'You do not have permission to access this resource.';

          _MessageService.add({
            severity: 'error',
            summary,
            detail,
            life: 5000,
          });
        }

        _AuthService.logout();
        return throwError(() => error);
      }

      // 2. Extract Error Message from Backend
      let errorMessage = 'An unexpected error occurred';

      if (error.error instanceof ErrorEvent) {
        // Client-side or Network error
        errorMessage = error.error.message;
      } else {
        // Server-side error
        errorMessage =
          error.error?.message || error.error?.error || error.message || 'Server Internal Error';
      }

      if (error.status !== 401 && error.status !== 403) {
        const errorMessages: string[] = Object.values(error.error.errors);
        if (Array.isArray(errorMessages) && errorMessages.length > 0) {
          errorMessages.forEach((message) => {
            _MessageService.add({
              severity: 'error',
              summary: `Error ${error.status || ''}`,
              detail: message,
              life: 5000,
            });
          });
        }

        _MessageService.add({
          severity: 'error',
          summary: `Error ${error.status || ''}`,
          detail: errorMessage,
          life: 5000,
        });
      }

      // 4. IMPORTANT: Re-throw the error so HttpClient/HttpResource can detect failure
      return throwError(() => error);
    }),
  );
};
