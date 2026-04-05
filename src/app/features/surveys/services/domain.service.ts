import { Injectable } from '@angular/core';
import { HttpService } from '@/core/services/http.service';
import { Observable } from 'rxjs';
import { API_CONFIG } from '@/core/config/api.config';

export interface DomainPayload {
  title: string;
  weight?: number;
  order?: number;
  parent_id?: number | null;
  pricing_logic?: string;
  questions?: DomainQuestion[];
}

export interface DomainQuestion {
  text: string;
  description?: string;
  hint?: string;
  type: string;
  is_scored: boolean;
  max_score?: number;
  order?: number;
  meta_data?: any;
  logic_rules?: any;
}

@Injectable({
  providedIn: 'root',
})
export class DomainService extends HttpService {
  private getBaseUrl(surveyId: string | number): string {
    return `${API_CONFIG.ENDPOINTS.SURVEYS.DOMAINS}/${surveyId}`;
  }

  createDomain(surveyId: string | number, data: DomainPayload): Observable<any> {
    return this.post<any>(this.getBaseUrl(surveyId), data);
  }

  updateDomain(domainId: number, data: Partial<DomainPayload[]>): Observable<any> {
    return this.http.put<any>(`${API_CONFIG.BASE_URL}${this.getBaseUrl(domainId)}`, data);
  }

  deleteDomain(domainId: number): Observable<any> {
    return this.http.delete<any>(`${API_CONFIG.BASE_URL}${this.getBaseUrl(domainId)}`);
  }
}
