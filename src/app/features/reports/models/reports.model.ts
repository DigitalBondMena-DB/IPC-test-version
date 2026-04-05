export interface ReportMetrics {
  total_surveys: number;
  completed: number;
  expired: number;
  surveyors: number;
  domains: number;
  sub_domains: number;
  questions: number;
  av_percentage: number;
}

export interface RecentSubmission {
  id: number;
  survey_name: string;
  survivor_name: string;
  submitted_at: string | null;
  entity_name: string;
  status: string;
}

export interface ReportOverviewData {
  metrics: ReportMetrics;
  recent_submissions: RecentSubmission[];
}

export interface ReportOverviewResponse {
  data: ReportOverviewData;
}

export interface ReportFilterParams {
  entity_id?: number;
  entity_type?: 'governorate' | 'medical_area' | 'hospital';
  start_date?: string;
  end_date?: string;
}
