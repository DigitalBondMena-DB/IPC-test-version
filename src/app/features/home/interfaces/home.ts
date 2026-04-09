export interface IHomeResponse {
  data: Data;
}
interface Data {
  counts: Counts;
  statistics: Statistics;
}
interface Counts {
  users: number;
  surveys: number;
  divisions: number;
  authorities: number;
  sectors: number;
  facilities: number;
}
interface Statistics {
  inspections_completed: number;
  inspections_in_progress: number;
  average_compliance: number;
  pending_action_plans: number;
  active_alarms: number;
}
