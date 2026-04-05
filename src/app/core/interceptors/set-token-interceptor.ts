import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const setTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const _AuthService = inject(AuthService);
  const token = _AuthService.userData()?.token;
  if (token) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(clonedReq);
  }
  return next(req);
};
