export enum LeaveType {
  LEAVE = 'leave',
  HOLIDAY = 'holiday',
}

export const LEAVE_TYPE_OPTIONS = [
  { value: LeaveType.LEAVE, label: 'Cuti' },
  { value: LeaveType.HOLIDAY, label: 'Libur' },
];

export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  [LeaveType.LEAVE]: 'Cuti',
  [LeaveType.HOLIDAY]: 'Libur',
};
