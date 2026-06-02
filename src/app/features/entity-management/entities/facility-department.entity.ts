import { Injectable } from '@angular/core';
import { BaseEntity } from '../base/base-entity';
import { IFormField } from '@shared/models/form-field.model';
import { API_CONFIG } from '@/core/config/api.config';

@Injectable()
export class FacilityDepartmentEntity extends BaseEntity {
  override readonly title = 'Facility Departments';
  override readonly entityLabel = 'Facility Department';
  override readonly endpoint = API_CONFIG.ENDPOINTS.FACILITY_DEPARTMENTS;
  override readonly navPath = '/dashboard/facility-departments';

  override readonly columns = [
    { field: 'name', header: 'Name', sortable: true },
    { field: 'updated_at', header: 'Last Update', sortable: true, type: 'date' },
    { field: 'updated_by', header: 'Updated By', sortable: true },
    { field: 'is_active', header: 'Actions', type: 'toggle', customClass: 'justify-end' },
  ];

  override getFormFields(isEdit?: boolean): IFormField[] {
    // We don't return fields here because FacilityDepartmentFormComponent handles the dynamic form
    return [];
  }
}
