import type { AttendanceStatus } from './shared';

/**
 * Attendance response dari backend
 * Mapping dari AttendanceResponse di backend
 */
export interface Attendance {
  id: number;
  employee_id: number;
  org_unit_id: number | null;
  attendance_date: string;
  status: AttendanceStatus;
  check_in_time: string | null;
  check_out_time: string | null;
  work_hours: number | null;
  overtime_hours: number | null;
  created_by: number | null;
  check_in_submitted_at: string | null;
  check_in_submitted_ip: string | null;
  check_in_notes: string | null;
  check_in_selfie_url: string | null;
  check_in_latitude: number | null;
  check_in_longitude: number | null;
  check_in_location_name: string | null;
  check_out_submitted_at: string | null;
  check_out_submitted_ip: string | null;
  check_out_notes: string | null;
  check_out_selfie_url: string | null;
  check_out_latitude: number | null;
  check_out_longitude: number | null;
  check_out_location_name: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Attendance list item dengan enriched data
 * Di backend, field employee_name, employee_number, org_unit_name di-inject di service layer
 */
export interface AttendanceListItem {
  id: number;
  employee_id: number;
  employee_name?: string | null;
  employee_number?: string | null;
  org_unit_id: number | null;
  org_unit_name?: string | null;
  attendance_date: string;
  status: AttendanceStatus;
  check_in_time: string | null;
  check_out_time: string | null;
  work_hours: number | null;
  overtime_hours: number | null;
  check_in_notes: string | null;
  check_out_notes: string | null;
  check_in_submitted_at: string | null;
  check_in_submitted_ip: string | null;
  check_in_latitude: number | null;
  check_in_longitude: number | null;
  check_in_location_name: string | null;
  check_out_submitted_at: string | null;
  check_out_submitted_ip: string | null;
  check_out_latitude: number | null;
  check_out_longitude: number | null;
  check_out_location_name: string | null;
  check_in_selfie_url: string | null;
  check_out_selfie_url: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Single attendance record dalam report
 * Mapping dari AttendanceRecordInReport di backend
 */
export interface AttendanceRecordInReport {
  attendance_date: string;
  status: AttendanceStatus;
  check_in_time: string | null;
  check_out_time: string | null;
  work_hours: number | null;
  overtime_hours: number | null;
}

/**
 * Employee attendance report
 * Mapping dari EmployeeAttendanceReport di backend
 */
export interface EmployeeAttendanceReport {
  employee_id: number;
  employee_name: string;
  employee_number: string | null;
  employee_position: string | null;
  employee_type: string | null;
  org_unit_id: number | null;
  org_unit_name: string | null;
  attendances: AttendanceRecordInReport[];
  total_present_days: number;
  total_work_hours: number | null;
  total_overtime_hours: number | null;
}

/**
 * Employee attendance overview (untuk table dengan paginasi)
 * Mapping dari EmployeeAttendanceOverview di backend
 */
export interface EmployeeAttendanceOverview {
  employee_id: number;
  employee_name: string;
  employee_number: string | null;
  employee_position: string | null;
  org_unit_id: number | null;
  org_unit_name: string | null;
  total_present: number;
  total_absent: number;
  total_leave: number;
  total_hybrid: number;
  total_work_hours: number | null;
  total_overtime_hours: number | null;
}
