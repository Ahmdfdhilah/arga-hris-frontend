// Employee Response Types - Simplified (SSO-first)

import type { BaseEntity } from '../../base/types';

export interface Employee extends BaseEntity {
  employee_number: string;
  name: string;
  email: string | null;
  phone: string | null;
  position: string | null;
  employee_type?: string | null;
  employee_gender?: string | null;
  org_unit_id: number | null;
  user_id: number | null;
  supervisor_id: number | null;
  employee_metadata?: Record<string, string> | null;
  is_active: boolean;
  deleted_at?: string | null;
  deleted_by?: number | null;
  org_unit?: {
    id: number;
    code: string;
    name: string;
    type: string;
  } | null;
  supervisor?: {
    id: number;
    employee_number: string;
    name: string;
    position: string | null;
  } | null;
}

export interface EmployeeSubordinates {
  employee: Employee;
  direct_subordinates: Employee[];
  all_subordinates?: Employee[];
}

// Simplified User - HRIS user is now just a linking table
export interface User {
  id: number;
  sso_id: string;
  employee_id: number | null;
  org_unit_id: number | null;
  is_active: boolean;
}

// Deprecated - Guest handling is in SSO now
export interface GuestAccount {
  id: number;
  user_id: number;
  guest_type: string;
}

export interface EmployeeWithAccount {
  employee: Employee | null;
  user: User | null;
  guest_account: GuestAccount | null;
}

export interface EmployeeAccountResponse {
  employee: Employee;
  user: User | null;
  guest_account: GuestAccount | null;
  temporary_password?: string | null;
  warnings?: string[] | null;
}

export interface EmployeeAccountUpdateResponse {
  employee: Employee | null;
  user: User | null;
  guest_account: GuestAccount | null;
  updated_fields?: {
    employee: boolean;
    sso: boolean;
  };
  warnings?: string[] | null;
}

export interface EmployeeAccountData {
  employee: Employee;
  user: User | null;
  warnings?: string[] | null;
}

// List item for employee accounts
export interface EmployeeAccountListItem {
  id: number;
  sso_id: string | null;
  employee_id: number | null;
  name: string;
  email: string;
  is_active: boolean;
}
