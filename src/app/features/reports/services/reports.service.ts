import { Injectable, Signal } from '@angular/core';
import { HttpService } from '@/core/services/http.service';
import { HttpResourceRef } from '@angular/common/http';
import { ReportOverviewResponse } from '../models/reports.model';

@Injectable({
  providedIn: 'root',
})
export class ReportsService extends HttpService {
  getOverview(params?: Signal<any>): HttpResourceRef<ReportOverviewResponse | undefined> {
    return this.get<ReportOverviewResponse>('reports/overview', params);
  }

  getOverviewDetails(params?: Signal<any>): HttpResourceRef<any | undefined> {
    return this.get<any>('reports/overview-details', params);
  }
}
