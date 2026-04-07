import { Routes } from '@angular/router';

export default [
  {
    path: 'divisions',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('@features/entity-management/entity-list/entity-list.component').then(
            (m) => m.EntityListComponent,
          ),
        data: { type: 'DIVISION' },
      },
      {
        path: 'create',
        loadComponent: () =>
          import('@features/entity-management/entity-id/entity-id.component').then(
            (m) => m.EntityIdComponent,
          ),
        data: { type: 'DIVISION' },
      },
      {
        path: 'edit/:id',
        loadComponent: () =>
          import('@features/entity-management/entity-id/entity-id.component').then(
            (m) => m.EntityIdComponent,
          ),
        data: { type: 'DIVISION' },
      },
    ],
  },
  {
    path: 'governorates',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('@features/entity-management/entity-list/entity-list.component').then(
            (m) => m.EntityListComponent,
          ),
        data: { type: 'GOVERNORATES' },
      },
      {
        path: 'create',
        loadComponent: () =>
          import('@features/entity-management/entity-id/entity-id.component').then(
            (m) => m.EntityIdComponent,
          ),
        data: { type: 'GOVERNORATES' },
      },
      {
        path: 'edit/:id',
        loadComponent: () =>
          import('@features/entity-management/entity-id/entity-id.component').then(
            (m) => m.EntityIdComponent,
          ),
        data: { type: 'GOVERNORATES' },
      },
    ],
  },
  {
    path: 'sectors',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('@features/entity-management/entity-list/entity-list.component').then(
            (m) => m.EntityListComponent,
          ),
        data: { type: 'SECTORS' },
      },
      {
        path: 'create',
        loadComponent: () =>
          import('@features/entity-management/entity-id/entity-id.component').then(
            (m) => m.EntityIdComponent,
          ),
        data: { type: 'SECTORS' },
      },
      {
        path: 'edit/:id',
        loadComponent: () =>
          import('@features/entity-management/entity-id/entity-id.component').then(
            (m) => m.EntityIdComponent,
          ),
        data: { type: 'SECTORS' },
      },
    ],
  },
  {
    path: 'authorities',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('@features/entity-management/entity-list/entity-list.component').then(
            (m) => m.EntityListComponent,
          ),
        data: { type: 'AUTHORITY' },
      },
      {
        path: 'create',
        loadComponent: () =>
          import('@features/entity-management/entity-id/entity-id.component').then(
            (m) => m.EntityIdComponent,
          ),
        data: { type: 'AUTHORITY' },
      },
      {
        path: 'edit/:id',
        loadComponent: () =>
          import('@features/entity-management/entity-id/entity-id.component').then(
            (m) => m.EntityIdComponent,
          ),
        data: { type: 'AUTHORITY' },
      },
    ],
  },
  {
    path: 'facilities',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('@features/entity-management/entity-list/entity-list.component').then(
            (m) => m.EntityListComponent,
          ),
        data: { type: 'FACILITIES' },
      },
      {
        path: 'create',
        loadComponent: () =>
          import('@features/entity-management/entity-id/entity-id.component').then(
            (m) => m.EntityIdComponent,
          ),
        data: { type: 'FACILITIES' },
      },
      {
        path: 'edit/:id',
        loadComponent: () =>
          import('@features/entity-management/entity-id/entity-id.component').then(
            (m) => m.EntityIdComponent,
          ),
        data: { type: 'FACILITIES' },
      },
    ],
  },
] as Routes;
