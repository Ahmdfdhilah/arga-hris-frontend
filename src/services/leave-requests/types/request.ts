import type { LeaveType } from './shared';

export interface LeaveRequestCreateRequest {
  employee_id: number;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  reason: string;
  replacement_employee_id?: number;
}

export interface LeaveRequestUpdateRequest {
  leave_type?: LeaveType;
  start_date?: string;
  end_date?: string;
  reason?: string;
}

export interface LeaveRequestFilterParams {
  employee_id?: number;
  start_date?: string;
  end_date?: string;
  leave_type?: LeaveType;
}
