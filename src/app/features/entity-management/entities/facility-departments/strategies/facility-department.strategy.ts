import { FormGroup } from '@angular/forms';
import { IFormField } from '@shared/models/form-field.model';

export interface FacilityDepartmentFormStrategy {
  /**
   * Returns the array of form fields specific to the role.
   */
  getFields(): IFormField[];

  /**
   * Handles dynamic changes when a field value changes (e.g., cascading logic, enabling/disabling fields).
   * @param key The key of the field that changed
   * @param value The new value
   * @param form The reactive form group
   * @param updateFieldsCallback Callback to update the fields definition dynamically (e.g. for options or disabled state)
   */
  handleValueChange(
    key: string,
    value: any,
    form: FormGroup,
    updateFieldsCallback: (fields: IFormField[]) => void,
    currentFields: IFormField[],
    httpService: any
  ): void;

  /**
   * Handles remote search queries for autocomplete inputs.
   * @param key The key of the field triggering the search
   * @param searchTerm The term typed by the user
   * @param form The reactive form group
   * @param updateFieldsCallback Callback to update field options
   */
  handleSearch(
    key: string,
    searchTerm: string,
    form: FormGroup,
    updateFieldsCallback: (fields: IFormField[]) => void,
    currentFields: IFormField[],
    httpService: any // Will be injected by the component
  ): void;
}
