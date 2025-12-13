// Attendances Service
// Menangani operasi attendance management

import { BaseService } from '../base/service';
import type { ApiResponse, PaginatedApiResponse, PaginationParams } from '../base/types';
import type {
  Attendance,
  AttendanceListItem,
  CheckInRequest,
  CheckOutRequest,
  BulkMarkPresentRequest,
  MarkPresentByIdRequest,
  AttendanceFilterParams,
  EmployeeAttendanceReport,
  EmployeeAttendanceOverview,
} from './types';

/**
 * Attendances Service Class
 * Menangani operasi attendance management sesuai dengan backend HRIS
 */
class AttendancesService extends BaseService {
  constructor() {
    super('/attendances');
  }

  // ==================== Self Service ====================

  /**
   * POST /attendances/check-in
   * Check-in attendance untuk employee
   *
   * PENTING: Selfie WAJIB untuk check-in
   */
  async checkIn(
    request: CheckInRequest,
    selfie: File,
  ): Promise<ApiResponse<Attendance>> {
    const formData = new FormData();

    if (request.notes) {
      formData.append('notes', request.notes);
    }

    if (request.latitude !== undefined) {
      formData.append('latitude', request.latitude.toString());
    }

    if (request.longitude !== undefined) {
      formData.append('longitude', request.longitude.toString());
    }

    formData.append('selfie', selfie);

    return this.post<ApiResponse<Attendance>>('/check-in', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * POST /attendances/check-out
   * Check-out attendance untuk employee
   *
   * PENTING: Selfie WAJIB untuk check-out
   */
  async checkOut(
    request: CheckOutRequest,
    selfie: File,
  ): Promise<ApiResponse<Attendance>> {
    const formData = new FormData();

    if (request.notes) {
      formData.append('notes', request.notes);
    }

    if (request.latitude !== undefined) {
      formData.append('latitude', request.latitude.toString());
    }

    if (request.longitude !== undefined) {
      formData.append('longitude', request.longitude.toString());
    }

    formData.append('selfie', selfie);

    return this.post<ApiResponse<Attendance>>('/check-out', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * GET /attendances/check-attendance-status
   * Check apakah user bisa absen hari ini (check status cuti dan hari kerja)
   *
   * Returns:
   * - can_attend: boolean
   * - reason: string (alasan jika tidak bisa absen)
   * - is_on_leave: boolean
   * - is_working_day: boolean
   * - leave_details: dict (detail cuti jika sedang cuti)
   */
  async checkAttendanceStatus(): Promise<ApiResponse<{
    can_attend: boolean;
    reason: string | null;
    is_on_leave: boolean;
    is_working_day: boolean;
    employee_type: string | null;
    leave_details: {
      leave_type: string;
      start_date: string;
      end_date: string;
      total_days: number;
      reason: string;
    } | null;
  }>> {
    return this.get<ApiResponse<{
      can_attend: boolean;
      reason: string | null;
      is_on_leave: boolean;
      is_working_day: boolean;
      employee_type: string | null;
      leave_details: {
        leave_type: string;
        start_date: string;
        end_date: string;
        total_days: number;
        reason: string;
      } | null;
    }>>('/check-attendance-status');
  }

  /**
   * GET /attendances/my-attendance
   * Ambil attendance history employee sendiri
   *
   * Filters:
   * - type: Tipe periode (today/weekly/monthly)
   * - start_date: Tanggal mulai (jika type tidak diisi)
   * - end_date: Tanggal akhir (jika type tidak diisi)
   */
  async getMyAttendance(
    params?: PaginationParams & AttendanceFilterParams,
  ): Promise<PaginatedApiResponse<AttendanceListItem>> {
    return this.get<PaginatedApiResponse<AttendanceListItem>>(
      '/my-attendance',
      { params },
    );
  }

  // ==================== Team/Subordinates ====================

  /**
   * GET /attendances/team
   * Ambil attendance team/subordinates (untuk org unit head)
   *
   * Requires permission: attendance.read_team
   *
   * Filters:
   * - start_date: Tanggal mulai
   * - end_date: Tanggal akhir
   * - status: Filter status (present/absent/leave)
   */
  async getTeamAttendance(
    params?: PaginationParams & Omit<AttendanceFilterParams, 'type' | 'org_unit_id' | 'employee_id'>,
  ): Promise<PaginatedApiResponse<AttendanceListItem>> {
    return this.get<PaginatedApiResponse<AttendanceListItem>>('/team', {
      params,
    });
  }

  // ==================== Admin Operations ====================

  /**
   * GET /attendances
   * Ambil semua attendance dengan berbagai filter (admin/super admin only)
   *
   * Requires role: admin atau super_admin
   *
   * Filters:
   * - type: Tipe periode (today/weekly/monthly)
   * - start_date: Tanggal mulai (jika type tidak diisi)
   * - end_date: Tanggal akhir (jika type tidak diisi)
   * - org_unit_id: Filter berdasarkan org unit
   * - employee_id: Filter berdasarkan employee ID tertentu
   * - status: Filter status (present/absent/leave)
   */
  async getAllAttendances(
    params?: PaginationParams & AttendanceFilterParams,
  ): Promise<PaginatedApiResponse<AttendanceListItem>> {
    return this.get<PaginatedApiResponse<AttendanceListItem>>('', {
      params,
    });
  }

  /**
   * GET /attendances/{id}
   * Ambil attendance berdasarkan ID
   *
   * Requires permission: attendance.read
   */
  async getAttendanceById(id: number): Promise<ApiResponse<Attendance>> {
    return this.get<ApiResponse<Attendance>>(`/${id}`);
  }

  /**
   * POST /attendances/bulk-mark-present
   * Bulk mark present untuk semua employees (admin only)
   *
   * Requires role: admin atau super_admin
   *
   * Use case: Libur nasional, libur mendadak, atau event khusus
   *
   * Logic:
   * - Membuat atau update attendance untuk semua users dengan role 'employee' dan employee_id
   * - Status: present
   * - Jika attendance sudah ada pada tanggal tersebut, akan diupdate statusnya dan notes
   * - Jika belum ada, akan dibuat attendance baru
   */
  async bulkMarkPresent(
    request: BulkMarkPresentRequest,
  ): Promise<ApiResponse<{
    total_employees: number;
    created: number;
    updated: number;
    skipped: number;
    attendance_date: string;
    notes?: string;
  }>> {
    return this.post<ApiResponse<{
      total_employees: number;
      created: number;
      updated: number;
      skipped: number;
      attendance_date: string;
      notes?: string;
    }>>('/bulk-mark-present', request);
  }

  /**
   * PATCH /attendances/{attendance_id}/mark-present
   * Mark attendance sebagai present berdasarkan ID (admin only)
   *
   * Requires permission: attendance.update
   *
   * Use case: Super admin dan HRIS admin ingin mengubah status attendance karyawan tertentu
   *
   * Restrictions:
   * - User tidak dapat mengubah attendance mereka sendiri (bahkan jika super admin)
   * - Memerlukan permission 'attendance.update'
   *
   * Logic:
   * - Update attendance yang sudah ada menjadi status 'present'
   * - Isi check_in_time (09:00) dan check_out_time (17:00) dari attendance_date
   * - Hitung work_hours otomatis (8 jam standar)
   * - Tambahkan keterangan otomatis: "Diubah oleh [nama admin] pada [tanggal waktu]"
   */
  async markPresentById(
    attendanceId: number,
    request: MarkPresentByIdRequest,
  ): Promise<ApiResponse<Attendance>> {
    return this.patch<ApiResponse<Attendance>>(
      `/${attendanceId}/mark-present`,
      request,
    );
  }

  // ==================== Reports ====================

  /**
   * GET /attendances/reports
   * Ambil attendance report untuk org unit tertentu dalam date range
   *
   * Requires role: admin atau super_admin
   *
   * Return list employees dengan attendance mereka untuk keperluan export Excel.
   * Tidak ada paginasi, semua data akan dikembalikan.
   *
   * Params (semua WAJIB):
   * - org_unit_id: ID org unit
   * - start_date: Tanggal mulai (format: YYYY-MM-DD)
   * - end_date: Tanggal akhir (format: YYYY-MM-DD)
   */
  async getAttendanceReport(params: {
    org_unit_id: number;
    start_date: string;
    end_date: string;
  }): Promise<ApiResponse<EmployeeAttendanceReport[]>> {
    return this.get<ApiResponse<EmployeeAttendanceReport[]>>('/reports', {
      params,
    });
  }

  /**
   * GET /attendances/overview
   * Ambil attendance overview per employee dengan paginasi
   *
   * Requires role: admin atau super_admin
   *
   * Return summary kehadiran (total present, absent, leave) per employee.
   * Dengan paginasi untuk ditampilkan di table.
   *
   * Params WAJIB:
   * - start_date: Tanggal mulai (format: YYYY-MM-DD)
   * - end_date: Tanggal akhir (format: YYYY-MM-DD)
   * - page: Nomor halaman (default: 1)
   * - limit: Jumlah item per halaman (default: 10)
   *
   * Params OPSIONAL:
   * - org_unit_id: ID org unit (jika tidak diisi, akan menampilkan semua org unit)
   */
  async getAttendanceOverview(
    params: PaginationParams & {
      org_unit_id?: number;
      start_date: string;
      end_date: string;
    },
  ): Promise<PaginatedApiResponse<EmployeeAttendanceOverview>> {
    return this.get<PaginatedApiResponse<EmployeeAttendanceOverview>>('/overview', {
      params,
    });
  }
}

// Export singleton instance
export const attendancesService = new AttendancesService();
export default attendancesService;
