import { Injectable } from '@angular/core';
import { IFormField } from '@shared/models/form-field.model';
import { BaseUser } from '../base/base-user';
import { API_CONFIG } from '@/core/config/api.config';

@Injectable()
export class SuperAdminUser extends BaseUser {
  override readonly title = 'Super Admins';
  override readonly endpoint = API_CONFIG.ENDPOINTS.USERS.BASE;
  override readonly userType = API_CONFIG.ENDPOINTS.USERS.TYPE.SUPER_ADMIN;
  override readonly entityLabel = 'Super Admin';
  override readonly navPath = '/dashboard/super-admin-users';
  override readonly columns = [
    { field: 'name', header: 'Name', sortable: true },
    { field: 'email', header: 'Email', sortable: true },
    { field: 'phone_number', header: 'Phone number', sortable: true },
    { field: 'categories', header: 'Division', sortable: true },
    { field: 'updated_at', header: 'Last Update', sortable: true, type: 'date' },
    { field: 'updated_by', header: 'Updated By', sortable: true },
    { field: 'is_active', header: 'Actions', type: 'toggle', customClass: 'justify-end' },
  ];
  override readonly entityEndpoint = API_CONFIG.ENDPOINTS.DIVISIONS;
  override getRoleFields(isEdit?: boolean): IFormField[] {
    return [
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
    ];
  }
}
