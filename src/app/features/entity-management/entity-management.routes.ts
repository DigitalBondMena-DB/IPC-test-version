import { roleGuard } from '@/core/guards/role-guard';
import { Routes } from '@angular/router';
import { createEntityRoutes } from './base/entity-routes.factory';
import { DivisionEntity } from './entities/division.entity';
import { GovernorateEntity } from './entities/governorate.entity';
import { SectorEntity } from './entities/sector.entity';
import { AuthorityEntity } from './entities/authority.entity';
import { FacilityEntity } from './entities/facility.entity';

export default [
  createEntityRoutes('divisions', DivisionEntity),
  createEntityRoutes('governorates', GovernorateEntity),
  createEntityRoutes('sectors', SectorEntity),
  createEntityRoutes('authorities', AuthorityEntity, { roles: ['super_admin'] }, [roleGuard]),
  createEntityRoutes('facilities', FacilityEntity),
] as Routes;
