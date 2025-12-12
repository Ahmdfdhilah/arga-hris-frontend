import { useState, useEffect } from 'react';
import { FormDialog } from '@/components/common';
import type {
  LeaveRequestWithEmployee,
  LeaveRequestCreateRequest,
  LeaveRequestUpdateRequest,
} from '@/services/leave-requests/types';
import { validateLeaveRequestDates } from '@/services/leave-requests/utils';
import LeaveRequestFormFields from './LeaveRequestFormFields';

interface LeaveRequestFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leaveRequest?: LeaveRequestWithEmployee | null;
  onSubmit: (
    data: LeaveRequestCreateRequest | LeaveRequestUpdateRequest,
  ) => void;
}

const LeaveRequestFormDialog: React.FC<LeaveRequestFormDialogProps> = ({
  open,
  onOpenChange,
  leaveRequest = null,
  onSubmit,
}) => {
  const isEdit = !!leaveRequest;
  const [formData, setFormData] = useState<
    Partial<LeaveRequestCreateRequest>
  >({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (leaveRequest) {
      setFormData({
        leave_type: leaveRequest.leave_type,
        start_date: leaveRequest.start_date,
        end_date: leaveRequest.end_date,
        reason: leaveRequest.reason,
      });
    } else {
      setFormData({});
    }
    setErrors({});
  }, [leaveRequest, open]);

  const handleFieldChange = (
    field: keyof LeaveRequestCreateRequest,
    value: any,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!isEdit) {
      if (!formData.employee_id) {
        newErrors.employee_id = 'Karyawan harus dipilih';
      }
    }

    if (!formData.leave_type) {
      newErrors.leave_type = 'Jenis cuti harus dipilih';
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Tanggal mulai harus diisi';
    }

    if (!formData.end_date) {
      newErrors.end_date = 'Tanggal akhir harus diisi';
    }

    if (formData.start_date && formData.end_date) {
      const dateValidation = validateLeaveRequestDates(
        formData.start_date,
        formData.end_date,
      );
      if (!dateValidation.valid) {
        newErrors.end_date = dateValidation.error || 'Tanggal tidak valid';
      }
    }

    if (!formData.reason || !formData.reason.trim()) {
      newErrors.reason = 'Alasan harus diisi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    onSubmit(formData as LeaveRequestCreateRequest | LeaveRequestUpdateRequest);
  };

  return (
    <FormDialog
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title={isEdit ? 'Edit Pengajuan Cuti' : 'Tambah Pengajuan Cuti'}
      description={
        isEdit
          ? 'Ubah informasi pengajuan cuti'
          : 'Isi formulir di bawah untuk menambahkan pengajuan cuti baru'
      }
      mode={isEdit ? 'edit' : 'create'}
      onSubmit={handleSubmit}
      isSubmitting={false}
    >
      <LeaveRequestFormFields
        formData={formData}
        errors={errors}
        onChange={handleFieldChange}
        isEdit={isEdit}
      />
    </FormDialog>
  );
};

export default LeaveRequestFormDialog;
