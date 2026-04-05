import { HttpService } from '@/core/services/http.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '@/core/config/api.config';

@Injectable({
  providedIn: 'root',
})
export class SurveyLogicService extends HttpService {
  createLogicRule(questionId: number | string, data: any): Observable<any> {
    return this.post<any>(`${API_CONFIG.ENDPOINTS.QUESTIONS}/${questionId}/logic-rules`, data);
  }

  updateLogicRule(ruleId: number | string, data: any): Observable<any> {
    // HttpService handles base URL for put as well if it's implemented,
    // but in survey.service.ts `put` was called via `this.http.put` with absolute URL.
    return this.http.put<any>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIC_RULES}/${ruleId}`,
      data,
    );
  }

  deleteLogicRule(ruleId: number | string): Observable<any> {
    return this.delete<any>(`${API_CONFIG.ENDPOINTS.LOGIC_RULES}/${ruleId}`);
  }
}
