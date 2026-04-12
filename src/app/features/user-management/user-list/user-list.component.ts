import {
  Component,
  ChangeDetectionStrategy,
  computed,
  inject,
  signal,
  effect,
} from '@angular/core';
import { BDataTableComponent } from '@shared/components/b-data-table/b-data-table.component';
import { BPageHeaderComponent } from '@shared/components/b-page-header/b-page-header.component';
import { UserManagementService } from '../services/user-management.service';
import { ITableColumn } from '@shared/models/table.model';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { BaseUser } from '../base/base-user';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [BDataTableComponent, BPageHeaderComponent],
  template: `
    <app-b-page-header
      [title]="config.title"
      [createButtonLabel]="'Create ' + config.entityLabel"
      [createButtonRoles]="['super_admin', 'authority']"
      (searchChange)="onSearch($event)"
      [showSearch]="true"
      (createClick)="onCreate()"
    />
    <div class="px-layout-x">
      <app-b-data-table
        [columns]="columns()"
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
export class UserListComponent {
  private readonly _Service = inject(UserManagementService);
  private readonly _MessageService = inject(MessageService);
  private readonly router = inject(Router);

  readonly config = inject(BaseUser);

  readonly columns = computed<ITableColumn[]>(() => this.config.columns);

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

  resource = this._Service.getUsers(this.config.endpoint, this.config.userType, this.params);

  localData = signal<any[]>([]);

  constructor() {
    effect(() => {
      const res = this.resource.value();
      if (res?.data) {
        this.localData.set([...res.data]);
      }
    });
  }

  tableData = computed(() => this.localData());

  totalRecords = computed(() => {
    if (this.resource.error()) return 0;
    return this.resource.value()?.total ?? 0;
  });

  isLoading = computed(() => this.resource.isLoading());
  hasError = computed(() => this.resource.error() !== undefined);

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
    const originalStatus = event.item.is_active;

    // Optimistic update
    this.localData.update((data) =>
      data.map((item) =>
        item.id === event.item.id ? { ...item, is_active: !originalStatus } : item,
      ),
    );

    this._Service.toggleUser(this.config.endpoint, event.item.id).subscribe({
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
          detail: 'Failed to toggle user',
        });
      },
    });
  }

  onEdit(item: any): void {
    this.router.navigate([this.config.navPath, 'edit', item.id]);
  }

  onCreate(): void {
    this.router.navigate([this.config.navPath, 'create']);
  }
}
