/**
 * Employee Widget - Personal attendance and leave summary
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common';
import type { EmployeeWidget as EmployeeWidgetType } from '@/services/dashboard/types';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Clock, Calendar, TrendingUp } from 'lucide-react';

interface EmployeeWidgetProps {
  data: EmployeeWidgetType;
}

export const EmployeeWidget: React.FC<EmployeeWidgetProps> = ({ data }) => {
  const formatTime = (timeString?: string) => {
    if (!timeString) return '-';
    try {
      return format(new Date(timeString), 'HH:mm', { locale: idLocale });
    } catch {
      return '-';
    }
  };

  const getStatusBadge = (status?: string) => {
    const statusColors: Record<string, string> = {
      present: 'bg-green-100 text-green-800',
      late: 'bg-yellow-100 text-yellow-800',
      absent: 'bg-red-100 text-red-800',
      leave: 'bg-blue-100 text-blue-800',
    };

    const statusLabels: Record<string, string> = {
      present: 'Hadir',
      late: 'Terlambat',
      absent: 'Tidak Hadir',
      leave: 'Cuti',
    };

    const colorClass = statusColors[status || ''] || 'bg-gray-100 text-gray-800';
    const label = statusLabels[status || ''] || 'Belum Absen';

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
        {label}
      </span>
    );
  };

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">{data.title}</CardTitle>
        <p className="text-sm text-gray-600">{data.employee_name}</p>
        {data.employee_number && (
          <p className="text-xs text-gray-500">NIP: {data.employee_number}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Attendance Today */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium">Absensi Hari Ini</span>
            </div>
            {getStatusBadge(data.attendance_today.status)}
          </div>

          {data.attendance_today.has_checked_in ? (
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-gray-600">Check In</p>
                <p className="font-semibold">{formatTime(data.attendance_today.check_in_time)}</p>
              </div>
              <div>
                <p className="text-gray-600">Check Out</p>
                <p className="font-semibold">{formatTime(data.attendance_today.check_out_time)}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Belum melakukan check-in</p>
          )}
        </div>

        {/* Monthly Attendance */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium">Kehadiran Bulan Ini</span>
            </div>
            <span className="text-lg font-bold text-primary">
              {data.monthly_attendance_percentage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${Math.min(data.monthly_attendance_percentage, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-600">
            {data.total_present_days} dari {data.total_work_days} hari kerja
          </p>
        </div>

        {/* Leave Requests */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-amber-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-amber-600" />
              <span className="text-xs text-amber-800">Cuti Pending</span>
            </div>
            <p className="text-2xl font-bold text-amber-900">{data.pending_leave_requests}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-green-600" />
              <span className="text-xs text-green-800">Cuti Approved</span>
            </div>
            <p className="text-2xl font-bold text-green-900">{data.approved_leave_requests}</p>
          </div>
        </div>

        {data.remaining_leave_quota !== null && data.remaining_leave_quota !== undefined && (
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <p className="text-xs text-blue-800 mb-1">Sisa Kuota Cuti</p>
            <p className="text-2xl font-bold text-blue-900">{data.remaining_leave_quota} hari</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
