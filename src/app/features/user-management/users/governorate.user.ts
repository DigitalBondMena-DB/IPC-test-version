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
        hasSelectAll: true,
        selectAllKey: 'all_authorities',
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
        hasSelectAll: true,
        selectAllKey: 'all_divisions',
        dependsOn: 'authority_ids',
      },
      {
        key: 'governorate_ids',
        label: 'Governorate',
        type: 'select',
        placeholder: 'Select Governorate',
        validators: [Validators.required],
        colSpan: 'col-span-1',
        filter: true,
        virtualScroll: true,
        dataPath: API_CONFIG.ENDPOINTS.GOVERNORATES,
        dependsOn: 'authority_ids',
      },
    ];
  }
}
