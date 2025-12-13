import React from 'react';
import { Calendar, FileText, Eye, User, MoreVertical } from 'lucide-react';
import {
  Button,
  Badge,
  Item,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
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

interface WorkSubmissionCardViewProps {
  submission: WorkSubmission | WorkSubmissionListItem;
  onView: (submission: WorkSubmission | WorkSubmissionListItem) => void;
  showUserInfo?: boolean;
}

export const WorkSubmissionCardView: React.FC<WorkSubmissionCardViewProps> = ({
  submission,
  onView,
  showUserInfo = false,
}) => {
  const isListItem = (item: any): item is WorkSubmissionListItem => {
    return 'employee_name' in item;
  };

  const filesCount = isListItem(submission)
    ? submission.files_count
    : submission.files.length;

  return (
    <Item variant="outline" className="mt-3">
      <ItemContent className="gap-1 min-w-0">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <ItemTitle className="truncate">{submission.title}</ItemTitle>
          <Badge
            variant="outline"
            className={`${getSubmissionStatusBadgeColor(submission.status)} shrink-0`}
          >
            {getSubmissionStatusLabel(submission.status)}
          </Badge>
        </div>

        <ItemDescription className="space-y-1">
          {showUserInfo && isListItem(submission) && (
            <div className="flex items-start gap-2 text-sm">
              <User className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <div className="truncate">{submission.employee_name || '-'}</div>
                {submission.employee_number && (
                  <div className="text-xs text-muted-foreground truncate">
                    NIP: {submission.employee_number}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex items-start gap-2 text-sm">
            <Calendar className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span className="text-muted-foreground">
              Bulan: {formatSubmissionMonth(submission.submission_month)}
            </span>
          </div>

          <div className="flex items-start gap-2 text-sm">
            <FileText className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span className="text-muted-foreground">{filesCount} file</span>
          </div>

          {submission.submitted_at && (
            <div className="text-xs text-muted-foreground">
              Submit: {formatSubmissionDateTime(submission.submitted_at)}
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            Dibuat: {formatSubmissionDateTime(submission.created_at)}
          </div>
        </ItemDescription>
      </ItemContent>

      <ItemActions>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
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
      </ItemActions>
    </Item>
  );
};
