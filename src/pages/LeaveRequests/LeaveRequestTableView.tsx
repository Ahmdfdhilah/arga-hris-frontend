import { Edit, MoreVertical, Trash2, Calendar, Users } from 'lucide-react';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/common';
import type { LeaveRequestWithEmployee } from '@/services/leave-requests/types';
import { getLeaveTypeLabel, formatLeaveRequestDateRange } from '@/services/leave-requests/utils';

interface LeaveRequestTableViewProps {
  leaveRequests: LeaveRequestWithEmployee[];
  onEdit?: (leaveRequest: LeaveRequestWithEmployee) => void;
  onDelete?: (leaveRequest: LeaveRequestWithEmployee) => void;
}

const LeaveRequestTableView: React.FC<LeaveRequestTableViewProps> = ({
  leaveRequests,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Karyawan</TableHead>
            <TableHead>Jenis Cuti</TableHead>
            <TableHead>Periode Cuti</TableHead>
            <TableHead className="text-center">Durasi</TableHead>
            <TableHead>Pengganti</TableHead>
            <TableHead>Alasan</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leaveRequests.map((leaveRequest) => (
            <TableRow key={leaveRequest.id}>
              <TableCell>
                <div className="space-y-1">
                  <p className="font-medium">{leaveRequest.employee_name || ''}</p>
                  <p className="text-sm text-muted-foreground">
                    {leaveRequest.employee_number || ''}
                  </p>
                </div>
              </TableCell>

              <TableCell>
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  {getLeaveTypeLabel(leaveRequest.leave_type)}
                </span>
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>
                    {formatLeaveRequestDateRange(
                      leaveRequest.start_date,
                      leaveRequest.end_date,
                    )}
                  </span>
                </div>
              </TableCell>

              <TableCell className="text-center">
                <span className="font-medium">{leaveRequest.total_days} hari</span>
              </TableCell>

              <TableCell>
                {leaveRequest.replacement ? (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{leaveRequest.replacement.employee_name}</p>
                      <p className="text-xs text-muted-foreground">{leaveRequest.replacement.employee_number}</p>
                    </div>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">-</span>
                )}
              </TableCell>

              <TableCell>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {leaveRequest.reason}
                </p>
              </TableCell>

              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default LeaveRequestTableView;
