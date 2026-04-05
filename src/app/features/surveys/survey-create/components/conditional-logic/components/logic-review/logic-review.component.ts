import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormsModule } from '@angular/forms';
import { LucideAngularModule, Pencil, Trash2, Check, LayoutGrid, GitFork, Plus } from 'lucide-angular';
import { ConditionalLogicStateService } from '../../conditional-logic.state';
import { BSelectComponent } from '@shared/components/b-select/b-select.component';
import { RadioButtonModule } from 'primeng/radiobutton';
import { BCheckboxComponent } from '@shared/components/b-checkbox/b-checkbox.component';
import { SurveyLogicService } from '@features/surveys/services/survey-logic.service';
import { MessageService, TreeNode } from 'primeng/api';
import { TreeSelectModule } from 'primeng/treeselect';

@Component({
  selector: 'app-logic-review',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    ReactiveFormsModule,
    FormsModule,
    BSelectComponent,
    RadioButtonModule,
    BCheckboxComponent,
    TreeSelectModule,
  ],
  templateUrl: './logic-review.component.html',
  styles: [
    `
      .radio-btn {
        --p-radiobutton-checked-background: var(--color-primary-500);
        --p-radiobutton-checked-border-color: var(--color-primary-500);
      }
    `,
  ],
})
export class LogicReviewComponent {
  readonly state = inject(ConditionalLogicStateService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly logicService = inject(SurveyLogicService);
  private readonly messageService = inject(MessageService);

  readonly EditIcon = Pencil;
  readonly TrashIcon = Trash2;
  readonly CheckIcon = Check;
  readonly GridIcon = LayoutGrid;
  readonly GitForkIcon = GitFork;
  readonly PlusIcon = Plus;

  allLogicRules = this.state.allLogicRules;
  reviewEditIndex = this.state.reviewEditIndex;
  reviewEditForm = this.state.reviewEditForm;
  actionOptions = this.state.actionOptions;
  alertTypeOptions = this.state.alertTypeOptions;
  domainTreeNodes = this.state.domainTreeNodes;
  reviewDomainFilterId = this.state.reviewDomainFilterId;
  selectedFilterNode = signal<TreeNode | null>(null);

  readonly surveysResource = this.state.surveysResource;
  readonly selectedSurveyId = this.state.activeSurveyId;

  readonly standaloneMode = computed(() => {
    // Check if ID exists in route hierarchy
    let currentRoute: ActivatedRoute | null = this.route;
    while (currentRoute) {
      if (currentRoute.snapshot.paramMap.get('id')) return false;
      currentRoute = currentRoute.parent;
    }
    return true;
  });

  readonly surveyOptions = computed(() => {
    const data = this.surveysResource.value();
    if (!data?.data) return [];
    return data.data.map((s: any) => ({ label: s.name, value: s.id }));
  });

  ngOnInit() {
    // Check for domain_id in query params to pre-filter
    const domainId = this.route.snapshot.queryParamMap.get('domain_id');
    if (domainId) {
      this.reviewDomainFilterId.set(`domain_${domainId}`);
      // Find the node in tree to show as selected if needed
      // (Optional UI polish)
    }
  }

  onDomainFilterSelect(event: any) {
    this.reviewDomainFilterId.set(event.node?.key || null);
  }

  onClearDomainFilter() {
    this.selectedFilterNode.set(null);
    this.reviewDomainFilterId.set(null);
  }

  onAddCondition() {
    this.router.navigate(['../form'], { relativeTo: this.route });
  }

  onEditRule(index: number) {
    const ruleEntry = this.allLogicRules()[index];
    if (!ruleEntry) return;

    this.reviewEditIndex.set(index);
    const form = this.state.createRuleForm(ruleEntry.triggerQuestion.id, ruleEntry.rule);
    form.get('isEditing')?.setValue(true);
    form.enable();
    this.reviewEditForm.set(form);
  }

  saveReviewRule(index: number) {
    const form = this.reviewEditForm();
    if (!form || form.invalid) {
      form?.markAllAsTouched();
      return;
    }

    const val = form.getRawValue();
    let backendActionType = val.ui_action_type;
    if (backendActionType === 'alert') backendActionType = val.alert_type;

    const targetId = val.target_question_ids?.length ? val.target_question_ids[0] : undefined;
    const payload = {
      trigger_answer: val.trigger_answer,
      action_type: backendActionType,
      target_question_id: targetId,
      target_question_ids: val.target_question_ids,
      target_answer_options: val.target_answer_options,
    };

    this.logicService.updateLogicRule(val.id, payload).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Rule updated' });
        this.reviewEditIndex.set(null);
        this.reviewEditForm.set(null);
        this.state.surveyResource?.reload();
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not update' }),
    });
  }

  cancelReviewEdit() {
    this.reviewEditIndex.set(null);
    this.reviewEditForm.set(null);
  }

  onDeleteRule(index: number) {
    const rules = this.allLogicRules();
    const ruleId = rules[index]?.rule?.id;
    if (ruleId) {
      this.logicService.deleteLogicRule(ruleId).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Rule deleted' });
          this.state.surveyResource?.reload();
        },
      });
    }
  }

  getQuestionTextById(id: number | null) {
    return this.state.getQuestionTextById(id);
  }

  getQuestionOptions(id: number | null) {
    return this.state.getQuestionOptions(id);
  }

  getReviewTriggerOptions(currentId: number | null) {
    return this.state.allQuestions().map((q) => ({ label: q.text, value: q.id }));
  }

  getReviewTargetOptions(triggerId: number | null) {
    return this.state.allQuestions()
      .filter((q) => q.id !== triggerId)
      .map((q) => ({ label: q.text, value: q.id }));
  }

  getTargetId(form: FormGroup) {
    const ids = form.get('target_question_ids')?.value;
    return ids?.length ? ids[0] : null;
  }

  setTargetId(form: FormGroup, id: number) {
    form.patchValue({ target_question_ids: [id] });
  }

  isAnswerSelected(form: FormGroup, ans: string): boolean {
    const selected = form.get('target_answer_options')?.value || [];
    return selected.includes(ans);
  }

  toggleAnswer(form: FormGroup, ans: string) {
    let selected = [...(form.get('target_answer_options')?.value || [])];
    if (selected.includes(ans)) {
      selected = selected.filter((a) => a !== ans);
    } else {
      selected.push(ans);
    }
    form.patchValue({ target_answer_options: selected });
  }

  onSkip() {
    this.router.navigate(['../overview'], { relativeTo: this.route.parent });
  }

  onSurveyChange(id: string) {
    this.state.setSurveyId(id);
  }

  onSurveySearch(search: string) {
    this.state.surveySearch.set(search);
    this.state.surveyPage.set(1);
  }

  onSurveyScroll(event: any) {
    if (this.surveysResource.isLoading()) return;
    this.state.surveyPage.update((p) => p + 1);
  }

  onNext() {
    this.router.navigate(['../overview'], { relativeTo: this.route.parent });
  }
}
