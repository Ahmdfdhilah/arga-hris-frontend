export interface CreateOrgUnitRequest {
  code: string;
  name: string;
  type: string;
  parent_id?: number;
  head_id?: number;
  description?: string;
}

export interface UpdateOrgUnitRequest {
  name?: string;
  type?: string;
  parent_id?: number;
  head_id?: number;
  description?: string;
  is_active?: boolean;
}

export interface OrgUnitFilterParams {
  search?: string;
  parent_id?: number;
  type_filter?: string;
}
