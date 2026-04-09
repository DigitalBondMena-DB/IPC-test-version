import { Routes } from '@angular/router';
import { createUserRoutes } from './base/user-routes.factory';
import { SuperAdminUser } from './users/super-admin.user';
import { GovernorateUser } from './users/governorate.user';
import { SectorUser } from './users/sector.user';
import { AuthorityUser } from './users/authority.user';
import { FacilityUser } from './users/facility.user';

export default [
  createUserRoutes('super-admin-users', SuperAdminUser),
  createUserRoutes('governorates-users', GovernorateUser),
  createUserRoutes('sectors-users', SectorUser),
  createUserRoutes('authorities-users', AuthorityUser),
  createUserRoutes('facilities-users', FacilityUser),
] as Routes;
