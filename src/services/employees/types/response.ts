import type { BaseEntity } from '../../base/types';

export interface Employee extends BaseEntity {
  user_id: string | null;
  code: string;
  name: string;
  email: string | null;
  position: string | null;
  site: string | null;
  type: string | null;
  org_unit_id: number | null;
  supervisor_id: number | null;
  metadata?: Record<string, string> | null;
  is_active: boolean;
  deleted_at?: string | null;
  deleted_by?: string | null;
  user?: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    gender: string | null;
    avatar_path: string | null;
    is_active: boolean;
  } | null;
  org_unit?: {
    id: number;
    code: string;
    name: string;
    type: string;
  } | null;
  supervisor?: {
    id: number;
    code: string;
    name: string;
    position: string | null;
    user?: {
      id: string;
      name: string;
      email: string | null;
      phone: string | null;
      avatar_path: string | null;
    } | null;
  } | null;
}

export interface EmployeeSubordinates {
  employee: Employee;
  direct_subordinates: Employee[];
  all_subordinates?: Employee[];
}
