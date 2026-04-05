import { Routes } from '@angular/router';

export default [
  // Super Admin
  {
    path: 'super-admin-users',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./user-list/user-list.component').then((m) => m.UserListComponent),
        data: { type: 'SUPER_ADMIN' },
      },
      {
        path: 'create',
        loadComponent: () => import('./user-id/user-id.component').then((m) => m.UserIdComponent),
        data: { type: 'SUPER_ADMIN' },
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('./user-id/user-id.component').then((m) => m.UserIdComponent),
        data: { type: 'SUPER_ADMIN' },
      },
    ],
  },
  // Health Directorate
  {
    path: 'health-directorate-users',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./user-list/user-list.component').then((m) => m.UserListComponent),
        data: { type: 'HEALTH_DIRECTORATE' },
      },
      {
        path: 'create',
        loadComponent: () => import('./user-id/user-id.component').then((m) => m.UserIdComponent),
        data: { type: 'HEALTH_DIRECTORATE' },
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('./user-id/user-id.component').then((m) => m.UserIdComponent),
        data: { type: 'HEALTH_DIRECTORATE' },
      },
    ],
  },
  // Health Division
  {
    path: 'health-division-users',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./user-list/user-list.component').then((m) => m.UserListComponent),
        data: { type: 'HEALTH_DIVISION' },
      },
      {
        path: 'create',
        loadComponent: () => import('./user-id/user-id.component').then((m) => m.UserIdComponent),
        data: { type: 'HEALTH_DIVISION' },
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('./user-id/user-id.component').then((m) => m.UserIdComponent),
        data: { type: 'HEALTH_DIVISION' },
      },
    ],
  },
  // Hospitals
  {
    path: 'hospitals-users',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./user-list/user-list.component').then((m) => m.UserListComponent),
        data: { type: 'HOSPITAL' },
      },
      {
        path: 'create',
        loadComponent: () => import('./user-id/user-id.component').then((m) => m.UserIdComponent),
        data: { type: 'HOSPITAL' },
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('./user-id/user-id.component').then((m) => m.UserIdComponent),
        data: { type: 'HOSPITAL' },
      },
    ],
  },
  // Authorities
  {
    path: 'authorities-users',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./user-list/user-list.component').then((m) => m.UserListComponent),
        data: { type: 'AUTHORITY' },
      },
      {
        path: 'create',
        loadComponent: () => import('./user-id/user-id.component').then((m) => m.UserIdComponent),
        data: { type: 'AUTHORITY' },
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('./user-id/user-id.component').then((m) => m.UserIdComponent),
        data: { type: 'AUTHORITY' },
      },
    ],
  },
  // Authority Hospitals
  {
    path: 'authorities-hospitals-users',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./user-list/user-list.component').then((m) => m.UserListComponent),
        data: { type: 'AUTHORITY_HOSPITAL' },
      },
      {
        path: 'create',
        loadComponent: () => import('./user-id/user-id.component').then((m) => m.UserIdComponent),
        data: { type: 'AUTHORITY_HOSPITAL' },
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('./user-id/user-id.component').then((m) => m.UserIdComponent),
        data: { type: 'AUTHORITY_HOSPITAL' },
      },
    ],
  },
] as Routes;
