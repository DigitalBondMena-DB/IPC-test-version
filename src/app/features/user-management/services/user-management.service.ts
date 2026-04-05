import { API_CONFIG } from '@/core/config/api.config';
import { HttpService } from '@/core/services/http.service';
import { HttpResourceRef } from '@angular/common/http';
import { computed, Injectable, Signal } from '@angular/core';
import { Observable } from 'rxjs';

export interface IUser {
  id: number;
  username: string;
  email: string;
  phone: string;
  entity_id: number;
  entity_name?: string;
  updated_at: string;
  updated_by: string;
  is_active: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class UserManagementService extends HttpService {
  // Generic methods to handle different user types by passing the endpoint

  getUsers(
    endpoint: string,
    userType: string,
    params: Signal<Record<string, string | number>>,
  ): HttpResourceRef<any | undefined> {
    const mergedParams = computed(() => ({
      ...params(),
      entity_type: userType,
    }));
    return this.get<any>(endpoint, mergedParams);
  }

  getUserById(endpoint: string, userType: string, id: string): HttpResourceRef<IUser | undefined> {
    const params = computed(() => ({
      type: userType,
    }));
    return this.get<IUser>(`${endpoint}/${id}`, params);
  }

  createUser(endpoint: string, userType: string, data: any): Observable<any> {
    return this.post<any>(endpoint, {
      ...data,
      type: userType,
    });
  }

  updateUser(endpoint: string, userType: string, id: string, data: any): Observable<any> {
    return this.http.put<any>(`${API_CONFIG.BASE_URL}${endpoint}/${id}`, {
      ...data,
      type: userType,
    });
  }

  toggleUser(endpoint: string, userType: string, id: string): Observable<any> {
    return this.post<any>(`${endpoint}/${id}/toggle`, {
      type: userType,
    });
  }
}
