import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Button,
  Field,
  FieldLabel,
  FieldContent,
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  Textarea,
} from '@/components/common';
import { Calendar } from 'lucide-react';
import { useBulkMarkPresent } from '@/hooks/tanstackHooks/useAttendances';
import type { BulkMarkPresentRequest } from '@/services/attendances/types';

interface BulkMarkPresentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BulkMarkPresentDialog: React.FC<BulkMarkPresentDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [attendanceDate, setAttendanceDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState<string>('');

  const bulkMarkPresentMutation = useBulkMarkPresent({
    onSuccess: () => {
      handleClose();
    },
  });

  const handleClose = () => {
    setAttendanceDate(format(new Date(), 'yyyy-MM-dd'));
    setNotes('');
    onOpenChange(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const request: BulkMarkPresentRequest = {
      attendance_date: attendanceDate,
      notes: notes || undefined,
    };

    bulkMarkPresentMutation.mutate(request);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Tandai Hadir Semua Pegawai</DialogTitle>
          <DialogDescription>
            Tandai semua pegawai sebagai hadir pada tanggal tertentu. Contoh: Libur nasional, libur mendadak, atau event khusus.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field>
            <FieldLabel>Tanggal Kehadiran <span className='text-destructive'>*</span></FieldLabel>
            <FieldContent>
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </InputGroupAddon>
                <InputGroupInput
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  max={format(new Date(), 'yyyy-MM-dd')}
                  required
                />
              </InputGroup>
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel>Catatan</FieldLabel>
            <FieldContent>
              <InputGroup>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Libur Nasional - Hari Kemerdekaan"
                  rows={3}
                  className="border-0 shadow-none focus:ring-0"
                />
              </InputGroup>
            </FieldContent>
          </Field>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={bulkMarkPresentMutation.isPending}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={bulkMarkPresentMutation.isPending}
            >
              {bulkMarkPresentMutation.isPending ? 'Memproses...' : 'Ubah'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
