import { Routes } from '@angular/router';
import { PreliminaryQuestionsComponent } from './preliminary-questions.component';

export default [
  {
    path: '',
    component: PreliminaryQuestionsComponent, // The shell
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./components/preliminary-questions-list/preliminary-questions-list.component').then(
            (m) => m.PreliminaryQuestionsListComponent,
          ),
      },
      {
        path: 'create',
        loadComponent: () =>
          import('./components/preliminary-questions-form/preliminary-questions-form.component').then(
            (m) => m.PreliminaryQuestionsFormComponent,
          ),
      },
      {
        path: 'edit/:questionId',
        loadComponent: () =>
          import('./components/preliminary-questions-form/preliminary-questions-form.component').then(
            (m) => m.PreliminaryQuestionsFormComponent,
          ),
      },
    ],
  },
] as Routes;
