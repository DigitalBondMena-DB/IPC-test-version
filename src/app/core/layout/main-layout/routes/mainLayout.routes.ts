import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () =>
      import('@features/home/home-page/home-page.component').then((m) => m.HomePageComponent),
  },
  {
    path: '',
    loadChildren: () => import('@features/entity-management/entity-management.routes'),
  },
  {
    path: '',
    loadChildren: () => import('@features/user-management/user-management.routes'),
  },
] as Routes;
