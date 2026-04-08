import { MainLayoutComponent } from './core/layout/main-layout/main-layout.component';
import { SurveyLayoutComponent } from './core/layout/survey-layout/survey-layout.component';
import { unAuthGuard } from './core/guards/un-auth-guard';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';
import { AppRoute } from './shared/models/route';

export const routes: AppRoute[] = [
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
    canMatch: [roleGuard],
    path: 'survey',
    component: SurveyLayoutComponent,
    loadChildren: () => import('@features/surveys/surveys.routes'),
    data: { roles: ['super_admin', 'authority'] },
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
