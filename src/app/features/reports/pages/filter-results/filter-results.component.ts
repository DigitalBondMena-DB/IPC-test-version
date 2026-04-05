import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReportsService } from '../../services/reports.service';
import { BDataTableComponent } from '@/shared/components/b-data-table/b-data-table.component';
import { BPageHeaderComponent } from '@/shared/components/b-page-header/b-page-header.component';
import { ITableColumn } from '@/shared/models/table.model';
import { toSignal } from '@angular/core/rxjs-interop';

import { ReportsFiltersComponent } from '../../components/reports-filters/reports-filters.component';

@Component({
  selector: 'app-filter-results',
  standalone: true,
  imports: [CommonModule, BDataTableComponent, BPageHeaderComponent, ReportsFiltersComponent],
  template: `
    <div class="flex flex-col gap-6">
      <app-b-page-header
        title="Filter Results"
        [showSearch]="true"
        [showCreateButton]="false"
        placeholder="Search results..."
        (searchChange)="onSearch($event)"
      />

      <div class="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <!-- Results Table (Left) -->
        <div class="xl:col-span-3">
          <div class="bg-white rounded-2xl shadow-sm border border-gray-50 overflow-hidden">
            <app-b-data-table
              [columns]="tableColumns"
              [data]="results() || []"
              [totalRecords]="totalRecords()"
              [loading]="isLoading()"
              [page]="params().page"
              [rows]="params().per_page"
              (pageChange)="onPageChange($event)"
              (rowsChange)="onRowsChange($event)"
              (sortChange)="onSortChange($event)"
              (retryLoad)="resultsResource.reload()"
            />
          </div>
        </div>

        <!-- Filters Sidebar (Right) -->
        <div class="flex flex-col gap-6">
          <app-reports-filters />
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterResultsComponent {
  private readonly reportsService = inject(ReportsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // Table Config
  readonly tableColumns: ITableColumn[] = [
    { field: 'survey_name', header: 'Survey', sortable: true },
    { field: 'survivor_name', header: 'Surveyor', sortable: true },
    { field: 'submitted_at', header: 'Submitted at', sortable: true },
    { field: 'entity_name', header: 'Related to', sortable: true },
    { field: 'actions', header: 'Actions', type: 'actions', viewOnly: true, sortable: false },
  ];

  // Parameters from Query
  private readonly queryParams = toSignal(this.route.queryParams);

  readonly params = signal({
    page: 1,
    per_page: 10,
    search: '',
    sort_by: 'created_at',
    sort_dir: 'desc',
  });

  // Combined Params Signal for API
  readonly apiParams = computed(() => {
    const q = this.queryParams() || {};
    return {
      ...q,
      ...this.params(),
    };
  });

  // Data Resource
  readonly resultsResource = this.reportsService.getOverviewDetails(this.apiParams);

  readonly results = computed(() => {
    const val = this.resultsResource.value();
    return val?.data?.recent_submissions || val?.data || [];
  });
  readonly totalRecords = computed(() => this.resultsResource.value()?.total || 0);
  readonly isLoading = computed(() => this.resultsResource.isLoading());

  onSearch(text: string) {
    this.params.update((p) => ({ ...p, search: text, page: 1 }));
  }

  onPageChange(page: number) {
    this.params.update((p) => ({ ...p, page }));
  }

  onRowsChange(rows: number) {
    this.params.update((p) => ({ ...p, per_page: rows, page: 1 }));
  }

  onSortChange(event: { field: string; direction: 'asc' | 'desc' }) {
    this.params.update((p) => ({
      ...p,
      sort_by: event.field,
      sort_dir: event.direction,
    }));
  }
}
