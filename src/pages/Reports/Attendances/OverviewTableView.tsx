import { User, Building2, Briefcase } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/common';
import { AttendanceStatus, type EmployeeAttendanceOverview } from '@/services/attendances/types';
import {  getAttendanceStatusBadgeColor } from '@/services/attendances/utils';

interface OverviewTableViewProps {
  data: EmployeeAttendanceOverview[];
}

export const OverviewTableView: React.FC<OverviewTableViewProps> = ({ data }) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama</TableHead>
            <TableHead>Nomor Karyawan</TableHead>
            <TableHead>Jabatan</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead className="text-center">Hadir</TableHead>
            <TableHead className="text-center">Absent</TableHead>
            <TableHead className="text-center">Cuti</TableHead>
            <TableHead className="text-center">Hybrid</TableHead>
            <TableHead className="text-center">Total Jam Kerja</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((employee) => (
            <TableRow key={employee.employee_id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{employee.employee_name}</span>
                </div>
              </TableCell>

              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {employee.employee_number || '-'}
                </span>
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-1 text-sm">
                  <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{employee.employee_position || '-'}</span>
                </div>
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="h-3.5 w-3.5" />
                  <span>{employee.org_unit_name || '-'}</span>
                </div>
              </TableCell>

              <TableCell className="text-center">
                <span className={`inline-flex items-center justify-center rounded-md px-2 py-1 text-xs font-medium ${getAttendanceStatusBadgeColor(AttendanceStatus.PRESENT)}`}>
                  {employee.total_present}
                </span>
              </TableCell>

              <TableCell className="text-center">
                <span className={`inline-flex items-center justify-center rounded-md px-2 py-1 text-xs font-medium ${getAttendanceStatusBadgeColor(AttendanceStatus.ABSENT)}`}>
                  {employee.total_absent}
                </span>
              </TableCell>

              <TableCell className="text-center">
                <span className={`inline-flex items-center justify-center rounded-md px-2 py-1 text-xs font-medium ${getAttendanceStatusBadgeColor(AttendanceStatus.LEAVE)}`}>
                  {employee.total_leave}
                </span>
              </TableCell>

              <TableCell className="text-center">
                <span className={`inline-flex items-center justify-center rounded-md px-2 py-1 text-xs font-medium ${getAttendanceStatusBadgeColor(AttendanceStatus.HYBRID)}`}>
                  {employee.total_hybrid}
                </span>
              </TableCell>

              <TableCell className="text-center font-medium">
                {employee.total_work_hours ? Number(employee.total_work_hours).toFixed(2) : '0.00'} jam
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
