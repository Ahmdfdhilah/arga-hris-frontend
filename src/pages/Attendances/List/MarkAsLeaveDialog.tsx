import React, { useState } from 'react';
import { Calendar, FileText, Filter, User } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Button,
    Field,
    FieldContent,
    FieldLabel,
    FieldError,
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Textarea,
} from '@/components/common';
import type { AttendanceListItem } from '@/services/attendances/types';
import { LEAVE_TYPE_OPTIONS, LeaveType } from '@/services/leave-requests/types';
import { useCreateLeaveRequest } from '@/hooks/tanstackHooks/useLeaveRequests';
import { useQueryClient } from '@tanstack/react-query';

interface MarkAsLeaveDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    attendance: AttendanceListItem | null;
    onSuccess?: () => void;
}

const MarkAsLeaveDialog: React.FC<MarkAsLeaveDialogProps> = ({
    open,
    onOpenChange,
    attendance,
    onSuccess,
}) => {
    const queryClient = useQueryClient();
    const [leaveType, setLeaveType] = useState<LeaveType | ''>('');
    const [reason, setReason] = useState<string>('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const createLeaveRequest = useCreateLeaveRequest({
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attendances'] });
            setLeaveType('');
            setReason('');
            setErrors({});
            onOpenChange(false);
            onSuccess?.();
        },
    });

    const handleSubmit = () => {
        const newErrors: Record<string, string> = {};

        if (!leaveType) {
            newErrors.leave_type = 'Jenis cuti harus dipilih';
        }

        if (!reason.trim()) {
            newErrors.reason = 'Alasan harus diisi';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        if (!attendance || !leaveType) return;

        createLeaveRequest.mutate({
            employee_id: attendance.employee_id,
            leave_type: leaveType,
            start_date: attendance.attendance_date,
            end_date: attendance.attendance_date,
            reason: reason.trim(),
        });
    };

    const handleOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            setLeaveType('');
            setReason('');
            setErrors({});
        }
        onOpenChange(isOpen);
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Tandai sebagai Cuti</DialogTitle>
                    <DialogDescription>
                        Buat pengajuan cuti untuk karyawan pada tanggal yang dipilih
                    </DialogDescription>
                </DialogHeader>

                {attendance && (
                    <div className="space-y-4 py-4">
                        <Field>
                            <FieldLabel>Karyawan</FieldLabel>
                            <FieldContent>
                                <InputGroup>
                                    <InputGroupAddon align="inline-start">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                    </InputGroupAddon>
                                    <InputGroupInput
                                        value={attendance.employee_name || '-'}
                                        disabled
                                        className="flex-1 border-0 shadow-none bg-muted/50"
                                    />
                                </InputGroup>
                            </FieldContent>
                        </Field>

                        <Field>
                            <FieldLabel>Tanggal</FieldLabel>
                            <FieldContent>
                                <InputGroup>
                                    <InputGroupAddon align="inline-start">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                    </InputGroupAddon>
                                    <InputGroupInput
                                        value={formatDate(attendance.attendance_date)}
                                        disabled
                                        className="flex-1 border-0 shadow-none bg-muted/50"
                                    />
                                </InputGroup>
                            </FieldContent>
                        </Field>

                        <Field>
                            <FieldLabel>
                                Jenis Cuti <span className="text-destructive">*</span>
                            </FieldLabel>
                            <FieldContent>
                                <InputGroup>
                                    <InputGroupAddon align="inline-start">
                                        <Filter className="h-4 w-4 text-muted-foreground" />
                                    </InputGroupAddon>
                                    <Select
                                        value={leaveType}
                                        onValueChange={(value) => {
                                            setLeaveType(value as LeaveType);
                                            if (errors.leave_type) {
                                                setErrors((prev) => {
                                                    const { leave_type: _, ...rest } = prev;
                                                    return rest;
                                                });
                                            }
                                        }}
                                    >
                                        <SelectTrigger className="flex-1 border-0 shadow-none focus:ring-0">
                                            <SelectValue placeholder="Pilih jenis cuti" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {LEAVE_TYPE_OPTIONS.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </InputGroup>
                            </FieldContent>
                            {errors.leave_type && <FieldError>{errors.leave_type}</FieldError>}
                        </Field>

                        <Field>
                            <FieldLabel>
                                Alasan <span className="text-destructive">*</span>
                            </FieldLabel>
                            <FieldContent>
                                <InputGroup>
                                    <InputGroupAddon align="inline-start">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                    </InputGroupAddon>
                                    <Textarea
                                        value={reason}
                                        onChange={(e) => {
                                            setReason(e.target.value);
                                            if (errors.reason) {
                                                setErrors((prev) => {
                                                    const { reason: _, ...rest } = prev;
                                                    return rest;
                                                });
                                            }
                                        }}
                                        placeholder="Masukkan alasan cuti..."
                                        className="flex-1 min-h-[80px] resize-none border-0 shadow-none focus:ring-0"
                                    />
                                </InputGroup>
                            </FieldContent>
                            {errors.reason && <FieldError>{errors.reason}</FieldError>}
                        </Field>
                    </div>
                )}

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => handleOpenChange(false)}
                        disabled={createLeaveRequest.isPending}
                    >
                        Batal
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={createLeaveRequest.isPending}
                    >
                        {createLeaveRequest.isPending ? 'Menyimpan...' : 'Simpan'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default MarkAsLeaveDialog;
