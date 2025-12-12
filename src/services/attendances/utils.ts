// Attendances Utils
// Helper functions untuk attendance module

import { format, eachDayOfInterval, parseISO, isWeekend } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import {
  generateExcelFile,
  downloadBlob,
  sanitizeSheetName,
  sanitizeFilename,
  type ExcelConfig,
  type SheetConfig,
  type SheetData,
  type HeaderRow,
  type CellValue,
  type StyledCell
} from '@/utils/excelGenerator';
import { attendancesService } from './service';
import type { Attendance, AttendanceListItem, AttendanceStatus, EmployeeAttendanceReport } from './types';

/**
 * Get label bahasa Indonesia untuk status attendance
 */
export function getAttendanceStatusLabel(status: AttendanceStatus): string {
  const labels: Record<AttendanceStatus, string> = {
    present: 'Hadir',
    absent: 'Tidak Hadir',
    leave: 'Cuti',
    hybrid: 'Hybrid',
    invalid: 'Invalid',
  };
  return labels[status] || status;
}


/**
 * Get badge color class untuk status attendance
 */
export function getAttendanceStatusBadgeColor(status: AttendanceStatus): string {
  const colors: Record<AttendanceStatus, string> = {
    present: 'bg-primary/10 text-primary',
    absent: 'bg-destructive/10 text-destructive',
    leave: 'bg-muted text-muted-foreground',
    hybrid: 'bg-blue-100 text-blue-700',
    invalid: 'bg-red-100 text-red-700',
  };
  return colors[status] || 'bg-muted text-muted-foreground';
}

/**
 * Get text color class untuk status attendance (tanpa background)
 */
export function getAttendanceStatusTextColor(status: AttendanceStatus): string {
  const colors: Record<AttendanceStatus, string> = {
    present: 'text-primary',
    absent: 'text-destructive',
    leave: 'text-muted-foreground',
    hybrid: 'text-blue-700',
    invalid: 'text-red-700',
  };
  return colors[status] || 'text-muted-foreground';
}

// ==================== Formatting Helpers ====================

/**
 * Format waktu check-in/check-out
 */
export function formatAttendanceTime(time: string | null | undefined): string {
  if (!time) return '-';

  try {
    const date = new Date(time);
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    console.error('Error formatting attendance time:', error);
    return '-';
  }
}

/**
 * Format tanggal attendance
 */
export function formatAttendanceDate(date: string | null | undefined): string {
  if (!date) return '-';

  try {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (error) {
    console.error('Error formatting attendance date:', error);
    return '-';
  }
}

/**
 * Calculate durasi kerja dari check-in ke check-out
 */
export function getAttendanceDuration(
  checkInTime: string | null | undefined,
  checkOutTime: string | null | undefined,
): string {
  if (!checkInTime || !checkOutTime) return '-';

  try {
    const checkIn = new Date(checkInTime);
    const checkOut = new Date(checkOutTime);
    const diffMs = checkOut.getTime() - checkIn.getTime();

    if (diffMs < 0) return '-';

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours === 0) {
      return `${minutes} menit`;
    }

    return `${hours} jam ${minutes} menit`;
  } catch (error) {
    console.error('Error calculating attendance duration:', error);
    return '-';
  }
}

/**
 * Format work hours dari decimal ke string (backend return decimal)
 * Contoh: 8.5 -> "8 jam 30 menit"
 */
export function formatWorkHours(workHours: number | null | undefined): string {
  if (workHours === null || workHours === undefined) return '-';

  try {
    const hours = Math.floor(workHours);
    const minutes = Math.round((workHours - hours) * 60);

    if (hours === 0) {
      return `${minutes} menit`;
    }

    if (minutes === 0) {
      return `${hours} jam`;
    }

    return `${hours} jam ${minutes} menit`;
  } catch (error) {
    console.error('Error formatting work hours:', error);
    return '-';
  }
}

/**
 * Format overtime hours dari decimal ke string (backend return decimal)
 * Contoh: 2.5 -> "2 jam 30 menit"
 * Sama dengan formatWorkHours tapi untuk overtime
 */
