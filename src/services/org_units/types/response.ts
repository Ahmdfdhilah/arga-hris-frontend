import type { BaseEntity } from '../../base/types';

export interface OrgUnit extends BaseEntity {
  code: string;
  name: string;
  type: string;
  parent_id: number | null;
  head_id: number | null;
  level: number;
  path: string;
  description: string | null;
  org_unit_metadata?: Record<string, string> | null;
  is_active: boolean;
  employee_count: number;
  total_employee_count: number;
  deleted_at?: string | null;
  deleted_by?: number | null;
  parent?: {
    id: number;
    code: string;
    name: string;
    type: string;
  } | null;
  head?: {
    id: number;
    employee_number: string;
    name: string;
    position: string | null;
  } | null;
}

export interface OrgUnitWithChildren extends OrgUnit {
  children?: OrgUnit[];
}

export interface OrgUnitHierarchy {
  current: OrgUnit;
  ancestors: OrgUnit[];
  descendants: OrgUnit[];
}

export interface OrgUnitTypes {
  types: string[];
}
