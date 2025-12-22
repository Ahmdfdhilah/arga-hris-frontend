import React, { useEffect, useState } from 'react';
import { Plus, Building2, UserCheck } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
  ItemGroup,
  Spinner,
  PageHeader,
  Filtering,
  Pagination,
  ConfirmDialog,
  Field,
  FieldContent,
  FieldLabel,
  InputGroup,
  InputGroupAddon,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Combobox,
} from '@/components/common';
import { useResponsive } from '@/hooks/useResponsive';
import { useURLFilters } from '@/hooks/useURLFilters';
import { useOrgUnitSearch } from '@/hooks/useOrgUnitSearch';
import {
  useEmployees,
  useCreateEmployee,
  useUpdateEmployee,
  useDeleteEmployee,
} from '@/hooks/tanstackHooks/useEmployees';
import type {
  Employee,
  EmployeeFilterParams,
  CreateEmployeeRequest,
  UpdateEmployeeRequest
} from '@/services/employees/types';
import type { PaginationParams } from '@/services/base/types';
import EmployeeTableView from './EmployeeTableView';
import { EmployeeCardView } from './EmployeeCardView';
import EmployeeFormDialog from './EmployeeFormDialog';
import { EmployeeDetailDialog } from './EmployeeDetailDialog';
// import { ManageRolesDialog } from './ManageRolesDialog'; // Disable for now as we focus on Employee schema alignment

