import type { LeaveType } from './shared';

export interface ReplacementInfo {
  employee_id: number;
  employee_name: string;
  employee_number: string;
  assignment_id: number;
  assignment_status: string;
}

export interface LeaveRequest {
  id: number;
  employee_id: number;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  replacement?: ReplacementInfo;
  created_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface LeaveRequestWithEmployee extends LeaveRequest {
  employee_name: string | null;
  employee_number: string | null;
}
