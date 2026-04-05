import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PreliminaryQuestionsStateService } from './preliminary-questions.state';

@Component({
  selector: 'app-preliminary-questions',
  standalone: true,
  imports: [RouterModule],
  providers: [PreliminaryQuestionsStateService],
  template: `<router-outlet></router-outlet>`,
})
export class PreliminaryQuestionsComponent {}
