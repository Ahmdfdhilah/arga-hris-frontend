import React from 'react';
import { Calendar, FileText, Download, User, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Badge,
  Button,
  Spinner,
  Alert,
  AlertDescription,
} from '@/components/common';
import type { WorkSubmission, WorkSubmissionListItem } from '@/services/work-submissions/types';
import { useWorkSubmission } from '@/hooks/tanstackHooks/useWorkSubmissions';
import {
  formatSubmissionMonth,
  formatSubmissionDateTime,
  formatFileSize,
  getSubmissionStatusLabel,
  getSubmissionStatusBadgeColor,
} from '@/services/work-submissions/utils';

interface WorkSubmissionDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submission: WorkSubmission | WorkSubmissionListItem | null;
}

export const WorkSubmissionDetailDialog: React.FC<WorkSubmissionDetailDialogProps> = ({
  open,
  onOpenChange,
  submission,
}) => {
  const { data, isLoading, error } = useWorkSubmission(submission?.id || null);

  const detailData = data?.data;

  const isListItem = (item: any): item is WorkSubmissionListItem => {
    return item && 'employee_name' in item;
  };

  const handleDownloadFile = (fileUrl: string) => {
    window.open(fileUrl, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Work Submission</DialogTitle>
          <DialogDescription>
            Informasi lengkap work submission
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Spinner className="h-8 w-8" />
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>
              {error instanceof Error ? error.message : 'Gagal memuat detail submission'}
            </AlertDescription>
          </Alert>
        )}

        {detailData && (
          <div className="space-y-6">
            {/* Header Info */}
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold">{detailData.title}</h3>
                  {submission && isListItem(submission) && (
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>{submission.employee_name || '-'}</span>
                      {submission.employee_number && (
                        <span className="font-mono">({submission.employee_number})</span>
                      )}
                    </div>
                  )}
                </div>
                <Badge
                  variant="outline"
                  className={getSubmissionStatusBadgeColor(detailData.status)}
                >
                  {getSubmissionStatusLabel(detailData.status)}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <div>
                    <div className="font-medium text-foreground">Bulan Pengumpulan</div>
                    <div>{formatSubmissionMonth(detailData.submission_month)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <div>
                    <div className="font-medium text-foreground">Tanggal Submit</div>
                    <div>
                      {detailData.submitted_at
                        ? formatSubmissionDateTime(detailData.submitted_at)
                        : 'Belum disubmit'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {detailData.description && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Deskripsi</h4>
                <div className="text-sm text-muted-foreground rounded-lg border p-4 bg-muted/30">
                  {detailData.description}
                </div>
              </div>
            )}

            {/* Files */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <h4 className="font-medium text-sm">
                  File Lampiran ({detailData.files.length})
                </h4>
              </div>

              {detailData.files.length === 0 ? (
                <Alert>
                  <AlertDescription>Belum ada file yang diupload</AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-2">
                  {detailData.files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {file.file_name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatFileSize(file.file_size)} • {file.file_type}
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDownloadFile(file?.file_url ?? '')}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Meta Info */}
            <div className="pt-4 border-t text-xs text-muted-foreground space-y-1">
              <div>Dibuat: {formatSubmissionDateTime(detailData.created_at)}</div>
              <div>Terakhir diupdate: {formatSubmissionDateTime(detailData.updated_at)}</div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
