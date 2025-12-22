import { useState, useEffect } from 'react';
import { FormDialog } from '@/components/common/FormDialog';
import EmployeeFormFields from './EmployeeFormFields';
import type { Employee } from '@/services/employees/types';
import { validateEmployeeEmail, validateEmployeePhone, validateEmployeeNumber } from '@/services/employees/utils';


interface EmployeeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: Employee | null;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

export interface EmployeeFormData {
  code?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  position?: string;
  type?: string;
  site?: string;
  gender?: string;
  org_unit_id?: number;
  supervisor_id?: number;
  is_active?: boolean;
}

const EmployeeFormDialog: React.FC<EmployeeFormDialogProps> = ({
  open,
  onOpenChange,
  employee = null,
  onSubmit,
  isSubmitting,
}) => {
  const isEdit = !!employee;
  const [formData, setFormData] = useState<EmployeeFormData>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (employee) {
        const nameParts = (employee.name || '').split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        setFormData({
          code: employee.code || '',
          first_name: firstName,
          last_name: lastName,
          email: employee.email || '',
          phone: employee.user?.phone || '',
          position: employee.position || '',
          type: employee.type || undefined,
          site: employee.site || undefined,
          gender: employee.user?.gender || undefined,
          org_unit_id: employee.org_unit_id || undefined,
          supervisor_id: employee.supervisor_id || undefined,
          is_active: employee.is_active ?? true,
        });
      } else {
        setFormData({
          code: '',
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          position: '',
          type: undefined,
          site: undefined,
          gender: undefined,
          org_unit_id: undefined,
          supervisor_id: undefined,
          is_active: true,
        });
      }
      setErrors({});
    }
  }, [open, employee]);

  const handleFieldChange = (field: string, value: string | number | boolean | null | undefined) => {
    setFormData((prev) => {
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
      const numberValidation = validateEmployeeNumber(formData.code || '');
      if (!numberValidation.valid) {
        newErrors.code = numberValidation.error || 'Nomor karyawan tidak valid';
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

    onSubmit(formData);
  };

  return (
    <FormDialog
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title={isEdit ? 'Edit Karyawan' : 'Tambah Karyawan Baru'}
      description={
        isEdit
          ? 'Ubah informasi karyawan'
          : 'Isi formulir di bawah untuk menambahkan karyawan baru.'
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
