import React from 'react';
import { Clock, Calendar, User, FileText, Camera, Timer, MapPin } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  formatAttendanceTime,
  formatAttendanceDate,
} from '@/services/attendances/utils';
import type { AttendanceListItem } from '@/services/attendances/types';

interface AttendanceDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attendance: AttendanceListItem | null;
}

export const AttendanceDetailDialog: React.FC<AttendanceDetailDialogProps> = ({
  open,
  onOpenChange,
  attendance,
}) => {
  if (!attendance) return null;

  const hasCheckIn = !!attendance.check_in_time;
  const hasCheckOut = !!attendance.check_out_time;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="flex max-h-[90vh] w-[95%] flex-col sm:max-w-5xl"
        style={{ maxWidth: '80rem' }}
      >
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Detail Attendance</DialogTitle>
          <DialogDescription>
            Informasi lengkap attendance pada tanggal{' '}
            {formatAttendanceDate(attendance.attendance_date)}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground">Tanggal</div>
                  <div className="text-sm font-medium">
                    {formatAttendanceDate(attendance.attendance_date)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground">Status</div>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      attendance.status === 'present'
                        ? 'bg-primary/10 text-primary'
                        : attendance.status === 'absent'
                          ? 'bg-destructive/10 text-destructive'
                          : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {attendance.status === 'present'
                      ? 'Hadir'
                      : attendance.status === 'absent'
                        ? 'Tidak Hadir'
                        : 'Cuti'}
                  </span>
                </div>
              </div>

              {attendance.work_hours && (
                <div className="flex items-center gap-2 col-span-2">
                  <Timer className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">Total Jam Kerja</div>
                    <div className="text-sm font-medium">
                      {attendance.work_hours} jam
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            <div className="grid gap-6 lg:grid-cols-2">
              {hasCheckIn && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Check In
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">
                          Waktu Check In
                        </div>
                        <div className="text-sm font-medium">
                          {formatAttendanceTime(attendance.check_in_time)}
                        </div>
                      </div>

                      {attendance.check_in_submitted_at && (
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">
                            Waktu Submit
                          </div>
                          <div className="text-sm font-medium">
                            {formatAttendanceTime(attendance.check_in_submitted_at)}
                          </div>
                        </div>
                      )}

                      {attendance.check_in_submitted_ip && (
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">IP Address</div>
                          <div className="text-sm font-medium">
                            {attendance.check_in_submitted_ip}
                          </div>
                        </div>
                      )}

                      {attendance.check_in_location_name && (
                        <div>
                          <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            Lokasi
                          </div>
                          <div className="text-sm font-medium">
                            {attendance.check_in_location_name}
                          </div>
                        </div>
                      )}

                      {attendance.check_in_notes && (
                        <div>
                          <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            Catatan
                          </div>
                          <div className="text-sm">{attendance.check_in_notes}</div>
                        </div>
                      )}

                      {attendance.check_in_selfie_url ? (
                        <div>
                          <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                            <Camera className="h-3 w-3" />
                            Foto Selfie
                          </div>
                          <div className="rounded-lg border p-2 bg-muted/30">
                            <img
                              src={attendance.check_in_selfie_url}
                              alt="Check In Selfie"
                              className="w-full rounded-md object-contain bg-black max-h-[300px]"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EGambar tidak tersedia%3C/text%3E%3C/svg%3E';
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                            <Camera className="h-3 w-3" />
                            Foto Selfie
                          </div>
                          <div className="rounded-lg border p-4 text-center text-sm text-muted-foreground bg-muted/30">
                            Tidak ada foto selfie
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {hasCheckOut && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Check Out
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">
                          Waktu Check Out
                        </div>
                        <div className="text-sm font-medium">
                          {formatAttendanceTime(attendance.check_out_time)}
                        </div>
                      </div>

                      {attendance.check_out_submitted_at && (
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">
                            Waktu Submit
                          </div>
                          <div className="text-sm font-medium">
                            {formatAttendanceTime(attendance.check_out_submitted_at)}
                          </div>
                        </div>
                      )}

                      {attendance.check_out_submitted_ip && (
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">IP Address</div>
                          <div className="text-sm font-medium">
                            {attendance.check_out_submitted_ip}
                          </div>
                        </div>
                      )}

                      {attendance.check_out_location_name && (
                        <div>
                          <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            Lokasi
                          </div>
                          <div className="text-sm font-medium">
                            {attendance.check_out_location_name}
                          </div>
                        </div>
                      )}

                      {attendance.check_out_notes && (
                        <div>
                          <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            Catatan
                          </div>
                          <div className="text-sm">{attendance.check_out_notes}</div>
                        </div>
                      )}

                      {attendance.check_out_selfie_url ? (
                        <div>
                          <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                            <Camera className="h-3 w-3" />
                            Foto Selfie
                          </div>
                          <div className="rounded-lg border p-2 bg-muted/30">
                            <img
                              src={attendance.check_out_selfie_url}
                              alt="Check Out Selfie"
                              className="w-full rounded-md object-contain bg-black max-h-[300px]"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EGambar tidak tersedia%3C/text%3E%3C/svg%3E';
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                            <Camera className="h-3 w-3" />
                            Foto Selfie
                          </div>
                          <div className="rounded-lg border p-4 text-center text-sm text-muted-foreground bg-muted/30">
                            Tidak ada foto selfie
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {!hasCheckIn && !hasCheckOut && (
              <Card>
                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                  Belum ada data check in atau check out
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AttendanceDetailDialog;
