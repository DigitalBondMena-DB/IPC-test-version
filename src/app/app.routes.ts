import { MainLayoutComponent } from './core/layout/main-layout/main-layout.component';
import { SurveyLayoutComponent } from './core/layout/survey-layout/survey-layout.component';
import { unAuthGuard } from './core/guards/un-auth-guard';
import { authGuard } from './core/guards/auth-guard';
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
  {
    canActivate: [authGuard],
    path: 'dashboard',
    component: MainLayoutComponent,
    loadChildren: () => import('@core/layout/main-layout/routes/mainLayout.routes'),
  },
  {
    canActivate: [authGuard],
    path: 'survey',
    component: SurveyLayoutComponent,
    loadChildren: () => import('@features/surveys/surveys.routes'),
  },
  {
    canActivate: [authGuard],
    path: 'reports',
    loadChildren: () => import('@features/reports/reports.routes'),
  },
  {
    canActivate: [unAuthGuard],

    path: 'login',
    loadComponent: () =>
      import('@features/auth/login-page/login-page.component').then((m) => m.LoginPageComponent),
  },
];
