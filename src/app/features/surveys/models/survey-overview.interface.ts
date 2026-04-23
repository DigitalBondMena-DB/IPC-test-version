export interface SurveyOverviewResponse {
  data: SurveyOverview;
}

export interface SurveyOverview {
  id: number;
  title: string;
  description: string;
  scoring_type: string;
  weighting_type: string;
  is_active: boolean;
  divisions: string[];
  totals: SurveyTotals;
  remaining_weight: number;
  domains: SurveyDomain[];
  high_risk_summary: HighRiskSummary;
  logic_summary: LogicSummary;
}

export interface SurveyTotals {
  preliminary_questions: number;
  domains: number;
  subdomains: number;
  total_questions: number;
  graded_questions: number;
}

export interface SurveyDomain {
  id: number;
  title: string;
  weight: string;
  order: number;
  questions_count: number;
  questions: string[];
  children: SurveyDomain[];
}

export interface HighRiskSummary {
  total: number;
  alarm_questions: string[]; // Adjust type if it's an array of objects
}

export interface LogicSummary {
  total_rules: number;
  rules: LogicRule[];
}

export interface LogicRule {
  trigger_question_id: number;
  trigger_question_text: string;
  trigger_answer: string;
  action_type: string;
  target_question_id: number | null;
  target_question_text: string;
  summary: string;
}
