import { Component, ChangeDetectionStrategy, inject, signal, computed, ViewChild, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BPageHeaderComponent } from '@shared/components/b-page-header/b-page-header.component';
import { BFormBuilderComponent } from '@shared/components/b-form-builder/b-form-builder.component';
import { AuthService } from '@/core/services/auth.service';
import { HttpService } from '@/core/services/http.service';
import { MessageService } from 'primeng/api';
import { IFormField } from '@shared/models/form-field.model';
import { FacilityDepartmentFormStrategy } from '../strategies/facility-department.strategy';
import { SuperAdminFormStrategy } from '../strategies/super-admin.strategy';
import { FacilityUserFormStrategy } from '../strategies/facility-user.strategy';
import { EntityManagementService } from '../../../services/entity-management.service';
import { BaseIdComponent } from '@shared/base/base-id-component';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

@Component({
  selector: 'app-facility-department-form',
  standalone: true,
  imports: [CommonModule, BFormBuilderComponent, BPageHeaderComponent],
  template: `
    <app-b-page-header [title]="title()" [showCreateButton]="false" />

    <div class="px-layout-x pt-2.5">
      <div class="card p-8 bg-white rounded-2xl shadow-sm overflow-x-auto min-w-[600px]">
        @if (isLoading()) {
          <div class="flex justify-center py-20">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        } @else {
          <app-b-form-builder
            #formBuilder
            [fields]="fields()"
            [initialData]="initialData()"
            [loading]="isSubmitting()"
            [submitLabel]="submitLabel()"
            [groupValidators]="groupValidators"
            (onValueChange)="onValueChange($event)"
            (onSearch)="onSearch($event)"
            (onScrollPagination)="onDropdownScroll($event)"
            (formSubmit)="onSubmit($event)"
            (formCancel)="onCancel()"
          ></app-b-form-builder>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FacilityDepartmentFormComponent extends BaseIdComponent {
  private readonly _HttpService = inject(HttpService);
  private readonly _MessageService = inject(MessageService);

  private readonly _EntityService = inject(EntityManagementService);

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  @ViewChild('formBuilder') formBuilder!: BFormBuilderComponent;

  strategy!: FacilityDepartmentFormStrategy;
  
  readonly id = signal<string | null>(this.route.snapshot.paramMap.get('id'));
  readonly isEdit = computed(() => !!this.id());
  readonly title = computed(() => `${this.isEdit() ? 'Edit' : 'Create'} Facility Department`);
  readonly submitLabel = computed(() => `${this.isEdit() ? 'Save Changes' : 'Create'}`);
  
  entityResource = this._EntityService.getEntityById(
    () => 'facility-departments',
    () => undefined,
    () => this.id(),
  );

  readonly isLoading = computed(() => (this.entityResource ? this.entityResource.isLoading() : false));

  readonly departmentsResource = this._HttpService.get<any>('departments');
  readonly sectorsResource = this._HttpService.get<any>('sectors');

  readonly groupValidators: ValidatorFn[] = [(control: AbstractControl): ValidationErrors | null => {
    const mainDept = control.get('main_department_id')?.value;
    const name = control.get('name')?.value;
    const entityId = control.get('entity_id');
    
    // We only require entity_id if the control exists in the form (i.e. super_admin)
    if (entityId && !entityId.value) return { missingEntity: true };
    if (!mainDept || !name) return { missingFields: true };
    return null;
  }];

  rawFields = signal<IFormField[]>([]);
  fields = computed(() => this.getAugmentedFields(this.rawFields(), this.isEdit()));
  initialData = signal<any>({});

  constructor() {
    super();
    this.initializeStrategy();
    
    effect(() => {
      const data = this.entityResource?.value();
      if (data && Object.keys(data).length > 0) {
        this.initialData.set({ ...data });
        
        // Trigger strategy updates for loaded data
        if (this.formBuilder?.form) {
          Object.keys(data).forEach(key => {
            this.strategy.handleValueChange(
              key,
              data[key],
              this.formBuilder.form,
              (updatedFields) => this.rawFields.set(updatedFields),
              this.rawFields(),
              this._HttpService
            );
          });
        }
      }
    });

    // Populate standalone dropdowns (sectors and departments)
    effect(() => {
      const deptsRes = this.departmentsResource.value();
      const sectorsRes = this.sectorsResource.value();
      
      let needsUpdate = false;
      const currentFields = this.rawFields();
      
      const updatedFields = currentFields.map(f => {
        if (f.key === 'main_department_id' && deptsRes) {
          const depts = Array.isArray(deptsRes) ? deptsRes : (deptsRes.data || []);
          const options = depts.map((d: any) => ({ label: d.name, value: d.id }));
          if (JSON.stringify(f.options) !== JSON.stringify(options)) {
            needsUpdate = true;
            return { ...f, options, loading: this.departmentsResource.isLoading() };
          }
        }
        if (f.key === 'sector_id' && sectorsRes) {
          const sectors = Array.isArray(sectorsRes) ? sectorsRes : (sectorsRes.data || []);
          const options = sectors.map((s: any) => ({ label: s.name, value: s.id }));
          if (JSON.stringify(f.options) !== JSON.stringify(options)) {
            needsUpdate = true;
            return { ...f, options, loading: this.sectorsResource.isLoading() };
          }
        }
        return f;
      });

      if (needsUpdate) {
        this.rawFields.set(updatedFields);
      }
    }, { allowSignalWrites: true });
  }

  private initializeStrategy() {
    const role = this._AuthService.role();

    // Strategy Selection based on role
    if (role === 'super_admin') {
      this.strategy = new SuperAdminFormStrategy();
    } else if (role === 'facility') {
      this.strategy = new FacilityUserFormStrategy();
    } else {
      // Fallback strategy or throw error depending on requirements
      this.strategy = new FacilityUserFormStrategy(); 
    }

    this.rawFields.set(this.strategy.getFields());
    this.initDependencies(this.rawFields(), this._EntityService);
  }

  override onValueChange(event: { key: string; value: any }) {
    super.onValueChange(event, this.rawFields());

    if (this.formBuilder?.form) {
      this.strategy.handleValueChange(
        event.key,
        event.value,
        this.formBuilder.form,
        (updatedFields) => this.rawFields.set(updatedFields),
        this.rawFields(),
        this._HttpService
      );
    }
  }

  onSearch(event: { key: string; text: string }) {
    super.onDropdownSearch(event);

    if (this.formBuilder?.form) {
      this.strategy.handleSearch(
        event.key,
        event.text,
        this.formBuilder.form,
        (updatedFields) => this.rawFields.set(updatedFields),
        this.rawFields(),
        this._HttpService
      );
    }
  }

  onSubmit(formData: any) {
    this.isSubmitting.set(true);

    const payload = {
      main_department_id: formData.main_department_id,
      entity_id: formData.entity_id || null, // super_admin provides this, facility gets it implicitly on backend
      name: formData.name,
    };

    const obs = this.isEdit() 
      ? this._HttpService.put(`facility-departments/${this.id()}`, payload)
      : this._HttpService.post('facility-departments', payload);

    obs.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this._MessageService.add({ severity: 'success', summary: 'Success', detail: 'Facility department saved successfully.' });
        this.router.navigate(['/dashboard/facility-departments']);
      },
      error: () => {
        this.isSubmitting.set(false);
      }
    });
  }

  onCancel() {
    this.router.navigate(['/dashboard/facility-departments']);
  }
}
