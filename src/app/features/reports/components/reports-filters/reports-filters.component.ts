import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  effect,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EntityManagementService } from '@/features/entity-management/services/entity-management.service';
import { UserManagementService } from '@/features/user-management/services/user-management.service';
import { API_CONFIG } from '@/core/config/api.config';
import { BSelectComponent } from '@/shared/components/b-select/b-select.component';
import { BMultiSelectComponent } from '@/shared/components/b-multi-select/b-multi-select.component';
import { BDateRangePickerComponent } from '@/shared/components/b-date-range-picker/b-date-range-picker.component';

@Component({
  selector: 'app-reports-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BSelectComponent,
    BMultiSelectComponent,
    BDateRangePickerComponent,
  ],
  template: `
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 flex flex-col gap-6 h-fit">
      <h3 class="text-lg font-bold text-[#202224]">Filter</h3>

      <div class="flex flex-col gap-4">
        <!-- Governorate -->
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-semibold">Governorate</label>
          <app-b-select
            placeholder="Select governorate name..."
            [options]="governorateOptions()"
            [ngModel]="selectedGovernorate()"
            (ngModelChange)="onGovernorateChange($event)"
            [virtualScroll]="true"
            [filter]="true"
            (onScrollPagination)="onDropdownScroll(govState, governoratesResource, $event)"
            (onSearch)="onDropdownSearch(govState, $event)"
          />
        </div>

        <!-- Directorate -->
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-semibold">Directorate</label>
          <app-b-select
            placeholder="Select directorate name..."
            [options]="directorateOptions()"
            [ngModel]="selectedDirectorate()"
            [disabled]="!selectedGovernorate()"
            disabledTooltip="Please select Governorate first"
            (ngModelChange)="onDirectorateChange($event)"
            [virtualScroll]="true"
            [filter]="true"
            (onScrollPagination)="onDropdownScroll(dirState, directoratesResource, $event)"
            (onSearch)="onDropdownSearch(dirState, $event)"
          />
        </div>

        <!-- Hospital -->
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-semibold">Hospital</label>
          <app-b-select
            placeholder="Select hospital name..."
            [options]="hospitalOptions()"
            [ngModel]="selectedHospital()"
            [disabled]="!selectedDirectorate()"
            disabledTooltip="Please select Directorate first"
            (ngModelChange)="onHospitalChange($event)"
            [virtualScroll]="true"
            [filter]="true"
            (onScrollPagination)="onDropdownScroll(hosState, hospitalsResource, $event)"
            (onSearch)="onDropdownSearch(hosState, $event)"
          />
        </div>

        <!-- Division -->
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-semibold">Division</label>
          <app-b-multi-select
            placeholder="Select division name..."
            [options]="divisionOptions()"
            [ngModel]="selectedDivisions()"
            (ngModelChange)="selectedDivisions.set($event)"
            [virtualScroll]="true"
            [filter]="true"
            (onScrollPagination)="onDropdownScroll(divState, divisionsResource, $event)"
            (onSearch)="onDropdownSearch(divState, $event)"
          />
        </div>

        <!-- Surveyor -->
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-semibold">Surveyor</label>
          <app-b-select
            placeholder="Select surveyor name..."
            [options]="surveyorOptions()"
            [ngModel]="selectedSurveyor()"
            (ngModelChange)="selectedSurveyor.set($event)"
            [virtualScroll]="true"
            [filter]="true"
            (onScrollPagination)="onDropdownScroll(surState, surveyorsResource, $event)"
            (onSearch)="onDropdownSearch(surState, $event)"
          />
        </div>

        <!-- Date -->
        <div class="flex flex-col gap-1.5 relative">
          <label class="text-sm font-semibold">Date</label>
          <app-b-date-range-picker
            opens="right"
            drops="up"
            [ngModel]="dateRange()"
            (ngModelChange)="dateRange.set($event)"
          />
        </div>
      </div>

      <button
        (click)="applyFilter()"
        class="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors shadow-sm active:transform active:scale-[0.98]"
      >
        Apply Filter
      </button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportsFiltersComponent implements OnInit {
  private readonly entityService = inject(EntityManagementService);
  private readonly userManagementService = inject(UserManagementService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // Filter Signals
  readonly selectedGovernorate = signal<number | null>(null);
  readonly selectedDirectorate = signal<number | null>(null);
  readonly selectedHospital = signal<number | null>(null);
  readonly selectedDivisions = signal<number[]>([]);
  readonly selectedSurveyor = signal<number | null>(null);
  readonly dateRange = signal<{ from: string; to: string; range?: string } | null>(null);

  // Dropdown States Pagination
  createDropdownState() {
    return {
      searchTerm: signal(''),
      page: signal(1),
      accumulated: signal<any[]>([]),
    };
  }

  readonly govState = this.createDropdownState();
  readonly dirState = this.createDropdownState();
  readonly hosState = this.createDropdownState();
  readonly divState = this.createDropdownState();
  readonly surState = this.createDropdownState();

  // Resources
  readonly governoratesParams = computed(() => {
    const p: any = { per_page: 25, page: this.govState.page() };
    if (this.govState.searchTerm()) p.search = this.govState.searchTerm();
    return p;
  });
  readonly governoratesResource = this.entityService.getEntities(
    API_CONFIG.ENDPOINTS.ENTITIES.BASE,
    'governorate',
    this.governoratesParams,
  );

  readonly directoratesParams = computed(() => {
    const p: any = {
      per_page: 25,
      page: this.dirState.page(),
      parent_id: this.selectedGovernorate() || '',
    };
    if (this.dirState.searchTerm()) p.search = this.dirState.searchTerm();
    return p;
  });
  readonly directoratesResource = this.entityService.getEntities(
    API_CONFIG.ENDPOINTS.ENTITIES.BASE,
    'medical_area',
    this.directoratesParams,
  );

  readonly hospitalsParams = computed(() => {
    const p: any = {
      per_page: 25,
      page: this.hosState.page(),
      parent_id: this.selectedDirectorate() || '',
    };
    if (this.hosState.searchTerm()) p.search = this.hosState.searchTerm();
    return p;
  });
  readonly hospitalsResource = this.entityService.getEntities(
    API_CONFIG.ENDPOINTS.ENTITIES.BASE,
    'hospital',
    this.hospitalsParams,
  );

  readonly divisionsParams = computed(() => {
    const p: any = { per_page: 25, page: this.divState.page() };
    if (this.divState.searchTerm()) p.search = this.divState.searchTerm();
    return p;
  });
  readonly divisionsResource = this.entityService.get<any>(
    API_CONFIG.ENDPOINTS.DIVISIONS,
    this.divisionsParams,
  );

  readonly surveyorsParams = computed(() => {
    const p: any = { per_page: 25, page: this.surState.page() };
    if (this.surState.searchTerm()) p.search = this.surState.searchTerm();
    return p;
  });
  readonly surveyorsResource = this.userManagementService.getUsers(
    API_CONFIG.ENDPOINTS.USERS.BASE,
    '',
    this.surveyorsParams,
  );

  constructor() {
    this.setupAccumulation(this.govState, this.governoratesResource);
    this.setupAccumulation(this.dirState, this.directoratesResource);
    this.setupAccumulation(this.hosState, this.hospitalsResource);
    this.setupAccumulation(this.divState, this.divisionsResource);
    this.setupAccumulation(this.surState, this.surveyorsResource);
  }

  ngOnInit(): void {
    // Sync filters with URL if they exist
    const params = this.route.snapshot.queryParams;
    if (params['entity_type'] === 'governorate') this.selectedGovernorate.set(+params['entity_id']);
    if (params['entity_type'] === 'medical_area')
      this.selectedDirectorate.set(+params['entity_id']);
    if (params['entity_type'] === 'hospital') this.selectedHospital.set(+params['entity_id']);
    if (params['category_id']) {
      this.selectedDivisions.set(params['category_id'].split(',').map(Number));
    }
    if (params['surveyor_id']) this.selectedSurveyor.set(+params['surveyor_id']);
    if (params['date_from'] || params['date_to']) {
      this.dateRange.set({
        from: params['date_from'],
        to: params['date_to'],
        range: params['date_range'],
      });
    }
  }

  private setupAccumulation(state: any, resource: any) {
    effect(() => {
      if (resource.isLoading()) return;
      const res = resource.value();
      if (res?.data) {
        if (state.page() === 1) state.accumulated.set(res.data);
        else state.accumulated.update((prev: any[]) => [...prev, ...res.data]);
      } else if (!res && !resource.isLoading()) {
        if (state.page() === 1) state.accumulated.set([]);
      }
    });
  }

  private mapOptions(state: any, resource: any) {
    const options = state
      .accumulated()
      .map((e: any) => ({ label: e.name || e.username || e.label, value: e.id }));
    const res = resource.value();
    if (res && state.page() < res.last_page) {
      options.push({ label: null, value: undefined });
    }
    return options;
  }

  readonly governorateOptions = computed(() =>
    this.mapOptions(this.govState, this.governoratesResource),
  );
  readonly directorateOptions = computed(() =>
    this.mapOptions(this.dirState, this.directoratesResource),
  );
  readonly hospitalOptions = computed(() => this.mapOptions(this.hosState, this.hospitalsResource));
  readonly divisionOptions = computed(() => this.mapOptions(this.divState, this.divisionsResource));
  readonly surveyorOptions = computed(() => this.mapOptions(this.surState, this.surveyorsResource));

  onDropdownScroll(state: any, resource: any, event: any) {
    if (resource.isLoading()) return;
    const lastVisible = event?.last || 0;
    const count = state.accumulated().length;
    const res = resource.value();
    if (res && lastVisible >= count - 1 && state.page() < (res.last_page || 1)) {
      state.page.update((p: number) => p + 1);
    }
  }

  onDropdownSearch(state: any, search: string) {
    state.searchTerm.set(search || '');
    state.page.set(1);
  }

  onGovernorateChange(id: any) {
    this.selectedGovernorate.set(id);
    this.selectedDirectorate.set(null);
    this.selectedHospital.set(null);
    this.dirState.page.set(1);
    this.dirState.accumulated.set([]);
    this.hosState.page.set(1);
    this.hosState.accumulated.set([]);
  }

  onDirectorateChange(id: any) {
    this.selectedDirectorate.set(id);
    this.selectedHospital.set(null);
    this.hosState.page.set(1);
    this.hosState.accumulated.set([]);
  }

  onHospitalChange(id: any) {
    this.selectedHospital.set(id);
  }

  applyFilter() {
    const queryParams: any = {};
    if (this.selectedHospital()) {
      queryParams['entity_id'] = this.selectedHospital();
      queryParams['entity_type'] = 'hospital';
    } else if (this.selectedDirectorate()) {
      queryParams['entity_id'] = this.selectedDirectorate();
      queryParams['entity_type'] = 'medical_area';
    } else if (this.selectedGovernorate()) {
      queryParams['entity_id'] = this.selectedGovernorate();
      queryParams['entity_type'] = 'governorate';
    }

    if (this.selectedDivisions()?.length > 0) {
      queryParams['category_id'] = this.selectedDivisions().join(',');
    }

    if (this.selectedSurveyor()) {
      queryParams['surveyor_id'] = this.selectedSurveyor();
    }

    if (this.dateRange()) {
      queryParams['start_date'] = this.dateRange()?.from;
      queryParams['end_date'] = this.dateRange()?.to;
    }

    this.router.navigate(['/reports/filter-results'], { queryParams });
  }
}
