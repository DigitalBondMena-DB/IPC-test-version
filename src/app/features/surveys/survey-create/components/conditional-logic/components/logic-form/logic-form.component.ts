import { Component, inject, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormsModule, Validators } from '@angular/forms';
import { LucideAngularModule, Edit2, Trash2, Check, Plus } from 'lucide-angular';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
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

  // Component-local FormGroups (UI State)
  readonly rulesForms = signal<FormGroup[]>([]);
  
  // Track internal form changes for Signal-based UI updates in Zoneless mode
  readonly formUpdateVersion = signal(0);
  
  // High-performance ViewModels for the template (calculated once per change)
  readonly ruleViewModels = computed(() => {
    this.formUpdateVersion(); // Dependency
    const rules = this.rulesForms();
    return rules.map((form, index) => {
      const triggerId = form.get('trigger_question_id')?.value;
      const targetId = form.get('target_question_ids')?.value?.[0];
      
      return {
        form,
        index,
        id: form.get('id')?.value || `temp_${index}`,
        isEditing: form.get('isEditing')?.value,
        triggerOptions: this.state.getTriggerQuestionOptions(triggerId),
        questionOptions: this.state.getQuestionOptions(triggerId),
        targetQuestionOptions: this.getFilteredTargetOptions(triggerId),
        targetAnswerOptions: this.state.getQuestionOptions(targetId),
        targetId,
        errors: {
          trigger_question_id: !!(form.get('trigger_question_id')?.invalid && form.get('trigger_question_id')?.touched),
          trigger_answer: !!(form.get('trigger_answer')?.invalid && form.get('trigger_answer')?.touched),
          ui_action_type: !!(form.get('ui_action_type')?.invalid && form.get('ui_action_type')?.touched),
          target_question_id: !!(form.get('target_question_ids')?.invalid && form.get('target_question_ids')?.touched),
          target_answer_options: !!(form.get('target_answer_options')?.invalid && form.get('target_answer_options')?.touched),
          alert_type: !!(form.get('alert_type')?.invalid && form.get('alert_type')?.touched),
        }
      };
    });
  });

  // Expose signals from state service
  readonly domainTreeNodes = this.state.domainTreeNodes;
  readonly selectedTreeNode = this.state.selectedTreeNode;
  readonly currentSubdomainQuestions = this.state.currentSubdomainQuestions;
  readonly actionOptions = this.state.actionOptions;
  readonly alertTypeOptions = this.state.alertTypeOptions;
  readonly isAnyRuleEditing = this.state.isAnyRuleEditing;
  readonly standaloneMode = this.state.standaloneMode;
  readonly surveyOptions = this.state.surveyOptions;
  readonly surveysResource = this.state.surveysResource;
  readonly selectedSurveyId = this.state.activeSurveyId;

  ngOnInit() {
    if (this.rulesForms().length === 0) {
      this.initEmptyForm();
    }
  }

  private initEmptyForm() {
    const form = this.state.createRuleForm(null);
    this.setupFormSubscription(form);
    this.rulesForms.set([form]);
  }

  private setupFormSubscription(form: FormGroup) {
    form.valueChanges.subscribe(() => {
      this.formUpdateVersion.update(v => v + 1);
    });
  }

  onSurveyChange(id: string) {
    this.state.setSurveyId(id);
    this.initEmptyForm();
  }

  onSurveySearch(search: string) {
    this.state.surveySearch.set(search);
    this.state.surveyPage.set(1);
  }

  onSurveyScroll(event: any) {
    if (this.surveysResource.isLoading()) return;
    this.state.surveyPage.update((p) => p + 1);
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

    const existingRefForms: FormGroup[] = [];
    ruleMap.forEach((entry) => {
      const form = this.state.createRuleForm(entry.triggerId, entry.rule);
      this.setupFormSubscription(form);
      existingRefForms.push(form);
    });
    
    if (existingRefForms.length === 0) {
      const emptyForm = this.state.createRuleForm(null);
      this.setupFormSubscription(emptyForm);
      existingRefForms.push(emptyForm);
    }

    this.rulesForms.set(existingRefForms);
    this.state.editingIds.set(new Set()); // Reset editing set when switching nodes
  }

  addRule() {
    this.saveAllActiveRules().subscribe({
      next: (success) => {
        if (!success) return;
        const rules = this.rulesForms();
        const newForm = this.state.createRuleForm(null);
        this.setupFormSubscription(newForm);
        this.rulesForms.set([...rules, newForm]);
      }
    });
  }

  editRule(index: number) {
    const rules = this.rulesForms();
    const form = rules[index];
    const ruleId = form.get('id')?.value || `temp_${index}`;

    form.patchValue({ isEditing: true });
    form.enable();
    
    this.state.editingIds.update(set => {
      const newSet = new Set(set);
      newSet.add(ruleId);
      return newSet;
    });

    this.rulesForms.set([...rules]); // UI Update for Zoneless
  }

  saveRule(index: number): Observable<any> {
    const rules = this.rulesForms();
    const form = rules[index];

    if (form.invalid) {
      form.markAllAsTouched();
      this.formUpdateVersion.update(v => v + 1);
      return of(null);
    }

    const val = form.getRawValue();
    const ruleId = val.id;
    const triggerQId = val.trigger_question_id;

    return this.state.saveLogicRule(val, ruleId, triggerQId).pipe(
      tap({
        next: (res) => {
          const savedId = res?.data?.id || res?.id || ruleId;
          form.patchValue({ id: savedId, isEditing: false });
          form.disable();
          
          this.state.editingIds.update(set => {
            const newSet = new Set(set);
            newSet.delete(ruleId || `temp_${index}`);
            newSet.delete(savedId);
            return newSet;
          });

          this.rulesForms.set([...rules]);
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Rule saved' });
          this.state.surveyResource.reload();
        },
        error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save rule' })
      })
    );
  }

  private saveAllActiveRules(): Observable<boolean> {
    const editIndex = this.rulesForms().findIndex(f => f.get('isEditing')?.value);
    if (editIndex === -1) return of(true);
    
    const form = this.rulesForms()[editIndex];
    if (form.invalid) {
      form.markAllAsTouched();
      this.formUpdateVersion.update(v => v + 1);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please fix validation errors before proceeding.' });
      return of(false);
    }

    return new Observable<boolean>(subscriber => {
      this.saveRule(editIndex).subscribe({
        next: (val) => {
          subscriber.next(val !== null);
          subscriber.complete();
        },
        error: () => {
          subscriber.next(false);
          subscriber.complete();
        }
      });
    });
  }

  removeRule(index: number) {
    const rules = [...this.rulesForms()];
    const form = rules[index];
    const ruleId = form.get('id')?.value;

    const cleanup = () => {
      rules.splice(index, 1);
      if (rules.length === 0) rules.push(this.state.createRuleForm(null));
      this.rulesForms.set(rules);
      
      this.state.editingIds.update(set => {
        const newSet = new Set(set);
        newSet.delete(ruleId || `temp_${index}`);
        return newSet;
      });
    };

    if (ruleId) {
      this.state.deleteLogicRule(ruleId).subscribe({
        next: () => {
          cleanup();
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Rule deleted' });
          this.state.surveyResource.reload();
        },
        error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete' })
      });
    } else {
      cleanup();
    }
  }

  // Refactor: Options are now reactive via State Service Map lookups
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
    this.saveAllActiveRules().subscribe({
      next: (success) => {
        if (success) {
          this.router.navigate(['../review'], { relativeTo: this.route });
        }
      }
    });
  }

  onBackToReview() {
    this.router.navigate(['../review'], { relativeTo: this.route });
  }
}
