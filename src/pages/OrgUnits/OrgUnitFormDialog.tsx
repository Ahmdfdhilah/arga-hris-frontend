import { useState, useEffect } from 'react';
import { FormDialog } from '@/components/common/FormDialog';
import OrgUnitFormFields from './OrgUnitFormFields';
import type { OrgUnit, CreateOrgUnitRequest, UpdateOrgUnitRequest } from '@/services/org_units/types';
import { validateOrgUnitCode } from '@/services/org_units/utils';

interface OrgUnitFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgUnit?: OrgUnit | null;
  onSubmit: (data: CreateOrgUnitRequest | UpdateOrgUnitRequest) => void;
  isSubmitting: boolean;
  orgUnitTypes: string[];
}

type OrgUnitFormData = Partial<CreateOrgUnitRequest> & Partial<UpdateOrgUnitRequest>;

const OrgUnitFormDialog: React.FC<OrgUnitFormDialogProps> = ({
  open,
  onOpenChange,
  orgUnit = null,
  onSubmit,
  isSubmitting,
  orgUnitTypes,
}) => {
  const isEdit = !!orgUnit;
  const [formData, setFormData] = useState<OrgUnitFormData>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (orgUnit) {
        setFormData({
          name: orgUnit.name,
          type: orgUnit.type,
          parent_id: orgUnit.parent_id || undefined,
          head_id: orgUnit.head_id || undefined,
          description: orgUnit.description || '',
          is_active: orgUnit.is_active,
        });
      } else {
        setFormData({
          code: '',
          name: '',
          type: '',
          parent_id: undefined,
          head_id: undefined,
          description: '',
        });
      }
      setErrors({});
    }
  }, [open, orgUnit]);

  const handleFieldChange = (field: string, value: string | number | boolean | null | undefined) => {
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
      const createData = formData as Partial<CreateOrgUnitRequest>;

      const codeValidation = validateOrgUnitCode(createData.code || '');
      if (!codeValidation.valid) {
        newErrors.code = codeValidation.error || 'Kode unit organisasi tidak valid';
      }

      if (!createData.name?.trim()) {
        newErrors.name = 'Nama unit organisasi tidak boleh kosong';
      }

      if (!createData.type?.trim()) {
        newErrors.type = 'Tipe unit harus dipilih';
      }
    } else {
      const updateData = formData as Partial<UpdateOrgUnitRequest>;

      if (updateData.name !== undefined && !updateData.name?.trim()) {
        newErrors.name = 'Nama unit organisasi tidak boleh kosong';
      }

      if (updateData.type !== undefined && !updateData.type?.trim()) {
        newErrors.type = 'Tipe unit harus dipilih';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    if (isEdit) {
      const updateData: UpdateOrgUnitRequest = {};
      if (formData.name !== undefined) updateData.name = formData.name;
      if (formData.type !== undefined) updateData.type = formData.type;
      if (formData.parent_id !== undefined) updateData.parent_id = formData.parent_id;
      if (formData.head_id !== undefined) updateData.head_id = formData.head_id;
      if (formData.description !== undefined) updateData.description = formData.description;
      if (formData.is_active !== undefined) updateData.is_active = formData.is_active;

      onSubmit(updateData);
    } else {
      onSubmit(formData as CreateOrgUnitRequest);
    }
  };

  return (
    <FormDialog
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title={isEdit ? 'Edit Unit Organisasi' : 'Tambah Unit Organisasi Baru'}
      description={
        isEdit
          ? 'Ubah informasi unit organisasi'
          : 'Isi formulir di bawah untuk menambahkan unit organisasi baru'
      }
      mode={isEdit ? 'edit' : 'create'}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    >
      <OrgUnitFormFields
        formData={formData}
        errors={errors}
        onChange={handleFieldChange}
        isEdit={isEdit}
        orgUnitTypes={orgUnitTypes}
      />
    </FormDialog>
  );
};

export default OrgUnitFormDialog;
