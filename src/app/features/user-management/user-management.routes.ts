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
    path: 'governorates-users',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./user-list/user-list.component').then((m) => m.UserListComponent),
        data: { type: 'GOVERNORATES' },
      },
      {
        path: 'create',
        loadComponent: () => import('./user-id/user-id.component').then((m) => m.UserIdComponent),
        data: { type: 'GOVERNORATES' },
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('./user-id/user-id.component').then((m) => m.UserIdComponent),
        data: { type: 'GOVERNORATES' },
      },
    ],
  },
  // Health Division
  {
    path: 'sectors-users',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./user-list/user-list.component').then((m) => m.UserListComponent),
        data: { type: 'SECTORS' },
      },
      {
        path: 'create',
        loadComponent: () => import('./user-id/user-id.component').then((m) => m.UserIdComponent),
        data: { type: 'SECTORS' },
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('./user-id/user-id.component').then((m) => m.UserIdComponent),
        data: { type: 'SECTORS' },
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
    path: 'facilities-users',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./user-list/user-list.component').then((m) => m.UserListComponent),
        data: { type: 'FACILITIES' },
      },
      {
        path: 'create',
        loadComponent: () => import('./user-id/user-id.component').then((m) => m.UserIdComponent),
        data: { type: 'FACILITIES' },
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('./user-id/user-id.component').then((m) => m.UserIdComponent),
        data: { type: 'FACILITIES' },
      },
    ],
  },
] as Routes;
