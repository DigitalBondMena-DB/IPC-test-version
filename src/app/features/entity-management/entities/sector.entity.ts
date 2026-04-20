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

  override readonly columns = [
    { field: 'name', header: 'Name', sortable: true },
    { field: 'authority', header: 'Authority', sortable: true, type: 'text' },
    { field: 'governorates_choice', header: 'Governorate', sortable: true, type: 'text' },
    { field: 'updated_at', header: 'Last Update', sortable: true, type: 'date' },
    { field: 'updated_by', header: 'Updated By', sortable: true },
    { field: 'is_active', header: 'Actions', type: 'toggle', customClass: 'justify-end' },
  ];

  override getFormFields(isEdit?: boolean): any[] {
    return [
      {
        key: 'name',
        label: 'Sector Name',
        type: 'text',
        placeholder: 'Enter sector name',
        validators: [Validators.required],
        colSpan: 'col-span-full',
      },
      {
        key: 'authority_ids',
        label: 'Authority Name',
        type: 'select',
        placeholder: 'Select authority name...',
        validators: [Validators.required],
        roles: ['super_admin'],
        colSpan: 'col-span-1',
        filter: true,
        virtualScroll: true,
        dataPath: API_CONFIG.ENDPOINTS.AUTHORITIES,
        include: 'authorities',
        hasSelectAll: true,
        selectAllKey: 'all_authorities',
        isDisabledWhenEdit: true,
      },
      {
        key: 'governorate_ids',
        label: 'Governorate',
        type: 'multiselect',
        placeholder: 'Select Governorate...',
        validators: [Validators.required],
        colSpan: 'col-span-1',
        filter: true,
        virtualScroll: true,
        dataPath: API_CONFIG.ENDPOINTS.GOVERNORATES,
        include: 'governorates',
        hasSelectAll: true,
        selectAllKey: 'all_governorates',
        isDisabledWhenEdit: true,
        dependsOn: 'authority_ids',
      },
    ];
  }
}
