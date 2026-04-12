import { HttpService } from '@/core/services/http.service';
import { Injectable, Signal } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '@/core/config/api.config';
import { HttpResourceRef } from '@angular/common/http';
import { SurveyOverviewResponse } from '../models/survey-overview.interface';

@Injectable({
  providedIn: 'root',
})
export class SurveyService extends HttpService {
  getSurveys(params: Signal<any>) {
    return this.get<any>(API_CONFIG.ENDPOINTS.SURVEYS.BASE, params);
  }

  duplicateSurvey(id: string | number): Observable<any> {
    return this.post<any>(`${API_CONFIG.ENDPOINTS.SURVEYS.BASE}/${id}/duplicate`, {});
  }

  toggleSurvey(id: string | number): Observable<any> {
    return this.post<any>(`${API_CONFIG.ENDPOINTS.SURVEYS.BASE}/${id}/toggle`, {});
  }
  createSurvey(data: any): Observable<any> {
    return this.post<any>(API_CONFIG.ENDPOINTS.SURVEYS.BASE, data);
  }

  updateSurvey(id: string | number, data: any): Observable<any> {
    return this.http.put<any>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SURVEYS.BASE}/${id}`,
      data,
    );
  }

  getSurveyById(id: string | number | Signal<string | null>): HttpResourceRef<any | undefined> {
    return this.get<any>(() => {
      const actualId = typeof id === 'function' ? id() : id;
      return actualId ? `${API_CONFIG.ENDPOINTS.SURVEYS.BASE}/${actualId}` : '';
    });
  }

  getSurveyOverview(id: string | number): HttpResourceRef<SurveyOverviewResponse | undefined> {
    return this.get<SurveyOverviewResponse>(`${API_CONFIG.ENDPOINTS.SURVEYS.BASE}/${id}/overview`);
  }

  getCategories(): Observable<any> {
    return this.http.get<any>(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DIVISIONS}`);
  }

  toggleDomainNa(id: string | number): Observable<any> {
    return this.post<any>(`${API_CONFIG.ENDPOINTS.SURVEYS.DOMAINS}/${id}/toggle-na`, {});
  }

  duplicateDomain(id: string | number): Observable<any> {
    return this.post<any>(`${API_CONFIG.ENDPOINTS.SURVEYS.DOMAINS}/${id}/duplicate`, {});
  }
}
