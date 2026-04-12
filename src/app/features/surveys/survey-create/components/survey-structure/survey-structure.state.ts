import { Injectable, inject, signal, effect, computed } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { MessageService, TreeNode } from 'primeng/api';
import { SurveyService } from '@features/surveys/services/survey.service';

@Injectable()
export class SurveyStructureStateService {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly surveyService = inject(SurveyService);
  private readonly messageService = inject(MessageService);

  readonly surveyId = signal<string | null>(null);
  readonly isLoaded = signal(false);
  readonly weightingType = signal<'manual' | 'question_count' | 'non_graded'>('question_count');
  readonly surveyName = signal('');

  // Track context for adding question
  readonly activeNodeContext = signal<{
    domain: FormGroup;
    breadcrumbs: string[];
    editIndex?: number;
  } | null>(null);

  readonly isEditMode = computed(() => this.activeNodeContext()?.editIndex !== undefined);

  readonly structureForm: FormGroup = this.fb.group({
    domains: this.fb.array([]),
  });

  readonly questionForm: FormGroup = this.fb.group({
    text: ['', Validators.required],
    description: ['', Validators.required],
    options: this.fb.array([]),
  });

  // Tree node signals for graded questions step
  readonly domainTreeNodes = computed(() => {
    this.formValue(); // Track form changes
    const nodes: TreeNode[] = [];
    this.domains.controls.forEach((d, i) => {
      const domain = d as FormGroup;
      nodes.push(this.mapFormGroupToTreeNode(domain, [domain.get('title')?.value], 0));
    });
    return nodes;
  });

  readonly selectedGradedTreeNode = signal<any>(null);

  private lastSyncedSnapshot: any[] = [];
  private surveyResource: any;

  constructor() {
    this.resetQuestionForm();

    let currentRoute: ActivatedRoute | null = this.route;
    let foundId = null;
    while (currentRoute) {
      const id = currentRoute.snapshot.paramMap.get('id');
      if (id) {
        foundId = id;
        break;
      }
      currentRoute = currentRoute.parent;
    }

    if (foundId) {
      this.surveyId.set(foundId);
      this.surveyResource = this.surveyService.getSurveyById(foundId);

      effect(() => {
        const data = this.surveyResource?.value();
        if (data) {
          this.weightingType.set(data.weighting_type || 'question_count');
          this.surveyName.set(data.title);
          if (data.domains && data.domains.length > 0) {
            this.patchDomains(data.domains);
            this.lastSyncedSnapshot = structuredClone(this.domains.getRawValue());
          }
          this.isLoaded.set(true);
        }
      });
    }
  }

  get domains() {
    return this.structureForm.get('domains') as FormArray;
  }

  private formValue = toSignal(this.structureForm.valueChanges);

  readonly isStructureValid = computed(() => {
    this.formValue();
    const domainsArray = this.domains;
    if (domainsArray.length === 0) return false;
    return this.validateDomainNodes(domainsArray);
  });

  private validateDomainNodes(domainsArray: FormArray): boolean {
    for (const control of domainsArray.controls) {
      const node = control as FormGroup;
      const subdomains = this.getSubdomains(node);
      const questions = this.getQuestions(node);

      if (subdomains.length > 0) {
        if (!this.validateDomainNodes(subdomains)) {
          return false;
        }
      } else {
        if (questions.length === 0) {
          return false;
        }
      }
    }
    return true;
  }

  patchDomains(domainsData: any[]) {
    this.domains.clear();
    domainsData.forEach((d) => {
      this.domains.push(this.createDomainFormGroup(d));
    });
  }

  createDomainFormGroup(data: any = {}): FormGroup {
    const titleValue = data.title || '';
    return this.fb.group({
      id: [data.id || null],
      title: [titleValue, Validators.required],
      weight: [data.weight || 1],
      isExpanded: [data.isExpanded !== undefined ? data.isExpanded : true],
      lastTitle: [data.lastTitle !== undefined ? data.lastTitle : titleValue],
      allow_na: [data.allow_na ?? data.is_na ?? false],
      questions: this.fb.array((data.questions || []).map((q: any) => this.fb.group(q))),
      sub_domains: this.fb.array(
        (data.sub_domains || []).map((sd: any) => this.createDomainFormGroup(sd)),
      ),
    });
  }

  addDomain() {
    const defaultTitle = `Domain ${this.domains.length + 1}`;
    this.domains.push(this.createDomainFormGroup({ title: defaultTitle }));
    this.syncDomains();
  }

  removeDomain(index: number) {
    this.domains.removeAt(index);
    this.syncDomains();
  }

  toggleNode(node: FormGroup) {
    const control = node.get('isExpanded');
    control?.setValue(!control.value);
  }

  getSubdomains(node: FormGroup): FormArray {
    return node.get('sub_domains') as FormArray;
  }

  getQuestions(node: FormGroup): FormArray {
    return node.get('questions') as FormArray;
  }

