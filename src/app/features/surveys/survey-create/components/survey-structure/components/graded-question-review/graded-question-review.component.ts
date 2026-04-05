import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { LucideAngularModule, LayoutGrid, Pencil, Trash2, Plus, ChevronUp } from 'lucide-angular';
import { SurveyStructureStateService } from '../../survey-structure.state';

@Component({
  selector: 'app-graded-question-review',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './graded-question-review.component.html',
  styleUrl: '../../survey-structure.component.css'
})
export class GradedQuestionReviewComponent {
  readonly state = inject(SurveyStructureStateService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly domainIcon = LayoutGrid;
  readonly pencilIcon = Pencil;
  readonly trashIcon = Trash2;
  readonly plusIcon = Plus;
  readonly chevronUpIcon = ChevronUp;

  allQuestionsFlat = this.state.allQuestionsFlat;
  isLoaded = this.state.isLoaded;
  domains = this.state.domains;
  weightingType = this.state.weightingType;

  toggleNode(node: FormGroup) {
    this.state.toggleNode(node);
  }

  getSubdomains(node: FormGroup) {
    return this.state.getSubdomains(node);
  }

  getQuestions(node: FormGroup) {
    return this.state.getQuestions(node);
  }

  getMaxQuestionScore(weights: any) {
    return this.state.getMaxQuestionScore(weights);
  }

  onEditFromGradedReview(item: any) {
    this.state.prepareEditQuestion(item.domainNode, item.breadcrumbs, item.questionIndex);
    this.router.navigate(['../graded'], { relativeTo: this.route, queryParams: { from: 'review' } });
  }

  onDeleteFromGradedReview(item: any) {
    this.state.getQuestions(item.domainNode).removeAt(item.questionIndex);
    this.state.syncDomains();
  }

  goToForm() {
    this.state.clearEditIndexFromContext();
    this.state.resetQuestionForm();
    this.router.navigate(['../graded'], { relativeTo: this.route, queryParams: { from: 'review' } });
  }

  backFromGradedReview() {
    this.router.navigate(['../tree'], { relativeTo: this.route });
  }

  confirmGradedAndNavigate() {
    this.router.navigate(['/survey', 'edit', this.state.surveyId(), 'conditional-logic']);
  }

  createBadge(level: number, index: number, pathIds: number[] = []): string {
    if (level === 0) return `D${index + 1}`;
    let badge = `D${(pathIds[0] !== undefined ? pathIds[0] : 0) + 1}`;
    if (level >= 1) {
      const sIndex = level === 1 ? index : pathIds[1];
      badge += `-S${(sIndex !== undefined ? sIndex : 0) + 1}`;
    }
    if (level >= 2) {
      for (let i = 2; i < level; i++) {
        badge += `-${(pathIds[i] !== undefined ? pathIds[i] : 0) + 1}`;
      }
      badge += `-${index + 1}`;
    }
    return badge;
  }
}
