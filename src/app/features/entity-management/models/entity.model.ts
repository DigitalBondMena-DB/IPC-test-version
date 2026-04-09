export interface Division {
  id: number;
  name: string;
}

export interface Parent {
  id: number;
  name: string;
}

export interface EntityResponse {
  id: number;
  name: string;
  type: string;
  parent?: Parent;
  categories?: Division[];
  is_active?: boolean;
  [key: string]: any;
}

export interface EntityRequest {
  name: string;
  type: string;
  parent_id?: number;
  category_ids?: (number | string)[];
  is_active?: boolean;
  [key: string]: any;
}
