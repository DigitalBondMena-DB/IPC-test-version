import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { LucideAngularModule, Plus, FileText, ListChecks, Pencil, Trash2 } from 'lucide-angular';
import { PreliminaryQuestionsStateService } from '../../preliminary-questions.state';

@Component({
  selector: 'app-preliminary-questions-list',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './preliminary-questions-list.component.html',
})
export class PreliminaryQuestionsListComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly stateService = inject(PreliminaryQuestionsStateService);

  readonly fileTextIcon = FileText;
  readonly listChecksIcon = ListChecks;
  readonly plusIcon = Plus;
  readonly editIcon = Pencil;
  readonly trashIcon = Trash2;

  get questions() {
    return this.stateService.questionsList();
  }

  get isSubmitting() {
    return this.stateService.isSubmitting();
  }

  onSkip() {
    if (this.stateService.surveyId()) {
      this.router.navigate(['/survey/edit', this.stateService.surveyId()!, 'structure']);
    }
  }

  async onSubmit() {
    const success = await this.stateService.submitToNextStep();
    if (success && this.stateService.surveyId()) {
      this.router.navigate(['/survey/edit', this.stateService.surveyId()!, 'structure']);
    }
  }

  onEditClick(id: string) {
    this.router.navigate(['edit', id], { relativeTo: this.route });
  }

  onRemoveClick(id: string) {
    this.stateService.removeQuestion(id);
  }

  onCreateClick() {
    this.router.navigate(['create'], { relativeTo: this.route });
  }
}
