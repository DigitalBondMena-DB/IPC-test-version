import {
  Component,
  ChangeDetectionStrategy,
  inject,
  computed,
  signal,
  effect,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BPageHeaderComponent } from '@shared/components/b-page-header/b-page-header.component';
import { BFormBuilderComponent } from '@shared/components/b-form-builder/b-form-builder.component';
import { UserManagementService } from '../services/user-management.service';
import { getUserFormConfig } from '../config/user-form.config';
import { USER_TYPE_CONFIG } from '../config/user-type.config';
import { MessageService } from 'primeng/api';
import { passwordMatchValidator } from '@shared/validators/password-match.validator';
import { API_CONFIG } from '@/core/config/api.config';

@Component({
  selector: 'app-user-id',
  standalone: true,
  imports: [CommonModule, BPageHeaderComponent, BFormBuilderComponent],
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
            [fields]="fields()"
            [initialData]="userData()"
            [submitLabel]="submitLabel()"
            [loading]="isSubmitting()"
            [groupValidators]="groupValidators"
            (formSubmit)="onSubmit($event)"
            (formCancel)="onCancel()"
            (onSearch)="onDropdownSearch($event)"
            (onScrollPagination)="onDropdownScroll($event)"
            (onValueChange)="onValueChange($event)"
          />
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserIdComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly _Service = inject(UserManagementService);
  private readonly _MessageService = inject(MessageService);

  readonly type = signal<string>(this.route.snapshot.data['type']);
  readonly config = computed(() => USER_TYPE_CONFIG[this.type()]);

  id = signal<string | null>(this.route.snapshot.paramMap.get('id'));
  isEdit = computed(() => !!this.id());
  title = computed(() => `${this.isEdit() ? 'Edit' : 'Create'} ${this.config().entityLabel}`);
  submitLabel = computed(() => `${this.isEdit() ? 'Save Changes' : 'Create'}`);

  readonly formValues = signal<Record<string, any>>({});
  readonly groupValidators = [passwordMatchValidator()];

  // User data for editing
  userResource = this.isEdit()
    ? this._Service.getUserById(this.config().endpoint, this.config().userType, this.id()!)
    : null;
  userData = computed(() => {
    const data = this.userResource?.value() || {};
    const transformed = this.isEdit() ? this.transformUserData(data) : data;

    if (this.isEdit()) {
      // Sync formValues with initial user data to trigger cascading dependencies
      setTimeout(() => this.formValues.set({ ...transformed }));
    }
    return transformed;
  });
  isLoading = computed(() => this.userResource?.isLoading() || false);

  private transformUserData(data: any): any {
    if (!data) return {};
    const transformed = { ...data };
    const type = this.config().userType;
    if (type === API_CONFIG.ENDPOINTS.USERS.TYPE.HOSPITAL) {
      transformed.health_directorate_id = data.entity.parent.parent_id;
      transformed.health_division_id = data.entity.parent_id;
      transformed.hospital_id = data.entity_id;
    } else if (type === API_CONFIG.ENDPOINTS.USERS.TYPE.FACILITIES) {
      transformed.hospital_id = data.entity_id;
      transformed.authority_id = data.entity.parent_id;
    } else if (type === API_CONFIG.ENDPOINTS.USERS.TYPE.SECTORS) {
      transformed.health_division_id = data.entity_id;
      transformed.health_directorate_id = data.entity.parent_id;
    } else if (type === API_CONFIG.ENDPOINTS.USERS.TYPE.GOVERNORATES) {
      transformed.health_directorate_id = data.entity_id;
    } else if (type === API_CONFIG.ENDPOINTS.USERS.TYPE.AUTHORITY) {
      transformed.authority_id = data.entity_id;
    } else if (type === API_CONFIG.ENDPOINTS.USERS.TYPE.SUPER_ADMIN) {
      if (data.categories && Array.isArray(data.categories) && data.categories.length > 0) {
        transformed.category_ids = data.categories.map((c: any) => c.id);
      }
    }

    if (data.categories && Array.isArray(data.categories)) {
      transformed.category_ids = data.categories.map((c: any) => c.id);
    }

    return transformed;
  }

  // Relational data management
  private depsState = signal<
    Record<
      string,
      {
        searchTerm: any;
        page: any;
        accumulated: any;
        resource: any;
      }
    >
  >({});

  constructor() {
    this.initDependencies();
  }

  private initDependencies(): void {
    const deps = this.config().dependencies || [];
    const state: any = {};

    deps.forEach((dep: string) => {
      const depConfig = this.getDepConfig(dep);

      const searchTerm = signal('');
      const page = signal(1);

      const params = computed(() => {
        const values = this.formValues();
        const userType = this.config().userType;
        const fieldsConfig = getUserFormConfig(userType, {}, this.isEdit());
        const fieldDef = fieldsConfig.find((f: any) => f.key === depConfig.key);

        let entityId = null;
        if (fieldDef?.dependsOn) {
          entityId = values[fieldDef.dependsOn];
          if (!entityId) return null;
        }

        return {
          page: page(),
          per_page: 15,
          search: searchTerm(),
          ...(depConfig.type ? { type: depConfig.type } : {}),
          ...(entityId ? { parent_id: entityId } : {}),
        };
      });

      const resource = this._Service.get<any>(depConfig.endpoint, params);
      const accumulated = signal<any[]>([]);

      effect(() => {
        if (resource.isLoading()) return;
        const res = resource.value();
        if (res?.data) {
          if (page() === 1) accumulated.set(res.data);
          else accumulated.update((prev) => [...prev, ...res.data]);
        } else if (!res && !resource.isLoading()) {
          accumulated.set([]);
        }
      });

      state[depConfig.key] = { searchTerm, page, accumulated, resource };
    });

    this.depsState.set(state);
  }

  private getDepConfig(dep: string): { key: string; endpoint: string; type?: string } {
    const mapping: Record<string, any> = {
      directorates: {
        key: 'health_directorate_id',
        endpoint: API_CONFIG.ENDPOINTS.ENTITIES.BASE,
        type: API_CONFIG.ENDPOINTS.ENTITIES.TYPE.GOVERNORATES,
      },
      healthDivisions: {
        key: 'health_division_id',
        endpoint: API_CONFIG.ENDPOINTS.ENTITIES.BASE,
        type: API_CONFIG.ENDPOINTS.ENTITIES.TYPE.SECTORS,
      },
      hospitals: {
        key: 'hospital_id',
        endpoint: API_CONFIG.ENDPOINTS.ENTITIES.BASE,
        type: API_CONFIG.ENDPOINTS.ENTITIES.TYPE.HOSPITAL,
      },
      authorities: {
        key: 'authority_id',
        endpoint: API_CONFIG.ENDPOINTS.ENTITIES.BASE,
        type: API_CONFIG.ENDPOINTS.ENTITIES.TYPE.AUTHORITY,
      },
      generalDivisions: {
        key: 'category_ids',
        endpoint: API_CONFIG.ENDPOINTS.CATEGORIES,
      },
    };
    return mapping[dep];
  }

  fields = computed(() => {
    const s = this.depsState();
    const depsObj: any = {};
    const userType = this.config().userType;

    Object.keys(s).forEach((key) => {
      const state = s[key];
      const filterdOptions = state.accumulated().filter((e: any) => e.is_active);
      const options = filterdOptions.map((i: any) => ({ label: i.name, value: i.id }));

      const res = state.resource.value();
      if (res && state.page() < res.last_page) {
        options.push({ label: null, value: null });
      }

      const configKey = this.getConfigKeyFromProp(key);

      depsObj[configKey] = options;
      depsObj[`is${configKey?.charAt(0)?.toUpperCase() + configKey.slice(1)}Loading`] =
        state.resource.isLoading();
    });

    const values = this.formValues();

    const rawFields = getUserFormConfig(userType, depsObj, this.isEdit());

    return rawFields.map((field: any) => {
      if (field.dependsOn) {
        const parentValue = values[field.dependsOn];
        return {
          ...field,
          disabled: !parentValue,
        };
      }
      return field;
    });
  });

  private getConfigKeyFromProp(prop: string): string {
    const mapping: Record<string, string> = {
      health_directorate_id: 'directorates',
      health_division_id: 'healthDivisions',
      hospital_id: 'hospitals',
      authority_id: 'authorities',
      category_ids: 'generalDivisions',
    };
    return mapping[prop] || prop;
  }

  isSubmitting = signal(false);

  onValueChange(event: { key: string; value: any }) {
    const userType = this.config().userType;
    const fields = getUserFormConfig(userType, {}, this.isEdit());

    const clearDependents = (key: string, valuesObj: any) => {
      fields.forEach((f: any) => {
        if (f.dependsOn === key) {
          valuesObj[f.key] = null;
          clearDependents(f.key, valuesObj);
        }
      });
    };

    this.formValues.update((prev) => {
      if (prev[event.key] === event.value) return prev;
      const newValues = { ...prev, [event.key]: event.value };
      clearDependents(event.key, newValues);
      return newValues;
    });

    const resetState = (key: string) => {
      const state = this.depsState();
      Object.keys(state).forEach((k) => {
        const fieldDef = fields.find((f: any) => f.key === k);

        if (fieldDef?.dependsOn === key) {
          state[k].page.set(1);
          state[k].searchTerm.set('');
          state[k].accumulated.set([]);
          resetState(k);
        }
      });
    };

    resetState(event.key);
  }

  onDropdownSearch(event: { key: string; text: string }) {
    const state = this.depsState()[event.key];
    if (state) {
      state.searchTerm.set(event.text);
      state.page.set(1);
    }
  }

  onDropdownScroll(event: { key: string; event: any }) {
    const state = this.depsState()[event.key];
    if (!state || state.resource.isLoading()) return;

    const res = state.resource.value();
    const lastVisible = event.event.last;
    const currentCount = state.accumulated().length;

    if (res && lastVisible >= currentCount - 1 && state.page() < res.last_page) {
      state.page.update((p: number) => p + 1);
    }
  }

  onSubmit(formData: any): void {
    this.isSubmitting.set(true);
    const id = this.id();
    const endpoint = this.config().endpoint;
    const userType = this.config().userType;

    const payload = this.preparePayload(formData);

    const obs = id
      ? this._Service.updateUser(endpoint, userType, id, payload)
      : this._Service.createUser(endpoint, userType, payload);

    obs.subscribe({
      next: () => {
        this._MessageService.add({
          summary: 'Success',
          detail: `User ${id ? 'updated' : 'created'} successfully`,
        });
        this.router.navigate([this.config().navPath]);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this._MessageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.error?.message || `Failed to ${id ? 'update' : 'create'} user`,
        });
      },
    });
  }

  private preparePayload(formData: any): any {
    const payload = { ...formData };

    if (formData.hospital_id) {
      payload.entity_id = formData.hospital_id;
    } else if (formData.health_division_id) {
      payload.entity_id = formData.health_division_id;
    } else if (formData.health_directorate_id) {
      payload.entity_id = formData.health_directorate_id;
    } else if (formData.authority_id) {
      payload.entity_id = formData.authority_id;
    }
    if (formData.category_ids) {
      payload.category_ids = Array.isArray(formData.category_ids)
        ? formData.category_ids
        : [formData.category_ids];
    }

    if (payload.category_ids && !Array.isArray(payload.category_ids)) {
      payload.category_ids = [payload.category_ids];
    }

    const entityKeys = [
      'hospital_id',
      'health_division_id',
      'health_directorate_id',
      'authority_id',
    ];

    entityKeys.forEach((key) => {
      delete payload[key];
    });
    Object.keys(payload).forEach((key) => {
      const value = payload[key];

      if (value === null || value === undefined || value === '') {
        delete payload[key];
      }
    });
    return payload;
  }

  onCancel(): void {
    this.router.navigate([this.config().navPath]);
  }
}
