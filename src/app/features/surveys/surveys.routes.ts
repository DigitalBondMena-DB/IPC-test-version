import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () =>
      import('@features/surveys/surveys-list/surveys-list.component').then(
        (m) => m.SurveysListComponent,
      ),
  },
  {
    path: 'create',
    loadComponent: () =>
      import('@features/surveys/survey-create/survey-create.component').then(
        (m) => m.SurveyCreateComponent,
      ),
    children: [
      { path: '', redirectTo: 'setup', pathMatch: 'full' },
      {
        path: 'setup',
        loadComponent: () =>
          import('@features/surveys/survey-create/components/survey-setup/survey-setup.component').then(
            (m) => m.SurveySetupComponent,
          ),
      },
      {
        path: 'preliminary-questions',
        loadChildren: () =>
          import('@features/surveys/survey-create/components/preliminary-questions/preliminary-questions.routes'),
      },
      {
        path: 'structure',
        loadChildren: () =>
          import('@features/surveys/survey-create/components/survey-structure/survey-structure.routes'),
      },
      {
        path: 'conditional-logic',
        loadChildren: () =>
          import(
            '@features/surveys/survey-create/components/conditional-logic/conditional-logic.routes'
          ),
      },
      {
        path: 'overview',
        loadComponent: () =>
          import('@features/surveys/survey-create/components/survey-overview/survey-overview.component').then(
            (m) => m.SurveyOverviewComponent,
          ),
      },
    ],
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('@features/surveys/survey-create/survey-create.component').then(
        (m) => m.SurveyCreateComponent,
      ),
    children: [
      { path: '', redirectTo: 'setup', pathMatch: 'full' },
      {
        path: 'setup',
        loadComponent: () =>
          import('./survey-create/components/survey-setup/survey-setup.component').then(
            (m) => m.SurveySetupComponent,
          ),
      },
      {
        path: 'preliminary-questions',
        loadChildren: () =>
          import('@features/surveys/survey-create/components/preliminary-questions/preliminary-questions.routes'),
      },
      {
        path: 'structure',
        loadChildren: () =>
          import('@features/surveys/survey-create/components/survey-structure/survey-structure.routes'),
      },
      {
        path: 'conditional-logic',
        loadChildren: () =>
          import(
            '@features/surveys/survey-create/components/conditional-logic/conditional-logic.routes'
          ),
      },
      {
        path: 'overview',
        loadComponent: () =>
          import('@features/surveys/survey-create/components/survey-overview/survey-overview.component').then(
            (m) => m.SurveyOverviewComponent,
          ),
      },
    ],
  },
  {
    path: 'conditional-logic',
    loadChildren: () =>
      import(
        '@features/surveys/survey-create/components/conditional-logic/conditional-logic.routes'
      ),
  },
] as Routes;
