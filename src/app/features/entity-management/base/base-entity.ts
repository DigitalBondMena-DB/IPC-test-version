import { FormCascadeUtil } from '@shared/utils/form-cascade.util';

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
    const fields = this.getFormFields(true);
    let transformed = FormCascadeUtil.transformResponse(data, fields);

    this.applyParentIdsDefaultFallback(transformed, data);
    
    return transformed;
  }

  // Prepares the payload before submitting to the API
  preparePayload(formData: any): any {
    const fields = this.getFormFields(true);
    let payload = FormCascadeUtil.preparePayload(formData, fields);

    // Handle image fields: only send if it's a new file (File/Blob)
    fields.forEach((field: any) => {
      if (field.type === 'image') {
        const value = payload[field.key];
        if (!(value instanceof File || value instanceof Blob)) {
          delete payload[field.key];
        }
      }
    });

    // Standard parent_id fallback (deepest first)
    if (formData.health_division_id) {
      payload.parent_id = formData.health_division_id;
    } else if (formData.health_directorate_id) {
      payload.parent_id = formData.health_directorate_id;
    }

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
