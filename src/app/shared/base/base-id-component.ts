import { inject, signal, computed, effect, Signal, WritableSignal } from '@angular/core';
import { IFormField } from '@shared/models/form-field.model';
import { HttpResourceRef } from '@angular/common/http';
import { AuthService } from '@/core/services/auth.service';

export interface IBaseDataService {
  get<T>(
    endpoint: string | (() => string | undefined) | undefined,
    params?: Signal<any>
  ): HttpResourceRef<T | undefined>;
}

import { DropdownCascadeService } from '@shared/services/dropdown-cascade.service';

export abstract class BaseIdComponent {
  protected readonly _AuthService = inject(AuthService);
  protected readonly _CascadeService = inject(DropdownCascadeService);

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
        includeKey: string;
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

    const userRole = this._AuthService.role();
    fields
      .filter((f) => f.dataPath)
      .forEach((field) => {
        // Skip API initialization for fields the user cannot see
        if (field.roles && field.roles.length > 0 && !field.roles.includes(userRole)) {
          return;
        }

        const searchTerm = signal('');
        const page = signal(1);

        // Check if the parent field is hidden from this user by roles
        const parentFieldDef = field.dependsOn ? fields.find((f) => f.key === field.dependsOn) : null;
        const isParentHidden = parentFieldDef?.roles && parentFieldDef.roles.length > 0 && !parentFieldDef.roles.includes(userRole);

        // Isolated dependency signal for the parent field
        const parentValue = computed(
          () => {
            if (!field.dependsOn) return undefined;
            // If the parent field is hidden by roles, the backend handles scoping via auth token
            if (isParentHidden) return '__IMPLICIT__';
            const values = this.formValues();
            return values[field.dependsOn];
          },
          { equal: (a, b) => JSON.stringify(a) === JSON.stringify(b) },
        );

        const endpoint = computed(
          () => {
            if (field.dependsOn) {
              const val = parentValue();
              const hasParentValue = val && (!Array.isArray(val) || val.length > 0);
              if (!hasParentValue) return undefined;
            }
            // All dependency fields must resolve to the uniform cascade endpoint
            return field.include || field.dataPath ? 'entities/cascade' : undefined;
          },
          { equal: (a, b) => a === b },
        );

        const params = computed(
          () => {
            const includeKey = field.include || (field.dataPath ? field.dataPath.split('/').pop() : '');
            
            const p: any = {
              per_page: 15,
              include: includeKey
            };

            if (includeKey) {
              p[`${includeKey}_page`] = page();
              p[`${includeKey}_search`] = searchTerm();
            }

            // Recursive Ancestor Traversal: Include all ancestors in the chain (Parent, Grandparent, etc.)
            let currentFieldDef: IFormField | undefined = field;
            const values = this.formValues();

            while (currentFieldDef?.dependsOn) {
              const parentKey: string = currentFieldDef.dependsOn;
              const parentFieldDef: IFormField | undefined = fields.find((f) => f.key === parentKey);
              if (!parentFieldDef) break;

              // Check if the parent field is hidden from this user by roles
              const isParentHidden = parentFieldDef?.roles && parentFieldDef.roles.length > 0 && !parentFieldDef.roles.includes(userRole);

              if (!isParentHidden) {
                const val = values[parentKey];
                if (val !== undefined && val !== null && val !== '') {
                  const isSelectAll = Array.isArray(val)
                    ? val.includes('SELECT_ALL')
                    : val === 'SELECT_ALL';

                  if (isSelectAll) {
                    if (parentFieldDef.selectAllKey) {
                      p[parentFieldDef.selectAllKey] = true;
                    }
                  } else {
                    p[`${parentKey}[]`] = Array.isArray(val) ? val : [val];
                  }
                }
              }
              currentFieldDef = parentFieldDef;
            }
            return p;
          },
          { equal: (a, b) => JSON.stringify(a) === JSON.stringify(b) },
        );

        const resource = this._CascadeService.get<any>(endpoint, params);
        const accumulated = signal<any[]>([]);

        // Sync accumulated data for virtual scrolling
        effect(() => {
          if (resource.isLoading()) return;
          const res = resource.value() as any;
          const includeKey = field.include || (field.dataPath ? field.dataPath.split('/').pop() : '');
          const entityData = includeKey && res ? res[includeKey] : null;

          if (entityData?.data) {
            if (page() === 1) accumulated.set(entityData.data);
            else accumulated.update((prev) => [...prev, ...entityData.data]);
          } else if (!res && !resource.isLoading()) {
            accumulated.set([]);
          }
        });

        const includeKey = field.include || (field.dataPath ? field.dataPath.split('/').pop() : '');
        state[field.key] = { searchTerm, page, accumulated, resource, includeKey: includeKey || '' };
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

        const res = state.resource.value() as any;
        const includeKey = field.include || (field.dataPath ? field.dataPath.split('/').pop() : '');
        const entityData = includeKey && res ? res[includeKey] : null;

        if (entityData && state.page() < entityData.last_page) {
          options.push({ label: null, value: null }); // Virtual scroll trigger
        }

        overrides.options = options;
        overrides.loading = state.resource.isLoading();

        // No data handling
        const parentValue = field.dependsOn ? values[field.dependsOn] : null;
        const hasParentValue = parentValue && (!Array.isArray(parentValue) || parentValue.length > 0);
        const isSearching = !!state.searchTerm();

        if (!state.resource.isLoading() && filteredOptions.length === 0 && field.dependsOn && hasParentValue && !isSearching) {
          overrides.subLable = 'No data available for this selection';
        }

        if (field.hasSelectAll && field.type === 'multiselect' && overrides.options) {
          overrides.options = [{ label: 'Select All', value: 'SELECT_ALL' }, ...overrides.options];
        }
      }

      // Disabled state logic (edit mode or parent dependency)
      let isDisabled = (field.isDisabledWhenEdit && isEdit) || !!field.disabled;
      if (field.dependsOn) {
        // Check if the parent field is hidden by roles — if so, skip parent-based disabling
        const userRole = this._AuthService.role();
        const parentFieldDef = rawFields.find((f) => f.key === field.dependsOn);
        const isParentHidden = parentFieldDef?.roles && parentFieldDef.roles.length > 0 && !parentFieldDef.roles.includes(userRole);

        if (!isParentHidden) {
          const parentValue = values[field.dependsOn];
          const hasParentValue = parentValue && (!Array.isArray(parentValue) || parentValue.length > 0);
          
          // Disable if parent is not selected OR if loading finished and no items were found (while NOT searching)
          const noDataFound = s[field.key] && 
                             !s[field.key].resource.isLoading() && 
                             s[field.key].accumulated().filter((e: any) => e.is_active !== false).length === 0 && 
                             !s[field.key].searchTerm();
          
          isDisabled = isDisabled || !hasParentValue || noDataFound;
        }
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
      // Identity check first to avoid any notification if nothing changed
      if (prev[event.key] === event.value) return prev;

      const newValues = { ...prev, [event.key]: event.value };
      clearDependents(event.key, newValues);
      return newValues;
    });

    const resetState = (key: string) => {
      const state = this.depsState();
      Object.entries(state).forEach(([k, s]) => {
        const fieldDef = rawFields.find((f) => f.key === k);
        if (fieldDef?.dependsOn === key) {
          // Reset child state only if necessary
          if (s.page() !== 1) s.page.set(1);
          if (s.searchTerm() !== '') s.searchTerm.set('');
          if (s.accumulated().length > 0) s.accumulated.set([]);
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

    const res = state.resource.value() as any;
    if (!res) return;

    const includeKey = state.includeKey;
    const entityData = includeKey && res ? res[includeKey] : null;

    const lastVisible = event.event.last;
    const currentCount = state.accumulated().length;

    if (entityData && lastVisible >= currentCount - 1 && state.page() < entityData.last_page) {
      state.page.update((p: number) => p + 1);
    }
  }
}
