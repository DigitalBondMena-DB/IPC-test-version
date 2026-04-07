export interface ITableColumn {
  field: string;
  header: string;
  sortable?: boolean;
  is_active_actions?: boolean;
  type?: 'text' | 'date' | 'toggle' | 'actions';
  duplicate?: boolean;
  viewOnly?: boolean;
  customClass?: string;
  transform?: (value: any) => any;
}

export interface ITableParams {
  page: number;
  per_page: number;
  search: string;
  sort_by: string;
  sort_dir: 'asc' | 'desc' | '';
}
