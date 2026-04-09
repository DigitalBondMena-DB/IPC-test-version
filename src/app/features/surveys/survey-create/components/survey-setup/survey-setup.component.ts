import { Component, inject, signal, computed, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { BFormBuilderComponent } from '@/shared/components/b-form-builder/b-form-builder.component';
import { SurveyService } from '../../../services/survey.service';
import { IFormField } from '@/shared/models/form-field.model';
import { Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { LucideAngularModule, Settings } from 'lucide-angular';
import { BaseIdComponent } from '@shared/base/base-id-component';
import { getCommonRelationalFields } from '@shared/config/common-fields.config';

@Component({
  selector: 'app-survey-setup',
  standalone: true,
  imports: [CommonModule, BFormBuilderComponent, LucideAngularModule],
  template: `
    <div class="mt-6 bg-white py-6 px-4 border border-[#E1E7EF] rounded-xl">
      <div class="flex items-center gap-3 mb-6">
        <div class="p-2 bg-blue-50 rounded-lg">
          <lucide-angular [img]="settingsIcon" [size]="20" class="text-blue-500" />
        </div>
        <div>
          <h2 class="text-lg font-bold text-black-400">Survey Setup</h2>
          <p class="text-sm text-gray-500">Set up basic survey parameters</p>
        </div>
      </div>

      <app-b-form-builder
        [fields]="fields()"
        [initialData]="initialData()"
        [loading]="isSubmitting()"
        submitLabel="Save"
        cancelLabel="Cancel"
        (formSubmit)="onSubmit($event)"
        (formCancel)="onCancel()"
        (onSearch)="onDropdownSearch($event)"
        (onScrollPagination)="onDropdownScroll($event)"
        (onValueChange)="onValueChange($event)"
      />
    </div>
  `,
})
export class SurveySetupComponent extends BaseIdComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly surveyService = inject(SurveyService);
  private readonly messageService = inject(MessageService);

  readonly settingsIcon = Settings;

  id = signal<string | null>(this.route.parent?.snapshot.paramMap.get('id') || null);

  initialData = signal<any>({});

  // Resource for loading existing survey data
  surveyResource = this.id() ? this.surveyService.getSurveyById(this.id()!) : null;

  rawFields: IFormField[] = [
    {
      key: 'title',
      label: 'Survey Title',
      type: 'text',
      placeholder: 'Survey Title',
      validators: [Validators.required],
      colSpan: 'col-span-1',
    },
    ...getCommonRelationalFields(),
    {
      key: 'deadline_hours',
      label: 'Deadline (Hours)',
      type: 'number',
      placeholder: '168',
      validators: [Validators.min(1)],
      colSpan: 'col-span-1',
    },
    {
      key: 'weighting_type',
      label: 'Calculation Method',
      type: 'select',
      placeholder: 'Select Method',
      options: [
        { label: 'Weighted', value: 'manual' },
        { label: 'Non-Weighted', value: 'question_count' },
        { label: 'Non-graded', value: 'non_graded' },
      ],
      validators: [Validators.required],
      colSpan: 'col-span-1',
      sendAs: 'single',
    },
  ];

  constructor() {
    super();
    this.initDependencies(this.rawFields, this.surveyService);
    effect(() => {
      const data = this.surveyResource?.value();
      if (data) {
        this.initialData.set({
          ...data,
          category_ids: data.categories?.map((c: any) => c.id) || [],
          weighting_type: data.weighting_type || 'manual',
          deadline_hours: data.deadline_hours?.toString() || '',
        });
      }
    });
  }

  fields = computed(() => this.getAugmentedFields(this.rawFields, !!this.id()));

  override onValueChange(event: { key: string; value: any }) {
    super.onValueChange(event, this.rawFields);
  }

  onSubmit(data: any) {
    this.isSubmitting.set(true);
    const deadlineHours = data.deadline_hours ? parseInt(data.deadline_hours, 10) : 0;

    let payload: any = { ...data };

    if (deadlineHours > 0) {
      payload.deadline_hours = deadlineHours;
    } else {
      delete payload.deadline_hours;
    }

    // Standardize select/multiselect and handle "Select All"
    this.rawFields.forEach((field: any) => {
      const value = payload[field.key];
      const sendAs = field.sendAs || 'array';

      if ((field.type === 'select' || field.type === 'multiselect') && value !== undefined) {
        // Handle formatting based on sendAs property
        if (sendAs === 'array') {
          if (value !== null && value !== '' && !Array.isArray(value)) {
            payload[field.key] = [value];
          }
        } else if (sendAs === 'single') {
          if (Array.isArray(value)) {
            payload[field.key] = value.length > 0 ? value[0] : null;
          }
        }

        // Handle SELECT_ALL
        if (field.hasSelectAll && field.selectAllKey && Array.isArray(payload[field.key])) {
          if (payload[field.key].includes('SELECT_ALL')) {
            delete payload[field.key];
            payload[field.selectAllKey] = true;
          }
        }
      }
    });

    const obs = this.id()
      ? this.surveyService.updateSurvey(this.id()!, payload)
      : this.surveyService.createSurvey(payload);

    obs.subscribe({
      next: (res: any) => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message });
        const newId = res.data?.id || this.id();
        this.router.navigate(['/survey/edit', newId, 'preliminary-questions']);
        this.isSubmitting.set(false);
      },
      error: (err: any) => {
        this.isSubmitting.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message || 'Failed to save',
        });
      },
    });
  }

  onCancel() {
    this.router.navigate(['/survey']);
  }
}
