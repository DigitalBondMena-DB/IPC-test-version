import { Injectable } from '@angular/core';
import { Validators } from '@angular/forms';
import { BaseEntity } from '../base/base-entity';
import { IFormField } from '@shared/models/form-field.model';
import { API_CONFIG } from '@/core/config/api.config';

@Injectable()
export class FacilityEntity extends BaseEntity {
  override readonly title = 'Facilities';
  override readonly entityLabel = 'Facility';
  override readonly endpoint = API_CONFIG.ENDPOINTS.FACILITIES;
  override readonly navPath = '/dashboard/facilities';

  override readonly columns = [
    { field: 'name', header: 'Name', sortable: true },
    { field: 'divisions', header: 'Division', sortable: true, type: 'text' },
    { field: 'authority', header: 'Authority', sortable: true, type: 'text' },
    { field: 'sector_choice', header: 'Sector', sortable: true, type: 'text' },
    { field: 'governorate_choice', header: 'Governorate', sortable: true, type: 'text' },
    { field: 'updated_at', header: 'Last Update', sortable: true, type: 'date' },
    { field: 'updated_by', header: 'Updated By', sortable: true },
    { field: 'is_active', header: 'Actions', type: 'toggle', customClass: 'justify-end' },
  ];

  override getFormFields(): IFormField[] {
    return [
      {
        key: 'name',
        label: 'Facility Name',
        type: 'text',
        placeholder: 'Enter Facility Name...',
        validators: [Validators.required],
        colSpan: 'col-span-1',
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
        isDisabledWhenEdit: true,
      },
      {
        key: 'division_ids',
        label: 'Division Name',
        type: 'multiselect',
        placeholder: 'Select division name...',
        validators: [Validators.required],
        colSpan: 'col-span-1',
        filter: true,
        virtualScroll: true,
        dataPath: API_CONFIG.ENDPOINTS.DIVISIONS,
        include: 'divisions',
        hasSelectAll: true,
        selectAllKey: 'all_divisions',
        dependsOn: 'authority_ids',
      },
      {
        key: 'sector_ids',
        label: 'Sector',
        type: 'multiselect',
        placeholder: 'Select Sector',
        validators: [Validators.required],
        colSpan: 'col-span-1',
        isDisabledWhenEdit: true,
        filter: true,
        virtualScroll: true,
        dataPath: API_CONFIG.ENDPOINTS.SECTORS,
        include: 'sectors',
        hasSelectAll: true,
        selectAllKey: 'all_sectors',
        dependsOn: 'authority_ids',
      },
      {
        key: 'governorate_ids',
        label: 'Governorate',
        type: 'multiselect',
        placeholder: 'Select Governorate',
        validators: [Validators.required],
        colSpan: 'col-span-1',
        filter: true,
        virtualScroll: true,
        hasSelectAll: true,
        selectAllKey: 'all_governorates',
        dataPath: API_CONFIG.ENDPOINTS.GOVERNORATES,
        include: 'governorates',
        dependsOn: 'sector_ids',
      },
    ];
  }
}
