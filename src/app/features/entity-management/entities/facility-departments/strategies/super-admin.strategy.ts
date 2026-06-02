import { FormGroup } from '@angular/forms';
import { IFormField } from '@shared/models/form-field.model';
import { FacilityDepartmentFormStrategy } from './facility-department.strategy';
import { Validators } from '@angular/forms';
import { API_CONFIG } from '@/core/config/api.config';

export class SuperAdminFormStrategy implements FacilityDepartmentFormStrategy {
  getFields(): IFormField[] {
    return [
      {
        key: 'sector_id',
        label: 'Sector',
        type: 'select',
        placeholder: 'Select sector',
        validators: [Validators.required],
        filter: true,
        colSpan: 'col-span-1',
        options: [],
      },
      {
        key: 'governorate_id',
        label: 'Governorate',
        type: 'select',
        placeholder: 'Select governorate',
        validators: [Validators.required],
        filter: true,
        dataPath: 'governorates',
        dependsOn: 'sector_id',
        disabled: true,
        colSpan: 'col-span-1',
      },
      {
        key: 'entity_id',
        label: 'Facility',
        type: 'select',
        placeholder: 'Select facility',
        validators: [Validators.required],
        filter: true,
        dataPath: 'facilities',
        dependsOn: 'governorate_id',
        disabled: true,
        colSpan: 'col-span-1',
      },
      {
        key: 'main_department_id',
        label: 'Main Department',
        type: 'select',
        placeholder: 'Select main department',
        validators: [Validators.required],
        filter: true,
        colSpan: 'col-span-1',
        options: [],
      },
      {
        key: 'name',
        label: 'Department Name',
        type: 'text', 
        placeholder: 'Search or type name',
        validators: [Validators.required],
        disabled: true, // Disabled until main_department_id is selected
        colSpan: 'col-span-1',
        options: [],
      },
    ];
  }

  handleValueChange(
    key: string,
    value: any,
    form: FormGroup,
    updateFieldsCallback: (fields: IFormField[]) => void,
    currentFields: IFormField[],
    httpService: any
  ): void {
    const updatedFields = [...currentFields];

    if (key === 'sector_id') {
      this.updateFieldState(updatedFields, 'governorate_id', !value);
      if (!value) {
        form.get('governorate_id')?.setValue(null);
      }
    } else if (key === 'governorate_id') {
      this.updateFieldState(updatedFields, 'entity_id', !value);
      if (!value) {
        form.get('entity_id')?.setValue(null);
      }
    } else if (key === 'main_department_id') {
      this.updateFieldState(updatedFields, 'name', !value);
      if (!value) {
        form.get('name')?.setValue(null);
        this.updateFieldOptions(updatedFields, 'name', []);
      }
    } else if (key === 'name' && value) {
      const mainDepartmentId = form.get('main_department_id')?.value;
      if (mainDepartmentId) {
        // Fetch autocomplete suggestions for the datalist
        httpService.http.get(API_CONFIG.BASE_URL + `facility-departments/search?q=${value}&main_department_id=${mainDepartmentId}`)
          .subscribe((res: any) => {
            const suggestions = Array.isArray(res) ? res : res.data || [];
            const options = suggestions.map((item: any) => ({
              label: item.name,
              value: item.name,
            }));

            this.updateFieldOptions(updatedFields, 'name', options);
            updateFieldsCallback([...updatedFields]);
          });
      }
    }

    updateFieldsCallback(updatedFields);
  }

  handleSearch(
    key: string,
    searchTerm: string,
    form: FormGroup,
    updateFieldsCallback: (fields: IFormField[]) => void,
    currentFields: IFormField[],
    httpService: any
  ): void {
    // Left intentionally empty as name now uses onValueChange for the datalist
  }

  private updateFieldState(fields: IFormField[], key: string, disabled: boolean): void {
    const field = fields.find((f) => f.key === key);
    if (field) {
      field.disabled = disabled;
    }
  }

  private updateFieldOptions(fields: IFormField[], key: string, options: any[]): void {
    const field = fields.find((f) => f.key === key);
    if (field) {
      field.options = options;
    }
  }
}
