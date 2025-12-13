// Employee Request Types - Simplified (no guest handling)

export interface CreateEmployeeRequest {
  number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  position?: string;
  employee_type?: string;
  employee_gender?: string;
  org_unit_id: number;
  supervisor_id?: number;
}

export interface UpdateEmployeeRequest {
  first_name?: string;
  last_name?: string;
  // email is NOT ALLOWED to be updated (core credential for login)
  phone?: string;
  position?: string;
  employee_type?: string;
  employee_gender?: string;
  org_unit_id?: number;
  supervisor_id?: number;
  is_active?: boolean;
}

export interface CreateEmployeeWithAccountRequest {
  // Employee fields (required)
  number: string;
  first_name: string;
  last_name: string;
  email: string;
  org_unit_id?: number;

  // Employee fields (optional)
  phone?: string;
  position?: string;
  employee_type?: string;
  employee_gender?: string;
  supervisor_id?: number;
}

export interface UpdateEmployeeWithAccountRequest {
  // Name fields (update employee + SSO)
  first_name?: string;
  last_name?: string;
  org_unit_id?: number;

  // Employee-only fields
  number?: string;
  phone?: string;
  position?: string;
  employee_type?: string;
  employee_gender?: string;
  supervisor_id?: number;

  // SSO profile fields (optional)
  alias?: string;
  gender?: string;
  address?: string;
  bio?: string;
}

export interface EmployeeFilterParams {
  search?: string;
  org_unit_id?: number;
  is_active?: boolean;
  include_details?: boolean;
}

export interface EmployeeWithAccountFilterParams {
  search?: string;
  org_unit_id?: number;
  is_active?: boolean;
}

export interface EmployeeSubordinatesParams {
  recursive?: boolean;
}

export interface EmployeesByOrgUnitParams {
  include_children?: boolean;
}
