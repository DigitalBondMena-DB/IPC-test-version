import { API_CONFIG } from '@/core/config/api.config';
import { HttpService } from '@/core/services/http.service';
import { HttpResourceRef } from '@angular/common/http';
import { Injectable, Signal, computed } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EntityManagementService extends HttpService {
  getEntities(
    endpoint: string,
    entityType: string | undefined,
    params: Signal<Record<string, string | number>>,
    parentType?: string | undefined,
  ): HttpResourceRef<any | undefined> {
    const mergedParams = computed(() => {
      const p = { ...params() };
      if (entityType) {
        p['type'] = entityType;
      }
      if (parentType) {
        p['parent_type'] = parentType;
      }
      return p;
    });
    return this.get<any>(endpoint, mergedParams);
  }

  getEntityById(
    endpoint: string,
    entityType: string | undefined,
    id: string,
  ): HttpResourceRef<any | undefined> {
    const params = computed(() => {
      const p: Record<string, string> = {};
      if (entityType) {
        p['type'] = entityType;
      }
      return p;
    });
    return this.get<any>(`${endpoint}/${id}`, params);
  }

  createEntity(endpoint: string, entityType: string | undefined, data: any): Observable<any> {
    const body = { ...data };
    if (entityType) {
      body['type'] = entityType;
    }
    return this.post<any>(endpoint, body);
  }

  updateEntity(
    endpoint: string,
    entityType: string | undefined,
    id: string,
    data: any,
  ): Observable<any> {
    const body = { ...data };
    if (entityType) {
      body['type'] = entityType;
    }
    return this.http.put<any>(`${API_CONFIG.BASE_URL}${endpoint}/${id}`, body);
  }

  toggleEntity(endpoint: string, entityType: string | undefined, id: string): Observable<any> {
    const body: Record<string, any> = {};
    if (entityType) {
      body['type'] = entityType;
    }
    return this.post<any>(`${endpoint}/${id}/toggle`, body);
  }
}