export function formatOvertimeHours(overtimeHours: number | null | undefined): string {
  if (overtimeHours === null || overtimeHours === undefined || overtimeHours === 0) return '-';

  try {
    const hours = Math.floor(overtimeHours);
    const minutes = Math.round((overtimeHours - hours) * 60);

    if (hours === 0) {
      return `${minutes} menit`;
    }

    if (minutes === 0) {
      return `${hours} jam`;
    }

    return `${hours} jam ${minutes} menit`;
  } catch (error) {
    console.error('Error formatting overtime hours:', error);
    return '-';
  }
}

/**
 * Format tampilan attendance lengkap
 */
export function formatAttendanceDisplay(
  attendance: Attendance | AttendanceListItem,
): string {
  const date = formatAttendanceDate(attendance.attendance_date);
  const checkIn = formatAttendanceTime(attendance.check_in_time);
  const checkOut = formatAttendanceTime(attendance.check_out_time);
  const status = getAttendanceStatusLabel(attendance.status);

  return `${date} - ${status} (Masuk: ${checkIn}, Keluar: ${checkOut})`;
}

// ==================== State Check Helpers ====================

/**
 * Check apakah sudah check-in
 */
export function isCheckedIn(attendance: Attendance | AttendanceListItem): boolean {
  return !!attendance.check_in_time;
}

/**
 * Check apakah sudah check-out
 */
export function isCheckedOut(attendance: Attendance | AttendanceListItem): boolean {
  return !!attendance.check_out_time;
}

/**
 * Check apakah bisa check-out (sudah check-in tapi belum check-out)
 */
export function canCheckOut(attendance: Attendance | AttendanceListItem): boolean {
  return isCheckedIn(attendance) && !isCheckedOut(attendance);
}

/**
 * Check apakah attendance untuk hari ini
 */
export function isAttendanceToday(attendanceDate: string): boolean {
  try {
    const date = new Date(attendanceDate);
    const today = new Date();

    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  } catch (error) {
    console.error('Error checking if attendance is today:', error);
    return false;
  }
}

// ==================== Service Helpers ====================

/**
 * Get attendance hari ini untuk employee
 * Note: parameter userId tidak digunakan karena backend menggunakan employee_id dari token
 */
export async function getTodayAttendance(): Promise<Attendance | null> {
  try {
    const response = await attendancesService.getMyAttendance({
      page: 1,
      limit: 1,
      type: 'today',
    });

    if (response.data.length > 0) {
      const attendance = response.data[0];
      if (isAttendanceToday(attendance.attendance_date)) {
        return attendance as unknown as Attendance;
      }
    }

    return null;
  } catch (error) {
    console.error('Error mendapatkan attendance hari ini:', error);
    return null;
  }
}

// ==================== Validation Helpers ====================

/**
 * Validasi waktu check-in dan check-out
 */
