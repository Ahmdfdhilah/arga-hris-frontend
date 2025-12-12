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
  Pagination ,
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
  useEmployeesWithAccount,
  useCreateEmployeeWithAccount,
  useUpdateEmployeeWithAccount,
  useDeactivateEmployeeAccount,
  useActivateEmployeeAccount,
  useSoftDeleteEmployeeAccount,
} from '@/hooks/tanstackHooks/useEmployees';
import type {
  EmployeeWithAccount,
  EmployeeWithAccountFilterParams,
  CreateEmployeeWithAccountRequest,
  UpdateEmployeeWithAccountRequest
} from '@/services/employees/types';
import type { PaginationParams } from '@/services/base/types';
import EmployeeTableView from './EmployeeTableView';
import EmployeeCardView from './EmployeeCardView';
import EmployeeFormDialog from './EmployeeFormDialog';
import { EmployeeDetailDialog } from './EmployeeDetailDialog';
import { ManageRolesDialog } from './ManageRolesDialog';
import { GuestPasswordModal } from './GuestPasswordModal';

const EmployeeList: React.FC = () => {
  const { isDesktop } = useResponsive();
  const [formOpen, setFormOpen] = useState(false);
  const [selectedEmployeeWithAccount, setSelectedEmployeeWithAccount] = useState<EmployeeWithAccount | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [employeeToDeactivate, setEmployeeToDeactivate] = useState<EmployeeWithAccount | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<EmployeeWithAccount | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [employeeToView, setEmployeeToView] = useState<EmployeeWithAccount | null>(null);
  const [manageRolesDialogOpen, setManageRolesDialogOpen] = useState(false);
  const [employeeToManageRoles, setEmployeeToManageRoles] = useState<EmployeeWithAccount | null>(null);
  const [guestPasswordModalOpen, setGuestPasswordModalOpen] = useState(false);
  const [guestPasswordData, setGuestPasswordData] = useState<{
    email: string;
    name: string;
    password: string;
  } | null>(null);

  const urlFiltersHook = useURLFilters<PaginationParams & EmployeeWithAccountFilterParams>({
    defaults: {
      page: 1,
      limit: 20,
      search: '',
      is_active: undefined,
      org_unit_id: undefined,
      account_type: undefined,
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

  const { data, isLoading, isError, error } = useEmployeesWithAccount(filters);
  const createEmployeeWithAccountMutation = useCreateEmployeeWithAccount();
  const updateEmployeeWithAccountMutation = useUpdateEmployeeWithAccount();
  const deactivateEmployeeAccountMutation = useDeactivateEmployeeAccount();
  const activateEmployeeAccountMutation = useActivateEmployeeAccount();
  const softDeleteEmployeeAccountMutation = useSoftDeleteEmployeeAccount();

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
    setSelectedEmployeeWithAccount(null);
    setFormOpen(true);
  };

  const handleView = (employeeWithAccount: EmployeeWithAccount) => {
    setEmployeeToView(employeeWithAccount);
    setDetailDialogOpen(true);
  };

  const handleEdit = (employeeWithAccount: EmployeeWithAccount) => {
    setSelectedEmployeeWithAccount(employeeWithAccount);
    setFormOpen(true);
  };

  const handleDeactivate = (employeeWithAccount: EmployeeWithAccount) => {
    setEmployeeToDeactivate(employeeWithAccount);
    setConfirmOpen(true);
  };

  const handleActivate = (employeeWithAccount: EmployeeWithAccount) => {
    // Activate employee and account in one operation
    activateEmployeeAccountMutation.mutate(employeeWithAccount.user.id);
  };

  const handleManageRoles = (employeeWithAccount: EmployeeWithAccount) => {
    setEmployeeToManageRoles(employeeWithAccount);
    setManageRolesDialogOpen(true);
  };

  const handleDelete = (employeeWithAccount: EmployeeWithAccount) => {
    setEmployeeToDelete(employeeWithAccount);
    setConfirmDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (!employeeToDelete) return;

    softDeleteEmployeeAccountMutation.mutate(employeeToDelete.user.id, {
      onSuccess: () => {
        setConfirmDeleteOpen(false);
        setEmployeeToDelete(null);
      },
    });
  };

  const confirmDeactivate = () => {
    if (!employeeToDeactivate) return;

    // Deactivate employee and account in one operation
    deactivateEmployeeAccountMutation.mutate(employeeToDeactivate.user.id, {
      onSuccess: () => {
        setConfirmOpen(false);
        setEmployeeToDeactivate(null);
      },
    });
  };

  const handleSubmit = (formData: any) => {
    if (selectedEmployeeWithAccount) {
      // Edit mode: update employee with account (unified)
      const updateData: UpdateEmployeeWithAccountRequest = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        org_unit_id: formData.org_unit_id,
        number: formData.number,
        phone: formData.phone,
        position: formData.position,
        employee_type: formData.employee_type,
        employee_gender: formData.employee_gender,
        supervisor_id: formData.supervisor_id,
        // Guest-only fields (if applicable)
        valid_from: formData.valid_from,
        valid_until: formData.valid_until,
        guest_type: formData.guest_type,
        notes: formData.notes,
        sponsor_id: formData.sponsor_id,
      };

      updateEmployeeWithAccountMutation.mutate(
        { userId: selectedEmployeeWithAccount.user.id, data: updateData },
        {
          onSuccess: () => {
            setFormOpen(false);
            setSelectedEmployeeWithAccount(null);
          },
        },
      );
    } else {
      // Create mode: create employee with account (unified)
      const createData: CreateEmployeeWithAccountRequest = {
        number: formData.number,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        org_unit_id: formData.org_unit_id,
        phone: formData.phone,
        position: formData.position,
        employee_type: formData.employee_type,
        employee_gender: formData.employee_gender,
        supervisor_id: formData.supervisor_id,
        account_type: formData.account_type || 'user',
  
        guest_type: formData.guest_type,
        valid_from: formData.valid_from,
        valid_until: formData.valid_until,
        sponsor_id: formData.sponsor_id,
        notes: formData.notes,
      };

      createEmployeeWithAccountMutation.mutate(createData, {
        onSuccess: (response) => {
          setFormOpen(false);

          // Show temporary password modal for guest accounts
          if (response.data.temporary_password) {
            setGuestPasswordData({
              email: formData.email,
              name: `${formData.first_name} ${formData.last_name}`,
              password: response.data.temporary_password,
            });
            setGuestPasswordModalOpen(true);
          }
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

          {!isLoading && !isError && data && data.data.length == 0  && (
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
                  {data.data.map((employeeWithAccount) => (
                    <EmployeeCardView
                      key={employeeWithAccount.user.id}
                      employee={employeeWithAccount}
                      onView={handleView}
                      onEdit={handleEdit}
                      onDeactivate={handleDeactivate}
                      onActivate={handleActivate}
                      onDelete={handleDelete}
                      onManageRoles={handleManageRoles}
                    />
                  ))}
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
        employee={selectedEmployeeWithAccount}
        onSubmit={handleSubmit}
        isSubmitting={createEmployeeWithAccountMutation.isPending || updateEmployeeWithAccountMutation.isPending}
      />

      <EmployeeDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        employee={employeeToView}
      />

      <ManageRolesDialog
        open={manageRolesDialogOpen}
        onOpenChange={setManageRolesDialogOpen}
        employee={employeeToManageRoles}
      />

      <GuestPasswordModal
        open={guestPasswordModalOpen}
        onOpenChange={setGuestPasswordModalOpen}
        guestEmail={guestPasswordData?.email || ''}
        guestName={guestPasswordData?.name || ''}
        temporaryPassword={guestPasswordData?.password || ''}
      />

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Nonaktifkan Karyawan?"
        description={`Apakah Anda yakin ingin menonaktifkan karyawan "${employeeToDeactivate?.employee?.name || employeeToDeactivate?.user.first_name + ' ' + employeeToDeactivate?.user.last_name}"? Karyawan yang dinonaktifkan tidak akan bisa login ke sistem.`}
        variant="danger"
        onConfirm={confirmDeactivate}
        isProcessing={deactivateEmployeeAccountMutation.isPending}
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
        description={`Apakah Anda yakin ingin menghapus karyawan "${employeeToDelete?.employee?.name || employeeToDelete?.user.first_name + ' ' + employeeToDelete?.user.last_name}"? Data yang dihapus dapat dipulihkan kembali dari menu Karyawan Terhapus.`}
        variant="danger"
        onConfirm={confirmDelete}
        isProcessing={softDeleteEmployeeAccountMutation.isPending}
        confirmText="Hapus"
        cancelText="Batal"
      />
    </div>
  );
};

export default EmployeeList;
