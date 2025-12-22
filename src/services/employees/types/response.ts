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