  addSubdomain(node: FormGroup) {
    const subdomains = this.getSubdomains(node);
    const defaultTitle = `Subdomain ${subdomains.length + 1}`;
    subdomains.push(this.createDomainFormGroup({ title: defaultTitle }));
    node.get('isExpanded')?.setValue(true);
    this.syncDomains();
  }

  removeSubdomain(parent: FormGroup, index: number) {
    this.getSubdomains(parent).removeAt(index);
    this.syncDomains();
  }

  onNodeBlur(node: FormGroup) {
    const currentTitle = node.get('title')?.value?.trim();
    if (!currentTitle) {
      node.get('title')?.setValue(node.get('lastTitle')?.value || '');
    } else if (node.get('lastTitle')?.value !== currentTitle) {
      node.get('lastTitle')?.setValue(currentTitle);
    }

    if (this.weightingType() === 'manual') {
      const weightCtrl = node.get('weight');
      if (weightCtrl && weightCtrl.value < 1) {
        weightCtrl.setValue(1);
      }
    }
    this.syncDomains();
  }

  syncDomains() {
    if (!this.surveyId()) return;
    const domainsPayload = this.collectDomains(this.domains);
    this.surveyService.updateSurvey(this.surveyId()!, { domains: domainsPayload }).subscribe({
      next: (res) => {
        this.lastSyncedSnapshot = structuredClone(this.domains.getRawValue());
      },
      error: () => {
        this.patchDomains(this.lastSyncedSnapshot);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to sync survey structure. Changes reverted.',
        });
      },
    });
  }

  toggleDomainNa(node: FormGroup) {
    const id = node.get('id')?.value;
    const allowNa = node.get('allow_na')?.value;

    if (id) {
      this.surveyService.toggleDomainNa(id).subscribe({
        error: (err) => {
          // Revert state on error
          node.get('allow_na')?.setValue(!allowNa, { emitEvent: false });
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err?.error?.message || 'Failed to toggle N/A status',
          });
        },
      });
    } else {
      // For new domains, just sync the whole object which includes the allow_na state
      this.syncDomains();
    }
  }

  duplicateDomain(id: string | number) {
    if (!id) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please wait for the domain to be saved before duplicating.',
      });
      return;
    }

    this.surveyService.duplicateDomain(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Domain duplicated successfully',
        });
        this.surveyResource.reload();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.error?.message || 'Failed to duplicate domain',
        });
      },
    });
  }

  collectDomains(domainsArray: FormArray): any[] {
    return domainsArray.controls.map((d: any, i: number) => {
      const node = d as FormGroup;
      return {
        id: node.get('id')?.value || undefined,
        title: node.get('title')?.value,
        weight: node.get('weight')?.value || 0,
        allow_na: node.get('allow_na')?.value || false,
        order: i + 1,
        questions: this.getQuestions(node).controls.map((q: any, qi: number) => ({
          text: q.get('text')?.value,
          description: q.get('description')?.value || '',
          is_scored: q.get('is_scored')?.value ?? true,
          order: qi + 1,
          max_score: q.get('max_score')?.value || 0,
          meta_data: q.get('meta_data')?.value || null,
          type: q.get('type')?.value || 'radio',
        })),
        sub_domains: this.collectDomains(this.getSubdomains(node)),
      };
    });
  }

  canAddSubdomain(node: FormGroup): boolean {
    return this.getQuestions(node).length === 0;
  }

  canAddQuestion(node: FormGroup): boolean {
    return this.getSubdomains(node).length === 0;
  }

  prepareAddQuestion(node: FormGroup, breadcrumbs: string[]) {
    this.activeNodeContext.set({ domain: node, breadcrumbs });
    this.resetQuestionForm();
  }

  prepareEditQuestion(node: FormGroup, breadcrumbs: string[], editIndex: number) {
    this.activeNodeContext.set({ domain: node, breadcrumbs, editIndex });

    const qGroup = this.getQuestions(node).at(editIndex) as FormGroup;
    const val = qGroup.value;

    this.resetOptionsAndWeights();
    this.questionForm.patchValue({
      text: val.text,
      description: val.description,
    });

    const metaData = val.meta_data || {};
    const options = metaData.options || [];
    const weights = metaData.weights || {};
    const allowNa = metaData.allow_na || false;

    options.forEach((optText: string) => {
      if (allowNa && optText === 'N/A') {
        this.optionsArray.push(
          this.fb.group({
            text: ['N/A', Validators.required],
            weight: [0],
            isNa: [true],
          }),
        );
      } else {
        const weightValue = weights[optText] !== undefined ? weights[optText] : 0;
        this.optionsArray.push(
          this.fb.group({
            text: [optText, Validators.required],
            weight: [weightValue, this.getOptionWeightValidators()],
            isNa: [false],
          }),
        );
      }
    });

    if (options.length === 0) {
      this.addOption();
    }
  }

  resetQuestionForm() {
    this.questionForm.reset({
      text: '',
      description: '',
    });
    this.resetOptionsAndWeights();
    this.addOption();
  }

  get optionsArray() {
    return this.questionForm.get('options') as FormArray;
  }

  get hasNaOption(): boolean {
    return this.optionsArray.controls.some((ctrl) => ctrl.get('isNa')?.value === true);
  }

  addOption() {
    this.optionsArray.push(
      this.fb.group({
        text: ['', Validators.required],
        weight: [0, this.getOptionWeightValidators()],
        isNa: [false],
      }),
    );
  }

  private getOptionWeightValidators() {
    return this.weightingType() === 'non_graded' ? [] : [Validators.required, Validators.min(0)];
  }

  addNaOption() {
    if (this.hasNaOption) return;
    this.optionsArray.push(
      this.fb.group({
        text: ['N/A', Validators.required],
        weight: [0],
        isNa: [true],
      }),
    );
  }

  removeOption(index: number) {
    if (this.optionsArray.length < 2) return;
    this.optionsArray.removeAt(index);
  }

  resetOptionsAndWeights() {
    this.optionsArray.clear();
  }

  saveQuestionToActiveDomain() {
    const val = this.questionForm.value;
    const optionsMapped: string[] = [];
    const weightsMapped: any = {};
    let maxScore = 0;
    let allowNa = false;

    val.options.forEach((opt: any) => {
      optionsMapped.push(opt.text);
      if (opt.isNa) {
        allowNa = true;
      } else {
        const w = opt.weight !== null && opt.weight !== undefined ? Number(opt.weight) : 0;
        weightsMapped[opt.text] = w;
        if (w > maxScore) {
          maxScore = w;
        }
      }
    });

    const meta_data: any = { options: optionsMapped };
    meta_data.weights = weightsMapped;
    meta_data.allow_na = allowNa;

    const questionData = {
      text: val.text,
      description: val.description,
      is_scored: true,
      max_score: maxScore,
      meta_data,
      type: 'radio',
    };

    const ctx = this.activeNodeContext();
    const targetNode = ctx?.domain;
    const editIndex = ctx?.editIndex;

    if (!targetNode) return;

    if (editIndex !== undefined) {
      const qGroup = this.getQuestions(targetNode).at(editIndex) as FormGroup;
      qGroup.patchValue(questionData);
    } else {
      this.getQuestions(targetNode).push(this.fb.group(questionData));
    }

    this.syncDomains();
  }

  clearEditIndexFromContext() {
    const ctx = this.activeNodeContext();
    if (!ctx) return;
    this.activeNodeContext.set({
      domain: ctx.domain,
      breadcrumbs: ctx.breadcrumbs,
      editIndex: undefined,
    });
  }

  private mapFormGroupToTreeNode(node: FormGroup, breadcrumbs: string[], level: number): TreeNode {
    const subdomains = this.getSubdomains(node);
    const title = node.get('title')?.value || 'Untitled';
    const treeNode: TreeNode & { searchTitle?: string } = {
      key: `node_${title}_${level}_${Math.random().toString(36).substring(7)}`,
      label: title,
      data: { formGroup: node, breadcrumbs },
      selectable: subdomains.length === 0,
      searchTitle: title,
    };

    if (subdomains.length > 0) {
      treeNode.children = subdomains.controls.map((sd, i) => {
        const sdGroup = sd as FormGroup;
        const sdTitle = sdGroup.get('title')?.value || 'Untitled';
        return this.mapFormGroupToTreeNode(sdGroup, [...breadcrumbs, sdTitle], level + 1);
      });
    }

    return treeNode;
  }

  readonly allQuestionsFlat = computed(() => {
    this.formValue(); // Track form changes
    const result: {
      question: any;
      breadcrumbs: string[];
      domainNode: FormGroup;
      questionIndex: number;
    }[] = [];
    this.collectQuestionsRecursive(this.domains, [], result);
    return result;
  });

  private collectQuestionsRecursive(
    domainsArray: FormArray,
    parentBreadcrumbs: string[],
    result: {
      question: any;
      breadcrumbs: string[];
      domainNode: FormGroup;
      questionIndex: number;
    }[],
  ) {
    domainsArray.controls.forEach((d) => {
      const node = d as FormGroup;
      const title = node.get('title')?.value || 'Untitled';
      const breadcrumbs = [...parentBreadcrumbs, title];
      const questions = this.getQuestions(node);
      const subdomains = this.getSubdomains(node);

      questions.controls.forEach((q, qi) => {
        result.push({
          question: q.value,
          breadcrumbs,
          domainNode: node,
          questionIndex: qi,
        });
      });

      if (subdomains.length > 0) {
        this.collectQuestionsRecursive(subdomains, breadcrumbs, result);
      }
    });
  }

  getMaxQuestionScore(weights: any): number {
    if (!weights) return 0;
    const max: number = Math.max(...(Object.values(weights) as number[]));
    return max || 0;
  }
}
