/**
 * HR Admin Widget - Company-wide statistics
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common';
import type { HRAdminWidget as HRAdminWidgetType } from '@/services/dashboard/types';
import { Users, UserCheck, UserX, FileText, CalendarCheck } from 'lucide-react';

interface HRAdminWidgetProps {
  data: HRAdminWidgetType;
}

export const HRAdminWidget: React.FC<HRAdminWidgetProps> = ({ data }) => {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">{data.title}</CardTitle>
        <p className="text-sm text-gray-600">Ringkasan HR & Administrasi</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Employee Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <Users className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <p className="text-xs text-blue-800 mb-1">Karyawan Aktif</p>
            <p className="text-2xl font-bold text-blue-900">{data.total_active_employees}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <UserX className="w-5 h-5 text-gray-600 mx-auto mb-1" />
            <p className="text-xs text-gray-700 mb-1">Tidak Aktif</p>
            <p className="text-2xl font-bold text-gray-900">{data.total_inactive_employees}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <UserCheck className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <p className="text-xs text-green-800 mb-1">Baru Bulan Ini</p>
            <p className="text-2xl font-bold text-green-900">{data.new_employees_this_month}</p>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-amber-900 mb-3">Menunggu Approval</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-600" />
                <span className="text-sm text-amber-800">Pengajuan Cuti</span>
              </div>
              <span className="text-lg font-bold text-amber-900">{data.pending_leave_approvals}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-amber-600" />
                <span className="text-sm text-amber-800">Koreksi Absensi</span>
              </div>
              <span className="text-lg font-bold text-amber-900">{data.pending_attendance_corrections}</span>
            </div>
          </div>
        </div>

        {/* Today's Snapshot */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Snapshot Hari Ini</h4>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-green-50 rounded p-2 text-center">
              <p className="text-xs text-green-700 mb-1">Hadir</p>
              <p className="text-xl font-bold text-green-900">{data.employees_present_today}</p>
            </div>
            <div className="bg-blue-50 rounded p-2 text-center">
              <p className="text-xs text-blue-700 mb-1">Cuti</p>
              <p className="text-xl font-bold text-blue-900">{data.employees_on_leave_today}</p>
            </div>
            <div className="bg-red-50 rounded p-2 text-center">
              <p className="text-xs text-red-700 mb-1">Tidak Hadir</p>
              <p className="text-xl font-bold text-red-900">{data.employees_absent_today}</p>
            </div>
          </div>
        </div>

        {data.pending_payroll_processing > 0 && (
          <div className="bg-purple-50 rounded-lg p-3 text-center">
            <p className="text-xs text-purple-800 mb-1">Payroll Pending</p>
            <p className="text-2xl font-bold text-purple-900">{data.pending_payroll_processing}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