const EmployeeList: React.FC = () => {
  const { isDesktop } = useResponsive();
  const [formOpen, setFormOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [employeeToDeactivate, setEmployeeToDeactivate] = useState<Employee | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [employeeToView, setEmployeeToView] = useState<Employee | null>(null);
  // const [manageRolesDialogOpen, setManageRolesDialogOpen] = useState(false);
  // const [employeeToManageRoles, setEmployeeToManageRoles] = useState<Employee | null>(null);


  const urlFiltersHook = useURLFilters<PaginationParams & EmployeeFilterParams>({
    defaults: {
      page: 1,
      limit: 20,
      search: '',
      is_active: undefined,
      org_unit_id: undefined,
    },
  });

  const filters = urlFiltersHook.getCurrentFilters();
  const orgUnitSearch = useOrgUnitSearch();

  useEffect(() => {
    if (filters.org_unit_id && orgUnitSearch.loadInitialValue) {
      orgUnitSearch.loadInitialValue(filters.org_unit_id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.org_unit_id]);

  const { data, isLoading, isError, error } = useEmployees(filters);
  const createEmployeeMutation = useCreateEmployee();
  const updateEmployeeMutation = useUpdateEmployee();
  const deleteEmployeeMutation = useDeleteEmployee();

  const handleSearch = (value: string) => {
    urlFiltersHook.updateURL({ search: value, page: 1 });
  };

  const handleClearFilters = () => {
    urlFiltersHook.resetFilters();
  };

  const handleItemsPerPageChange = (value: string) => {
    urlFiltersHook.updateURL({ limit: parseInt(value), page: 1 });
  };

  const hasActiveFilters = urlFiltersHook.hasActiveFilters();

  const handleCreate = () => {
    setSelectedEmployee(null);
    setFormOpen(true);
  };

  const handleView = (employee: Employee) => {
    setEmployeeToView(employee);
    setDetailDialogOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setFormOpen(true);
  };

  const handleDeactivate = (employee: Employee) => {
    setEmployeeToDeactivate(employee);
    setConfirmOpen(true);
  };

  const handleActivate = (employee: Employee) => {
    if (!employee.id) return;
    updateEmployeeMutation.mutate({
      employeeId: employee.id,
      data: { is_active: true }
    });
  };

  const handleManageRoles = (employee: Employee) => {
    // setEmployeeToManageRoles(employee);
    // setManageRolesDialogOpen(true);
    console.log("Manage roles not implemented yet for Employee view", employee);
  };

  const handleDelete = (employee: Employee) => {
    setEmployeeToDelete(employee);
    setConfirmDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (!employeeToDelete || !employeeToDelete.id) return;

    deleteEmployeeMutation.mutate(employeeToDelete.id, {
      onSuccess: () => {
        setConfirmDeleteOpen(false);
        setEmployeeToDelete(null);
      },
    });
  };

  const confirmDeactivate = () => {
    if (!employeeToDeactivate || !employeeToDeactivate.id) return;

    updateEmployeeMutation.mutate({
      employeeId: employeeToDeactivate.id,
      data: { is_active: false }
    }, {
      onSuccess: () => {
        setConfirmOpen(false);
        setEmployeeToDeactivate(null);
      },
    });
  };

  const handleSubmit = (formData: any) => {
    // Helper to combine name
    const fullName = `${formData.first_name || ''} ${formData.last_name || ''}`.trim() || formData.name;

    if (selectedEmployee) {
      // Edit mode
      const updateData: UpdateEmployeeRequest = {
        name: fullName,
        org_unit_id: formData.org_unit_id,
        employee_number: formData.number, // Form uses 'number', API uses 'employee_number'
        phone: formData.phone,
        position: formData.position,
        employee_type: formData.employee_type,
        employee_gender: formData.employee_gender,
        supervisor_id: formData.supervisor_id,
        is_active: formData.is_active,
      };

      if (!selectedEmployee.id) return;

      updateEmployeeMutation.mutate(
        { employeeId: selectedEmployee.id, data: updateData },
        {
          onSuccess: () => {
            setFormOpen(false);
            setSelectedEmployee(null);
          },
        },
      );
    } else {
      // Create mode
      const createData: CreateEmployeeRequest = {
        employee_number: formData.number,
        name: fullName,
        email: formData.email,
        org_unit_id: formData.org_unit_id,
        phone: formData.phone,
        position: formData.position,
        employee_type: formData.employee_type,
        employee_gender: formData.employee_gender,
        supervisor_id: formData.supervisor_id,
        is_active: formData.is_active,
      };

      createEmployeeMutation.mutate(createData, {
        onSuccess: () => {
          setFormOpen(false);
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manajemen Karyawan"
        description="Kelola data karyawan"
        breadcrumb={[
          { label: 'Dashboard', href: '/' },
          { label: 'Karyawan' },
        ]}
        actions={
          <Button onClick={handleCreate} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Karyawan
          </Button>
        }
      />

      <Filtering
        searchValue={filters.search || ''}
        onSearchChange={handleSearch}
        searchPlaceholder="Cari berdasarkan nomor atau nama..."
        onClearFilters={handleClearFilters}
      >
        <Field>
          <FieldLabel>Status Karyawan</FieldLabel>
          <FieldContent>
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </InputGroupAddon>
              <Select
                value={
                  filters.is_active === undefined
                    ? 'all'
                    : String(filters.is_active)
                }
                onValueChange={(value) => {
                  urlFiltersHook.updateURL({
                    is_active: value === 'all' ? undefined : value === 'true',
                    page: 1,
                  });
                }}
              >
                <SelectTrigger className="flex-1 border-0 shadow-none focus:ring-0">
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="true">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-primary" />
                      <span>Aktif</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="false">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/50" />
                      <span>Tidak Aktif</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </InputGroup>
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>Unit Organisasi</FieldLabel>
          <FieldContent>
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </InputGroupAddon>
              <div className="flex-1">
                <Combobox
                  options={orgUnitSearch.options}
                  value={filters.org_unit_id}
                  onChange={(value) => {
                    urlFiltersHook.updateURL({
                      org_unit_id: value as number,
                      page: 1,
                    });
                  }}
                  placeholder="Semua Unit Organisasi"
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
        </Field>
      </Filtering>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Karyawan</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Spinner className="h-8 w-8" />
            </div>
          )}

          {isError && (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>Terjadi Kesalahan</EmptyTitle>
                <EmptyDescription>
                  {error instanceof Error
                    ? error.message
                    : 'Gagal memuat data karyawan'}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}

          {!isLoading && !isError && data && data.data.length == 0 && (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>
                  {hasActiveFilters ? 'Tidak Ada Hasil' : 'Tidak Ada Data'}
                </EmptyTitle>
                <EmptyDescription>
                  {hasActiveFilters
                    ? 'Tidak ada karyawan yang sesuai dengan filter'
                    : 'Belum ada karyawan yang terdaftar'}
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                {hasActiveFilters ? (
                  <Button variant="outline" onClick={handleClearFilters}>
                    Hapus Filter
                  </Button>
                ) : (
                  <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Karyawan
                  </Button>
                )}
              </EmptyContent>
            </Empty>
          )}

          {!isLoading && !isError && data && data.data.length > 0 && (
            <>
              {isDesktop ? (
                <EmployeeTableView
                  employees={data.data}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDeactivate={handleDeactivate}
                  onActivate={handleActivate}
                  onDelete={handleDelete}
                  onManageRoles={handleManageRoles}
                />
              ) : (
                <ItemGroup>
                  <EmployeeCardView
                    employees={data.data}
                    isLoading={isLoading}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDeactivate={handleDeactivate}
                    onActivate={handleActivate}
                    onDelete={handleDelete}
                    onManageRoles={handleManageRoles}
                  />
                </ItemGroup>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {!isLoading && !isError && data && data.meta && (
        <Pagination
          currentPage={filters.page || 1}
          totalPages={data.meta.total_pages}
          onPageChange={(page) => urlFiltersHook.updateURL({ page })}
          totalItems={data.meta.total_items}
          itemsPerPage={filters.limit || 20}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      )}

      <EmployeeFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        employee={selectedEmployee}
        onSubmit={handleSubmit}
        isSubmitting={createEmployeeMutation.isPending || updateEmployeeMutation.isPending}
      />

      <EmployeeDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        employee={employeeToView}
      />

      {/*   <ManageRolesDialog
        open={manageRolesDialogOpen}
        onOpenChange={setManageRolesDialogOpen}
        employee={employeeToManageRoles}
      /> */}

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Nonaktifkan Karyawan?"
        description={`Apakah Anda yakin ingin menonaktifkan karyawan "${employeeToDeactivate?.name || 'ini'}"?`}
        variant="danger"
        onConfirm={confirmDeactivate}
        isProcessing={updateEmployeeMutation.isPending}
        confirmText="Nonaktifkan"
        cancelText="Batal"
      />

      <ConfirmDialog
        isOpen={confirmDeleteOpen}
        onClose={() => {
          setConfirmDeleteOpen(false);
          setEmployeeToDelete(null);
        }}
        title="Hapus Karyawan?"
        description={`Apakah Anda yakin ingin menghapus karyawan "${employeeToDelete?.name || 'ini'}"? Data yang dihapus dapat dipulihkan kembali dari menu Karyawan Terhapus.`}
        variant="danger"
        onConfirm={confirmDelete}
        isProcessing={deleteEmployeeMutation.isPending}
        confirmText="Hapus"
        cancelText="Batal"
      />
    </div>
  );
};

export default EmployeeList;
