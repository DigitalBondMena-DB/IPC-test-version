import { Injectable } from '@angular/core';
import { IFormField } from '@shared/models/form-field.model';
import { Validators } from '@angular/forms';
import { BaseUser } from '../base/base-user';
import { API_CONFIG } from '@/core/config/api.config';

@Injectable()
export class SectorUser extends BaseUser {
  override readonly title = 'Sector Users';
  override readonly endpoint = API_CONFIG.ENDPOINTS.USERS.BASE;
  override readonly userType = API_CONFIG.ENDPOINTS.USERS.TYPE.SECTORS;
  override readonly entityLabel = 'User';
  override readonly navPath = '/dashboard/sectors-users';
  override readonly columns = [
    { field: 'name', header: 'Name', sortable: true },
    { field: 'email', header: 'Email', sortable: true },
    { field: 'phone_number', header: 'Phone Number', sortable: true },
    { field: 'directorate', header: 'Directorate', sortable: true },
    { field: 'division', header: 'Health Division', sortable: true },
    { field: 'categories', header: 'Division', sortable: true },
    { field: 'updated_at', header: 'Last Update', sortable: true, type: 'date' },
    { field: 'updated_by', header: 'Updated By', sortable: true },
    { field: 'is_active', header: 'Actions', type: 'toggle', customClass: 'justify-end' },
  ];
  override readonly entityEndpoint = API_CONFIG.ENDPOINTS.ENTITIES.BASE;
  override readonly entityType = API_CONFIG.ENDPOINTS.ENTITIES.TYPE.SECTORS;
  override readonly dependencies = ['directorates', 'healthDivisions', 'generalDivisions'];

  override getRoleFields(deps: any, _isEdit: boolean): IFormField[] {
    return [
      {
        key: 'category_ids',
        label: 'Division',
        type: 'multiselect',
        placeholder: 'Select Divisions',
        options: deps.generalDivisions || [],
        validators: [],
        colSpan: 'col-span-1',
        filter: true,
        virtualScroll: true,
        loading: deps.isGeneralDivisionsLoading,
      },
      {
        key: 'health_directorate_id',
        label: 'Health Directorate',
        type: 'select',
        placeholder: 'Select Health Directorate',
        options: deps.directorates || [],
        validators: [Validators.required],
        colSpan: 'col-span-1',
        filter: true,
        virtualScroll: true,
        loading: deps.isDirectoratesLoading,
      },
      {
        key: 'health_division_id',
        label: 'Division Name',
        type: 'select',
        placeholder: 'Select Division',
        options: deps.healthDivisions || [],
        validators: [Validators.required],
        colSpan: 'col-span-1',
        filter: true,
        virtualScroll: true,
        loading: deps.isHealthDivisionsLoading,
        dependsOn: 'health_directorate_id',
      },
    ];
  }
}
