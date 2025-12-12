export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LEAVE = 'leave',
  HYBRID = 'hybrid',
  INVALID = 'invalid',
}

export const ATTENDANCE_STATUS_OPTIONS = [
  { value: AttendanceStatus.PRESENT, label: 'Hadir' },
  { value: AttendanceStatus.ABSENT, label: 'Tidak Hadir' },
  { value: AttendanceStatus.LEAVE, label: 'Cuti' },
  { value: AttendanceStatus.HYBRID, label: 'Hybrid' },
  { value: AttendanceStatus.INVALID, label: 'Invalid' },
] as const;

export enum AttendanceFilterType {
  TODAY = 'today',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

export const ATTENDANCE_FILTER_TYPE_OPTIONS = [
  { value: AttendanceFilterType.TODAY, label: 'Hari Ini' },
  { value: AttendanceFilterType.WEEKLY, label: 'Minggu Ini' },
  { value: AttendanceFilterType.MONTHLY, label: 'Bulan Ini' },
] as const;
