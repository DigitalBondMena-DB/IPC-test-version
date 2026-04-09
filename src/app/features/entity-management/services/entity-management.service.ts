import { HttpService } from '@/core/services/http.service';
import { HttpResourceRef } from '@angular/common/http';
import { Injectable, Signal, computed } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EntityManagementService extends HttpService {
  getEntities(
    endpoint: string | (() => string | undefined),
    entityType: string | (() => string | undefined) | undefined,
    params: Signal<Record<string, string | number>>,
    parentType?: string | (() => string | undefined) | undefined,
  ): HttpResourceRef<any | undefined> {
    const mergedParams = computed(() => {
      const p = { ...params() };
      const type = typeof entityType === 'function' ? entityType() : entityType;
      const pType = typeof parentType === 'function' ? parentType() : parentType;

      if (type) {
        p['type'] = type;
      }
      if (pType) {
        p['parent_type'] = pType;
      }
      return p;
    });

    return this.get<any>(endpoint, mergedParams);
  }

  getEntityById(
    endpoint: string | (() => string | undefined),
    entityType: string | (() => string | undefined) | undefined,
    id: string | (() => string | null | undefined),
  ): HttpResourceRef<any | undefined> {
    const params = computed(() => {
      const p: Record<string, string> = {};
      const type = typeof entityType === 'function' ? entityType() : entityType;
      if (type) {
        p['type'] = type;
      }
      return p;
    });

    const fullEndpoint = () => {
      const e = typeof endpoint === 'function' ? endpoint() : endpoint;
      const i = typeof id === 'function' ? id() : id;
      if (!e || !i) return undefined;
      return `${e}/${i}`;
    };

    return this.get<any>(fullEndpoint, params);
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
    return this.put<any>(`${endpoint}/${id}`, body);
  }

  toggleEntity(endpoint: string, entityType: string | undefined, id: string): Observable<any> {
    const body: Record<string, any> = {};
    if (entityType) {
      body['type'] = entityType;
    }
    return this.post<any>(`${endpoint}/${id}/toggle`, body);
  }
}
