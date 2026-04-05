import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  effect,
  ViewEncapsulation,
  computed,
  inject,
} from '@angular/core';
import { LucideAngularModule, Search, Plus, CalendarDays } from 'lucide-angular';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { NgxDaterangepickerMd, LocaleService, LOCALE_CONFIG } from 'ngx-daterangepicker-material';
import moment from 'moment';
import { TopBarBreadcrumbComponent } from '@/core/layout/main-layout/components/top-bar/top-bar.component';
import { BNotificationComponent } from '../b-notification/b-notification.component';
import { SideBarService } from '@/core/layout/main-layout/components/side-bar/services/side-bar.service';
import { Avatar } from 'primeng/avatar';

@Component({
  selector: 'app-b-page-header',
  standalone: true,
  imports: [
    LucideAngularModule,
    FormsModule,
    NgxDaterangepickerMd,
    TopBarBreadcrumbComponent,
    BNotificationComponent,
    Avatar,
  ],
  templateUrl: './b-page-header.component.html',
  styleUrl: './b-page-header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [
    { provide: LOCALE_CONFIG, useValue: {} },
    { provide: LocaleService, useClass: LocaleService, deps: [LOCALE_CONFIG] },
  ],
})
export class BPageHeaderComponent {
  // Inputs
  title = input.required<string>();
  placeholder = input<string>('Search for...');
  createButtonLabel = input<string>('Create');
  showCreateButton = input<boolean>(true);
  showSearch = input<boolean>(false);
  createButtonIcon = input<any>(Plus);
  private readonly _SideBarService = inject(SideBarService);
  userLogoResource = this._SideBarService.getIcon();
  userLogo = computed(() => {
    return this.userLogoResource.value();
  });
  // Outputs
  searchChange = output<string>();
  createClick = output<void>();
  dateChange = output<{ from: string; to: string; range?: string }>();

  // Inputs for showing filters
  showDateFilter = input<boolean>(false);

  // Icons
  readonly searchIcon = Search;
  readonly plusIcon = Plus;
  readonly calendarIcon = CalendarDays;

  // Internal search state
  searchText = signal<string>('');
  selectedRange = signal<any>(null);
  isDateDropdownOpen = signal<boolean>(false);
  ranges: any = {
    Today: [moment(), moment()],
    Yesterday: [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
    'Last 30 Days': [moment().subtract(29, 'days'), moment()],
    'Last 6 Months': [moment().subtract(6, 'month'), moment()],
    Lifetime: [moment('2020-01-01'), moment()],
  };

  rangeToNameMap: Record<string, string> = {
    Today: 'today',
    Yesterday: 'yesterday',
    'Last 7 Days': 'last_7_days',
    'Last 30 Days': 'last_30_days',
    'Last 6 Months': 'last_6_months',
    Lifetime: 'lifetime',
  };

  // Debounced search using Signals and RxJS Interop
  private searchText$ = toObservable(this.searchText);
  private debouncedSearchText = toSignal(
    this.searchText$.pipe(debounceTime(400), distinctUntilChanged()),
    { initialValue: '' },
  );

  constructor() {
    let isInitial = true;
    effect(() => {
      const val = this.debouncedSearchText();
      if (!isInitial) {
        this.searchChange.emit(val);
      }
      isInitial = false;
    });
  }

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchText.set(value);
  }

  onCreateClick(): void {
    this.createClick.emit();
  }

  onDatesUpdated(event: any) {
    this.selectedRange.set(event);
  }
  toggleDateDropdown() {
    this.isDateDropdownOpen.update((value) => !value);
  }
  applyFilter() {
    const range = this.selectedRange();
    if (range && range.startDate && range.endDate) {
      this.dateChange.emit({
        from: range.startDate.format('YYYY-MM-DD'),
        to: range.endDate.format('YYYY-MM-DD'),
        range: this.rangeToNameMap[range.label] || '',
      });
    }
    this.isDateDropdownOpen.update((value) => !value);
  }
}
