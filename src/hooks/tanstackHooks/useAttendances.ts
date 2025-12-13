import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { attendancesService } from '@/services/attendances';
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
} from '@/services/attendances/types';
import type { PaginationParams, PaginatedApiResponse, ApiResponse } from '@/services/base/types';
import { handleApiError } from '@/utils/errorHandler';

// Query Keys
export const attendancesKeys = {
  all: ['attendances'] as const,
  lists: () => [...attendancesKeys.all, 'list'] as const,
  list: (filters: PaginationParams & AttendanceFilterParams) =>
    [...attendancesKeys.lists(), filters] as const,
  myAttendance: (filters: PaginationParams & AttendanceFilterParams) =>
    [...attendancesKeys.all, 'my-attendance', filters] as const,
  teamAttendance: (filters: PaginationParams & Omit<AttendanceFilterParams, 'type' | 'org_unit_id' | 'employee_id'>) =>
    [...attendancesKeys.all, 'team', filters] as const,
  details: () => [...attendancesKeys.all, 'detail'] as const,
  detail: (id: number) => [...attendancesKeys.details(), id] as const,
  attendanceStatus: () => [...attendancesKeys.all, 'attendance-status'] as const,
  reports: () => [...attendancesKeys.all, 'report'] as const,
  report: (filters: { org_unit_id: number; start_date: string; end_date: string }) =>
    [...attendancesKeys.reports(), filters] as const,
  overviews: () => [...attendancesKeys.all, 'overview'] as const,
  overview: (filters: PaginationParams & { org_unit_id?: number; start_date: string; end_date: string }) =>
    [...attendancesKeys.overviews(), filters] as const,
};

// ==================== Queries ====================

/**
 * Hook untuk mendapatkan attendance history user sendiri
 */
