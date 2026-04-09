import { Type } from '@angular/core';
import { Route } from '@angular/router';
import { BaseEntity } from './base-entity';

export function createEntityRoutes(
  path: string,
  entityClass: Type<BaseEntity>,
  extraData: any = {},
  canMatch: any[] = []
): Route {
  return {
    path,
    providers: [
      { provide: BaseEntity, useClass: entityClass }
    ],
    ...(canMatch.length ? { canMatch } : {}),
    ...(Object.keys(extraData).length ? { data: extraData } : {}),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('@features/entity-management/entity-list/entity-list.component').then(
            (m) => m.EntityListComponent,
          ),
      },
      {
        path: 'create',
        loadComponent: () =>
          import('@features/entity-management/entity-id/entity-id.component').then(
            (m) => m.EntityIdComponent,
          ),
      },
      {
        path: 'edit/:id',
        loadComponent: () =>
          import('@features/entity-management/entity-id/entity-id.component').then(
            (m) => m.EntityIdComponent,
          ),
      },
    ],
  };
}
