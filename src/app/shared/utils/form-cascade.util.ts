import { IFormField } from '@shared/models/form-field.model';

export class FormCascadeUtil {
  private static readonly KEY_MAPPINGS: Record<string, string> = {
    categories: 'category_ids',
    authorities: 'authority_ids',
    governorates: 'governorate_ids',
    sectors: 'sector_ids',
    divisions: 'division_ids',
    facilities: 'facility_ids',
  };

  /**
   * Transforms an API response object into a structure suitable for the reactive form.
   * Handles relational arrays mapping to ID arrays and Select All flags mapping to ['SELECT_ALL'].
   */
  static transformResponse(data: any, fields: IFormField[]): any {
    if (!data) return {};
    const transformed = { ...data };

    // 1. Dynamic relational mapping based on KEY_MAPPINGS
    Object.entries(this.KEY_MAPPINGS).forEach(([apiPath, formKey]) => {
      const apiData = data[apiPath];
      if (apiData && Array.isArray(apiData)) {
        const ids = apiData.map((item: any) => item.id);
        const field = fields.find((f) => f.key === formKey);

        if (field?.type === 'select') {
          transformed[formKey] = ids.length > 0 ? ids[0] : null;
        } else {
          transformed[formKey] = ids;
        }
      }
    });

    // 2. Handle specific flat ID properties fallback if array mapping didn't find data
    const fallbackIds = [
      { idKey: 'authority_id', formKey: 'authority_ids' },
      { idKey: 'governorate_id', formKey: 'governorate_ids' },
      { idKey: 'sector_id', formKey: 'sector_ids' },
      { idKey: 'division_id', formKey: 'division_ids' },
      { idKey: 'hospital_id', formKey: 'hospital_id' },
    ];

    fallbackIds.forEach(({ idKey, formKey }) => {
      if (!transformed[formKey] && data[idKey]) {
        const field = fields.find((f) => f.key === formKey);
        transformed[formKey] = field?.type === 'select' ? data[idKey] : [data[idKey]];
      }
    });

    // 3. Standardize "Select All" handling
    fields.forEach((field) => {
      if (field.hasSelectAll && field.selectAllKey && data[field.selectAllKey] === true) {
        transformed[field.key] = ['SELECT_ALL'];
      }
    });

    return transformed;
  }

  /**
   * Prepares a form data object for submission to the API.
   * Handles SELECT_ALL mapping to all_ flags and formats arrays/singles based on field config.
   */
  static preparePayload(formData: any, fields: IFormField[]): any {
    const payload = { ...formData };

    fields.forEach((field) => {
      if ((field.type === 'select' || field.type === 'multiselect') && payload[field.key] !== undefined) {
        let value = payload[field.key];
        const sendAs = field.sendAs || 'array';

        // 1. Handle "Select All" logic
        if (field.hasSelectAll && field.selectAllKey && Array.isArray(value)) {
          if (value.includes('SELECT_ALL')) {
            delete payload[field.key];
            payload[field.selectAllKey] = true;
            return; // Skip further formatting for this field
          }
        }

        // 2. Standardize array/single formatting
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

    return payload;
  }
}
