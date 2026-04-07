import { Component, ChangeDetectionStrategy, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BDataTableComponent } from '@shared/components/b-data-table/b-data-table.component';
import { BPageHeaderComponent } from '@shared/components/b-page-header/b-page-header.component';
import { UserManagementService } from '../services/user-management.service';
import { ITableColumn } from '@shared/models/table.model';
import { Router, ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { MessageService } from 'primeng/api';
import { USER_TYPE_CONFIG } from '../config/user-type.config';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [BDataTableComponent, BPageHeaderComponent],
  template: `
    <app-b-page-header
      [title]="config().title"
      [createButtonLabel]="'Create ' + config().entityLabel"
      [createButtonRoles]="['ministry', 'authority']"
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
  private readonly route = inject(ActivatedRoute);

  readonly type = toSignal(this.route.data.pipe(map((d) => d['type'] as string)), {
    initialValue: '',
  });
  readonly config = computed(() => USER_TYPE_CONFIG[this.type()]);

  readonly columns = computed<ITableColumn[]>(() => this.config().columns);

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

  resource = this._Service.getUsers(this.config().endpoint, this.config().userType, this.params);

  tableData = computed(() => {
    if (this.resource.error()) return [];
    return this.resource.value()?.data ?? [];
  });
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
    this._Service
      .toggleUser(this.config().endpoint, this.config().userType, event.item.id)
      .subscribe({
        next: (res) => {
          const isActive = res.data.is_active;

          this.resource.reload();
          this._MessageService.add({
            summary: 'Success',
            detail: `User ${isActive ? 'Activated' : 'Deactivated'} successfully`,
          });
        },
        error: () => {
          this.resource.reload();
          this._MessageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to toggle user',
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
