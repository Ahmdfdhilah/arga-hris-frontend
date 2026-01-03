import { Calendar, Clock, Edit, MoreVertical, Trash2, User, Eye, CheckCircle, FileText } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/common';
import type { AttendanceListItem } from '@/services/attendances/types';
import {
  getAttendanceStatusLabel,
  getAttendanceStatusBadgeColor,
  formatAttendanceDate,
  formatAttendanceTime,
  formatWorkHours,
} from '@/services/attendances/utils';

interface AttendanceTableViewProps {
  attendances: AttendanceListItem[];
  onView?: (attendance: AttendanceListItem) => void;
  onEdit?: (attendance: AttendanceListItem) => void;
  onDelete?: (attendance: AttendanceListItem) => void;
  onMarkPresent?: (attendance: AttendanceListItem) => void;
  onMarkAsLeave?: (attendance: AttendanceListItem) => void;
  showUserInfo?: boolean;
}

export const AttendanceTableView: React.FC<AttendanceTableViewProps> = ({
  attendances,
  onView,
  onEdit,
  onDelete,
  onMarkPresent,
  onMarkAsLeave,
  showUserInfo = true,
}) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {showUserInfo && <TableHead>Employee</TableHead>}
            <TableHead>Tanggal</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Check In</TableHead>
            <TableHead className="w-[250px] min-w-[250px]">Lokasi Check In</TableHead>
            <TableHead>Check Out</TableHead>
            <TableHead className="w-[250px] min-w-[250px]">Lokasi Check Out</TableHead>
            <TableHead>Jam Kerja</TableHead>
            {(onView || onEdit || onDelete || onMarkPresent || onMarkAsLeave) && <TableHead className="w-[70px]"></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {attendances.map((attendance) => (
            <TableRow key={attendance.id}>
              {showUserInfo && (
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{attendance.employee_name || '-'}</div>
                      {attendance.employee_number && (
                        <div className="text-xs text-muted-foreground">
                          NIP: {attendance.employee_number}
                        </div>
                      )}
                      {attendance.org_unit_name && (
                        <div className="text-xs text-muted-foreground">
                          {attendance.org_unit_name}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
              )}

              <TableCell>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{formatAttendanceDate(attendance.attendance_date)}</span>
                </div>
              </TableCell>

              <TableCell>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getAttendanceStatusBadgeColor(
                    attendance.status,
                  )}`}
                >
                  {getAttendanceStatusLabel(attendance.status)}
                </span>
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{formatAttendanceTime(attendance.check_in_time)}</span>
                </div>
                {attendance.check_in_notes && (
                  <div className="mt-1 text-xs text-muted-foreground">
                    {attendance.check_in_notes}
                  </div>
                )}
              </TableCell>

              <TableCell>
                <div className="text-sm text-muted-foreground">
                  {attendance.check_in_location_name || '-'}
                </div>
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{formatAttendanceTime(attendance.check_out_time)}</span>
                </div>
                {attendance.check_out_notes && (
                  <div className="mt-1 text-xs text-muted-foreground">
                    {attendance.check_out_notes}
                  </div>
                )}
              </TableCell>

              <TableCell>
                <div className="text-sm text-muted-foreground">
                  {attendance.check_out_location_name || '-'}
                </div>
              </TableCell>

              <TableCell>
                <div className="text-sm">
                  {formatWorkHours(attendance.work_hours)}
                </div>
              </TableCell>

              {(onView || onEdit || onDelete || onMarkPresent || onMarkAsLeave) && (
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onView && (
                        <DropdownMenuItem onClick={() => onView(attendance)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Lihat Detail
                        </DropdownMenuItem>
                      )}
                      {onView && (onEdit || onDelete || onMarkPresent) && <DropdownMenuSeparator />}
                      {(onMarkPresent && attendance.status !== 'present') && (
                        <DropdownMenuItem onClick={() => onMarkPresent(attendance)}>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Tandai Hadir
                        </DropdownMenuItem>
                      )}
                      {onMarkPresent && (onEdit || onDelete || onMarkAsLeave) && <DropdownMenuSeparator />}
                      {(onMarkAsLeave && attendance.status !== 'leave') && (
                        <DropdownMenuItem onClick={() => onMarkAsLeave(attendance)}>
                          <FileText className="mr-2 h-4 w-4" />
                          Tandai sebagai Cuti
                        </DropdownMenuItem>
                      )}
                      {onMarkAsLeave && (onEdit || onDelete) && <DropdownMenuSeparator />}
                      {onEdit && (
                        <DropdownMenuItem onClick={() => onEdit(attendance)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      {onEdit && onDelete && <DropdownMenuSeparator />}
                      {onDelete && (
                        <DropdownMenuItem
                          onClick={() => onDelete(attendance)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Hapus
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
