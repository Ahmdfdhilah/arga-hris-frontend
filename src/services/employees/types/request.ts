export interface CreateEmployeeRequest {
  code: string;
  name: string;
  email?: string;
  phone?: string;
  position?: string;
  site?: string;
  type?: string;
  org_unit_id?: number;
  supervisor_id?: number;
  is_active?: boolean;
}

export interface UpdateEmployeeRequest {
  code?: string;
  name?: string;
  email?: string;
  phone?: string;
  position?: string;
  site?: string;
  type?: string;
  org_unit_id?: number;
  supervisor_id?: number;
  is_active?: boolean;
}

export interface EmployeeFilterParams {
  search?: string;
  org_unit_id?: number;
  is_active?: boolean;
  include_details?: boolean;
}

export interface EmployeeSubordinatesParams {
  recursive?: boolean;
}

export interface EmployeesByOrgUnitParams {
  include_children?: boolean;
}
