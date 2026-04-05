import { Injectable, inject, signal, computed } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { httpResource } from '@angular/common/http';
import { API_CONFIG } from '@/core/config/api.config';
import { SurveyService } from '@features/surveys/services/survey.service';
import { SurveyLogicService } from '@features/surveys/services/survey-logic.service';
import { MessageService, TreeNode } from 'primeng/api';
import { startWith, distinctUntilChanged, pairwise } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ConditionalLogicStateService {
  private readonly fb = inject(FormBuilder);
  private readonly surveyService = inject(SurveyService);
  private readonly logicService = inject(SurveyLogicService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);

  readonly activeSurveyId = signal<string | null>(null);
  private readonly route = inject(ActivatedRoute);

  readonly standaloneMode = computed(() => {
    // Traverse up to find 'id' parameter in any parent route
    let currentRoute: ActivatedRoute | null = this.route;
    while (currentRoute) {
      if (currentRoute.snapshot.paramMap.get('id')) return false;
      currentRoute = currentRoute.parent;
    }
    return true;
  });

  // Standalone mode survey list
  readonly surveySearch = signal('');
  readonly surveyPage = signal(1);
  readonly surveyParams = computed(() => ({
    page: this.surveyPage(),
    per_page: 20,
    search: this.surveySearch(),
  }));

  readonly surveysResource = this.surveyService.getSurveys(this.surveyParams);

  readonly surveyOptions = computed(() => {
    const data = this.surveysResource.value();
    if (!data?.data) return [];
    return data.data.map((s: any) => ({ label: s.name, value: s.id }));
  });

  // Active survey data
  readonly surveyResource = httpResource<any>(() => {
    const surveyId = this.activeSurveyId();
    if (!surveyId) return undefined;
    return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SURVEYS.BASE}/${surveyId}`;
  });

  readonly allQuestions = signal<any[]>([]);
  readonly domainTreeNodes = signal<TreeNode[]>([]);
  readonly selectedTreeNode = signal<any>(null);
  readonly currentSubdomainQuestions = signal<any[]>([]);
  readonly rulesForms = signal<FormGroup[]>([]);

  // For review step
  readonly reviewEditIndex = signal<number | null>(null);
  readonly reviewEditForm = signal<FormGroup | null>(null);
  readonly reviewDomainFilterId = signal<string | null>(null);

  readonly allLogicRules = computed(() => {
    const questions = this.allQuestions();
    const domainFilter = this.reviewDomainFilterId();
    const rules: any[] = [];
    const ruleIds = new Set<number>();

    questions.forEach((q) => {
      // If we have a domain filter, skip questions that don't match
      if (domainFilter) {
        const matches = q.domainIds?.includes(domainFilter);
        if (!matches) return;
      }

      if (q.logic_rules) {
        q.logic_rules.forEach((r: any) => {
          if (!ruleIds.has(r.id)) {
            ruleIds.add(r.id);
            rules.push({ triggerQuestion: q, rule: r });
          }
        });
      }
    });
    return rules;
  });

  readonly isAnyRuleEditing = computed(() => {
    return (
      this.rulesForms().some((form) => form.get('isEditing')?.value && !!form.get('id')?.value) ||
      this.reviewEditIndex() !== null
    );
  });

  readonly actionOptions = [
    { label: 'Hide', value: 'hide' },
    { label: 'N/A', value: 'na' },
    { label: 'Show', value: 'show' },
    { label: 'Answer', value: 'limited_answer' },
    { label: 'Comment', value: 'mandatory_comment' },
    { label: 'Alert', value: 'alert' },
    { label: 'Action Plan', value: 'mandatory_action_plan' },
  ];

  readonly alertTypeOptions = [
    { label: 'Highlight', value: 'highlight' },
    { label: 'Raise an Alarm', value: 'raise_alarm' },
  ];

  processSurveyData(data: any) {
    const nodes: TreeNode[] = [];
    let allQs: any[] = [];

    if (data.domains) {
      data.domains.forEach((d: any) => {
        nodes.push(this.mapDomainToTreeNode(d, allQs));
      });
    }
    this.domainTreeNodes.set(nodes);
    this.allQuestions.set(allQs);
  }

  private mapDomainToTreeNode(
    domain: any,
    allQuestionsRef: any[],
    parentDomainIds: string[] = [],
  ): TreeNode {
    const currentDomainId = `domain_${domain.id}`;
    const domainIds = [...parentDomainIds, currentDomainId];

    const questionsText = (domain.questions || []).map((q: any) => q.text).join(' ');
    const node: TreeNode & { searchTitle?: string } = {
      key: currentDomainId,
      label: domain.title,
      data: domain,
      selectable: false,
      searchTitle: `${domain.title} ${questionsText}`,
    };

    // Store the hierarchy info in each question
    const questions = (domain.questions || []).map((q: any) => ({
      ...q,
      domainIds,
    }));
    allQuestionsRef.push(...questions);

    if (domain.sub_domains && domain.sub_domains.length > 0) {
      node.children = domain.sub_domains.map((sd: any) =>
        this.mapDomainToTreeNode(sd, allQuestionsRef, domainIds),
      );
      node.selectable = false;
    } else {
      node.selectable = true;
    }

    return node;
  }

  createRuleForm(triggerQuestionId: number | null, ruleData?: any): FormGroup {
    let uiActionType = ruleData?.action_type || '';
    let alertType = null;

    if (uiActionType === 'highlight' || uiActionType === 'raise_alarm') {
      alertType = uiActionType;
      uiActionType = 'alert';
    }

    const isEditing = ruleData ? false : true;

    const group = this.fb.group({
      id: [ruleData?.id || null],
      trigger_question_id: [triggerQuestionId, Validators.required],
      trigger_answer: [ruleData?.trigger_answer || null, Validators.required],
      ui_action_type: [uiActionType, Validators.required],
      target_question_ids: [
        ruleData?.target_question_ids ||
          (ruleData?.target_question_id ? [ruleData.target_question_id] : []),
      ],
      target_answer_options: [ruleData?.target_answer_options || []],
      alert_type: [alertType],
      isEditing: [isEditing],
    });

    // Add custom validator AFTER group is initialized to avoid ReferenceError
    group.get('target_answer_options')?.setValidators([
      (control: any) => {
        const actionType = group.get('ui_action_type')?.value;
        if (actionType === 'limited_answer' && (!control.value || control.value.length === 0)) {
          return { requiredAnswers: true };
        }
        return null;
      },
    ]);

    if (!isEditing) {
      group.disable();
    }

    // Force re-validation of answers when action type changes
    group.get('ui_action_type')?.valueChanges.subscribe(() => {
      group.get('target_answer_options')?.updateValueAndValidity();
    });

    group
      .get('ui_action_type')
      ?.valueChanges.pipe(startWith(uiActionType), distinctUntilChanged(), pairwise())
      .subscribe(([oldVal, newVal]) => {
        if (oldVal && newVal && oldVal !== newVal && group.get('isEditing')?.value) {
          group.patchValue(
            {
              target_question_ids: [],
              target_answer_options: [],
              alert_type: null,
            },
            { emitEvent: false },
          );
        }
      });

    return group;
  }

  getQuestionOptions(questionId: number | null): any[] {
    if (!questionId) return [];
    const q = this.allQuestions().find((q: any) => q.id === questionId);
    if (!q || !q.meta_data || !q.meta_data.options) return [];
    return q.meta_data.options.map((opt: string) => ({ label: opt, value: opt }));
  }

  getTriggerQuestionOptions(currentRuleTriggerId: number | null): any[] {
    const options = this.currentSubdomainQuestions().map((q: any) => ({
      label: q.text,
      value: q.id,
    }));
    if (currentRuleTriggerId && !options.find((opt) => opt.value === currentRuleTriggerId)) {
      const q = this.allQuestions().find((q) => q.id === currentRuleTriggerId);
      if (q) {
        options.push({ label: q.text, value: q.id });
      }
    }
    return options;
  }

  getQuestionTextById(id: number | null): string {
    if (!id) return '';
    return this.allQuestions().find((q) => q.id === id)?.text || 'Question ' + id;
  }

  setSurveyId(id: string | null) {
    this.activeSurveyId.set(id);
    this.selectedTreeNode.set(null);
    this.currentSubdomainQuestions.set([]);
    this.rulesForms.set([]);
    this.allQuestions.set([]);
    this.domainTreeNodes.set([]);
    this.reviewDomainFilterId.set(null);
  }

  saveRule(index: number) {
    const rules = this.rulesForms();
    const form = rules[index];

    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }

    const val = form.value;
    const triggerQId = val.trigger_question_id;

    let backendActionType = val.ui_action_type;
    if (backendActionType === 'alert') {
      backendActionType = val.alert_type;
    }

    const targetId = val.target_question_ids?.length ? val.target_question_ids[0] : undefined;
    const payload = {
      trigger_answer: val.trigger_answer,
      action_type: backendActionType,
      target_question_id: targetId,
      target_question_ids: val.target_question_ids?.length ? val.target_question_ids : undefined,
      target_answer_options: val.target_answer_options?.length
        ? val.target_answer_options
        : undefined,
    };

    if (val.id) {
      this.logicService.updateLogicRule(val.id, payload).subscribe({
        next: () => {
          form.patchValue({ isEditing: false });
          form.disable();
          this.rulesForms.set([...rules]);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Rule updated',
          });
          this.surveyResource?.reload();
        },
        error: () =>
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Could not update',
          }),
      });
    } else {
      this.logicService.createLogicRule(triggerQId, payload).subscribe({
        next: (res) => {
          form.patchValue({ id: res.data?.id || res.id, isEditing: false });
          form.disable();
          this.rulesForms.set([...rules]);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Rule created',
          });
          this.surveyResource?.reload();
        },
        error: () =>
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Could not create',
          }),
      });
    }
  }

  removeRule(index: number) {
    const rules = this.rulesForms();
    const ruleId = rules[index].get('id')?.value;

    if (ruleId) {
      this.logicService.deleteLogicRule(ruleId).subscribe({
        next: () => {
          rules.splice(index, 1);
          if (rules.length === 0) rules.push(this.createRuleForm(null));
          this.rulesForms.set([...rules]);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Rule deleted',
          });
          this.surveyResource?.reload();
        },
        error: () =>
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Could not delete',
          }),
      });
    } else {
      rules.splice(index, 1);
      if (rules.length === 0) rules.push(this.createRuleForm(null));
      this.rulesForms.set([...rules]);
    }
  }
}
