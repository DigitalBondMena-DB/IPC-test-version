import { HttpClient, httpResource, HttpResourceRef } from '@angular/common/http';
import { inject, Injectable, Signal } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  public http = inject(HttpClient);

  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(API_CONFIG.BASE_URL + endpoint, data);
  }
  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(API_CONFIG.BASE_URL + endpoint);
  }
  get<T>(
    endpoint: string | (() => string | undefined) | undefined,
    params?: Signal<any>,
  ): HttpResourceRef<T | undefined> {
    return httpResource<T>(() => {
      const currentParams = params ? params() : {};
      const actualEndpoint = typeof endpoint === 'function' ? endpoint() : endpoint;
      
      if (!actualEndpoint) return undefined;

      return {
        url: API_CONFIG.BASE_URL + actualEndpoint,
        method: 'GET',
        params: currentParams,
      };
    });
  }
}
