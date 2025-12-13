/**
 * Dashboard service types
 */

export interface AttendanceStatusToday {
  has_checked_in: boolean;
  check_in_time?: string;
  check_out_time?: string;
  status?: string;
  location?: string;
}

export interface BaseWidget {
  widget_type: string;
  title: string;
  order: number;
}

export interface EmployeeWidget extends BaseWidget {
  widget_type: 'employee';
  attendance_today: AttendanceStatusToday;
  monthly_attendance_percentage: number;
  total_present_days: number;
  total_work_days: number;
  pending_leave_requests: number;
  approved_leave_requests: number;
  remaining_leave_quota?: number;
  employee_name: string;
  employee_number?: string;
  position?: string;
  department?: string;
}

export interface HRAdminWidget extends BaseWidget {
  widget_type: 'hr_admin';
  total_active_employees: number;
  total_inactive_employees: number;
  new_employees_this_month: number;
  pending_leave_approvals: number;
  pending_attendance_corrections: number;
  employees_on_leave_today: number;
  employees_present_today: number;
  employees_absent_today: number;
  pending_payroll_processing: number;
}

export interface OrgUnitHeadWidget extends BaseWidget {
  widget_type: 'org_unit_head';
  org_unit_name: string;
  team_size: number;
  team_present_today: number;
  team_absent_today: number;
  team_on_leave_today: number;
  team_attendance_percentage: number;
  team_pending_leave_requests: number;
  team_pending_work_submissions: number;
  monthly_team_attendance_avg: number;
}

export interface GuestWidget extends BaseWidget {
  widget_type: 'guest';
  attendance_today: AttendanceStatusToday;
  total_attendance_records: number;
}

export type DashboardWidget = EmployeeWidget | HRAdminWidget | OrgUnitHeadWidget | GuestWidget;

export interface DashboardSummary {
  user_id: number;
  full_name: string;
  email: string;
  roles: string[];
  widgets: DashboardWidget[];
  generated_at: string;
  timezone: string;
}

export interface DashboardRolesResponse {
  user_id: number;
  all_roles: string[];
  dashboard_roles: string[];
  has_employee_record: boolean;
}
