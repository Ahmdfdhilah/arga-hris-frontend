import React, { useState } from 'react';
import { Plus, Calendar, Filter, User } from 'lucide-react';
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
  InputGroupInput,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Combobox,
} from '@/components/common';
import { useResponsive } from '@/hooks/useResponsive';
import { useURLFilters } from '@/hooks/useURLFilters';
import { useEmployeeSearch } from '@/hooks/useEmployeeSearch';
import { useRoleBasedQuery } from '@/hooks/useRoleBasedQuery';
import { useAppSelector } from '@/redux/hooks';
import { hasPermission } from '@/services/users/utils';
import {
  useLeaveRequests,
  useTeamLeaveRequests,
  useCreateLeaveRequest,
  useUpdateLeaveRequest,
  useDeleteLeaveRequest,
} from '@/hooks/tanstackHooks/useLeaveRequests';
import type {
  LeaveRequestWithEmployee,
  LeaveRequestFilterParams,
  LeaveRequestCreateRequest,
  LeaveRequestUpdateRequest,
  LeaveType,
} from '@/services/leave-requests/types';
import type { PaginationParams } from '@/services/base/types';
import { LEAVE_TYPE_OPTIONS } from '@/services/leave-requests/types';
import LeaveRequestTableView from './LeaveRequestTableView';
import LeaveRequestCardView from './LeaveRequestCardView';
import LeaveRequestFormDialog from './LeaveRequestFormDialog';

