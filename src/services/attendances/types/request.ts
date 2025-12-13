/**
 * Check-in request schema
 */
export interface CheckInRequest {
  notes?: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Check-out request schema
 */
export interface CheckOutRequest {
  notes?: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Bulk mark present request (Admin only)
 * Mapping dari BulkMarkPresentRequest di backend
 */
export interface BulkMarkPresentRequest {
  attendance_date: string;
  notes?: string;
}

/**
 * Mark present by ID request (Admin only)
 * Mapping dari MarkPresentByIdRequest di backend
 */
export interface MarkPresentByIdRequest {
  notes?: string;
}

/**
 * Filter params untuk list attendance
 * Mapping dari query params di backend router
 */
export interface AttendanceFilterParams {
  type?: 'today' | 'weekly' | 'monthly';
  start_date?: string;
  end_date?: string;
  org_unit_id?: number;
  employee_id?: number;
  status?: 'present' | 'absent' | 'leave';
}
