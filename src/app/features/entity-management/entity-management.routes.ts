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
    path: 'health-directorate',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('@features/entity-management/entity-list/entity-list.component').then(
            (m) => m.EntityListComponent,
          ),
        data: { type: 'HEALTH_DIRECTORATE' },
      },
      {
        path: 'create',
        loadComponent: () =>
          import('@features/entity-management/entity-id/entity-id.component').then(
            (m) => m.EntityIdComponent,
          ),
        data: { type: 'HEALTH_DIRECTORATE' },
      },
      {
        path: 'edit/:id',
        loadComponent: () =>
          import('@features/entity-management/entity-id/entity-id.component').then(
            (m) => m.EntityIdComponent,
          ),
        data: { type: 'HEALTH_DIRECTORATE' },
      },
    ],
  },
  {
    path: 'health-division',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('@features/entity-management/entity-list/entity-list.component').then(
            (m) => m.EntityListComponent,
          ),
        data: { type: 'HEALTH_DIVISION' },
      },
      {
        path: 'create',
        loadComponent: () =>
          import('@features/entity-management/entity-id/entity-id.component').then(
            (m) => m.EntityIdComponent,
          ),
        data: { type: 'HEALTH_DIVISION' },
      },
      {
        path: 'edit/:id',
        loadComponent: () =>
          import('@features/entity-management/entity-id/entity-id.component').then(
            (m) => m.EntityIdComponent,
          ),
        data: { type: 'HEALTH_DIVISION' },
      },
    ],
  },
  {
    path: 'hospitals',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('@features/entity-management/entity-list/entity-list.component').then(
            (m) => m.EntityListComponent,
          ),
        data: { type: 'HOSPITAL' },
      },
      {
        path: 'create',
        loadComponent: () =>
          import('@features/entity-management/entity-id/entity-id.component').then(
            (m) => m.EntityIdComponent,
          ),
        data: { type: 'HOSPITAL' },
      },
      {
        path: 'edit/:id',
        loadComponent: () =>
          import('@features/entity-management/entity-id/entity-id.component').then(
            (m) => m.EntityIdComponent,
          ),
        data: { type: 'HOSPITAL' },
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
    path: 'authorities-hospitals',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('@features/entity-management/entity-list/entity-list.component').then(
            (m) => m.EntityListComponent,
          ),
        data: { type: 'AUTHORITY_HOSPITAL' },
      },
      {
        path: 'create',
        loadComponent: () =>
          import('@features/entity-management/entity-id/entity-id.component').then(
            (m) => m.EntityIdComponent,
          ),
        data: { type: 'AUTHORITY_HOSPITAL' },
      },
      {
        path: 'edit/:id',
        loadComponent: () =>
          import('@features/entity-management/entity-id/entity-id.component').then(
            (m) => m.EntityIdComponent,
          ),
        data: { type: 'AUTHORITY_HOSPITAL' },
      },
    ],
  },
] as Routes;
