import { HttpClient, httpResource, HttpResourceRef } from '@angular/common/http';
import { inject, Injectable, Signal } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  public http = inject(HttpClient);

  private hasFile(data: any): boolean {
    if (!data) return false;
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        if (data[key] instanceof File || data[key] instanceof Blob) return true;
      }
    }
    return false;
  }

  private processData(data: any): any {
    if (!this.hasFile(data)) return data;

    const formData = new FormData();
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const val = data[key];
        if (Array.isArray(val)) {
            val.forEach((item, index) => {
               formData.append(`${key}[${index}]`, item); 
            });
        } else if (val !== null && val !== undefined) {
             formData.append(key, val);
        }
      }
    }
    return formData;
  }

  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(API_CONFIG.BASE_URL + endpoint, this.processData(data));
  }

  put<T>(endpoint: string, data: any): Observable<T> {
    const processed = this.processData(data);
    if (processed instanceof FormData) {
        processed.append('_method', 'PUT');
        return this.http.post<T>(API_CONFIG.BASE_URL + endpoint, processed);
    }
    return this.http.put<T>(API_CONFIG.BASE_URL + endpoint, processed);
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
