import { inject, signal, computed, effect, Signal, WritableSignal } from '@angular/core';
import { IFormField } from '@shared/models/form-field.model';
import { HttpResourceRef } from '@angular/common/http';

export interface IBaseDataService {
  get<T>(
    endpoint: string | (() => string | undefined) | undefined,
    params?: Signal<any>
  ): HttpResourceRef<T | undefined>;
}

export abstract class BaseIdComponent {
  // Common signals used across all form-based management components
  readonly formValues = signal<Record<string, any>>({});
  readonly isSubmitting = signal(false);

  // Relational data management (shared state)
  protected depsState = signal<
    Record<
      string,
      {
        searchTerm: WritableSignal<string>;
        page: WritableSignal<number>;
        accumulated: WritableSignal<any[]>;
        resource: HttpResourceRef<any | undefined>;
      }
    >
  >({});

  /**
   * Initializes dependencies based on dataPath and dependsOn in the form fields.
   * @param fields The original field configuration.
   * @param service The service to fetch data from (must have a .get method).
   */
  protected initDependencies(fields: IFormField[], service: IBaseDataService): void {
    const state: any = {};

    fields
      .filter((f) => f.dataPath)
      .forEach((field) => {
        const searchTerm = signal('');
        const page = signal(1);

        const endpoint = computed(() => {
          const values = this.formValues();
          if (field.dependsOn) {
            const parentValue = values[field.dependsOn];
            const hasParentValue = parentValue && (!Array.isArray(parentValue) || parentValue.length > 0);
            if (!hasParentValue) return undefined;
          }
          return field.dataPath!;
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
              const isSelectAll = Array.isArray(parentValue)
                ? parentValue.includes('SELECT_ALL')
                : parentValue === 'SELECT_ALL';

              if (!isSelectAll) {
                const baseKey = field.dependsOn.endsWith('_ids')
                  ? field.dependsOn.replace('_ids', '_id')
                  : field.dependsOn;
                p[`${baseKey}[]`] = Array.isArray(parentValue) ? parentValue : [parentValue];
              }
            }
          }
          return p;
        });

        const resource = service.get<any>(endpoint, params);
        const accumulated = signal<any[]>([]);

        // Sync accumulated data for virtual scrolling
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

  /**
   * Computed signal that merges the raw field configuration with the dynamically loaded options.
   * @param rawFields The fields from the model configuration.
   * @param isEdit Whether the component is in edit mode.
   */
  protected getAugmentedFields(rawFields: IFormField[], isEdit: boolean): IFormField[] {
    const s = this.depsState();
    const values = this.formValues();

    return rawFields.map((field) => {
      let overrides: any = {};

      if (field.dataPath && s[field.key]) {
        const state = s[field.key];
        const filteredOptions = state.accumulated().filter((e: any) => e.is_active !== false);
        const options = filteredOptions.map((i: any) => ({
          label: i.name || '',
          value: i.id,
        }));

        const res = state.resource.value();
        if (res && state.page() < res.last_page) {
          options.push({ label: null, value: null }); // Virtual scroll trigger
        }

        overrides.options = options;
        overrides.loading = state.resource.isLoading();

        // No data handling
        const parentValue = field.dependsOn ? values[field.dependsOn] : null;
        const hasParentValue = parentValue && (!Array.isArray(parentValue) || parentValue.length > 0);

        if (!state.resource.isLoading() && filteredOptions.length === 0 && field.dependsOn && hasParentValue) {
          overrides.subLable = 'No data available for this selection';
        }

        if (field.hasSelectAll && field.type === 'multiselect' && overrides.options) {
          overrides.options = [{ label: 'Select All', value: 'SELECT_ALL' }, ...overrides.options];
        }
      }

      // Disabled state logic (edit mode or parent dependency)
      let isDisabled = (field.isDisabledWhenEdit && isEdit) || !!field.disabled;
      if (field.dependsOn) {
        const parentValue = values[field.dependsOn];
        const hasParentValue = parentValue && (!Array.isArray(parentValue) || parentValue.length > 0);
        isDisabled = isDisabled || !hasParentValue;
      }

      return {
        ...field,
        ...overrides,
        disabled: isDisabled,
      };
    });
  }

  // Common UI event handlers
  onValueChange(event: { key: string; value: any }, rawFields: IFormField[]) {
    const clearDependents = (key: string, valuesObj: any) => {
      rawFields.forEach((f) => {
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
        const fieldDef = rawFields.find((f) => f.key === k);
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
      state.page.update((p) => p + 1);
    }
  }
}
