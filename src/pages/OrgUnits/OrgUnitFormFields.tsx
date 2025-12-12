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
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/common';
import {
  Hash,
  Building2,
  Layers,
  User,
  Type,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useOrgUnitSearch } from '@/hooks/useOrgUnitSearch';
import { useEmployeeSearch } from '@/hooks/useEmployeeSearch';
import type { CreateOrgUnitRequest, UpdateOrgUnitRequest } from '@/services/org_units/types';

type OrgUnitFormData = Partial<CreateOrgUnitRequest> & Partial<UpdateOrgUnitRequest>;

interface OrgUnitFormFieldsProps {
  formData: OrgUnitFormData;
  errors: Record<string, string>;
  onChange: (field: string, value: string | number | boolean | null | undefined) => void;
  isEdit?: boolean;
  orgUnitTypes: string[];
}

const OrgUnitFormFields: React.FC<OrgUnitFormFieldsProps> = ({
  formData,
  errors,
  onChange,
  isEdit = false,
  orgUnitTypes,
}) => {
  const parentSearch = useOrgUnitSearch();
  const employeeSearch = useEmployeeSearch();

  // Load initial value for parent_id when it exists
  useEffect(() => {
    if (formData.parent_id && parentSearch.loadInitialValue) {
      parentSearch.loadInitialValue(formData.parent_id);
    }
  }, [formData.parent_id]);

  // Load initial value for head_id when it exists
  useEffect(() => {
    if (formData.head_id && employeeSearch.loadInitialValue) {
      employeeSearch.loadInitialValue(formData.head_id);
    }
  }, [formData.head_id]);

  const defaultTypes = [
    'company',
    'division',
    'department',
    'section',
    'team',
    'branch',
    'region',
  ];

  const availableTypes = orgUnitTypes.length > 0 ? orgUnitTypes : defaultTypes;

  const isCustomType = formData.type && !availableTypes.includes(formData.type);
  const [showCustomInput, setShowCustomInput] = useState(isCustomType);

  const handleTypeChange = (value: string) => {
    if (value === '__custom__') {
      setShowCustomInput(true);
      onChange('type', '');
    } else {
      setShowCustomInput(false);
      onChange('type', value);
    }
  };

  return (
    <div className="space-y-4">
      {!isEdit && (
        <Field>
          <FieldLabel>Kode Unit Organisasi</FieldLabel>
          <FieldContent>
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <Hash className="h-4 w-4 text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                value={formData.code || ''}
                onChange={(e) => onChange('code', e.target.value.toUpperCase())}
                placeholder="Contoh: DEPT-IT"
              />
            </InputGroup>
          </FieldContent>
          {errors.code && <FieldError>{errors.code}</FieldError>}
        </Field>
      )}

      <Field>
        <FieldLabel>Nama Unit Organisasi</FieldLabel>
        <FieldContent>
          <InputGroup>
            <InputGroupAddon align="inline-start">
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              value={formData.name || ''}
              onChange={(e) => onChange('name', e.target.value)}
              placeholder="Contoh: Departemen IT"
            />
          </InputGroup>
        </FieldContent>
        {errors.name && <FieldError>{errors.name}</FieldError>}
      </Field>

      <Field>
        <FieldLabel>Tipe Unit</FieldLabel>
        <FieldContent>
          <div className="space-y-2">
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <Layers className="h-4 w-4 text-muted-foreground" />
              </InputGroupAddon>
              <Select
                value={showCustomInput ? '__custom__' : (formData.type || '')}
                onValueChange={handleTypeChange}
              >
                <SelectTrigger className="flex-1 border-0 shadow-none focus:ring-0">
                  <SelectValue placeholder="Pilih tipe unit..." />
                </SelectTrigger>
                <SelectContent>
                  {availableTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      <span className="capitalize">{type}</span>
                    </SelectItem>
                  ))}
                  <SelectItem value="__custom__">
                    <span className="text-primary">+ Custom Type...</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </InputGroup>

            {showCustomInput && (
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <Type className="h-4 w-4 text-muted-foreground" />
                </InputGroupAddon>
                <InputGroupInput
                  value={formData.type || ''}
                  onChange={(e) => onChange('type', e.target.value.toLowerCase())}
                  placeholder="Ketik tipe custom (contoh: unit, group)"
                  autoFocus
                />
              </InputGroup>
            )}
          </div>
        </FieldContent>
        {errors.type && <FieldError>{errors.type}</FieldError>}
      </Field>

      <Field>
        <FieldLabel>Parent Unit (Opsional)</FieldLabel>
        <FieldContent>
          <InputGroup>
            <InputGroupAddon align="inline-start">
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </InputGroupAddon>
            <div className="flex-1">
              <Combobox
                options={[{ value: null, label: '-- Kosong --' }, ...parentSearch.options]}
                value={formData.parent_id}
                onChange={(value) => onChange('parent_id', value as number | null)}
                placeholder="Pilih parent unit..."
                searchPlaceholder="Cari berdasarkan kode/nama..."
                searchValue={parentSearch.searchTerm}
                onSearchChange={parentSearch.setSearchTerm}
                emptyMessage={
                  parentSearch.searchTerm
                    ? 'Tidak ada unit organisasi yang ditemukan'
                    : 'Pilih unit organisasi induk'
                }
                isLoading={parentSearch.isSearching}
                enableInfiniteScroll={true}
                onLoadMore={parentSearch.loadMore}
                hasNextPage={parentSearch.hasMoreData}
                isLoadingMore={parentSearch.isLoadingMore}
                pagination={parentSearch.pagination}
                className="border-0 shadow-none focus:ring-0"
              />
            </div>
          </InputGroup>
        </FieldContent>
        {errors.parent_id && <FieldError>{errors.parent_id}</FieldError>}
      </Field>

      <Field>
        <FieldLabel>Kepala Unit (Opsional)</FieldLabel>
        <FieldContent>
          <InputGroup>
            <InputGroupAddon align="inline-start">
              <User className="h-4 w-4 text-muted-foreground" />
            </InputGroupAddon>
            <div className="flex-1">
             <Combobox
                options={[
                  { value: null, label: '-- Kosong --' },
                  ...employeeSearch.options
                ]}
                value={formData.head_id}
                onChange={(value) => onChange('head_id', value as number | null)}
                placeholder="Pilih kepala unit..."
                searchPlaceholder="Cari berdasarkan nomor/nama..."
                searchValue={employeeSearch.searchTerm}
                onSearchChange={employeeSearch.setSearchTerm}
                emptyMessage={
                  employeeSearch.searchTerm
                    ? 'Tidak ada karyawan yang ditemukan'
                    : 'Pilih kepala unit'
                }
                isLoading={employeeSearch.isSearching}
                enableInfiniteScroll={true}
                onLoadMore={employeeSearch.loadMore}
                hasNextPage={employeeSearch.hasMoreData}
                isLoadingMore={employeeSearch.isLoadingMore}
                pagination={employeeSearch.pagination}
                className="border-0 shadow-none focus:ring-0"
              />
            </div>
          </InputGroup>
        </FieldContent>
        {errors.head_id && <FieldError>{errors.head_id}</FieldError>}
      </Field>

      <Field>
        <FieldLabel>Deskripsi (Opsional)</FieldLabel>
        <FieldContent>
          <InputGroup>
            <Textarea
              value={formData.description || ''}
              onChange={(e) => onChange('description', e.target.value)}
              placeholder="Deskripsi unit organisasi..."
              className="min-h-[80px] border-0 shadow-none focus:ring-0"
            />
          </InputGroup>
        </FieldContent>
        {errors.description && <FieldError>{errors.description}</FieldError>}
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

export default OrgUnitFormFields;
