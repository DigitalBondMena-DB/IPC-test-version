import { Injectable } from '@angular/core';
import { Validators } from '@angular/forms';
import { BaseEntity } from '../base/base-entity';
import { IFormField } from '@shared/models/form-field.model';
import { API_CONFIG } from '@/core/config/api.config';

@Injectable()
export class DepartmentEntity extends BaseEntity {
  override readonly title = 'Main Departments';
  override readonly entityLabel = 'Main Department';
  override readonly endpoint = API_CONFIG.ENDPOINTS.DEPARTMENTS;
  override readonly navPath = '/dashboard/departments';

  override readonly columns = [
    { field: 'name', header: 'Name', sortable: true },
    { field: 'updated_at', header: 'Last Update', sortable: true, type: 'date' },
    { field: 'updated_by', header: 'Updated By', sortable: true },
    { field: 'is_active', header: 'Actions', type: 'toggle', customClass: 'justify-end' },
  ];

  override getFormFields(isEdit?: boolean): IFormField[] {
    return [
      {
        key: 'name',
        label: 'Main Department Name',
        type: 'text',
        placeholder: 'Enter main department name...',
        validators: [Validators.required],
        colSpan: 'col-span-1',
      },
    ];
  }
}
