import { API_CONFIG } from '@/core/config/api.config';
import { IFormField } from '@shared/models/form-field.model';
import { Validators } from '@angular/forms';

/**
 * Returns a standardized list of form fields for Authority, Sector, Governorate, Division, and Facility.
 * These fields come pre-configured with dataPath and dependsOn for reactive loading.
 */
export const getCommonRelationalFields = (overrides: Partial<IFormField> = {}): IFormField[] => [
  {
    key: COMMON_FIELD_KEYS.AUTHORITY,
    label: 'Authority Name',
    type: 'multiselect',
    placeholder: 'Select Authority...',
    validators: [Validators.required],
    colSpan: 'col-span-1',
    filter: true,
    virtualScroll: true,
    dataPath: API_CONFIG.ENDPOINTS.AUTHORITIES,
    hasSelectAll: true,
    selectAllKey: 'all_authorities',
    ...overrides,
  },
  {
    key: COMMON_FIELD_KEYS.SECTOR,
    label: 'Sector',
    type: 'multiselect',
    placeholder: 'Select Sector...',
    validators: [Validators.required],
    colSpan: 'col-span-1',
    filter: true,
    virtualScroll: true,
    dependsOn: COMMON_FIELD_KEYS.AUTHORITY,
    dataPath: API_CONFIG.ENDPOINTS.SECTORS,
    hasSelectAll: true,
    selectAllKey: 'all_sectors',
    ...overrides,
  },
  {
    key: COMMON_FIELD_KEYS.GOVERNORATE,
    label: 'Governorate',
    type: 'multiselect',
    placeholder: 'Select Governorate...',
    validators: [Validators.required],
    colSpan: 'col-span-1',
    filter: true,
    virtualScroll: true,
    dependsOn: COMMON_FIELD_KEYS.SECTOR,
    dataPath: API_CONFIG.ENDPOINTS.GOVERNORATES,
    hasSelectAll: true,
    selectAllKey: 'all_governorates',
    ...overrides,
  },
  {
    key: COMMON_FIELD_KEYS.DIVISION,
    label: 'Division Name',
    type: 'multiselect',
    placeholder: 'Select Divisions...',
    validators: [Validators.required],
    colSpan: 'col-span-1',
    filter: true,
    virtualScroll: true,
    dependsOn: COMMON_FIELD_KEYS.AUTHORITY,
    dataPath: API_CONFIG.ENDPOINTS.DIVISIONS,
    hasSelectAll: true,
    selectAllKey: 'all_divisions',
    ...overrides,
  },
  {
    key: COMMON_FIELD_KEYS.FACILITY,
    label: 'Facility Name',
    type: 'multiselect',
    placeholder: 'Select Facilities...',
    validators: [Validators.required],
    colSpan: 'col-span-1',
    filter: true,
    virtualScroll: true,
    dependsOn: COMMON_FIELD_KEYS.GOVERNORATE,
    dataPath: API_CONFIG.ENDPOINTS.FACILITIES,
    hasSelectAll: true,
    selectAllKey: 'all_facilities',
    ...overrides,
  },
];

export const COMMON_FIELD_KEYS = {
  AUTHORITY: 'authority_ids',
  SECTOR: 'sector_ids',
  GOVERNORATE: 'governorate_ids',
  DIVISION: 'division_ids',
  FACILITY: 'facility_ids',
};
