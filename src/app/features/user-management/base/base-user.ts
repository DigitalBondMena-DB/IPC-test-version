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
  abstract readonly dependencies: string[];
  readonly entityType?: string;

  // Each specific user type provides its own role-specific inputs
  abstract getRoleFields(deps: any, isEdit: boolean): IFormField[];

  // Combines common top/bottom inputs with role-specific inputs
  getFormFields(deps: any, isEdit: boolean): IFormField[] {
    const fields = [
      ...this.getHigherInputs(),
      ...this.getRoleFields(deps, isEdit),
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

  // Maps dependency string references to precise API parameters
  getDependencyConfig(dep: string): { key: string; endpoint: string; type?: string } {
    const mapping: Record<string, any> = {
      directorates: {
        key: 'health_directorate_id',
        endpoint: API_CONFIG.ENDPOINTS.ENTITIES.BASE,
        type: API_CONFIG.ENDPOINTS.ENTITIES.TYPE.GOVERNORATES,
      },
      healthDivisions: {
        key: 'health_division_id',
        endpoint: API_CONFIG.ENDPOINTS.ENTITIES.BASE,
        type: API_CONFIG.ENDPOINTS.ENTITIES.TYPE.SECTORS,
      },
      hospitals: {
        key: 'hospital_id',
        endpoint: API_CONFIG.ENDPOINTS.ENTITIES.BASE,
        type: API_CONFIG.ENDPOINTS.ENTITIES.TYPE.HOSPITAL,
      },
      authorities: {
        key: 'authority_id',
        endpoint: API_CONFIG.ENDPOINTS.ENTITIES.BASE,
        type: API_CONFIG.ENDPOINTS.ENTITIES.TYPE.AUTHORITY,
      },
      generalDivisions: {
        key: 'category_ids',
        endpoint: API_CONFIG.ENDPOINTS.DIVISIONS,
      },
    };
    return mapping[dep];
  }

  // Maps backend UI keys back to config strings
  getConfigKeyFromProp(prop: string): string {
    const mapping: Record<string, string> = {
      health_directorate_id: 'directorates',
      health_division_id: 'healthDivisions',
      hospital_id: 'hospitals',
      authority_id: 'authorities',
      category_ids: 'generalDivisions',
    };
    return mapping[prop] || prop;
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

    if (formData.category_ids) {
      payload.category_ids = Array.isArray(formData.category_ids)
        ? formData.category_ids
        : [formData.category_ids];
    }

    if (payload.category_ids && !Array.isArray(payload.category_ids)) {
      payload.category_ids = [payload.category_ids];
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

    Object.keys(payload).forEach((key) => {
      const value = payload[key];
      if (value === null || value === undefined || value === '') {
        delete payload[key];
      }
    });

    return payload;
  }
}
