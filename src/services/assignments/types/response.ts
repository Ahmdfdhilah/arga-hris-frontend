import type { AssignmentStatus } from './shared';

export interface EmployeeInfo {
    id: number;
    number: string;
    name: string;
    position: string;
}

export interface OrgUnitInfo {
    id: number;
    code: string;
    name: string;
    type: string;
}

export interface Assignment {
    id: number;
    employee_id: number;
    replaced_employee_id: number;
    org_unit_id: number;
    start_date: string;
    end_date: string;
    status: AssignmentStatus;
    leave_request_id?: number;
    reason?: string;
    employee?: EmployeeInfo;
    replaced_employee?: EmployeeInfo;
    org_unit?: OrgUnitInfo;
    created_at: string;
    updated_at: string;
}
