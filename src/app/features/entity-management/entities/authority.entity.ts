import { Injectable } from '@angular/core';
import { Validators } from '@angular/forms';
import { BaseEntity } from '../base/base-entity';
import { API_CONFIG } from '@/core/config/api.config';

@Injectable()
export class AuthorityEntity extends BaseEntity {
  override readonly title = 'Authorities';
  override readonly entityLabel = 'Authority';
  override readonly endpoint = API_CONFIG.ENDPOINTS.AUTHORITIES;
  override readonly navPath = '/dashboard/authorities';
  override readonly entity_type = 'AUTHORITY';

  override readonly dependencies = [];

  override readonly columns = [
    { field: 'name', header: 'Name', sortable: true },
    { field: 'updated_at', header: 'Last Update', sortable: true, type: 'date' },
    { field: 'updated_by', header: 'Updated By', sortable: true },
    { field: 'is_active', header: 'Actions', type: 'toggle', customClass: 'justify-end' },
  ];

  override getFormFields(_deps: any): any[] {
    return [
      {
        key: 'name',
        label: 'Authority Name',
        type: 'text',
        placeholder: 'Enter authority name',
        validators: [Validators.required],
        colSpan: 'col-span-full',
      },
      {
        key: 'image',
        label: 'Authority Logo',
        type: 'image',
        colSpan: 'col-span-full',
      },
    ];
  }
}
