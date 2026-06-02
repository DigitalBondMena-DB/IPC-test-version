import { FormGroup } from '@angular/forms';
import { IFormField } from '@shared/models/form-field.model';
import { FacilityDepartmentFormStrategy } from './facility-department.strategy';
import { Validators } from '@angular/forms';
import { API_CONFIG } from '@/core/config/api.config';

export class FacilityUserFormStrategy implements FacilityDepartmentFormStrategy {
  getFields(): IFormField[] {
    return [
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

    if (key === 'main_department_id') {
      const nameField = updatedFields.find(f => f.key === 'name');
      if (nameField) {
        nameField.disabled = !value;
      }
      
      if (!value) {
        form.get('name')?.setValue(null);
        if (nameField) nameField.options = [];
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

  private updateFieldOptions(fields: IFormField[], key: string, options: any[]): void {
    const field = fields.find((f) => f.key === key);
    if (field) {
      field.options = options;
    }
  }
}
