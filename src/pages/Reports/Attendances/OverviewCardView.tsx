import { User, Building2, Briefcase } from 'lucide-react';
import {
  Item,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemFooter,
} from '@/components/common';
import { AttendanceStatus, type EmployeeAttendanceOverview } from '@/services/attendances/types';
import {  getAttendanceStatusTextColor } from '@/services/attendances/utils';

interface OverviewCardViewProps {
  employee: EmployeeAttendanceOverview;
}

export const OverviewCardView: React.FC<OverviewCardViewProps> = ({ employee }) => {
  return (
    <Item variant="outline" className="mt-3">
      <ItemMedia className="hidden sm:flex shrink-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <User className="h-5 w-5 text-primary" />
        </div>
      </ItemMedia>

      <ItemContent className="gap-1 min-w-0">
        <ItemTitle className="truncate">{employee.employee_name}</ItemTitle>

        <ItemDescription className="space-y-1">
          {employee.employee_number && (
            <div className="text-sm text-muted-foreground">
              NIP: {employee.employee_number}
            </div>
          )}

          {employee.employee_position && (
            <div className="flex items-start gap-1 text-sm text-muted-foreground">
              <Briefcase className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span className="break-words flex-1 min-w-0">{employee.employee_position}</span>
            </div>
          )}

          {employee.org_unit_name && (
            <div className="flex items-start gap-1 text-sm text-muted-foreground">
              <Building2 className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span className="truncate flex-1 min-w-0">{employee.org_unit_name}</span>
            </div>
          )}

          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
            <div className="min-w-0">
              <span className="text-muted-foreground">Hadir:</span>{' '}
              <span className={`font-medium ${getAttendanceStatusTextColor(AttendanceStatus.PRESENT)}`}>{employee.total_present}</span>
            </div>
            <div className="min-w-0">
              <span className="text-muted-foreground">Absent:</span>{' '}
              <span className={`font-medium ${getAttendanceStatusTextColor(AttendanceStatus.ABSENT)}`}>{employee.total_absent}</span>
            </div>
            <div className="min-w-0">
              <span className="text-muted-foreground">Cuti:</span>{' '}
              <span className={`font-medium ${getAttendanceStatusTextColor(AttendanceStatus.LEAVE)}`}>{employee.total_leave}</span>
            </div>
            <div className="min-w-0">
              <span className="text-muted-foreground">Hybrid:</span>{' '}
              <span className={`font-medium ${getAttendanceStatusTextColor(AttendanceStatus.HYBRID)}`}>{employee.total_hybrid}</span>
            </div>
          </div>
        </ItemDescription>

        <ItemFooter>
          <div className="text-xs text-muted-foreground">
            Total Jam Kerja: {employee.total_work_hours ? Number(employee.total_work_hours).toFixed(2) : '0.00'} jam
          </div>
        </ItemFooter>
      </ItemContent>
    </Item>
  );
};
