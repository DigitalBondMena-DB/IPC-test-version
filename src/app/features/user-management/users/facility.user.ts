import { Injectable } from '@angular/core';
import { IFormField } from '@shared/models/form-field.model';
import { Validators } from '@angular/forms';
import { BaseUser } from '../base/base-user';
import { API_CONFIG } from '@/core/config/api.config';

@Injectable()
export class FacilityUser extends BaseUser {
  override readonly title = "Authority's Hospital Users";
  override readonly endpoint = API_CONFIG.ENDPOINTS.USERS.BASE;
  override readonly userType = API_CONFIG.ENDPOINTS.USERS.TYPE.FACILITIES;
  override readonly entityLabel = 'User';
  override readonly navPath = '/dashboard/facilities-users';
  override readonly columns = [
    { field: 'name', header: 'Username', sortable: true },
    { field: 'email', header: 'Email', sortable: true },
    { field: 'phone_number', header: 'Phone', sortable: true },
    { field: 'authority', header: 'Authority', sortable: true },
    { field: 'hospital', header: 'Hospital', sortable: true },
    { field: 'categories', header: 'Division', sortable: true },
    { field: 'updated_at', header: 'Last Update', sortable: true, type: 'date' },
    { field: 'updated_by', header: 'Updated By', sortable: true },
    { field: 'is_active', header: 'Actions', type: 'toggle', customClass: 'justify-end' },
  ];
  override readonly entityEndpoint = API_CONFIG.ENDPOINTS.ENTITIES.BASE;
  override readonly entityType = API_CONFIG.ENDPOINTS.ENTITIES.TYPE.FACILITIES;
  override readonly dependencies = ['authorities', 'hospitals', 'generalDivisions'];

  override getRoleFields(deps: any, _isEdit: boolean): IFormField[] {
    return [
      {
        key: 'hospital_id',
        label: 'Sector',
        type: 'select',
        placeholder: 'Select Sector',
        options: deps.hospitals || [],
        validators: [Validators.required],
        colSpan: 'col-span-1',
        filter: true,
        virtualScroll: true,
        loading: deps.isHospitalsLoading,
        dependsOn: 'authority_id',
      },
      {
        key: 'authority_id',
        label: 'Authority',
        type: 'select',
        placeholder: 'Select Authority',
        options: deps.authorities || [],
        validators: [Validators.required],
        colSpan: 'col-span-1',
        roles: ['super_admin'],
        filter: true,
        virtualScroll: true,
        loading: deps.isAuthoritiesLoading,
      },
      {
        key: 'health_directorate_id',
        label: 'Governorate',
        type: 'multiselect',
        placeholder: 'Select Governorate',
        options: deps.generalDivisions || [],
        validators: [],
        colSpan: 'col-span-1',
        filter: true,
        virtualScroll: true,
        loading: deps.isGeneralDivisionsLoading,
      },
      {
        key: 'category_ids',
        label: 'Division',
        type: 'multiselect',
        placeholder: 'Select Divisions...',
        options: deps.generalDivisions || [],
        validators: [],
        colSpan: 'col-span-1',
        filter: true,
        virtualScroll: true,
        loading: deps.isGeneralDivisionsLoading,
      },
      {
        key: 'has_all_entity_surveys',
        label: 'Supervisor',
        type: 'checkbox',
        colSpan: 'col-span-1',
      },
    ];
  }
}
