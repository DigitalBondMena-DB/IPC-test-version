import { Injectable } from '@angular/core';
import { Validators } from '@angular/forms';
import { BaseEntity } from '../base/base-entity';
import { API_CONFIG } from '@/core/config/api.config';
import { IFormField } from '@shared/models/form-field.model';
import { fileTypeValidator, fileSizeValidator } from '@shared/validators/file.validator';

@Injectable()
export class AuthorityEntity extends BaseEntity {
  override readonly title = 'Authorities';
  override readonly entityLabel = 'Authority';
  override readonly endpoint = API_CONFIG.ENDPOINTS.AUTHORITIES;
  override readonly navPath = '/dashboard/authorities';

  override readonly columns = [
    { field: 'name', header: 'Name', sortable: true },
    { field: 'updated_at', header: 'Last Update', sortable: true, type: 'date' },
    { field: 'updated_by', header: 'Updated By', sortable: true },
    { field: 'is_active', header: 'Actions', type: 'toggle', customClass: 'justify-end' },
  ];

  override getFormFields(isEdit?: boolean): IFormField[] {
    return [
      {
        key: 'logo',
        label: 'Authority Logo',
        type: 'image',
        placeholder: 'Upload Authority Logo...',
        colSpan: 'col-span-full',
        validators: [
          fileTypeValidator(['jpeg', 'png', 'jpg', 'gif', 'svg']),
          fileSizeValidator(2 * 1024 * 1024),
        ],
      },
      {
        key: 'name',
        label: 'Authority Name',
        type: 'text',
        placeholder: 'Enter Authority Name...',
        validators: [Validators.required],
        colSpan: 'col-span-1',
      },
    ];
  }
}
