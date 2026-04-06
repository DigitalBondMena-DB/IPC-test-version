import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormsModule } from '@angular/forms';
import { LucideAngularModule, Pencil, Trash2, Check, LayoutGrid, GitFork, Plus } from 'lucide-angular';
import { ConditionalLogicStateService } from '../../conditional-logic.state';
import { BSelectComponent } from '@shared/components/b-select/b-select.component';
import { RadioButtonModule } from 'primeng/radiobutton';
import { BCheckboxComponent } from '@shared/components/b-checkbox/b-checkbox.component';
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
export class LogicReviewComponent implements OnInit {
  readonly state = inject(ConditionalLogicStateService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);

  readonly EditIcon = Pencil;
  readonly TrashIcon = Trash2;
  readonly CheckIcon = Check;
  readonly GridIcon = LayoutGrid;
  readonly GitForkIcon = GitFork;
  readonly PlusIcon = Plus;

  // Signal for edit form reactivity in Zoneless
  readonly editFormUpdateVersion = signal(0);

  // Optimized Rule ViewModels for the list
  readonly ruleListItems = computed(() => {
    const rules = this.state.allLogicRules();
    return rules.map((r, index) => ({
      ...r,
      index,
      triggerLabel: r.triggerQuestion.text,
      targetLabel: this.state.getQuestionTextById(r.rule.target_question_id || r.rule.target_question_ids?.[0])
    }));
  });

  // Optimized Edit ViewModel
  readonly editViewModel = computed(() => {
    this.editFormUpdateVersion();
    const form = this.state.reviewEditForm();
    if (!form) return null;

    const triggerId = form.get('trigger_question_id')?.value;
    const targetId = form.get('target_question_ids')?.value?.[0];

    return {
      form,
      triggerOptions: this.getReviewTriggerOptions(triggerId),
      questionOptions: this.state.getQuestionOptions(triggerId),
      targetOptions: this.getReviewTargetOptions(triggerId),
      targetAnswerOptions: this.state.getQuestionOptions(targetId),
      targetId
    };
  });

  readonly allLogicRules = this.state.allLogicRules;
  readonly reviewEditIndex = this.state.reviewEditIndex;
  readonly reviewEditForm = this.state.reviewEditForm;
  readonly actionOptions = this.state.actionOptions;
  readonly alertTypeOptions = this.state.alertTypeOptions;
  readonly domainTreeNodes = this.state.domainTreeNodes;
  readonly reviewDomainFilterId = this.state.reviewDomainFilterId;
  readonly selectedFilterNode = signal<TreeNode | null>(null);

  readonly surveysResource = this.state.surveysResource;
  readonly selectedSurveyId = this.state.activeSurveyId;
  readonly standaloneMode = this.state.standaloneMode;
  readonly surveyOptions = this.state.surveyOptions;

  ngOnInit() {
    const domainId = this.route.snapshot.queryParamMap.get('domain_id');
    if (domainId) {
      this.reviewDomainFilterId.set(`domain_${domainId}`);
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
    
    form.valueChanges.subscribe(() => {
      this.editFormUpdateVersion.update(v => v + 1);
    });

    this.reviewEditForm.set(form);
  }

  saveReviewRule(index: number) {
    const form = this.reviewEditForm();
    if (!form || form.invalid) {
      form?.markAllAsTouched();
      return;
    }

    const val = form.getRawValue();
    this.state.saveLogicRule(val, val.id, val.trigger_question_id).subscribe({
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
      this.state.deleteLogicRule(ruleId).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Rule deleted' });
          this.state.surveyResource?.reload();
        },
      });
    }
  }

  // Pre-calculated options helpers
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
    const ctrl = form.get('target_answer_options');
    ctrl?.patchValue(selected);
    ctrl?.markAsTouched();
    ctrl?.updateValueAndValidity();
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
