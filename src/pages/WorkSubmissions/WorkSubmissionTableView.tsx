import React from 'react';
import { Eye, FileText, MoreVertical } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
  Badge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/common';
import type { WorkSubmission, WorkSubmissionListItem } from '@/services/work-submissions/types';
import {
  formatSubmissionMonth,
  formatSubmissionDateTime,
  getSubmissionStatusLabel,
  getSubmissionStatusBadgeColor,
} from '@/services/work-submissions/utils';

interface WorkSubmissionTableViewProps {
  submissions: WorkSubmission[] | WorkSubmissionListItem[];
  onView: (submission: WorkSubmission | WorkSubmissionListItem) => void;
  showUserInfo?: boolean;
}

export const WorkSubmissionTableView: React.FC<WorkSubmissionTableViewProps> = ({
  submissions,
  onView,
  showUserInfo = false,
}) => {
  const isListItem = (item: any): item is WorkSubmissionListItem => {
    return 'employee_name' in item;
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {showUserInfo && (
              <>
                <TableHead>NIP</TableHead>
                <TableHead>Nama Karyawan</TableHead>
              </>
            )}
            <TableHead>Judul</TableHead>
            <TableHead>Bulan Pengumpulan</TableHead>
            <TableHead>Jumlah File</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Tanggal Submit</TableHead>
            <TableHead>Tanggal Dibuat</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.map((submission) => {
            const filesCount = isListItem(submission)
              ? submission.files_count
              : submission.files.length;

            return (
              <TableRow key={submission.id}>
                {showUserInfo && isListItem(submission) && (
                  <>
                    <TableCell className="font-mono text-sm">
                      {submission.employee_number || '-'}
                    </TableCell>
                    <TableCell className="font-medium">
                      {submission.employee_name || '-'}
                    </TableCell>
                  </>
                )}
                <TableCell className="font-medium">{submission.title}</TableCell>
                <TableCell>{formatSubmissionMonth(submission.submission_month)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>{filesCount} file</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={getSubmissionStatusBadgeColor(submission.status)}
                  >
                    {getSubmissionStatusLabel(submission.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatSubmissionDateTime(submission.submitted_at)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatSubmissionDateTime(submission.created_at)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView(submission)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Lihat Detail
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
