import { Injectable } from '@angular/core';
import { Validators } from '@angular/forms';
import { BaseEntity } from '../base/base-entity';
import { API_CONFIG } from '@/core/config/api.config';

@Injectable()
export class FacilityEntity extends BaseEntity {
  override readonly title = 'Facilities';
  override readonly entityLabel = 'Facility';
  override readonly endpoint = API_CONFIG.ENDPOINTS.FACILITIES;
  override readonly navPath = '/dashboard/facilities';
  override readonly entity_type = 'FACILITIES';

  override readonly dependencies = ['authorities', 'generalDivisions', 'directorates'];

  override readonly columns = [
    { field: 'name', header: 'Name', sortable: true },
    { field: 'authority', header: 'Authority', sortable: true, type: 'text' },
    { field: 'categories', header: 'Division', sortable: true, type: 'text' },
    { field: 'updated_at', header: 'Last Update', sortable: true, type: 'date' },
    { field: 'updated_by', header: 'Updated By', sortable: true },
    { field: 'is_active', header: 'Actions', type: 'toggle', customClass: 'justify-end' },
  ];

  override getFormFields(deps: any): any[] {
    return [
      {
        key: 'name',
        label: 'Hospital Authority Name',
        type: 'text',
        placeholder: 'Enter hospital authority name...',
        validators: [Validators.required],
        colSpan: 'col-span-1',
      },
      {
        key: 'category_ids',
        label: 'Divison Name',
        type: 'multiselect',
        placeholder: 'Select Division name...',
        options: deps.generalDivisions || [],
        validators: [],
        colSpan: 'col-span-1',
        virtualScroll: true,
        filter: true,
        loading: deps.isGeneralDivisionsLoading,
        dataPath: API_CONFIG.ENDPOINTS.DIVISIONS,
      },
      {
        key: 'authority_ids',
        label: 'Authority',
        type: 'multiselect',
        placeholder: 'Select authority...',
        options: deps.authorities || [],
        validators: [Validators.required],
        colSpan: 'col-span-1',
        roles: ['super_admin'],
        filter: true,
        virtualScroll: true,
        loading: deps.isAuthoritiesLoading,
        dataPath: API_CONFIG.ENDPOINTS.AUTHORITIES,
        hasSelectAll: true,
        selectAllKey: 'all-authority',
      },
      {
        key: 'authority_id',
        label: 'Sector',
        type: 'multiselect',
        placeholder: 'Select Sector',
        options: deps.authorities || [],
        validators: [Validators.required],
        colSpan: 'col-span-1',
        filter: true,
        virtualScroll: true,
        loading: deps.isAuthoritiesLoading,
        dataPath: API_CONFIG.ENDPOINTS.SECTORS,
      },
      {
        key: 'health_directorate_id',
        label: 'Governorate',
        type: 'multiselect',
        placeholder: 'Select Governorate...',
        options: deps.directorates || [],
        validators: [Validators.required],
        colSpan: 'col-span-1',
        filter: true,
        virtualScroll: true,
        loading: deps.isDirectoratesLoading,
        dataPath: API_CONFIG.ENDPOINTS.GOVERNORATES,
      },
    ];
  }
}
