import { IFormField } from '@shared/models/form-field.model';
import { Validators } from '@angular/forms';
import { API_CONFIG } from '@/core/config/api.config';

export abstract class BaseUser {
  abstract readonly title: string;
  abstract readonly endpoint: string;
  abstract readonly userType: string;
  abstract readonly entityLabel: string;
  abstract readonly columns: any[];
  abstract readonly entityEndpoint: string;
  abstract readonly navPath: string;
  readonly entityType?: string;

  // Each specific user type provides its own role-specific inputs
  abstract getRoleFields(isEdit?: boolean): IFormField[];

  // Combines common top/bottom inputs with role-specific inputs
  getFormFields(isEdit?: boolean): IFormField[] {
    const fields = [
      ...this.getHigherInputs(),
      ...this.getRoleFields(isEdit),
      ...this.getLowerInputs(),
    ];
    return fields;
  }

  protected getHigherInputs(): IFormField[] {
    return [
      {
        key: 'name',
        label: 'User Name',
        type: 'text',
        placeholder: 'Enter user name...',
        validators: [Validators.required],
        colSpan: 'col-span-1',
      },
      {
        key: 'email',
        label: 'Email',
        type: 'email',
        placeholder: 'Enter email address...',
        validators: [Validators.required, Validators.email],
        colSpan: 'col-span-1',
      },
      {
        key: 'phone_number',
        label: 'Phone Number',
        type: 'text',
        placeholder: 'Enter phone number...',
        validators: [Validators.required, Validators.pattern(/^[0-9]+$/)],
        colSpan: 'col-span-1',
      },
    ];
  }

  protected getLowerInputs(): IFormField[] {
    return [
      {
        key: 'password',
        label: 'Password',
        type: 'password',
        placeholder: '********',
        validators: [], // Validations are handled dynamically or left optional typically for edit
        colSpan: 'col-span-1',
      },
      {
        key: 'password_confirmation',
        label: 'Confirm Password',
        type: 'password',
        placeholder: '********',
        validators: [],
        colSpan: 'col-span-1',
      },
    ];
  }

  // Hook for reshaping data when loading for edit
  transformResponse(data: any): any {
    if (!data) return {};
    const transformed = { ...data };
    const type = this.userType;

    // Apply specific conversions based on what type this user instance represents natively
    if (type === API_CONFIG.ENDPOINTS.USERS.TYPE.HOSPITAL) {
      transformed.health_directorate_id = data.entity?.parent?.parent_id;
      transformed.health_division_id = data.entity?.parent_id;
      transformed.hospital_id = data.entity_id;
    } else if (type === API_CONFIG.ENDPOINTS.USERS.TYPE.FACILITIES) {
      transformed.hospital_id = data.entity_id;
      transformed.authority_id = data.entity?.parent_id;
    } else if (type === API_CONFIG.ENDPOINTS.USERS.TYPE.SECTORS) {
      transformed.health_division_id = data.entity_id;
      transformed.health_directorate_id = data.entity?.parent_id;
    } else if (type === API_CONFIG.ENDPOINTS.USERS.TYPE.GOVERNORATES) {
      transformed.health_directorate_id = data.entity_id;
    } else if (type === API_CONFIG.ENDPOINTS.USERS.TYPE.AUTHORITY) {
      transformed.authority_id = data.entity_id;
    } else if (type === API_CONFIG.ENDPOINTS.USERS.TYPE.SUPER_ADMIN) {
      if (data.categories && Array.isArray(data.categories) && data.categories.length > 0) {
        transformed.category_ids = data.categories.map((c: any) => c.id);
      }
    }

    // Standard array conversion
    if (data.categories && Array.isArray(data.categories)) {
      transformed.category_ids = data.categories.map((c: any) => c.id);
    }

    return transformed;
  }

  // Hook for reshaping payload before saving
  preparePayload(formData: any): any {
    const payload = { ...formData };
    const fields = this.getFormFields(true);

    // Handle formatting based on sendAs property
    fields.forEach((field: any) => {
      if ((field.type === 'select' || field.type === 'multiselect') && payload[field.key] !== undefined) {
        const value = payload[field.key];
        const sendAs = field.sendAs || 'array';

        if (sendAs === 'array') {
          if (value !== null && value !== '' && !Array.isArray(value)) {
            payload[field.key] = [value];
          }
        } else if (sendAs === 'single') {
          if (Array.isArray(value)) {
            payload[field.key] = value.length > 0 ? value[0] : null;
          }
        }
      }
    });

    // Common standard entity extraction for single assignment hierarchy
    if (formData.hospital_id) {
      payload.entity_id = formData.hospital_id;
    } else if (formData.health_division_id) {
      payload.entity_id = formData.health_division_id;
    } else if (formData.health_directorate_id) {
      payload.entity_id = formData.health_directorate_id;
    } else if (formData.authority_id) {
      payload.entity_id = formData.authority_id;
    }

    // Clean up temporary internal form UI state references
    const entityKeys = [
      'hospital_id',
      'health_division_id',
      'health_directorate_id',
      'authority_id',
    ];
    entityKeys.forEach((key) => {
      delete payload[key];
    });

    // Default "Select All" logic handling
    const rawFields = this.getFormFields(true);
    rawFields.forEach((field: any) => {
      if (field.hasSelectAll && field.selectAllKey && Array.isArray(payload[field.key])) {
        if (payload[field.key].includes('SELECT_ALL')) {
          delete payload[field.key];
          payload[field.selectAllKey] = true;
        }
      }
    });

    Object.keys(payload).forEach((key) => {
      const value = payload[key];
      if (value === null || value === undefined || value === '') {
        delete payload[key];
      }
    });

    return payload;
  }
}
