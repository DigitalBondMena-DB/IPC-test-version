export abstract class BaseEntity {
  abstract readonly title: string;
  abstract readonly entityLabel: string;
  abstract readonly endpoint: string;
  abstract readonly navPath: string;
  abstract readonly columns: any[];
  readonly entity_type?: string;
  readonly parent_type?: string;
  abstract getFormFields(isEdit?: boolean): any[];

  // Data transformation hooks
  transformResponse(data: any): any {
    if (!data) return {};
    const transformed = { ...data };

    // Dynamic relational mapping based on available form fields
    const fields = this.getFormFields(true);
    const mappings: Record<string, string> = {
      categories: 'category_ids',
      authorities: 'authority_ids',
      governorates: 'governorate_ids',
      sectors: 'sector_ids',
      divisions: 'division_ids',
    };

    Object.entries(mappings).forEach(([apiPath, formKey]) => {
      const apiData = data[apiPath];
      if (apiData && Array.isArray(apiData)) {
        const ids = apiData.map((item: any) => item.id);
        const field = fields.find((f: any) => f.key === formKey);

        if (field?.type === 'select') {
          transformed[formKey] = ids.length > 0 ? ids[0] : null;
        } else {
          transformed[formKey] = ids;
        }
      }
    });

    // Fallback for single ID properties if array mapping didn't find data
    if (!transformed.authority_ids) {
      const authId = data.authority_id || data.authority?.id;
      if (authId) {
        const field = fields.find((f: any) => f.key === 'authority_ids');
        transformed.authority_ids = field?.type === 'select' ? authId : [authId];
      }
    }

    if (!transformed.governorate_ids && data.governorate_id) {
      const field = fields.find((f: any) => f.key === 'governorate_ids');
      transformed.governorate_ids = field?.type === 'select' ? data.governorate_id : [data.governorate_id];
    }

    this.applyParentIdsDefaultFallback(transformed, data);

    return transformed;
  }

  // Prepares the payload before submitting to the API
  preparePayload(formData: any): any {
    const payload = { ...formData };

    const fields = this.getFormFields(true);

    // Standardize all select/multiselect as arrays
    fields.forEach((field: any) => {
      if ((field.type === 'select' || field.type === 'multiselect') && payload[field.key] !== undefined) {
        const value = payload[field.key];
        if (value !== null && value !== '' && !Array.isArray(value)) {
          payload[field.key] = [value];
        }
      }
    });

    // Standard parent_id fallback (deepest first)
    if (formData.health_division_id) {
      payload.parent_id = formData.health_division_id;
    } else if (formData.health_directorate_id) {
      payload.parent_id = formData.health_directorate_id;
    }

    // Default "Select All" logic handling
    const rawFields = this.getFormFields();
    rawFields.forEach((field: any) => {
      if (field.hasSelectAll && field.selectAllKey && Array.isArray(payload[field.key])) {
        if (payload[field.key].includes('SELECT_ALL')) {
          delete payload[field.key];
          payload[field.selectAllKey] = true;
        }
      }
    });

    // Cleanup standard UI-only fields
    const entityKeys = ['health_division_id', 'health_directorate_id', 'division_id'];
    entityKeys.forEach((key) => delete payload[key]);

    return payload;
  }

  // Legacy hardcoded mappings maintained for compatibility with implicit unconfigured entities like 'HOSPITAL'
  protected applyParentIdsDefaultFallback(transformed: any, data: any): void {
    const type = String(data?.type || this.entity_type || '').toUpperCase();
    const parentType = String(data?.parent?.type || this.entity_type || '').toUpperCase();

    if (type === 'HOSPITAL' && parentType === 'AUTHORITY') {
      transformed.authority_ids = Array.isArray(data.parent_id)
        ? data.parent_id
        : data.parent_id
          ? [data.parent_id]
          : [];
    } else if (type === 'HOSPITAL') {
      transformed.health_division_id = data.parent_id;
      if (data.parent) {
        transformed.health_directorate_id = data.parent.parent_id;
      }
    } else if (type === 'MEDICAL_AREA' || type === 'SECTORS') {
      transformed.health_directorate_id = data.parent_id;
    }
  }
}
