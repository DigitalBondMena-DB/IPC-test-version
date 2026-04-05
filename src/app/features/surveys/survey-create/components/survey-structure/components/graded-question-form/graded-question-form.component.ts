import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TreeSelectModule } from 'primeng/treeselect';
import { BInputComponent } from '@shared/components/b-input/b-input.component';
import { LucideAngularModule, Trash2 } from 'lucide-angular';
import { SurveyStructureStateService } from '../../survey-structure.state';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-graded-question-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TreeSelectModule,
    BInputComponent,
    LucideAngularModule,
  ],
  templateUrl: './graded-question-form.component.html',
  styleUrl: '../../survey-structure.component.css',
})
export class GradedQuestionFormComponent {
  readonly state = inject(SurveyStructureStateService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);

  readonly trashIcon = Trash2;

  surveyName = this.state.surveyName;
  activeNodeContext = this.state.activeNodeContext;
  questionForm = this.state.questionForm;
  domainTreeNodes = this.state.domainTreeNodes;
  selectedGradedTreeNode = this.state.selectedGradedTreeNode;
  isEditMode = this.state.isEditMode;
  fromParam = '';

  constructor() {
    this.fromParam = this.route.snapshot.queryParamMap.get('from') || 'review';
  }

  get optionsArray() {
    return this.state.optionsArray;
  }

  get hasNaOption() {
    return this.state.hasNaOption;
  }

  addOption() {
    this.state.addOption();
  }

  addNaOption() {
    this.state.addNaOption();
  }

  removeOption(index: number) {
    this.state.removeOption(index);
  }

  onGradedTreeNodeSelect(event: any) {
    const data = event.node?.data;
    if (!data) return;
    this.state.activeNodeContext.set({
      domain: data.formGroup,
      breadcrumbs: data.breadcrumbs,
      editIndex: undefined,
    });
    this.state.resetQuestionForm();
  }

  onAddGradedQuestion() {
    if (this.questionForm.invalid) {
      this.questionForm.markAllAsTouched();
      return;
    }
    if (!this.activeNodeContext()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please select a domain or subdomain first.',
      });
      return;
    }

    const update = this.isEditMode();

    this.state.saveQuestionToActiveDomain();
    this.state.clearEditIndexFromContext();
    this.state.resetQuestionForm();

    if (update) {
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Question updated successfully.',
      });
    } else {
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Question added successfully.',
      });
    }
  }

  goToGradedReview() {
    if (!this.activeNodeContext()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please select a domain or subdomain first.',
      });
      return;
    }

    if (this.questionForm.invalid) {
      this.questionForm.markAllAsTouched();
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please complete the question form correctly.',
      });
      return;
    }

    this.state.saveQuestionToActiveDomain();
    this.state.clearEditIndexFromContext();
    this.state.resetQuestionForm();
    this.navigateBack();
  }

  backFromGradedForm() {
    this.navigateBack();
  }

  private navigateBack() {
    const target = this.fromParam === 'tree' ? '../tree' : '../graded-review';
    this.router.navigate([target], { relativeTo: this.route });
  }
  cancelFromGradedForm() {
    this.router.navigate(['/survey']);
  }
}
