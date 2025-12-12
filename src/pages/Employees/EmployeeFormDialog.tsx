import { useState, useEffect } from 'react';
import { FormDialog } from '@/components/common/FormDialog';
import EmployeeFormFields from './EmployeeFormFields';
import type { EmployeeWithAccount, CreateEmployeeWithAccountRequest, UpdateEmployeeWithAccountRequest } from '@/services/employees/types';
import { validateEmployeeEmail, validateEmployeePhone, validateEmployeeNumber } from '@/services/employees/utils';
import { toHTMLDateString } from '@/utils/date';


interface EmployeeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: EmployeeWithAccount | null;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

type EmployeeFormData = Partial<CreateEmployeeWithAccountRequest> & Partial<UpdateEmployeeWithAccountRequest> & {
  is_active?: boolean;
};

const EmployeeFormDialog: React.FC<EmployeeFormDialogProps> = ({
  open,
  onOpenChange,
  employee: employeeWithAccount = null,
  onSubmit,
  isSubmitting,
}) => {
  const isEdit = !!employeeWithAccount;
  const [formData, setFormData] = useState<EmployeeFormData>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (employeeWithAccount) {
        const { employee, user, guest_account } = employeeWithAccount;

        setFormData({
          number: employee?.employee_number || '',
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          phone: employee?.phone || '',
          position: employee?.position || '',
          employee_type: employee?.employee_type || undefined,
          employee_gender: employee?.employee_gender || undefined,
          org_unit_id: employee?.org_unit_id || undefined,
          supervisor_id: employee?.supervisor_id || undefined,
          is_active: user.is_active,
          // Guest fields (if applicable)
          guest_type: guest_account?.guest_type || undefined,
          valid_from: toHTMLDateString(guest_account?.valid_from),
          valid_until: toHTMLDateString(guest_account?.valid_until),
          sponsor_id: guest_account?.sponsor_id || undefined,
          notes: guest_account?.notes || undefined,
        });
      } else {
        setFormData({
          account_type: 'user',
          number: '',
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          position: '',
          employee_type: undefined,
          employee_gender: undefined,
          org_unit_id: undefined,
          supervisor_id: undefined,
          guest_type: undefined,
          valid_from: undefined,
          valid_until: undefined,
          sponsor_id: undefined,
          notes: undefined,
        });
      }
      setErrors({});
    }
  }, [open, employeeWithAccount]);

  const handleFieldChange = (field: string, value: string | number | boolean | null | undefined) => {
    setFormData((prev) => {
      // Convert email to lowercase
      const processedValue = field === 'email' && typeof value === 'string'
        ? value.toLowerCase()
        : value;

      const updated = { ...prev, [field]: processedValue };

      // Auto-set guest_type to 'intern' when account_type changes to 'guest'
      if (field === 'account_type' && value === 'guest' && !prev.guest_type) {
        updated.guest_type = 'intern';
      }

      return updated;
    });

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
      // Create mode validation
      const numberValidation = validateEmployeeNumber(formData.number || '');
      if (!numberValidation.valid) {
        newErrors.number = numberValidation.error || 'Nomor karyawan tidak valid';
      }

      if (!formData.first_name?.trim()) {
        newErrors.first_name = 'Nama depan tidak boleh kosong';
      }

      if (!formData.last_name?.trim()) {
        newErrors.last_name = 'Nama belakang tidak boleh kosong';
      }

      const emailValidation = validateEmployeeEmail(formData.email || '');
      if (!emailValidation.valid) {
        newErrors.email = emailValidation.error || 'Email tidak valid';
      }

      // Guest-specific validation
      if (formData.account_type === 'guest') {
        // guest_type is auto-set to 'intern', no need to validate
        
        if (!formData.valid_from) {
          newErrors.valid_from = 'Valid from harus diisi';
        }

        if (!formData.valid_until) {
          newErrors.valid_until = 'Valid until harus diisi';
        } else {
          const validUntilDate = new Date(formData.valid_until);
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          if (validUntilDate <= today) {
            newErrors.valid_until = 'Valid until harus di masa depan';
          }
        }

        if (formData.valid_from && formData.valid_until) {
          const validFromDate = new Date(formData.valid_from);
          const validUntilDate = new Date(formData.valid_until);

          if (validFromDate >= validUntilDate) {
            newErrors.valid_from = 'Valid from harus sebelum valid until';
          }
        }
      }
    } else {
      const updateData = formData as Partial<UpdateEmployeeWithAccountRequest>;

      if (updateData.first_name !== undefined && !updateData.first_name?.trim()) {
        newErrors.first_name = 'Nama depan tidak boleh kosong';
      }

      if (updateData.last_name !== undefined && !updateData.last_name?.trim()) {
        newErrors.last_name = 'Nama belakang tidak boleh kosong';
      }

      // Email validation removed - email cannot be updated
    }

    if (formData.phone) {
      const phoneValidation = validateEmployeePhone(formData.phone);
      if (!phoneValidation.valid) {
        newErrors.phone = phoneValidation.error || 'Nomor telepon tidak valid';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    if (isEdit) {
      const updateData: UpdateEmployeeWithAccountRequest = {};
      // Intersection fields (employee + user)
      if (formData.first_name !== undefined) updateData.first_name = formData.first_name;
      if (formData.last_name !== undefined) updateData.last_name = formData.last_name;
      if (formData.org_unit_id !== undefined) updateData.org_unit_id = formData.org_unit_id;
      // Employee-only fields
      if (formData.number !== undefined) updateData.number = formData.number;
      if (formData.phone !== undefined) updateData.phone = formData.phone;
      if (formData.position !== undefined) updateData.position = formData.position;
      if (formData.employee_type !== undefined) updateData.employee_type = formData.employee_type;
      if (formData.employee_gender !== undefined) updateData.employee_gender = formData.employee_gender;
      if (formData.supervisor_id !== undefined) updateData.supervisor_id = formData.supervisor_id;
      // Guest-only fields (if applicable)
      if (formData.guest_type !== undefined) updateData.guest_type = formData.guest_type;
      if (formData.valid_from !== undefined) updateData.valid_from = formData.valid_from;
      if (formData.valid_until !== undefined) updateData.valid_until = formData.valid_until;
      if (formData.sponsor_id !== undefined) updateData.sponsor_id = formData.sponsor_id;
      if (formData.notes !== undefined) updateData.notes = formData.notes;

      onSubmit(updateData);
    } else {
      // Create mode: send CreateEmployeeWithAccountRequest
      // Ensure email is lowercase before submitting
      const submitData = {
        ...formData,
        email: typeof formData.email === 'string' ? formData.email.toLowerCase() : formData.email,
      };
      onSubmit(submitData);
    }
  };

  return (
    <FormDialog
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title={isEdit ? 'Edit Karyawan' : 'Tambah Karyawan Baru'}
      description={
        isEdit
          ? 'Ubah informasi karyawan'
          : 'Isi formulir di bawah untuk menambahkan karyawan baru'
      }
      mode={isEdit ? 'edit' : 'create'}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    >
      <EmployeeFormFields
        formData={formData}
        errors={errors}
        onChange={handleFieldChange}
        isEdit={isEdit}
      />
    </FormDialog>
  );
};

export default EmployeeFormDialog;
