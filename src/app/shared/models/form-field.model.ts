export interface IFormField {
  key: string;
  label: string;
  subLable?: string;
  type: 'text' | 'password' | 'email' | 'checkbox' | 'select' | 'multiselect' | 'number';
  placeholder?: string;
  options?: { label: string; value: any }[];
  validators?: any[];
  colSpan?: string;
  filter?: boolean;
  virtualScroll?: boolean;
  loading?: boolean;
  dependsOn?: string;
  disabled?: boolean;
}
