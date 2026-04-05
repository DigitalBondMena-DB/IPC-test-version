import { HttpService } from '@/core/services/http.service';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ILoginData, ILoginResponse } from '../interfaces/auth';
import { API_CONFIG } from '@/core/config/api.config';
import { AuthService } from '@/core/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class LoginService extends HttpService {
  private readonly _AuthService = inject(AuthService);
  login(data: ILoginData): Observable<ILoginResponse> {
    return this.post<ILoginResponse>(API_CONFIG.ENDPOINTS.LOGIN, data).pipe(
      tap((response: ILoginResponse) => {
        this._AuthService.setUserData(response);
      }),
    );
  }
}
