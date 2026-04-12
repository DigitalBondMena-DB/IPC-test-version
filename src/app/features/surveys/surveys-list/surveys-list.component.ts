import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  computed,
  effect,
} from '@angular/core';
import { Router } from '@angular/router';
import { BDataTableComponent } from '@/shared/components/b-data-table/b-data-table.component';
import { BPageHeaderComponent } from '@/shared/components/b-page-header/b-page-header.component';
import { SurveyService } from '../services/survey.service';
import { ITableColumn } from '@/shared/models/table.model';
import { CommonModule } from '@angular/common';
import { LocaleService, LOCALE_CONFIG } from 'ngx-daterangepicker-material';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-surveys-list',
  standalone: true,
  imports: [CommonModule, BDataTableComponent, BPageHeaderComponent],
  templateUrl: './surveys-list.component.html',
  styleUrl: './surveys-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: LOCALE_CONFIG, useValue: {} },
    { provide: LocaleService, useClass: LocaleService, deps: [LOCALE_CONFIG] },
  ],
})
export class SurveysListComponent {
  private readonly _SurveyService = inject(SurveyService);
  private readonly _MessageService = inject(MessageService);
  // Table Config
  columns: ITableColumn[] = [
    { field: 'name', header: 'Name', sortable: true },
    { field: 'division', header: 'Division', sortable: true },
    {
      field: 'weighting_type',
      header: 'Calculation Method',
      sortable: true,
      transform: (value: string) => {
        switch (value) {
          case 'manual':
            return 'Weighted';
          case 'question_count':
            return 'Non Weighted';
          case 'non_graded':
            return 'Non Graded';
          default:
            return value;
        }
      },
    },
    { field: 'created', header: 'Created', type: 'date', sortable: true },
    { field: 'last_update', header: 'Last Update', type: 'date', sortable: true },
    { field: 'updated_by', header: 'Updated By', sortable: true },
    {
      field: 'is_active',
      header: 'Actions',
      type: 'toggle',
      duplicate: true,
      customClass: 'justify-center',
    },
  ];

  // State
  params = signal<any>({
    page: 1,
    per_page: 10,
    search: '',
    sort_by: 'created_at',
    sort_dir: 'desc',
    date_from: '',
    date_to: '',
  });
  hasError = computed(() => !!this.surveysResource.error());
  isLoading = computed(() => this.surveysResource.isLoading());
  // Data Resource
  surveysResource = this._SurveyService.getSurveys(this.params);

  localData = signal<any[]>([]);

  constructor() {
    effect(() => {
      const res = this.surveysResource.value();
      if (res?.data) {
        this.localData.set([...res.data]);
      }
    });
  }

  tableData = computed(() => this.localData());

  // Actions
  onSearch(query: string) {
    this.params.update((p) => ({ ...p, search: query, page: 1 }));
  }

  onDateChange(event: { from: string; to: string; range?: string }) {
    this.params.update((p) => ({
      ...p,
      start_date: event.from,
      end_date: event.to,
      page: 1,
    }));
  }

  onPageChange(page: number) {
    this.params.update((p) => ({ ...p, page }));
  }

  onRowsChange(per_page: number) {
    this.params.update((p) => ({ ...p, per_page, page: 1 }));
  }

  onSortChange(event: { field: string; direction: 'asc' | 'desc' }) {
    this.params.update((p) => ({
      ...p,
      sort_by: event.field,
      sort_dir: event.direction,
    }));
  }

  onToggle(event: { item: any; field: string; value: boolean }) {
    const originalStatus = event.item.is_active;

    // Optimistic update
    this.localData.update((data) =>
      data.map((item) =>
        item.id === event.item.id ? { ...item, is_active: !originalStatus } : item,
      ),
    );

    this._SurveyService.toggleSurvey(event.item.id).subscribe({
      next: (res) => {
        this._MessageService.add({
          summary: 'Success',
          detail: res.message || 'Status updated successfully.',
        });
      },
      error: () => {
        // Revert on error
        this.localData.update((data) =>
          data.map((item) =>
            item.id === event.item.id ? { ...item, is_active: originalStatus } : item,
          ),
        );
        this._MessageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to toggle entity',
        });
      },
    });
  }

  onDuplicate(item: any) {
    this._SurveyService.duplicateSurvey(item.id).subscribe({
      next: (res) => {
        this._MessageService.add({
          summary: 'Success',
          detail: `Entity Duplicated successfully`,
        });
        this.router.navigate(['/survey/edit', res.data.id]);
      },
      error: () => {
        this._MessageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to duplicate entity',
        });
      },
    });
  }

  private readonly router = inject(Router);

  onCreate() {
    this.router.navigate(['/survey/create/setup']);
  }

  onEdit(item: any) {
    this.router.navigate(['/survey/edit', item.id]);
  }
}
