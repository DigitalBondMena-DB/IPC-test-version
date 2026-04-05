import { Routes } from '@angular/router';
import { ConditionalLogicComponent } from './conditional-logic.component';

export default [
  {
    path: '',
    component: ConditionalLogicComponent,
    children: [
      {
        path: '',
        redirectTo: 'review',
        pathMatch: 'full',
      },
      {
        path: 'review',
        loadComponent: () =>
          import('./components/logic-review/logic-review.component').then(
            (m) => m.LogicReviewComponent,
          ),
      },
      {
        path: 'form',
        loadComponent: () =>
          import('./components/logic-form/logic-form.component').then(
            (m) => m.LogicFormComponent,
          ),
      },
    ],
  },
] as Routes;
