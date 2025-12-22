import { Edit, MoreVertical, Trash2, Calendar, User, FileText, Users } from 'lucide-react';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Item,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
  ItemFooter,
} from '@/components/common';
import type { LeaveRequestWithEmployee } from '@/services/leave-requests/types';
import { getLeaveTypeLabel, formatLeaveRequestDateRange } from '@/services/leave-requests/utils';

interface LeaveRequestCardViewProps {
  leaveRequest: LeaveRequestWithEmployee;
  onEdit?: (leaveRequest: LeaveRequestWithEmployee) => void;
  onDelete?: (leaveRequest: LeaveRequestWithEmployee) => void;
}

const LeaveRequestCardView: React.FC<LeaveRequestCardViewProps> = ({
  leaveRequest,
  onEdit,
  onDelete,
}) => {
  return (
    <Item variant="outline" className="mt-3">
      <ItemContent className="gap-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <ItemTitle className="truncate">{leaveRequest.employee_name || '-'}</ItemTitle>
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary shrink-0">
            {getLeaveTypeLabel(leaveRequest.leave_type)}
          </span>
        </div>

        <ItemDescription className="space-y-1.5">
          <div className="flex items-start gap-2 text-sm">
            <User className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span className="break-words flex-1 min-w-0">NIP: {leaveRequest.employee_number || '-'}</span>
          </div>

          <div className="flex items-start gap-2 text-sm">
            <Calendar className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span className="break-words flex-1 min-w-0">
              {formatLeaveRequestDateRange(
                leaveRequest.start_date,
                leaveRequest.end_date,
              )}
            </span>
          </div>

          <div className="flex items-start gap-2 text-sm">
            <FileText className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span className="line-clamp-2 flex-1 min-w-0">{leaveRequest.reason}</span>
          </div>

          {leaveRequest.replacement && (
            <div className="flex items-start gap-2 text-sm">
              <Users className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span className="break-words flex-1 min-w-0">
                Pengganti: {leaveRequest.replacement.employee_name} ({leaveRequest.replacement.employee_number})
              </span>
            </div>
          )}
        </ItemDescription>

        <ItemFooter>
          <div className="text-xs text-muted-foreground">
            Durasi:{' '}
            <span className="font-medium text-foreground">
              {leaveRequest.total_days} hari
            </span>
          </div>
        </ItemFooter>
      </ItemContent>

      <ItemActions>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(leaveRequest)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem
                onClick={() => onDelete(leaveRequest)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </ItemActions>
    </Item>
  );
};

export default LeaveRequestCardView;
