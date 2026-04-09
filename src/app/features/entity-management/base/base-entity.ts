export abstract class BaseEntity {
  abstract readonly title: string;
  abstract readonly entityLabel: string;
  abstract readonly endpoint: string;
  abstract readonly navPath: string;
  abstract readonly columns: any[];
  readonly entity_type?: string;
  readonly parent_type?: string;
  readonly dependencies: string[] = [];

  abstract getFormFields(deps: any): any[];

  // Data transformation hooks
  transformResponse(data: any): any {
    if (!data) return {};
    const transformed = { ...data };

    // Standard relational arrays mappings
    if (data.categories && Array.isArray(data.categories)) {
      transformed.category_ids = data.categories.map((c: any) => c.id);
    }
    if (data.authorities && Array.isArray(data.authorities)) {
      transformed.authority_ids = data.authorities.map((a: any) => a.id);
    } else if (data.authority_id) {
      transformed.authority_ids = [data.authority_id];
    } else if (data.authority && data.authority.id) {
      transformed.authority_ids = [data.authority.id];
    }

    if (data.governorates && Array.isArray(data.governorates)) {
      transformed.governorate_ids = data.governorates.map((g: any) => g.id);
    } else if (data.governorate_id) {
      transformed.governorate_ids = [data.governorate_id];
    }

    this.applyParentIdsDefaultFallback(transformed, data);

    return transformed;
  }

  // Prepares the payload before submitting to the API
  preparePayload(formData: any): any {
    const payload = { ...formData };

    // Standard parent_id fallback (deepest first)
    if (formData.health_division_id) {
      payload.parent_id = formData.health_division_id;
    } else if (formData.health_directorate_id) {
      payload.parent_id = formData.health_directorate_id;
    }

    if (payload.category_ids && !Array.isArray(payload.category_ids)) {
      payload.category_ids = [payload.category_ids];
    }

    if (payload.authority_ids && !Array.isArray(payload.authority_ids)) {
      payload.authority_ids = [payload.authority_ids];
    }

    if (payload.governorate_ids && !Array.isArray(payload.governorate_ids)) {
      payload.governorate_ids = [payload.governorate_ids];
    }

    // Default "Select All" logic handling
    const rawFields = this.getFormFields({});
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

  // Maps dependency endpoint config to expected internal UI keys
  getDependencyConfig(dep: string): { key: string } {
    const mapping: Record<string, any> = {
      directorates: { key: 'health_directorate_id' },
      healthDivisions: { key: 'health_division_id' },
      generalDivisions: { key: 'category_ids' },
      authorities: { key: 'authority_ids' },
      governorates: { key: 'governorate_ids' },
    };
    return mapping[dep] || { key: dep };
  }

  // Translates internal UI keys back to config keys
  getConfigKeyFromProp(prop: string): string {
    const mapping: Record<string, string> = {
      health_directorate_id: 'directorates',
      health_division_id: 'healthDivisions',
      category_ids: 'generalDivisions',
      authority_ids: 'authorities',
      governorate_ids: 'governorates',
    };
    return mapping[prop] || prop;
  }

  // Legacy hardcoded mappings maintained for compatibility with implicit unconfigured entities like 'HOSPITAL'
  protected applyParentIdsDefaultFallback(transformed: any, data: any): void {
    const type = (data?.type || this.entity_type)?.toUpperCase();
    const parentType = (data?.parent?.type || this.entity_type)?.toUpperCase();

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
