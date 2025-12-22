import type { AssignmentStatus } from './shared';

export interface AssignmentCreateRequest {
    employee_id: number;
    replaced_employee_id: number;
    start_date: string;
    end_date: string;
    leave_request_id?: number;
    reason?: string;
}

export interface AssignmentFilterParams {
    employee_id?: number;
    replaced_employee_id?: number;
    status?: AssignmentStatus;
    start_date?: string;
    end_date?: string;
}
