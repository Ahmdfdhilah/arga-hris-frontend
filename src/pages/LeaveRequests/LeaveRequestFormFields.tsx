import { useEffect } from 'react';
import { Calendar, FileText, Filter, User } from 'lucide-react';
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  Combobox,
} from '@/components/common';
import type {
  LeaveRequestCreateRequest
} from '@/services/leave-requests/types';
import { LEAVE_TYPE_OPTIONS } from '@/services/leave-requests/types';
import { useEmployeeSearch } from '@/hooks/useEmployeeSearch';

interface LeaveRequestFormFieldsProps {
  formData: Partial<LeaveRequestCreateRequest>;
  errors: Record<string, string>;
  onChange: (
    field: keyof LeaveRequestCreateRequest,
    value: any,
  ) => void;
  isEdit?: boolean;
}

const LeaveRequestFormFields: React.FC<LeaveRequestFormFieldsProps> = ({
  formData,
  errors,
  onChange,
  isEdit = false,
}) => {
  const employeeSearch = useEmployeeSearch();

  // Load initial value for employee_id when it exists
  useEffect(() => {
    const employeeId = 'employee_id' in formData ? formData.employee_id : undefined;
    if (employeeId && employeeSearch.loadInitialValue) {
      employeeSearch.loadInitialValue(employeeId);
    }
  }, [formData.employee_id]);

  return (
    <div className="space-y-4">
      {!isEdit && (
        <Field>
          <FieldLabel>
            Karyawan <span className="text-destructive">*</span>
          </FieldLabel>
          <FieldContent>
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <User className="h-4 w-4 text-muted-foreground" />
              </InputGroupAddon>
              <div className="flex-1">
                <Combobox
                  options={employeeSearch.options}
                  value={
                    'employee_id' in formData ? formData.employee_id : undefined
                  }
                  onChange={(value) => onChange('employee_id', value as number)}
                  placeholder="Pilih karyawan..."
                  searchPlaceholder="Cari berdasarkan nomor/nama..."
                  searchValue={employeeSearch.searchTerm}
                  onSearchChange={employeeSearch.setSearchTerm}
                  emptyMessage={
                    employeeSearch.searchTerm
                      ? 'Tidak ada karyawan yang ditemukan'
                      : 'Pilih karyawan'
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
          {errors.employee_id && <FieldError>{errors.employee_id}</FieldError>}
        </Field>
      )}

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
              value={formData.leave_type || ''}
              onValueChange={(value) => onChange('leave_type', value)}
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
          Tanggal Mulai <span className="text-destructive">*</span>
        </FieldLabel>
        <FieldContent>
          <InputGroup>
            <InputGroupAddon align="inline-start">
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              type="date"
              value={formData.start_date || ''}
              onChange={(e) => onChange('start_date', e.target.value)}
              className="flex-1 border-0 shadow-none focus:ring-0"
            />
          </InputGroup>
        </FieldContent>
        {errors.start_date && <FieldError>{errors.start_date}</FieldError>}
      </Field>

      <Field>
        <FieldLabel>
          Tanggal Akhir <span className="text-destructive">*</span>
        </FieldLabel>
        <FieldContent>
          <InputGroup>
            <InputGroupAddon align="inline-start">
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              type="date"
              value={formData.end_date || ''}
              onChange={(e) => onChange('end_date', e.target.value)}
              className="flex-1 border-0 shadow-none focus:ring-0"
            />
          </InputGroup>
        </FieldContent>
        {errors.end_date && <FieldError>{errors.end_date}</FieldError>}
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
              value={formData.reason || ''}
              onChange={(e) => onChange('reason', e.target.value)}
              placeholder="Masukkan alasan pengajuan cuti..."
              className="flex-1 min-h-[100px] resize-none border-0 shadow-none focus:ring-0"
            />
          </InputGroup>
        </FieldContent>
        {errors.reason && <FieldError>{errors.reason}</FieldError>}
      </Field>
    </div>
  );
};

export default LeaveRequestFormFields;
