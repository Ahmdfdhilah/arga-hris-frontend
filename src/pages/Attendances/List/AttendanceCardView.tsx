import { Calendar, Clock, Edit, MoreVertical, Trash2, User, Eye, CheckCircle, FileText } from 'lucide-react';
import {
  Item,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
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

interface AttendanceCardViewProps {
  attendance: AttendanceListItem;
  onView?: (attendance: AttendanceListItem) => void;
  onEdit?: (attendance: AttendanceListItem) => void;
  onDelete?: (attendance: AttendanceListItem) => void;
  onMarkPresent?: (attendance: AttendanceListItem) => void;
  onMarkAsLeave?: (attendance: AttendanceListItem) => void;
  showUserInfo?: boolean;
}

export const AttendanceCardView: React.FC<AttendanceCardViewProps> = ({
  attendance,
  onView,
  onEdit,
  onDelete,
  onMarkPresent,
  onMarkAsLeave,
  showUserInfo = true,
}) => {
  return (
    <Item variant="outline" className="mt-3">
      <ItemMedia className="hidden sm:flex shrink-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Calendar className="h-5 w-5 text-primary" />
        </div>
      </ItemMedia>

      <ItemContent className="gap-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <ItemTitle className="truncate">{formatAttendanceDate(attendance.attendance_date)}</ItemTitle>
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium shrink-0 ${getAttendanceStatusBadgeColor(
              attendance.status,
            )}`}
          >
            {getAttendanceStatusLabel(attendance.status)}
          </span>
        </div>

        <ItemDescription className="space-y-1">
          {showUserInfo && (
            <div className="flex items-start gap-2 text-sm">
              <User className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <div className="truncate">{attendance.employee_name || '-'}</div>
                {attendance.employee_number && (
                  <div className="text-xs text-muted-foreground truncate">
                    NIP: {attendance.employee_number}
                  </div>
                )}
                {attendance.org_unit_name && (
                  <div className="text-xs text-muted-foreground truncate">
                    {attendance.org_unit_name}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex items-start gap-2 text-sm">
            <Clock className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span className="flex-1 break-words">
              <span className="block sm:inline">Masuk: {formatAttendanceTime(attendance.check_in_time)}</span>
              <span className="hidden sm:inline"> | </span>
              <span className="block sm:inline">Keluar: {formatAttendanceTime(attendance.check_out_time)}</span>
            </span>
          </div>

          {attendance.check_in_location_name && (
            <div className="text-sm">
              <span className="text-muted-foreground">Lokasi Check In:</span>{' '}
              {attendance.check_in_location_name}
            </div>
          )}

          {attendance.check_out_location_name && (
            <div className="text-sm">
              <span className="text-muted-foreground">Lokasi Check Out:</span>{' '}
              {attendance.check_out_location_name}
            </div>
          )}

          {attendance.work_hours !== null && attendance.work_hours !== undefined && (
            <div className="text-sm">
              <span className="text-muted-foreground">Jam Kerja:</span>{' '}
              {formatWorkHours(attendance.work_hours)}
            </div>
          )}

          {attendance.check_in_notes && (
            <div className="text-xs">
              <span className="text-muted-foreground">Note Masuk:</span>{' '}
              <span className="break-words">{attendance.check_in_notes}</span>
            </div>
          )}

          {attendance.check_out_notes && (
            <div className="text-xs">
              <span className="text-muted-foreground">Note Keluar:</span>{' '}
              <span className="break-words">{attendance.check_out_notes}</span>
            </div>
          )}
        </ItemDescription>

      </ItemContent>

      {(onView || onEdit || onDelete || onMarkPresent || onMarkAsLeave) && (
        <ItemActions>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
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
        </ItemActions>
      )}
    </Item>
  );
};
