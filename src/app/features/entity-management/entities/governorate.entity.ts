import { Injectable } from '@angular/core';
import { Validators } from '@angular/forms';
import { BaseEntity } from '../base/base-entity';
import { API_CONFIG } from '@/core/config/api.config';

@Injectable()
export class GovernorateEntity extends BaseEntity {
  override readonly title = 'Governorates';
  override readonly entityLabel = 'Governorate';
  override readonly endpoint = API_CONFIG.ENDPOINTS.GOVERNORATES;
  override readonly navPath = '/dashboard/governorates';
  override readonly entity_type = 'GOVERNORATES';

  override readonly dependencies = ['authorities'];

  override readonly columns = [
    { field: 'name', header: 'Name', sortable: true },
    { field: 'updated_at', header: 'Last Update', sortable: true, type: 'date' },
    { field: 'updated_by', header: 'Updated By', sortable: true },
    { field: 'is_active', header: 'Actions', type: 'toggle', customClass: 'justify-end' },
  ];

  override getFormFields(deps: any): any[] {
    return [
      {
        key: 'name',
        label: 'Governorate Name',
        type: 'text',
        placeholder: 'Enter Governorate name...',
        validators: [Validators.required],
        colSpan: 'col-span-1',
      },
      {
        key: 'authority_ids',
        label: 'Authority Name',
        type: 'multiselect',
        placeholder: 'Select authority name...',
        options: deps.authorities || [],
        validators: [Validators.required],
        roles: ['super_admin'],
        colSpan: 'col-span-1',
        filter: true,
        virtualScroll: true,
        loading: deps.isAuthoritiesLoading,
        dataPath: API_CONFIG.ENDPOINTS.AUTHORITIES,
        hasSelectAll: true,
        isDisabledWhenEdit: true,
        selectAllKey: 'all_authorities',
      },
    ];
  }
}