export const useMyAttendance = (
  filters: PaginationParams & AttendanceFilterParams,
  options?: Omit<
    UseQueryOptions<
      PaginatedApiResponse<AttendanceListItem>,
      Error,
      PaginatedApiResponse<AttendanceListItem>,
      ReturnType<typeof attendancesKeys.myAttendance>
    >,
    'queryKey' | 'queryFn'
  >,
) => {
  return useQuery({
    queryKey: attendancesKeys.myAttendance(filters),
    queryFn: () => attendancesService.getMyAttendance(filters),
    staleTime: 2 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook untuk mendapatkan attendance team/subordinates
 */
export const useTeamAttendance = (
  filters: PaginationParams & Omit<AttendanceFilterParams, 'type' | 'org_unit_id' | 'employee_id'>,
  options?: Omit<
    UseQueryOptions<
      PaginatedApiResponse<AttendanceListItem>,
      Error,
      PaginatedApiResponse<AttendanceListItem>,
      ReturnType<typeof attendancesKeys.teamAttendance>
    >,
    'queryKey' | 'queryFn'
  >,
) => {
  return useQuery({
    queryKey: attendancesKeys.teamAttendance(filters),
    queryFn: () => attendancesService.getTeamAttendance(filters),
    staleTime: 2 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook untuk mendapatkan semua attendance (admin)
 */
export const useAttendances = (
  filters: PaginationParams & AttendanceFilterParams,
  options?: Omit<
    UseQueryOptions<
      PaginatedApiResponse<AttendanceListItem>,
      Error,
      PaginatedApiResponse<AttendanceListItem>,
      ReturnType<typeof attendancesKeys.list>
    >,
    'queryKey' | 'queryFn'
  >,
) => {
  return useQuery({
    queryKey: attendancesKeys.list(filters),
    queryFn: () => attendancesService.getAllAttendances(filters),
    staleTime: 2 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook untuk mendapatkan single attendance by ID
 */
export const useAttendance = (
  attendanceId: number | null,
  options?: Omit<
    UseQueryOptions<
      ApiResponse<Attendance>,
      Error,
      ApiResponse<Attendance>,
      ReturnType<typeof attendancesKeys.detail>
    >,
    'queryKey' | 'queryFn' | 'enabled'
  >,
) => {
  return useQuery({
    queryKey: attendancesKeys.detail(attendanceId!),
    queryFn: () => attendancesService.getAttendanceById(attendanceId!),
    enabled: !!attendanceId,
    staleTime: 2 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook untuk check apakah user bisa absen hari ini (check status cuti dan hari kerja)
 */
export const useAttendanceStatus = (
  options?: Omit<
    UseQueryOptions<
      ApiResponse<{
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
      }>,
      Error,
      ApiResponse<{
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
      }>,
      ReturnType<typeof attendancesKeys.attendanceStatus>
    >,
    'queryKey' | 'queryFn'
  >,
) => {
  return useQuery({
    queryKey: attendancesKeys.attendanceStatus(),
    queryFn: () => attendancesService.checkAttendanceStatus(),
    staleTime: 1 * 60 * 1000, // 1 minute
    ...options,
  });
};

/**
 * Hook untuk mendapatkan attendance report (admin)
 *
 * Return list employees dengan attendance mereka untuk keperluan export Excel.
 * Tidak ada paginasi, semua data akan dikembalikan.
 *
 * Params (semua WAJIB):
 * - org_unit_id: ID org unit
 * - start_date: Tanggal mulai (format: YYYY-MM-DD)
 * - end_date: Tanggal akhir (format: YYYY-MM-DD)
 */
export const useAttendanceReport = (
  filters: {
    org_unit_id: number;
    start_date: string;
    end_date: string;
  },
  options?: Omit<
    UseQueryOptions<
      ApiResponse<EmployeeAttendanceReport[]>,
      Error,
      ApiResponse<EmployeeAttendanceReport[]>,
      ReturnType<typeof attendancesKeys.report>
    >,
    'queryKey' | 'queryFn'
  >,
) => {
  return useQuery({
    queryKey: attendancesKeys.report(filters),
    queryFn: () => attendancesService.getAttendanceReport(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes (report data tidak perlu terlalu fresh)
    ...options,
  });
};

/**
 * Hook untuk mendapatkan attendance overview per employee dengan paginasi (admin)
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
export const useAttendanceOverview = (
  filters: PaginationParams & {
    org_unit_id?: number;
    start_date: string;
    end_date: string;
  },
  options?: Omit<
    UseQueryOptions<
      PaginatedApiResponse<EmployeeAttendanceOverview>,
      Error,
      PaginatedApiResponse<EmployeeAttendanceOverview>,
      ReturnType<typeof attendancesKeys.overview>
    >,
    'queryKey' | 'queryFn'
  >,
) => {
  return useQuery({
    queryKey: attendancesKeys.overview(filters as any),
    queryFn: () => attendancesService.getAttendanceOverview(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
};

// ==================== Mutations ====================

/**
 * Hook untuk check-in
 * PENTING: Selfie WAJIB untuk check-in
 */
export const useCheckIn = (
  options?: Omit<
    UseMutationOptions<
      ApiResponse<Attendance>,
      Error,
      { request: CheckInRequest; selfie: File }
    >,
    'mutationFn'
  >,
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...restOptions } = options || {};

  return useMutation({
    ...restOptions,
    mutationFn: ({ request, selfie }: { request: CheckInRequest; selfie: File }) =>
      attendancesService.checkIn(request, selfie),
    onSuccess: (response, variables, context, _mutation) => {
      queryClient.invalidateQueries({ queryKey: attendancesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: attendancesKeys.all });

      toast.success('Berhasil check-in');
      onSuccess?.(response, variables, context, _mutation);
    },
    onError: (error, variables, context, _mutation) => {
      const apiError = handleApiError(error);
      toast.error(apiError.message);
      onError?.(error, variables, context, _mutation);
    },
  });
};

/**
 * Hook untuk check-out
 * PENTING: Selfie WAJIB untuk check-out
 */
export const useCheckOut = (
  options?: Omit<
    UseMutationOptions<
      ApiResponse<Attendance>,
      Error,
      { request: CheckOutRequest; selfie: File }
    >,
    'mutationFn'
  >,
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...restOptions } = options || {};

  return useMutation({
    ...restOptions,
    mutationFn: ({ request, selfie }: { request: CheckOutRequest; selfie: File }) =>
      attendancesService.checkOut(request, selfie),
    onSuccess: (response, variables, context, _mutation) => {
      queryClient.invalidateQueries({ queryKey: attendancesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: attendancesKeys.all });

      toast.success('Berhasil check-out');
      onSuccess?.(response, variables, context, _mutation);
    },
    onError: (error, variables, context, _mutation) => {
      const apiError = handleApiError(error);
      toast.error(apiError.message);
      onError?.(error, variables, context, _mutation);
    },
  });
};

/**
 * Hook untuk bulk mark present semua employees (admin)
 * Use case: Libur nasional, libur mendadak, atau event khusus
 */
export const useBulkMarkPresent = (
  options?: Omit<
    UseMutationOptions<
      ApiResponse<{
        total_employees: number;
        created: number;
        updated: number;
        skipped: number;
        attendance_date: string;
        notes?: string;
      }>,
      Error,
      BulkMarkPresentRequest
    >,
    'mutationFn'
  >,
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...restOptions } = options || {};

  return useMutation({
    ...restOptions,
    mutationFn: (data: BulkMarkPresentRequest) =>
      attendancesService.bulkMarkPresent(data),
    onSuccess: (response, variables, context, _mutation) => {
      queryClient.invalidateQueries({ queryKey: attendancesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: attendancesKeys.all });

      const summary = response.data;
      toast.success(
        `Bulk mark present berhasil! ${summary.created} attendance dibuat, ${summary.updated} attendance diupdate.`
      );
      onSuccess?.(response, variables, context, _mutation);
    },
    onError: (error, variables, context, _mutation) => {
      const apiError = handleApiError(error);
      toast.error(apiError.message);
      onError?.(error, variables, context, _mutation);
    },
  });
};

/**
 * Hook untuk mark present berdasarkan attendance ID (admin)
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
export const useMarkPresentById = (
  options?: Omit<
    UseMutationOptions<
      ApiResponse<Attendance>,
      Error,
      { attendanceId: number; request: MarkPresentByIdRequest }
    >,
    'mutationFn'
  >,
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...restOptions } = options || {};

  return useMutation({
    ...restOptions,
    mutationFn: ({ attendanceId, request }: { attendanceId: number; request: MarkPresentByIdRequest }) =>
      attendancesService.markPresentById(attendanceId, request),
    onSuccess: (response, variables, context, _mutation) => {
      // Invalidate all attendance lists and detail
      queryClient.invalidateQueries({ queryKey: attendancesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: attendancesKeys.all });
      queryClient.invalidateQueries({ queryKey: attendancesKeys.detail(variables.attendanceId) });

      toast.success('Attendance berhasil diubah menjadi present');
      onSuccess?.(response, variables, context, _mutation);
    },
    onError: (error, variables, context, _mutation) => {
      const apiError = handleApiError(error);
      toast.error(apiError.message);
      onError?.(error, variables, context, _mutation);
    },
  });
};
