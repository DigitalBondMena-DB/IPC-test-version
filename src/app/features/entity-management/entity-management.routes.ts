import { roleGuard } from '@/core/guards/role-guard';
import { Routes } from '@angular/router';
import { createEntityRoutes } from './base/entity-routes.factory';
import { DivisionEntity } from './entities/division.entity';
import { GovernorateEntity } from './entities/governorate.entity';
import { SectorEntity } from './entities/sector.entity';
import { AuthorityEntity } from './entities/authority.entity';
import { FacilityEntity } from './entities/facility.entity';
import { DepartmentEntity } from './entities/department.entity';
import { FacilityDepartmentEntity } from './entities/facility-department.entity';
import { BaseEntity } from './base/base-entity';

export default [
  createEntityRoutes('departments', DepartmentEntity, { roles: ['super_admin'] }, [roleGuard]),
  {
    path: 'facility-departments',
    providers: [
      { provide: BaseEntity, useClass: FacilityDepartmentEntity }
    ],
    canMatch: [roleGuard],
    data: { roles: ['super_admin', 'facility'] },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./entity-list/entity-list.component').then((m) => m.EntityListComponent),
      },
      {
        path: 'create',
        loadComponent: () =>
          import('./entities/facility-departments/components/facility-department-form.component').then(
            (m) => m.FacilityDepartmentFormComponent,
          ),
      },
      {
        path: 'edit/:id',
        loadComponent: () =>
          import('./entities/facility-departments/components/facility-department-form.component').then(
            (m) => m.FacilityDepartmentFormComponent,
          ),
      },
    ],
  },
  createEntityRoutes('divisions', DivisionEntity),
  createEntityRoutes('governorates', GovernorateEntity),
  createEntityRoutes('sectors', SectorEntity),
  createEntityRoutes('authorities', AuthorityEntity, { roles: ['super_admin'] }, [roleGuard]),
  createEntityRoutes('facilities', FacilityEntity),
] as Routes;
