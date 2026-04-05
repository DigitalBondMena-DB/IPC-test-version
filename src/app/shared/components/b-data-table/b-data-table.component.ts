import { Component, ChangeDetectionStrategy, input, output, signal, computed } from '@angular/core';
import { ITableColumn } from '@shared/models/table.model';
import { DatePipe } from '@angular/common';
import {
  LucideAngularModule,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Pencil,
  RotateCcw,
  Copy,
  Eye,
} from 'lucide-angular';
import { Tooltip } from 'primeng/tooltip';

@Component({
  selector: 'app-b-data-table',
  imports: [DatePipe, LucideAngularModule, Tooltip],
  templateUrl: './b-data-table.component.html',
  styleUrl: './b-data-table.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BDataTableComponent {
  // Inputs
  columns = input.required<ITableColumn[]>();
  data = input<any[]>([]);
  totalRecords = input(0);
  rows = input(10);
  loading = input(false);
  hasError = input<boolean>(false);
  page = input(1);
  showPagination = input(true);
  // Outputs
  pageChange = output<number>();
  sortChange = output<{ field: string; direction: 'asc' | 'desc' }>();
  rowsChange = output<number>();
  retryLoad = output<void>();
  toggleChange = output<{ item: any; field: string; value: boolean }>();
  editClick = output<any>();
  duplicateClick = output<any>();
  viewClick = output<any>();

  // Local state
  currentSortField = signal('');
  currentSortDir = signal<'asc' | 'desc'>('asc');

  // Icons
  readonly arrowUpDownIcon = ArrowUpDown;
  readonly arrowUpIcon = ArrowUp;
  readonly arrowDownIcon = ArrowDown;
  readonly chevronLeftIcon = ChevronLeft;
  readonly chevronRightIcon = ChevronRight;
  readonly pencilIcon = Pencil;
  readonly retryIcon = RotateCcw;
  readonly copyIcon = Copy;
  readonly eyeIcon = Eye;

  // Row sizes
  dynamicRowOptions = computed(() => {
    const total = this.totalRecords();
    const options = [
      { label: '10', value: 10 },
      { label: '50', value: 50 },
      { label: '100', value: 100 },
    ];

    const filtered = options.filter((opt) => opt.value <= total);

    // Add "All" option if it's not already exactly one of the options above
    // or if no options are filtered (total < 10)
    if (!filtered.find((opt) => opt.value === total) && total > 0) {
      filtered.push({ label: 'All', value: total });
    }

    // Ensure we always have at least the current rows count as an option if total is 0 or something else
    if (filtered.length === 0 && total === 0) {
      filtered.push({ label: '10', value: 10 });
    }

    return filtered;
  });
  readonly skeletonRows = Array(8).fill(0);

  // Computed
  lastPage = computed(() => Math.ceil(this.totalRecords() / this.rows()) || 1);
  startRecord = computed(() => (this.page() - 1) * this.rows() + 1);
  endRecord = computed(() => Math.min(this.page() * this.rows(), this.totalRecords()));

  visiblePages = computed(() => {
    const current = this.page();
    const last = this.lastPage();
    const pages: (number | '...')[] = [];

    if (last <= 7) {
      for (let i = 1; i <= last; i++) pages.push(i);
      return pages;
    }

    pages.push(1);

    if (current > 3) pages.push('...');

    const start = Math.max(2, current - 1);
    const end = Math.min(last - 1, current + 1);

    for (let i = start; i <= end; i++) pages.push(i);

    if (current < last - 2) pages.push('...');

    pages.push(last);

    return pages;
  });

  onSort(column: ITableColumn): void {
    if (!column.sortable) return;

    if (this.currentSortField() === column.field) {
      this.currentSortDir.update((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.currentSortField.set(column.field);
      this.currentSortDir.set('asc');
    }

    this.sortChange.emit({
      field: this.currentSortField(),
      direction: this.currentSortDir(),
    });
  }

  onPageChange(page: number | '...'): void {
    if (page === '...' || page === this.page()) return;
    this.pageChange.emit(page);
  }

  onPrev(): void {
    if (this.page() > 1) this.pageChange.emit(this.page() - 1);
  }

  onNext(): void {
    if (this.page() < this.lastPage()) this.pageChange.emit(this.page() + 1);
  }

  onRowsChange(event: Event): void {
    const value = +(event.target as HTMLSelectElement).value;
    this.rowsChange.emit(value);
  }

  onToggle(item: any, field: string): void {
    if (item?.can_be_edited === false) return;
    this.toggleChange.emit({ item, field, value: !item[field] });
  }

  onEdit(item: any): void {
    if (item.can_be_edited === false) return;
    this.editClick.emit(item);
  }

  onDuplicate(item: any): void {
    this.duplicateClick.emit(item);
  }

  onView(item: any): void {
    this.viewClick.emit(item);
  }

  getSortIcon(column: ITableColumn) {
    if (!column.sortable) return null;
    if (this.currentSortField() !== column.field) return this.arrowUpDownIcon;
    return this.currentSortDir() === 'asc' ? this.arrowUpIcon : this.arrowDownIcon;
  }
  isCanBeEdited(item: any): boolean {
    if (item.can_be_edited === undefined) {
      return false;
    }
    {
      return item?.can_be_edited === false;
    }
  }
}
