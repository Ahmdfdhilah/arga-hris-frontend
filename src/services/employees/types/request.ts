export interface CreateEmployeeRequest {
  employee_number: string;
  name: string;
  email?: string;
  phone?: string;
  position?: string;
  employee_type?: string;
  employee_gender?: string;
  org_unit_id?: number;
  supervisor_id?: number;
  is_active?: boolean;
}

export interface UpdateEmployeeRequest {
  employee_number?: string;
  name?: string;
  first_name?: string; // Legacy support or if backend handles it
  last_name?: string; // Legacy support
  email?: string;
  phone?: string;
  position?: string;
  employee_type?: string;
  employee_gender?: string;
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
