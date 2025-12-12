import { useState, useEffect } from 'react';
import { FormDialog } from '@/components/common/FormDialog';
import EmployeeFormFields from './EmployeeFormFields';
import type { EmployeeWithAccount, CreateEmployeeWithAccountRequest, UpdateEmployeeWithAccountRequest } from '@/services/employees/types';
import { validateEmployeeEmail, validateEmployeePhone, validateEmployeeNumber } from '@/services/employees/utils';


interface EmployeeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: EmployeeWithAccount | null;
  onSubmit: (data: CreateEmployeeWithAccountRequest | UpdateEmployeeWithAccountRequest) => void;
  isSubmitting: boolean;
}

type EmployeeFormData = Partial<CreateEmployeeWithAccountRequest> & Partial<UpdateEmployeeWithAccountRequest> & {
  is_active?: boolean;
  email?: string;
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
        const { employee } = employeeWithAccount;

        // Split name into first_name and last_name
        const nameParts = (employee?.name || '').split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        setFormData({
          number: employee?.employee_number || '',
          first_name: firstName,
          last_name: lastName,
          email: employee?.email || '',
          phone: employee?.phone || '',
          position: employee?.position || '',
          employee_type: employee?.employee_type || undefined,
          employee_gender: employee?.employee_gender || undefined,
          org_unit_id: employee?.org_unit_id || undefined,
          supervisor_id: employee?.supervisor_id || undefined,
          is_active: employee?.is_active ?? true,
        });
      } else {
        // Create mode
        setFormData({
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

      return { ...prev, [field]: processedValue };
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
    } else {
      // Update mode validation
      if (formData.first_name !== undefined && !formData.first_name?.trim()) {
        newErrors.first_name = 'Nama depan tidak boleh kosong';
      }

      if (formData.last_name !== undefined && !formData.last_name?.trim()) {
        newErrors.last_name = 'Nama belakang tidak boleh kosong';
      }
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
      // Name fields (update employee + SSO)
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

      onSubmit(updateData);
    } else {
      // Create mode: send CreateEmployeeWithAccountRequest
      const createData: CreateEmployeeWithAccountRequest = {
        number: formData.number || '',
        first_name: formData.first_name || '',
        last_name: formData.last_name || '',
        email: (formData.email || '').toLowerCase(),
        org_unit_id: formData.org_unit_id,
        phone: formData.phone,
        position: formData.position,
        employee_type: formData.employee_type,
        employee_gender: formData.employee_gender,
        supervisor_id: formData.supervisor_id,
      };
      onSubmit(createData);
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
          : 'Isi formulir di bawah untuk menambahkan karyawan baru. Akun SSO akan dibuat secara otomatis.'
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
