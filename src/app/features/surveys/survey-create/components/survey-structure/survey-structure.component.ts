import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { SurveyStructureStateService } from './survey-structure.state';

@Component({
  selector: 'app-survey-structure',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <router-outlet></router-outlet>
  `,
  providers: [SurveyStructureStateService]
})
export class SurveyStructureComponent {
  private readonly state = inject(SurveyStructureStateService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  ngOnInit() {
    if (!this.state.surveyId()) {
      this.router.navigate(['/survey/create/setup']);
    }
  }
}