const LeaveRequestList: React.FC = () => {
  const { isDesktop } = useResponsive();
  const [formOpen, setFormOpen] = useState(false);
  const [selectedLeaveRequest, setSelectedLeaveRequest] =
    useState<LeaveRequestWithEmployee | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [leaveRequestToDelete, setLeaveRequestToDelete] =
    useState<LeaveRequestWithEmployee | null>(null);

  // Get current user from Redux store
  const { userData } = useAppSelector((state) => state.auth);

  const canCreate = hasPermission(userData, 'leave_request.create');
  const canUpdate = hasPermission(userData, 'leave_request.update');
  const canDelete = hasPermission(userData, 'leave_request.delete');

  const urlFiltersHook = useURLFilters<PaginationParams & LeaveRequestFilterParams>({
    defaults: {
      page: 1,
      limit: 20,
      start_date: undefined,
      end_date: undefined,
      leave_type: undefined,
      employee_id: undefined,
    },
  });

  const filters = urlFiltersHook.getCurrentFilters();

  const employeeSearch = useEmployeeSearch();

  // Load initial value if employee_id is in URL
  React.useEffect(() => {
    if (filters.employee_id && employeeSearch.loadInitialValue) {
      employeeSearch.loadInitialValue(filters.employee_id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.employee_id]);

  // Role-based query hook - handles all role checking and conditional fetching
  const { shouldUseTeamFetch, query } = useRoleBasedQuery({
    adminFilters: filters,
    getTeamFilters: ({ employee_id, ...rest }) => rest,
    useAdminQuery: useLeaveRequests,
    useTeamQuery: useTeamLeaveRequests,
  });

  const { data, isLoading, isError, error } = query;

  const createMutation = useCreateLeaveRequest();
  const updateMutation = useUpdateLeaveRequest();
  const deleteMutation = useDeleteLeaveRequest();

  const handleClearFilters = () => {
    urlFiltersHook.resetFilters();
  };

  const handleItemsPerPageChange = (value: string) => {
    urlFiltersHook.updateURL({ limit: parseInt(value), page: 1 });
  };

  const hasActiveFilters = urlFiltersHook.hasActiveFilters();

  const handleCreate = () => {
    setSelectedLeaveRequest(null);
    setFormOpen(true);
  };

  const handleEdit = (leaveRequest: LeaveRequestWithEmployee) => {
    setSelectedLeaveRequest(leaveRequest);
    setFormOpen(true);
  };

  const handleDelete = (leaveRequest: LeaveRequestWithEmployee) => {
    setLeaveRequestToDelete(leaveRequest);
    setConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!leaveRequestToDelete) return;

    deleteMutation.mutate(leaveRequestToDelete.id, {
      onSuccess: () => {
        setConfirmOpen(false);
        setLeaveRequestToDelete(null);
      },
    });
  };

  const handleSubmit = (
    formData: LeaveRequestCreateRequest | LeaveRequestUpdateRequest,
  ) => {
    if (selectedLeaveRequest) {
      updateMutation.mutate(
        {
          leaveRequestId: selectedLeaveRequest.id,
          data: formData as LeaveRequestUpdateRequest,
        },
        {
          onSuccess: () => {
            setFormOpen(false);
            setSelectedLeaveRequest(null);
          },
        },
      );
    } else {
      createMutation.mutate(formData as LeaveRequestCreateRequest, {
        onSuccess: () => {
          setFormOpen(false);
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daftar Cuti"
        description="Kelola semua cuti karyawan"
        breadcrumb={[
          { label: 'Dashboard', href: '/' },
          { label: 'Daftar Cuti' },
        ]}
        actions={
          canCreate && (
            <Button size="sm" onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Cuti
            </Button>
          )
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Filter Cuti</CardTitle>
        </CardHeader>
        <CardContent>
          <Filtering
            onClearFilters={handleClearFilters}
            showSearch={false}
          >
            <Field>
              <FieldLabel>Jenis Cuti</FieldLabel>
              <FieldContent>
                <InputGroup>
                  <InputGroupAddon align="inline-start">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                  </InputGroupAddon>
                  <Select
                    value={filters.leave_type || 'all'}
                    onValueChange={(value) => {
                      urlFiltersHook.updateURL({
                        leave_type:
                          value === 'all' ? undefined : (value as LeaveType),
                        page: 1,
                      });
                    }}
                  >
                    <SelectTrigger className="flex-1 border-0 shadow-none focus:ring-0">
                      <SelectValue placeholder="Semua Jenis Cuti" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Jenis Cuti</SelectItem>
                      {LEAVE_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </InputGroup>
              </FieldContent>
            </Field>

            {!shouldUseTeamFetch && (
              <Field>
                <FieldLabel>Karyawan</FieldLabel>
                <FieldContent>
                  <InputGroup>
                    <InputGroupAddon align="inline-start">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </InputGroupAddon>
                    <div className="flex-1">
                      <Combobox
                        options={employeeSearch.options}
                        value={filters.employee_id}
                        onChange={(value) => {
                          urlFiltersHook.updateURL({
                            employee_id: value as number,
                            page: 1,
                          });
                        }}
                        placeholder="Semua Karyawan"
                        searchPlaceholder="Cari berdasarkan nama/NIP..."
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
              </Field>
            )}

            <Field>
              <FieldLabel>Tanggal Mulai</FieldLabel>
              <FieldContent>
                <InputGroup>
                  <InputGroupAddon align="inline-start">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </InputGroupAddon>
                  <InputGroupInput
                    type="date"
                    value={filters.start_date || ''}
                    onChange={(e) => {
                      urlFiltersHook.updateURL({
                        start_date: e.target.value || undefined,
                        page: 1,
                      });
                    }}
                    className="flex-1 border-0 shadow-none focus:ring-0"
                  />
                </InputGroup>
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>Tanggal Akhir</FieldLabel>
              <FieldContent>
                <InputGroup>
                  <InputGroupAddon align="inline-start">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </InputGroupAddon>
                  <InputGroupInput
                    type="date"
                    value={filters.end_date || ''}
                    onChange={(e) => {
                      urlFiltersHook.updateURL({
                        end_date: e.target.value || undefined,
                        page: 1,
                      });
                    }}
                    className="flex-1 border-0 shadow-none focus:ring-0"
                  />
                </InputGroup>
              </FieldContent>
            </Field>
          </Filtering>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Cuti</CardTitle>
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
                  {error instanceof Error ? error.message : 'Gagal memuat data cuti'}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}

          {!isLoading && !isError && data?.data.length === 0 && (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>
                  {hasActiveFilters ? 'Tidak Ada Hasil' : 'Tidak Ada Data'}
                </EmptyTitle>
                <EmptyDescription>
                  {hasActiveFilters
                    ? 'Tidak ada cuti yang sesuai dengan filter'
                    : 'Belum ada cuti yang terdaftar'}
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                {hasActiveFilters ? (
                  <Button variant="outline" onClick={handleClearFilters}>
                    Hapus Filter
                  </Button>
                ) : (
                  canCreate && (
                    <Button onClick={handleCreate}>
                      <Plus className="mr-2 h-4 w-4" />
                      Tambah Cuti
                    </Button>
                  )
                )}
              </EmptyContent>
            </Empty>
          )}

          {!isLoading && !isError && data && data.data.length > 0 && (
            <>
              {isDesktop ? (
                <LeaveRequestTableView
                  leaveRequests={data.data}
                  onEdit={canUpdate ? handleEdit : undefined}
                  onDelete={canDelete ? handleDelete : undefined}
                />
              ) : (
                <ItemGroup>
                  {data.data.map((leaveRequest: LeaveRequestWithEmployee) => (
                    <LeaveRequestCardView
                      key={leaveRequest.id}
                      leaveRequest={leaveRequest}
                      onEdit={canUpdate ? handleEdit : undefined}
                      onDelete={canDelete ? handleDelete : undefined}
                    />
                  ))}
                </ItemGroup>
              )}
              <Pagination
                currentPage={data.meta.page}
                totalPages={data.meta.total_pages}
                totalItems={data.meta.total_items}
                itemsPerPage={filters.limit || 20}
                onPageChange={(page) => urlFiltersHook.updateURL({ page })}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            </>
          )}
        </CardContent>
      </Card>

      <LeaveRequestFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        leaveRequest={selectedLeaveRequest}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Hapus Cuti?"
        description={`Apakah Anda yakin ingin menghapus cuti ini? Tindakan ini tidak dapat dibatalkan.`}
        variant="danger"
        onConfirm={confirmDelete}
        isProcessing={deleteMutation.isPending}
        confirmText="Hapus"
        cancelText="Batal"
      />
    </div>
  );
};

export default LeaveRequestList;
