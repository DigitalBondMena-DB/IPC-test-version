import { Injectable } from '@angular/core';
import { Validators } from '@angular/forms';
import { BaseEntity } from '../base/base-entity';
import { API_CONFIG } from '@/core/config/api.config';

@Injectable()
export class SectorEntity extends BaseEntity {
  override readonly title = 'Sectors';
  override readonly entityLabel = 'Sector';
  override readonly endpoint = API_CONFIG.ENDPOINTS.SECTORS;
  override readonly navPath = '/dashboard/sectors';
  override readonly entity_type = 'SECTORS';

  override readonly dependencies = ['authorities', 'governorates'];

  override readonly columns = [
    { field: 'name', header: 'Name', sortable: true },
    { field: 'governorates', header: 'Governorate', sortable: true, type: 'text' },
    { field: 'updated_at', header: 'Last Update', sortable: true, type: 'date' },
    { field: 'updated_by', header: 'Updated By', sortable: true },
    { field: 'is_active', header: 'Actions', type: 'toggle', customClass: 'justify-end' },
  ];

  override getFormFields(deps: any): any[] {
    return [
      {
        key: 'name',
        label: 'Sector Name',
        type: 'text',
        placeholder: 'Enter sector name...',
        validators: [Validators.required],
        colSpan: 'col-span-1',
      },
      {
        key: 'governorate_ids',
        label: 'Governorate',
        type: 'multiselect',
        placeholder: 'Select Governorate...',
        options: deps.governorates || [],
        validators: [Validators.required],
        colSpan: 'col-span-1',
        filter: true,
        virtualScroll: true,
        loading: deps.isGovernoratesLoading,
        dataPath: API_CONFIG.ENDPOINTS.GOVERNORATES,
        hasSelectAll: true,
        selectAllKey: 'all_governorates',
        isDisabledWhenEdit: true,
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
        selectAllKey: 'all_authorities',
        isDisabledWhenEdit: true,
      },
    ];
  }
}
