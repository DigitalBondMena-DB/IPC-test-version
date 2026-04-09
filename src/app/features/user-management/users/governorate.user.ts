import { Injectable } from '@angular/core';
import { IFormField } from '@shared/models/form-field.model';
import { Validators } from '@angular/forms';
import { BaseUser } from '../base/base-user';
import { API_CONFIG } from '@/core/config/api.config';

@Injectable()
export class GovernorateUser extends BaseUser {
  override readonly title = 'Governorate Users';
  override readonly endpoint = API_CONFIG.ENDPOINTS.USERS.BASE;
  override readonly userType = API_CONFIG.ENDPOINTS.USERS.TYPE.GOVERNORATES;
  override readonly entityLabel = 'User';
  override readonly navPath = '/dashboard/governorates-users';
  override readonly columns = [
    { field: 'name', header: 'Name', sortable: true },
    { field: 'email', header: 'Email', sortable: true },
    { field: 'phone_number', header: 'Phone Number', sortable: true },
    { field: 'directorate', header: 'Directorate', sortable: true },
    { field: 'categories', header: 'Division', sortable: true },
    { field: 'updated_at', header: 'Last Update', sortable: true, type: 'date' },
    { field: 'updated_by', header: 'Updated By', sortable: true },
    { field: 'is_active', header: 'Actions', type: 'toggle', customClass: 'justify-end' },
  ];
  override readonly entityEndpoint = API_CONFIG.ENDPOINTS.ENTITIES.BASE;
  override readonly entityType = API_CONFIG.ENDPOINTS.ENTITIES.TYPE.GOVERNORATES;
  override getRoleFields(isEdit?: boolean): IFormField[] {
    return [
      {
        key: 'health_directorate_id',
        label: 'Governorate',
        type: 'multiselect',
        placeholder: 'Select Governorate',
        validators: [],
        colSpan: 'col-span-1',
        filter: true,
        virtualScroll: true,
        dataPath: API_CONFIG.ENDPOINTS.ENTITIES.BASE + '?type=' + API_CONFIG.ENDPOINTS.ENTITIES.TYPE.GOVERNORATES,
      },
      {
        key: 'category_ids',
        label: 'Division',
        type: 'multiselect',
        placeholder: 'Select Divisions',
        validators: [],
        colSpan: 'col-span-1',
        filter: true,
        virtualScroll: true,
        dataPath: API_CONFIG.ENDPOINTS.DIVISIONS,
      },
      {
        key: 'authority_id',
        label: 'Authority',
        type: 'select',
        placeholder: 'Select Authority',
        validators: [Validators.required],
        colSpan: 'col-span-1',
        roles: ['super_admin'],
        filter: true,
        virtualScroll: true,
        dataPath: API_CONFIG.ENDPOINTS.ENTITIES.BASE + '?type=' + API_CONFIG.ENDPOINTS.ENTITIES.TYPE.AUTHORITY,
      },
    ];
  }
}
