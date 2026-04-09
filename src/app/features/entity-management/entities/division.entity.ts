import { Injectable } from '@angular/core';
import { Validators } from '@angular/forms';
import { BaseEntity } from '../base/base-entity';
import { IFormField } from '@shared/models/form-field.model';
import { API_CONFIG } from '@/core/config/api.config';

@Injectable()
export class DivisionEntity extends BaseEntity {
  override readonly title = 'Divisions';
  override readonly entityLabel = 'Division';
  override readonly endpoint = API_CONFIG.ENDPOINTS.DIVISIONS;
  override readonly navPath = '/dashboard/divisions';

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
        label: 'Division Name',
        type: 'text',
        placeholder: 'Enter division name...',
        validators: [Validators.required],
        colSpan: 'col-span-1',
      },
      {
        key: 'authority_ids',
        label: 'Authority Name',
        type: 'multiselect',
        placeholder: 'Select authority name...',
        validators: [Validators.required],
        roles: ['super_admin'],
        colSpan: 'col-span-1',
        filter: true,
        virtualScroll: true,
        dataPath: API_CONFIG.ENDPOINTS.AUTHORITIES,
        hasSelectAll: true,
        selectAllKey: 'all_authorities',
        isDisabledWhenEdit: true,
      },
    ];
  }
}
