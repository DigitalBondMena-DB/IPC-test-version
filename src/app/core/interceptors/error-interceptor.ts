import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const _MessageService = inject(MessageService);
  const _AuthService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // 1. Handle Unauthenticated (401)
      if (error.status === 401 && !router.url.includes('login')) {
        _MessageService.add({
          severity: 'error',
          summary: 'Unauthenticated',
          detail: 'Your session has ended or you are unauthenticated. Please login again.',
        });
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
        // Some backends return { message: "..." } or { error: "..." }
        errorMessage =
          error.error?.message || error.error?.error || error.message || 'Server Internal Error';
      }

      // 3. Display Global Toast Notification (except for 401 handled above)
      if (error.status !== 401) {
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
