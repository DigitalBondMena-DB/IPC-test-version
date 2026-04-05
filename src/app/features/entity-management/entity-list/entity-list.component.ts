import { Component, ChangeDetectionStrategy, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BDataTableComponent } from '@shared/components/b-data-table/b-data-table.component';
import { BPageHeaderComponent } from '@shared/components/b-page-header/b-page-header.component';
import { EntityManagementService } from '../services/entity-management.service';
import { Router, ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ENTITY_TYPE_CONFIG } from '../config/entity-type.config';

@Component({
  selector: 'app-entity-list',
  standalone: true,
  imports: [BDataTableComponent, BPageHeaderComponent],
  template: `
    <app-b-page-header
      [title]="config().title"
      [createButtonLabel]="'Create ' + config().entityLabel"
      [showSearch]="true"
      (searchChange)="onSearch($event)"
      (createClick)="onCreate()"
    />
    <div class="px-layout-x">
      <app-b-data-table
        [columns]="config().columns"
        [data]="tableData()"
        [totalRecords]="totalRecords()"
        [rows]="tableState().perPage"
        [page]="tableState().page"
        [loading]="isLoading()"
        [hasError]="hasError()"
        (pageChange)="onPageChange($event)"
        (sortChange)="onSortChange($event)"
        (rowsChange)="onRowsChange($event)"
        (retryLoad)="onRetry()"
        (toggleChange)="onToggle($event)"
        (editClick)="onEdit($event)"
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntityListComponent {
  private readonly _Service = inject(EntityManagementService);
  private readonly _MessageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly type = toSignal(this.route.data.pipe(map((d) => d['type'] as string)), {
    initialValue: '',
  });
  readonly config = computed(() => ENTITY_TYPE_CONFIG[this.type()]);

  tableState = signal({
    page: 1,
    perPage: 10,
    search: '',
    sortBy: '',
    sortDir: '' as 'asc' | 'desc' | '',
  });

  params = computed(() => {
    const s = this.tableState();
    const p: Record<string, string | number> = {
      page: s.page,
      per_page: s.perPage,
    };
    if (s.search) p['search'] = s.search;
    if (s.sortBy) {
      p['sort_by'] = s.sortBy;
      p['sort_dir'] = s.sortDir || 'asc';
    }
    return p;
  });

  resource = this._Service.getEntities(
    this.config().endpoint,
    this.config().entity_type,
    this.params,
    this.config().parent_type,
  );

  tableData = computed(() => {
    if (this.resource.error()) return [];
    return this.resource.value()?.data ?? [];
  });
  totalRecords = computed(() => {
    if (this.resource.error()) return 0;
    return this.resource.value()?.total ?? 0;
  });
  isLoading = computed(() => this.resource.isLoading());
  hasError = computed(() => !!this.resource.error());

  onSearch(value: string): void {
    this.tableState.update((s) => ({ ...s, search: value, page: 1 }));
  }

  onPageChange(page: number): void {
    this.tableState.update((s) => ({ ...s, page }));
  }

  onSortChange(sort: { field: string; direction: 'asc' | 'desc' }): void {
    this.tableState.update((s) => ({ ...s, sortBy: sort.field, sortDir: sort.direction, page: 1 }));
  }

  onRowsChange(rows: number): void {
    this.tableState.update((s) => ({ ...s, perPage: rows, page: 1 }));
  }

  onRetry(): void {
    this.resource.reload();
  }

  onToggle(event: { item: any }): void {
    this._Service
      .toggleEntity(this.config().endpoint, this.config().entity_type, event.item.id)
      .subscribe({
        next: (res: any) => {
          const isActive = res.data.is_active;
          this.resource.reload();
          this._MessageService.add({
            summary: 'Success',
            detail: `Entity ${isActive ? 'Activated' : 'Deactivated'} successfully`,
          });
        },
        error: () => {
          this.resource.reload();
          this._MessageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to toggle entity',
          });
        },
      });
  }

  onEdit(item: any): void {
    this.router.navigate([this.config().navPath, 'edit', item.id]);
  }

  onCreate(): void {
    this.router.navigate([this.config().navPath, 'create']);
  }
}
