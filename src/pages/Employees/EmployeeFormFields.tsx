import { useEffect } from 'react';
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  Switch,
  Combobox,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/common';
import {
  Hash,
  Mail,
  Phone,
  Briefcase,
  Building2,
  User,
  UserCircle,
  BadgeCheck,
  UserCog,
} from 'lucide-react';
import { useOrgUnitSearch } from '@/hooks/useOrgUnitSearch';
import type { CreateEmployeeWithAccountRequest, UpdateEmployeeWithAccountRequest } from '@/services/employees/types';
import { EMPLOYEE_TYPE_OPTIONS, EMPLOYEE_GENDER_OPTIONS } from '@/services/employees/types';

type EmployeeFormData = Partial<CreateEmployeeWithAccountRequest> & Partial<UpdateEmployeeWithAccountRequest> & {
  is_active?: boolean;
  email?: string;
};

interface EmployeeFormFieldsProps {
  formData: EmployeeFormData;
  errors: Record<string, string>;
  onChange: (field: string, value: string | number | boolean | null | undefined) => void;
  isEdit?: boolean;
}

const EmployeeFormFields: React.FC<EmployeeFormFieldsProps> = ({
  formData,
  errors,
  onChange,
  isEdit = false,
}) => {
  const orgUnitSearch = useOrgUnitSearch();

  useEffect(() => {
    if (formData.org_unit_id && orgUnitSearch.loadInitialValue) {
      orgUnitSearch.loadInitialValue(formData.org_unit_id);
    }
  }, [formData.org_unit_id]);

  return (
    <div className="space-y-4">
      {!isEdit && (
        <Field>
          <FieldLabel>
            Nomor Karyawan <span className="text-destructive">*</span>
          </FieldLabel>
          <FieldContent>
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <Hash className="h-4 w-4 text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                value={formData.number || ''}
                onChange={(e) => onChange('number', e.target.value)}
                placeholder="Contoh: EMP001"
              />
            </InputGroup>
          </FieldContent>
          {errors.number && <FieldError>{errors.number}</FieldError>}
        </Field>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field>
          <FieldLabel>
            Nama Depan <span className="text-destructive">*</span>
          </FieldLabel>
          <FieldContent>
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <User className="h-4 w-4 text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                value={formData.first_name || ''}
                onChange={(e) => onChange('first_name', e.target.value)}
                placeholder="John"
              />
            </InputGroup>
          </FieldContent>
          {errors.first_name && <FieldError>{errors.first_name}</FieldError>}
        </Field>

        <Field>
          <FieldLabel>
            Nama Belakang <span className="text-destructive">*</span>
          </FieldLabel>
          <FieldContent>
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <UserCircle className="h-4 w-4 text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                value={formData.last_name || ''}
                onChange={(e) => onChange('last_name', e.target.value)}
                placeholder="Doe"
              />
            </InputGroup>
          </FieldContent>
          {errors.last_name && <FieldError>{errors.last_name}</FieldError>}
        </Field>
      </div>

      <Field>
        <FieldLabel>
          Email <span className="text-destructive">*</span>
        </FieldLabel>
        <FieldContent>
          <InputGroup>
            <InputGroupAddon align="inline-start">
              <Mail className="h-4 w-4 text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              type="email"
              value={formData.email || ''}
              onChange={(e) => onChange('email', e.target.value.toLowerCase())}
              placeholder="john.doe@company.com"
              disabled={isEdit}
              className={isEdit ? 'bg-muted cursor-not-allowed' : ''}
            />
          </InputGroup>
        </FieldContent>
        {isEdit ? (
          <p className="text-xs text-muted-foreground mt-1">
            Email tidak dapat diubah
          </p>
        ) : (
          errors.email && <FieldError>{errors.email}</FieldError>
        )}
      </Field>

      <Field>
        <FieldLabel>Nomor Telepon</FieldLabel>
        <FieldContent>
          <InputGroup>
            <InputGroupAddon align="inline-start">
              <Phone className="h-4 w-4 text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => onChange('phone', e.target.value)}
              placeholder="+62812345678"
            />
          </InputGroup>
        </FieldContent>
        {errors.phone && <FieldError>{errors.phone}</FieldError>}
      </Field>

      <Field>
        <FieldLabel>Jabatan</FieldLabel>
        <FieldContent>
          <InputGroup>
            <InputGroupAddon align="inline-start">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              value={formData.position || ''}
              onChange={(e) => onChange('position', e.target.value)}
              placeholder="Software Engineer"
            />
          </InputGroup>
        </FieldContent>
        {errors.position && <FieldError>{errors.position}</FieldError>}
      </Field>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field>
          <FieldLabel>Tipe Karyawan</FieldLabel>
          <FieldContent>
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <BadgeCheck className="h-4 w-4 text-muted-foreground" />
              </InputGroupAddon>
              <div className="flex-1">
                <Select
                  value={formData.employee_type || ''}
                  onValueChange={(value) => onChange('employee_type', value)}
                >
                  <SelectTrigger className="border-0 shadow-none focus:ring-0">
                    <SelectValue placeholder="Pilih tipe karyawan..." />
                  </SelectTrigger>
                  <SelectContent>
                    {EMPLOYEE_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </InputGroup>
          </FieldContent>
          {errors.employee_type && <FieldError>{errors.employee_type}</FieldError>}
        </Field>

        <Field>
          <FieldLabel>Jenis Kelamin</FieldLabel>
          <FieldContent>
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <UserCog className="h-4 w-4 text-muted-foreground" />
              </InputGroupAddon>
              <div className="flex-1">
                <Select
                  value={formData.employee_gender || ''}
                  onValueChange={(value) => onChange('employee_gender', value)}
                >
                  <SelectTrigger className="border-0 shadow-none focus:ring-0">
                    <SelectValue placeholder="Pilih jenis kelamin..." />
                  </SelectTrigger>
                  <SelectContent>
                    {EMPLOYEE_GENDER_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </InputGroup>
          </FieldContent>
          {errors.employee_gender && <FieldError>{errors.employee_gender}</FieldError>}
        </Field>
      </div>

      <Field>
        <FieldLabel>Unit Organisasi (Opsional)</FieldLabel>
        <FieldContent>
          <InputGroup>
            <InputGroupAddon align="inline-start">
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </InputGroupAddon>
            <div className="flex-1">
              <Combobox
                options={[{ value: null, label: '-- Kosong --' }, ...orgUnitSearch.options]}
                value={formData.org_unit_id}
                onChange={(value) => onChange('org_unit_id', value as number | null)}
                placeholder="Pilih unit organisasi..."
                searchPlaceholder="Cari berdasarkan kode/nama..."
                searchValue={orgUnitSearch.searchTerm}
                onSearchChange={orgUnitSearch.setSearchTerm}
                emptyMessage={
                  orgUnitSearch.searchTerm
                    ? 'Tidak ada unit organisasi yang ditemukan'
                    : 'Pilih unit organisasi'
                }
                isLoading={orgUnitSearch.isSearching}
                enableInfiniteScroll={true}
                onLoadMore={orgUnitSearch.loadMore}
                hasNextPage={orgUnitSearch.hasMoreData}
                isLoadingMore={orgUnitSearch.isLoadingMore}
                pagination={orgUnitSearch.pagination}
                className="border-0 shadow-none focus:ring-0"
              />
            </div>
          </InputGroup>
        </FieldContent>
        {errors.org_unit_id && <FieldError>{errors.org_unit_id}</FieldError>}
      </Field>

      {isEdit && (
        <Field>
          <FieldLabel>Status Aktif</FieldLabel>
          <FieldContent>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_active ?? true}
                onCheckedChange={(checked) => onChange('is_active', checked)}
              />
              <span className="text-sm text-muted-foreground">
                {formData.is_active ? 'Aktif' : 'Tidak Aktif'}
              </span>
            </div>
          </FieldContent>
        </Field>
      )}
    </div>
  );
};

export default EmployeeFormFields;