export function validateAttendanceTimes(
  checkInTime: string | null | undefined,
  checkOutTime: string | null | undefined,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (checkOutTime && !checkInTime) {
    errors.push('Waktu check-in harus diisi jika waktu check-out diisi');
  }

  if (checkInTime && checkOutTime) {
    const checkIn = new Date(checkInTime);
    const checkOut = new Date(checkOutTime);

    if (checkOut <= checkIn) {
      errors.push('Waktu check-out harus lebih besar dari waktu check-in');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ==================== Excel Report Helpers ====================

/**
 * Generate attendance report Excel dari API response
 *
 * @param data - Array of EmployeeAttendanceReport dari API
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @param orgUnitName - Optional org unit name untuk filename
 * @returns ExcelConfig ready untuk generate
 *
 * @example
 * ```typescript
 * const reportData = await attendancesService.getAttendanceReport({
 *   org_unit_id: 1,
 *   start_date: '2025-11-01',
 *   end_date: '2025-11-30'
 * });
 *
 * const config = generateAttendanceReportExcel(
 *   reportData.data,
 *   '2025-11-01',
 *   '2025-11-30'
 * );
 *
 * const blob = generateExcelFile(config);
 * downloadBlob(blob, config.filename);
 * ```
 */
export function generateAttendanceReportExcel(
  data: EmployeeAttendanceReport[],
  startDate: string,
  endDate: string,
  orgUnitName?: string
): ExcelConfig {
  // Group by org unit
  const groupedByOrgUnit = groupByOrgUnit(data);

  // Generate date range
  const dateRange = eachDayOfInterval({
    start: parseISO(startDate),
    end: parseISO(endDate)
  });

  // Create sheets per org unit
  const sheets: SheetConfig[] = Object.entries(groupedByOrgUnit).map(
    ([_, employees]) => {
      const orgUnit = employees[0]?.org_unit_name || 'Tanpa Unit';

      return {
        sheetName: sanitizeSheetName(orgUnit),
        title: `Laporan Absensi - ${orgUnit}`,
        description: `Periode: ${formatDateDisplay(parseISO(startDate))} s/d ${formatDateDisplay(parseISO(endDate))}`,
        data: createAttendanceSheetData(employees, dateRange)
      };
    }
  );

  const periodLabel = `${format(parseISO(startDate), 'dd-MM-yyyy')}_${format(parseISO(endDate), 'dd-MM-yyyy')}`;
  const filename = orgUnitName
    ? `Laporan_Absensi_${sanitizeFilename(orgUnitName)}_${periodLabel}.xlsx`
    : `Laporan_Absensi_${periodLabel}.xlsx`;

  return {
    filename,
    sheets
  };
}

/**
 * Group employees by org unit
 */
function groupByOrgUnit(
  data: EmployeeAttendanceReport[]
): Record<string, EmployeeAttendanceReport[]> {
  return data.reduce((acc, employee) => {
    const key = employee.org_unit_id?.toString() || 'no-unit';
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(employee);
    return acc;
  }, {} as Record<string, EmployeeAttendanceReport[]>);
}

/**
 * Create sheet data untuk attendance report
 */
function createAttendanceSheetData(
  employees: EmployeeAttendanceReport[],
  dateRange: Date[]
): SheetData {
  // Group dates by month for better header structure
  interface MonthGroup {
    monthLabel: string;
    dates: Date[];
  }

  const monthGroups: MonthGroup[] = [];
  let currentMonth = '';
  let currentGroup: Date[] = [];

  dateRange.forEach((date, index) => {
    const monthLabel = format(date, 'MMMM yyyy', { locale: idLocale });

    if (monthLabel !== currentMonth) {
      // New month started
      if (currentGroup.length > 0) {
        monthGroups.push({
          monthLabel: currentMonth,
          dates: currentGroup
        });
      }
      currentMonth = monthLabel;
      currentGroup = [date];
    } else {
      currentGroup.push(date);
    }

    // Last group
    if (index === dateRange.length - 1) {
      monthGroups.push({
        monthLabel: currentMonth,
        dates: currentGroup
      });
    }
  });

  // Create headers
  // Row 1: Static columns (rowSpan=2) + Month headers (merged per month) + Total columns (rowSpan=2)
  // Row 2: Empty cells for static + Actual date numbers (1-31) + Empty cells for totals

  const staticColumns = [
    { value: 'No', colSpan: 1, rowSpan: 2 },
    { value: 'Nomor Pegawai', colSpan: 1, rowSpan: 2 },
    { value: 'Nama', colSpan: 1, rowSpan: 2 },
    { value: 'Jabatan', colSpan: 1, rowSpan: 2 }
  ];

  const totalColumns = [
    { value: 'Total Hadir', colSpan: 1, rowSpan: 2 },
    { value: 'Total Jam Kerja', colSpan: 1, rowSpan: 2 },
    { value: 'Total Overtime', colSpan: 1, rowSpan: 2 }
  ];

  const headers: HeaderRow[] = [
    {
      // Row 1: Static columns + Month headers (merged) + Total columns
      cells: [
        ...staticColumns,
        ...monthGroups.map(group => ({
          value: group.monthLabel,
          colSpan: group.dates.length,
          rowSpan: 1
        })),
        ...totalColumns
      ]
    },
    {
      // Row 2: Empty cells for merged static columns + Actual date numbers + Empty cells for merged totals
      cells: [
        // Empty cells untuk kolom static yang di-merge (No, Nomor Pegawai, Nama, Jabatan)
        { value: '', colSpan: 1, rowSpan: 1 },
        { value: '', colSpan: 1, rowSpan: 1 },
        { value: '', colSpan: 1, rowSpan: 1 },
        { value: '', colSpan: 1, rowSpan: 1 },
        // Actual date numbers (1-31) untuk setiap tanggal
        ...dateRange.map((date) => ({
          value: format(date, 'd'), // Actual date: 1, 2, 3, ..., 28, 29, 30, 31
          colSpan: 1,
          rowSpan: 1
        })),
        // Empty cells untuk kolom total yang di-merge (Total Hadir, Total Jam Kerja, Total Overtime)
        { value: '', colSpan: 1, rowSpan: 1 },
        { value: '', colSpan: 1, rowSpan: 1 },
        { value: '', colSpan: 1, rowSpan: 1 }
      ]
    }
  ];

  // Create data rows
  const rows: CellValue[][] = employees.map((employee, index) => {
    // Create attendance map by date
    const attendanceMap = new Map(
      employee.attendances.map(att => [att.attendance_date, att])
    );

    const row: CellValue[] = [
      index + 1, // No
      employee.employee_number || '-', // Nomor Pegawai
      employee.employee_name, // Nama
      employee.employee_position || '-' // Jabatan
    ];

    // Add attendance detail untuk setiap tanggal
    dateRange.forEach(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const attendance = attendanceMap.get(dateStr);

      if (attendance) {
        row.push(formatAttendanceCell(attendance));
      } else {
        // Jika tidak ada data dari backend
        const isSunday = date.getDay() === 0; // 0 = Sunday

        // Business Rule: Employee on_site kerja 7 hari (termasuk Sunday)
        // Employee lain kerja 6 hari (Senin-Sabtu, Sunday libur)
        if (isSunday && employee.employee_type === 'on_site') {
          // On_site tidak ada data di Sunday = tidak hadir (bukan libur)
          row.push('-');
        } else if (isWeekend(date)) {
          // Weekend untuk non-on_site employee atau Saturday untuk semua = libur
          row.push(formatWeekendCell());
        } else {
          // Hari kerja tapi tidak ada data (mungkin data belum diisi atau error)
          row.push('-');
        }
      }
    });

    // Add total present days
    row.push(employee.total_present_days);

    // Add total work hours
    if (employee.total_work_hours !== null && employee.total_work_hours !== undefined) {
      const hours = Math.floor(employee.total_work_hours);
      const minutes = Math.round((employee.total_work_hours - hours) * 60);
      if (hours > 0 && minutes > 0) {
        row.push(`${hours} jam ${minutes} menit`);
      } else if (hours > 0) {
        row.push(`${hours} jam`);
      } else if (minutes > 0) {
        row.push(`${minutes} menit`);
      } else {
        row.push('0 jam');
      }
    } else {
      row.push('-');
    }

    // Add total overtime hours
    if (employee.total_overtime_hours !== null && employee.total_overtime_hours !== undefined && employee.total_overtime_hours > 0) {
      const hours = Math.floor(employee.total_overtime_hours);
      const minutes = Math.round((employee.total_overtime_hours - hours) * 60);
      if (hours > 0 && minutes > 0) {
        row.push(`${hours} jam ${minutes} menit`);
      } else if (hours > 0) {
        row.push(`${hours} jam`);
      } else if (minutes > 0) {
        row.push(`${minutes} menit`);
      } else {
        row.push('0 jam');
      }
    } else {
      row.push('-');
    }

    return row;
  });

  // Calculate column widths
  const columnWidths = [
    5,  // No
    15, // Nomor Pegawai
    25, // Nama
    20, // Jabatan
    ...dateRange.map(() => 25), // Tanggal columns (wider for time format)
    15, // Total Hadir
    20, // Total Jam Kerja
    20  // Total Overtime
  ];

  return {
    headers,
    rows,
    columnWidths
  };
}

/**
 * Format weekend cell (hari libur)
 */
function formatWeekendCell(): StyledCell {
  return {
    value: 'Libur',
    style: {
      fill: {
        fgColor: { rgb: 'E0E0E0' } // Light gray
      },
    }
  };
}

/**
 * Format attendance cell dengan check-in, check-out, work hours dan styling berdasarkan status
 */
function formatAttendanceCell(attendance: {
  status: string;
  check_in_time: string | null;
  check_out_time: string | null;
  work_hours: number | null;
}): StyledCell {
  const { status, check_in_time, check_out_time, work_hours } = attendance;

  // Format check-in dan check-out time (HH:mm)
  const checkInFormatted = check_in_time
    ? format(new Date(check_in_time), 'HH:mm')
    : '';
  const checkOutFormatted = check_out_time
    ? format(new Date(check_out_time), 'HH:mm')
    : '';

  // Format work hours (x jam y menit)
  let workHoursFormatted = '';
  if (work_hours !== null && work_hours !== undefined) {
    const hours = Math.floor(work_hours);
    const minutes = Math.round((work_hours - hours) * 60);
    if (hours > 0 && minutes > 0) {
      workHoursFormatted = ` (${hours} jam ${minutes} menit)`;
    } else if (hours > 0) {
      workHoursFormatted = ` (${hours} jam)`;
    } else if (minutes > 0) {
      workHoursFormatted = ` (${minutes} menit)`;
    }
  }

  // Combine format: "09:12 - 17:22 (8 jam 10 menit)"
  let cellValue = '';
  if (status === 'present' || status === 'hybrid') {
    // Check langsung ke check_out_time untuk memastikan tidak ada checkout
    if (check_in_time && !check_out_time) {
      // Sudah check-in tapi belum check-out
      cellValue = `${checkInFormatted} (Belum Checkout)`;
    } else if (check_in_time && check_out_time) {
      // Sudah check-in dan check-out
      cellValue = `${checkInFormatted} - ${checkOutFormatted}${workHoursFormatted}`;
    } else if (checkInFormatted || checkOutFormatted) {
      // Fallback untuk kasus lainnya
      cellValue = `${checkInFormatted}${checkInFormatted && checkOutFormatted ? ' - ' : ''}${checkOutFormatted}${workHoursFormatted}`;
    }
  } else if (status === 'leave') {
    cellValue = 'Cuti';
  } else if (status === 'absent') {
    cellValue = 'Tidak Hadir';
  } else if (status === 'invalid') {
    cellValue = 'Invalid';
  }
  // Jika status lain atau tidak ada data, cellValue akan tetap kosong ('')

  return {
    value: cellValue,
    style: {
      fill: {
        fgColor: { rgb: getAttendanceStatusColor(status) }
      },
    }
  };
}

/**
 * Get background color untuk attendance status
 */
function getAttendanceStatusColor(status: string): string {
  const colors: Record<string, string> = {
    present: 'C6EFCE', // Light green
    absent: 'FFC7CE',  // Light red
    leave: 'FFF2CC',   // Light yellow
    hybrid: 'DAEEF3',  // Light blue
    invalid: 'F4CCCC'  // Light red/pink (similar to absent but distinguishable)
  };
  return colors[status] || 'FFFFFF';
}


/**
 * Format date untuk display (dd MMMM yyyy)
 */
function formatDateDisplay(date: Date): string {
  return format(date, 'dd MMMM yyyy', { locale: idLocale });
}

/**
 * Quick helper untuk generate dan download attendance report
 *
 * @param data - Array of EmployeeAttendanceReport
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @param orgUnitName - Optional org unit name
 *
 * @example
 * ```typescript
 * const reportData = await attendancesService.getAttendanceReport({
 *   org_unit_id: 1,
 *   start_date: '2025-11-01',
 *   end_date: '2025-11-30'
 * });
 *
 * await exportAttendanceReport(
 *   reportData.data,
 *   '2025-11-01',
 *   '2025-11-30',
 *   'HR Department'
 * );
 * ```
 */
export async function exportAttendanceReport(
  data: EmployeeAttendanceReport[],
  startDate: string,
  endDate: string,
  orgUnitName?: string
): Promise<void> {
  const config = generateAttendanceReportExcel(data, startDate, endDate, orgUnitName);
  const blob = await generateExcelFile(config);
  downloadBlob(blob, config.filename);
}
