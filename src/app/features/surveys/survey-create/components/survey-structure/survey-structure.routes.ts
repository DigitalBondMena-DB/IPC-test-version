import { Routes } from '@angular/router';
import { SurveyStructureComponent } from './survey-structure.component';

export default [
  {
    path: '',
    component: SurveyStructureComponent,
    children: [
      {
        path: '',
        redirectTo: 'tree',
        pathMatch: 'full',
      },
      {
        path: 'tree',
        loadComponent: () =>
          import('./components/structure-tree/structure-tree.component').then(
            (m) => m.StructureTreeComponent,
          ),
      },


      {
        path: 'graded',
        loadComponent: () =>
          import('./components/graded-question-form/graded-question-form.component').then(
            (m) => m.GradedQuestionFormComponent,
          ),
      },
      {
        path: 'graded-review',
        loadComponent: () =>
          import('./components/graded-question-review/graded-question-review.component').then(
            (m) => m.GradedQuestionReviewComponent,
          ),
      },
    ],
  },
] as Routes;
