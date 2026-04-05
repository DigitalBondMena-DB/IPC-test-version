import { Component, inject, model, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormsModule } from '@angular/forms';
import { LucideAngularModule, Edit2, Trash2, Check, Plus } from 'lucide-angular';
import { TreeSelectModule } from 'primeng/treeselect';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ConditionalLogicStateService } from '../../conditional-logic.state';
import { BSelectComponent } from '@shared/components/b-select/b-select.component';
import { BCheckboxComponent } from '@shared/components/b-checkbox/b-checkbox.component';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-logic-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    LucideAngularModule,
    TreeSelectModule,
    RadioButtonModule,
    BSelectComponent,
    BCheckboxComponent,
  ],
  templateUrl: './logic-form.component.html',
  styles: [
    `
      .radio-btn {
        --p-radiobutton-checked-background: var(--color-primary-500);
        --p-radiobutton-checked-border-color: var(--color-primary-500);
      }
    `,
  ],
})
export class LogicFormComponent implements OnInit {
  readonly state = inject(ConditionalLogicStateService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);

  readonly EditIcon = Edit2;
  readonly TrashIcon = Trash2;
  readonly CheckIcon = Check;
  readonly PlusIcon = Plus;

  domainTreeNodes = this.state.domainTreeNodes;
  selectedTreeNode = this.state.selectedTreeNode;
  rulesForms = this.state.rulesForms;
  currentSubdomainQuestions = this.state.currentSubdomainQuestions;
  actionOptions = this.state.actionOptions;
  alertTypeOptions = this.state.alertTypeOptions;
  isAnyRuleEditing = this.state.isAnyRuleEditing;

  readonly standaloneMode = this.state.standaloneMode;
  readonly surveyOptions = this.state.surveyOptions;
  readonly surveysResource = this.state.surveysResource;
  readonly selectedSurveyId = this.state.activeSurveyId;

  onSurveyChange(id: string) {
    this.state.setSurveyId(id);
    // Re-initialize with one empty form after state reset
    this.rulesForms.set([this.state.createRuleForm(null)]);
  }

  onSurveySearch(search: string) {
    this.state.surveySearch.set(search);
    this.state.surveyPage.set(1);
  }

  onSurveyScroll(event: any) {
    if (this.surveysResource.isLoading()) return;
    this.state.surveyPage.update((p) => p + 1);
  }

  ngOnInit() {
    // If no rules are loaded, provide one empty form as initial state
    if (this.rulesForms().length === 0) {
      this.rulesForms.set([this.state.createRuleForm(null)]);
    }
  }

  onNodeSelect(event: any) {
    const nodeData = event.node.data;
    if (!nodeData || !nodeData.questions) {
      this.currentSubdomainQuestions.set([]);
      this.rulesForms.set([]);
      return;
    }

    this.currentSubdomainQuestions.set(nodeData.questions);

    const ruleMap = new Map<number, { triggerId: number; rule: any }>();
    nodeData.questions.forEach((q: any) => {
      if (q.logic_rules) {
        q.logic_rules.forEach((rule: any) => ruleMap.set(rule.id, { triggerId: q.id, rule }));
      }
      if (q.affected_by_rules) {
        q.affected_by_rules.forEach((rule: any) => {
          const triggerId = rule.question_id || rule.trigger_question?.id;
          if (triggerId) ruleMap.set(rule.id, { triggerId, rule });
        });
      }
    });

    const existingRules: FormGroup[] = [];
    ruleMap.forEach((entry) =>
      existingRules.push(this.state.createRuleForm(entry.triggerId, entry.rule)),
    );
    if (existingRules.length === 0) existingRules.push(this.state.createRuleForm(null));

    this.rulesForms.set(existingRules);
  }

  addRule() {
    const rules = this.rulesForms();
    const pendingRules = rules.filter((f) => f.get('isEditing')?.value || f.dirty);

    if (pendingRules.length > 0) {
      const invalidForms = pendingRules.filter((f) => f.invalid);
      if (invalidForms.length > 0) {
        invalidForms.forEach((f) => f.markAllAsTouched());
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Complete current rule first.',
        });
        return;
      }
      // Save all then add
      pendingRules.forEach((form, i) => {
        this.state.saveRule(rules.indexOf(form));
      });
      rules.push(this.state.createRuleForm(null));
      this.rulesForms.set([...rules]);
    } else {
      rules.push(this.state.createRuleForm(null));
      this.rulesForms.set([...rules]);
    }
  }

  saveRule(index: number) {
    this.state.saveRule(index);
  }

  editRule(index: number) {
    const rules = this.rulesForms();
    rules[index].patchValue({ isEditing: true });
    rules[index].enable();
    this.rulesForms.set([...rules]);
  }

  removeRule(index: number) {
    this.state.removeRule(index);
  }

  getTriggerQuestionOptions(triggerId: number | null) {
    return this.state.getTriggerQuestionOptions(triggerId);
  }

  getQuestionOptions(id: number | null) {
    return this.state.getQuestionOptions(id);
  }

  getFilteredTargetOptions(triggerId: number | null) {
    return this.currentSubdomainQuestions()
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

  onSaveAndBack() {
    this.router.navigate(['../review'], { relativeTo: this.route });
  }

  onBackToReview() {
    this.router.navigate(['../review'], { relativeTo: this.route });
  }
}
