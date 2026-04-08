import { Route } from '@angular/router';
import { Role } from './users-role.model';

export interface AppRoute extends Route {
  data?: AppRouteData;
}
interface AppRouteData {
  roles?: Role[];
}
