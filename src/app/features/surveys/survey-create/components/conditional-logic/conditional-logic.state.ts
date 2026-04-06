import { Injectable, inject, signal, computed } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { httpResource } from '@angular/common/http';
import { API_CONFIG } from '@/core/config/api.config';
import { SurveyService } from '@features/surveys/services/survey.service';
import { SurveyLogicService } from '@features/surveys/services/survey-logic.service';
import { MessageService, TreeNode } from 'primeng/api';
import { startWith, distinctUntilChanged, pairwise, Observable } from 'rxjs';

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
  
  // Optimization: Question lookup map O(1)
  readonly questionsMap = computed(() => {
    const map = new Map<number, any>();
    this.allQuestions().forEach(q => map.set(q.id, q));
    return map;
  });

  readonly domainTreeNodes = signal<TreeNode[]>([]);
  readonly selectedTreeNode = signal<any>(null);
  readonly currentSubdomainQuestions = signal<any[]>([]);
  
  // Refactored: Track editing IDs instead of counting FormGroups internally
  readonly editingIds = signal<Set<number | string>>(new Set());

  // For review step
  readonly reviewEditIndex = signal<number | null>(null);
  readonly reviewEditForm = signal<FormGroup | null>(null);
  readonly reviewDomainFilterId = signal<string | null>(null);

  // Optimized: O(n) complexity for rule aggregation
  readonly allLogicRules = computed(() => {
    const questions = this.allQuestions();
    const domainFilter = this.reviewDomainFilterId();
    const rules: any[] = [];
    const ruleIds = new Set<number>();

    questions.forEach((q) => {
      if (domainFilter && !q.domainIds?.includes(domainFilter)) return;

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
    return this.editingIds().size > 0 || this.reviewEditIndex() !== null;
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

    group.get('target_answer_options')?.setValidators([
      (control: any) => {
        const actionType = group.get('ui_action_type')?.value;
        if (actionType === 'limited_answer' && (!control.value || control.value.length === 0)) {
          return { requiredAnswers: true };
        }
        return null;
      },
    ]);

    if (!isEditing) group.disable();

    group.get('ui_action_type')?.valueChanges.subscribe(() => {
      group.get('target_answer_options')?.updateValueAndValidity();
    });

    group
      .get('ui_action_type')
      ?.valueChanges.pipe(distinctUntilChanged(), pairwise())
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
    const q = this.questionsMap().get(questionId);
    if (!q || !q.meta_data || !q.meta_data.options) return [];
    return q.meta_data.options.map((opt: string) => ({ label: opt, value: opt }));
  }

  getTriggerQuestionOptions(currentRuleTriggerId: number | null): any[] {
    const options = this.currentSubdomainQuestions().map((q: any) => ({
      label: q.text,
      value: q.id,
    }));
    if (currentRuleTriggerId && !options.find((opt) => opt.value === currentRuleTriggerId)) {
      const q = this.questionsMap().get(currentRuleTriggerId);
      if (q) options.push({ label: q.text, value: q.id });
    }
    return options;
  }

  getQuestionTextById(id: number | null): string {
    if (!id) return '';
    return this.questionsMap().get(id)?.text || 'Question ' + id;
  }

  setSurveyId(id: string | null) {
    this.activeSurveyId.set(id);
    this.selectedTreeNode.set(null);
    this.currentSubdomainQuestions.set([]);
    this.allQuestions.set([]);
    this.domainTreeNodes.set([]);
    this.reviewDomainFilterId.set(null);
    this.editingIds.set(new Set());
  }

  // Refactored: Takes data directly instead of relying on Signal array mutation
  saveLogicRule(payloadData: any, id?: number, triggerQId?: number): Observable<any> {
    const payload = {
      trigger_answer: payloadData.trigger_answer,
      action_type: payloadData.ui_action_type === 'alert' ? payloadData.alert_type : payloadData.ui_action_type,
      target_question_id: payloadData.target_question_ids?.length ? payloadData.target_question_ids[0] : undefined,
      target_question_ids: payloadData.target_question_ids?.length ? payloadData.target_question_ids : undefined,
      target_answer_options: payloadData.target_answer_options?.length ? payloadData.target_answer_options : undefined,
    };

    if (id) {
      return this.logicService.updateLogicRule(id, payload);
    } else {
      return this.logicService.createLogicRule(triggerQId!, payload);
    }
  }

  deleteLogicRule(ruleId: number): Observable<any> {
    return this.logicService.deleteLogicRule(ruleId);
  }
}
