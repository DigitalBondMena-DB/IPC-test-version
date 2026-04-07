import { IFormField } from '@shared/models/form-field.model';
import { Validators } from '@angular/forms';

export const getUserFormConfig = (
  userType: string,
  deps: any = {},
  isEdit: boolean = false,
): IFormField[] => {
  const higherInputs: IFormField[] = [
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
  const lowerInputs: IFormField[] = [
    {
      key: 'password',
      label: 'Password',
      type: 'password',
      placeholder: '********',
      validators: [],
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

  let roleFields: IFormField[] = [];

  switch (userType) {
    case 'ministry': // SUPER_ADMIN
      roleFields = [
        {
          key: 'category_ids',
          label: 'Division',
          type: 'multiselect',
          placeholder: 'Select Divisions',
          options: deps.generalDivisions || [],
          validators: [],
          colSpan: 'col-span-1',
          filter: true,
          virtualScroll: true,
          loading: deps.isGeneralDivisionsLoading,
        },
      ];
      break;

    case 'governorate':
      roleFields = [
        {
          key: 'health_directorate_id',
          label: 'Governorate',
          type: 'multiselect',
          placeholder: 'Select Governorate',
          options: deps.generalDivisions || [],
          validators: [],
          colSpan: 'col-span-1',
          filter: true,
          virtualScroll: true,
          loading: deps.isGeneralDivisionsLoading,
        },
        {
          key: 'category_ids',
          label: 'Division',
          type: 'multiselect',
          placeholder: 'Select Divisions',
          options: deps.generalDivisions || [],
          validators: [],
          colSpan: 'col-span-1',
          filter: true,
          virtualScroll: true,
          loading: deps.isGeneralDivisionsLoading,
        },
        {
          key: 'authority_id',
          label: 'Authority',
          type: 'select',
          placeholder: 'Select Authority',
          options: deps.authorities || [],
          validators: [Validators.required],
          colSpan: 'col-span-1',
          roles: ['ministry'],
          filter: true,
          virtualScroll: true,
          loading: deps.isAuthoritiesLoading,
        },
      ];
      break;

    case 'medical_area':
      roleFields = [
        {
          key: 'category_ids',
          label: 'Division',
          type: 'multiselect',
          placeholder: 'Select Divisions',
          options: deps.generalDivisions || [],
          validators: [],
          colSpan: 'col-span-1',
          filter: true,
          virtualScroll: true,
          loading: deps.isGeneralDivisionsLoading,
        },
        {
          key: 'health_directorate_id',
          label: 'Health Directorate',
          type: 'select',
          placeholder: 'Select Health Directorate',
          options: deps.directorates || [],
          validators: [Validators.required],
          colSpan: 'col-span-1',
          filter: true,
          virtualScroll: true,
          loading: deps.isDirectoratesLoading,
        },

        {
          key: 'health_division_id',
          label: 'Division Name',
          type: 'select',
          placeholder: 'Select Division',
          options: deps.healthDivisions || [],
          validators: [Validators.required],
          colSpan: 'col-span-1',
          filter: true,
          virtualScroll: true,
          loading: deps.isHealthDivisionsLoading,
          dependsOn: 'health_directorate_id',
        },
      ];
      break;

    case 'hospital': // HOSPITAL
      roleFields = [
        {
          key: 'health_directorate_id',
          label: 'Health Directorate',
          type: 'select',
          placeholder: 'Select Health Directorate...',
          options: deps.directorates || [],
          validators: [Validators.required],
          colSpan: 'col-span-1',
          filter: true,
          virtualScroll: true,
          loading: deps.isDirectoratesLoading,
        },
        {
          key: 'health_division_id',
          label: 'Health Division Name',
          type: 'select',
          placeholder: 'Select Health Division Name...',
          options: deps.healthDivisions || [],
          validators: [Validators.required],
          colSpan: 'col-span-1',
          filter: true,
          virtualScroll: true,
          loading: deps.isHealthDivisionsLoading,
          dependsOn: 'health_directorate_id',
        },
        {
          key: 'hospital_id',
          label: 'Hospital Name',
          type: 'select',
          placeholder: 'Select Hospital',
          options: deps.hospitals || [],
          validators: [Validators.required],
          colSpan: 'col-span-1',
          filter: true,
          virtualScroll: true,
          loading: deps.isHospitalsLoading,
          dependsOn: 'health_division_id',
        },
        {
          key: 'category_ids',
          label: 'Division',
          type: 'multiselect',
          placeholder: 'Select General Divisions',
          options: deps.generalDivisions || [],
          validators: [],
          colSpan: 'col-span-1',
          filter: true,
          virtualScroll: true,
          loading: deps.isGeneralDivisionsLoading,
        },
        {
          key: 'has_all_entity_surveys',
          label: 'Supervisor',
          type: 'checkbox',
          colSpan: 'col-span-1',
        },
      ];
      break;

    case 'authority': // AUTHORITY
      roleFields = [
        {
          key: 'category_ids',
          label: 'Division',
          type: 'multiselect',
          placeholder: 'Select Divisions',
          options: deps.generalDivisions || [],
          validators: [],
          colSpan: 'col-span-1',
          filter: true,
          virtualScroll: true,
          loading: deps.isGeneralDivisionsLoading,
        },
        {
          key: 'authority_id',
          label: 'Authority',
          type: 'select',
          placeholder: 'Select Authority',
          options: deps.authorities || [],
          validators: [Validators.required],
          colSpan: 'col-span-1',
          roles: ['ministry'],
          filter: true,
          virtualScroll: true,
          loading: deps.isAuthoritiesLoading,
        },
      ];
      break;

    case 'facility':
      roleFields = [
        {
          key: 'hospital_id',
          label: 'Sector',
          type: 'select',
          placeholder: 'Select Sector',
          options: deps.hospitals || [],
          validators: [Validators.required],
          colSpan: 'col-span-1',
          filter: true,
          virtualScroll: true,
          loading: deps.isHospitalsLoading,
          dependsOn: 'authority_id',
        },
        {
          key: 'authority_id',
          label: 'Authority',
          type: 'select',
          placeholder: 'Select Authority',
          options: deps.authorities || [],
          validators: [Validators.required],
          colSpan: 'col-span-1',
          roles: ['ministry'],
          filter: true,
          virtualScroll: true,
          loading: deps.isAuthoritiesLoading,
        },
        {
          key: 'health_directorate_id',
          label: 'Governorate',
          type: 'multiselect',
          placeholder: 'Select Governorate',
          options: deps.generalDivisions || [],
          validators: [],
          colSpan: 'col-span-1',
          filter: true,
          virtualScroll: true,
          loading: deps.isGeneralDivisionsLoading,
        },
        {
          key: 'category_ids',
          label: 'Division',
          type: 'multiselect',
          placeholder: 'Select Divisions...',
          options: deps.generalDivisions || [],
          validators: [],
          colSpan: 'col-span-1',
          filter: true,
          virtualScroll: true,
          loading: deps.isGeneralDivisionsLoading,
        },
        {
          key: 'has_all_entity_surveys',
          label: 'Supervisor',
          type: 'checkbox',
          colSpan: 'col-span-1',
        },
      ];
      break;
  }

  const fields = [...higherInputs, ...roleFields, ...lowerInputs];

  if (!isEdit) {
    fields.push();
  }

  return fields;
};
