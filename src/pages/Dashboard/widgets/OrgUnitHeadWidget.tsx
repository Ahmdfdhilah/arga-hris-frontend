/**
 * Org Unit Head Widget - Team metrics
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common';
import type { OrgUnitHeadWidget as OrgUnitHeadWidgetType } from '@/services/dashboard/types';
import { Users, UserCheck, UserX, Calendar, FileText, TrendingUp } from 'lucide-react';

interface OrgUnitHeadWidgetProps {
  data: OrgUnitHeadWidgetType;
}

export const OrgUnitHeadWidget: React.FC<OrgUnitHeadWidgetProps> = ({ data }) => {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">{data.title}</CardTitle>
        <p className="text-sm text-gray-600">{data.org_unit_name}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Team Size */}
        <div className="bg-primary/10 rounded-lg p-4 text-center">
          <Users className="w-6 h-6 text-primary mx-auto mb-2" />
          <p className="text-xs text-gray-700 mb-1">Anggota Tim</p>
          <p className="text-3xl font-bold text-primary">{data.team_size}</p>
        </div>

        {/* Team Attendance Today */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium">Kehadiran Tim Hari Ini</span>
            </div>
            <span className="text-lg font-bold text-primary">
              {data.team_attendance_percentage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${Math.min(data.team_attendance_percentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Team Status Today */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <UserCheck className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <p className="text-xs text-green-800 mb-1">Hadir</p>
            <p className="text-xl font-bold text-green-900">{data.team_present_today}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <Calendar className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <p className="text-xs text-blue-800 mb-1">Cuti</p>
            <p className="text-xl font-bold text-blue-900">{data.team_on_leave_today}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-3 text-center">
            <UserX className="w-5 h-5 text-red-600 mx-auto mb-1" />
            <p className="text-xs text-red-800 mb-1">Absen</p>
            <p className="text-xl font-bold text-red-900">{data.team_absent_today}</p>
          </div>
        </div>

        {/* Pending Approvals */}
        {(data.team_pending_leave_requests > 0 || data.team_pending_work_submissions > 0) && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <h4 className="text-sm font-semibold text-amber-900 mb-2">Pending Approval</h4>
            <div className="space-y-2">
              {data.team_pending_leave_requests > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    <span className="text-sm text-amber-800">Cuti Tim</span>
                  </div>
                  <span className="text-lg font-bold text-amber-900">
                    {data.team_pending_leave_requests}
                  </span>
                </div>
              )}
              {data.team_pending_work_submissions > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-600" />
                    <span className="text-sm text-amber-800">Laporan Kerja</span>
                  </div>
                  <span className="text-lg font-bold text-amber-900">
                    {data.team_pending_work_submissions}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Monthly Average */}
        {data.monthly_team_attendance_avg > 0 && (
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-700 mb-1">Rata-rata Kehadiran Bulan Ini</p>
            <p className="text-2xl font-bold text-gray-900">
              {data.monthly_team_attendance_avg.toFixed(1)}%
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
