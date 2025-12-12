import type { LeaveRequest, LeaveType } from './types';
import { LEAVE_TYPE_LABELS } from './types';

export function getLeaveTypeLabel(leaveType: LeaveType): string {
  return LEAVE_TYPE_LABELS[leaveType] || leaveType;
}

export function formatLeaveRequestDateRange(
  startDate: string,
  endDate: string,
): string {
  const start = new Date(startDate).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const end = new Date(endDate).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  return `${start} - ${end}`;
}

export function calculateLeaveDuration(
  startDate: string,
  endDate: string,
): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
}

export function validateLeaveRequestDates(
  startDate: string,
  endDate: string,
): { valid: boolean; error?: string } {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end < start) {
    return {
      valid: false,
      error: 'Tanggal akhir harus lebih besar atau sama dengan tanggal mulai',
    };
  }

  return { valid: true };
}

export function formatLeaveRequestSummary(
  leaveRequest: LeaveRequest,
): string {
  const leaveTypeLabel = getLeaveTypeLabel(leaveRequest.leave_type);
  const dateRange = formatLeaveRequestDateRange(
    leaveRequest.start_date,
    leaveRequest.end_date,
  );
  return `${leaveTypeLabel} - ${dateRange} (${leaveRequest.total_days} hari)`;
}
