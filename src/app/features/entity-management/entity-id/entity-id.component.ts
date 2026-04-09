import {
  Component,
  ChangeDetectionStrategy,
  computed,
  inject,
  signal,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BPageHeaderComponent } from '@shared/components/b-page-header/b-page-header.component';
import { BFormBuilderComponent } from '@shared/components/b-form-builder/b-form-builder.component';
import { EntityManagementService } from '../services/entity-management.service';
import { MessageService } from 'primeng/api';
import { BaseEntity } from '../base/base-entity';

@Component({
  selector: 'app-entity-id',
  standalone: true,
  imports: [CommonModule, BPageHeaderComponent, BFormBuilderComponent],
  templateUrl: './entity-id.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntityIdComponent {
  private readonly _Service = inject(EntityManagementService);
  private readonly _MessageService = inject(MessageService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly config = inject(BaseEntity);

  readonly id = signal<string | null>(this.route.snapshot.paramMap.get('id'));
  readonly isEdit = computed(() => !!this.id());

  readonly title = computed(
    () => `${this.isEdit() ? 'Edit ' : 'Create '} ${this.config.entityLabel}`,
  );
  readonly submitLabel = computed(() => `${this.isEdit() ? 'Save Changes ' : 'Create '}`);

  readonly formValues = signal<Record<string, any>>({});

  // Entity data for editing
  entityResource = this._Service.getEntityById(
    () => this.config.endpoint,
    () => this.config.entity_type,
    () => this.id(),
  );

  entityData = computed(() => {
    const data = this.entityResource?.value();
    if (!data) return {};
    const transformed = this.config.transformResponse(data);
    setTimeout(() => {
      this.formValues.set({ ...transformed });
    });
    return transformed;
  });

  isLoading = computed(() => (this.entityResource ? this.entityResource.isLoading() : false));

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
    const state: any = {};
    const fields = this.config.getFormFields(this.isEdit());

    fields
      .filter((f: any) => f.dataPath)
      .forEach((field: any) => {
        const searchTerm = signal('');
        const page = signal(1);

        const endpoint = computed(() => {
          const values = this.formValues();
          let path = field.dataPath;

          if (field.dependsOn) {
            const parentId = values[field.dependsOn];
            if (!parentId || (Array.isArray(parentId) && parentId.length === 0)) return null;
          }

          return path;
        });

        const params = computed(() => {
          const p: any = {
            page: page(),
            per_page: 15,
            search: searchTerm(),
          };

          if (field.dependsOn) {
            const parentValue = this.formValues()[field.dependsOn];
            if (parentValue) {
              let baseKey = field.dependsOn.endsWith('_ids')
                ? field.dependsOn.replace('_ids', '_id')
                : field.dependsOn;
              p[`${baseKey}[]`] = Array.isArray(parentValue) ? parentValue : [parentValue];
            }
          }
          return p;
        });

        const resource = this._Service.get<any>(endpoint, params);
        const accumulated = signal<any[]>([]);

        // Sync accumulated data
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

        state[field.key] = { searchTerm, page, accumulated, resource };
      });

    this.depsState.set(state);
  }

  fields = computed(() => {
    const s = this.depsState();
    const values = this.formValues();
    const rawFields = this.config.getFormFields(this.isEdit());

    return rawFields.map((field: any) => {
      let overrides: any = {};

      if (field.dataPath && s[field.key]) {
        const state = s[field.key];
        const filterdOptions = state.accumulated().filter((e: any) => e.is_active);
        const options = filterdOptions.map((i: any) => ({ 
          label: i.name || '', 
          value: i.id 
        }));
        const res = state.resource.value();
        if (res && state.page() < res.last_page) {
          options.push({ label: null, value: null });
        }

        overrides.options = options;
        overrides.loading = state.resource.isLoading();

        // Show message if no data returned for a selection
        const parentValue = field.dependsOn ? values[field.dependsOn] : null;
        const hasParentValue =
          parentValue && (!Array.isArray(parentValue) || parentValue.length > 0);

        if (
          !state.resource.isLoading() &&
          filterdOptions.length === 0 &&
          field.dependsOn &&
          hasParentValue
        ) {
          overrides.subLable = 'No data available for this selection';
          field.disabled = true;
        }
      }

      if (field.hasSelectAll && field.type === 'multiselect' && overrides.options) {
        overrides.options = [{ label: 'Select All', value: 'SELECT_ALL' }, ...overrides.options];
      }

      let isDisabled = (field.isDisabledWhenEdit && this.isEdit()) || !!field.disabled;

      if (field.dependsOn) {
        const parentValue = values[field.dependsOn];
        const hasParentValue =
          parentValue && (!Array.isArray(parentValue) || parentValue.length > 0);
        isDisabled = isDisabled || !hasParentValue;
      }

      return {
        ...field,
        ...overrides,
        disabled: isDisabled,
      };
    });
  });

  isSubmitting = signal(false);

  onValueChange(event: { key: string; value: any }) {
    const fields = this.config.getFormFields(this.isEdit());

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
    const payload = this.config.preparePayload(formData);

    const obs = this.isEdit()
      ? this._Service.updateEntity(
          this.config.endpoint,
          this.config.entity_type,
          this.id()!,
          payload,
        )
      : this._Service.createEntity(this.config.endpoint, this.config.entity_type, payload);

    obs.subscribe({
      next: () => {
        this._MessageService.add({ summary: 'Success', detail: 'Saved successfully' });
        this.router.navigate([this.config.navPath]);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this._MessageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.error?.message || 'Failed to save',
        });
      },
    });
  }

  onCancel(): void {
    this.router.navigate([this.config.navPath]);
  }
}
