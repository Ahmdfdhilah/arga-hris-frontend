import React, { useEffect, useState } from 'react';
import { CalendarCheck, Calendar, Activity, User, Building2 } from 'lucide-react';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  ItemGroup,
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  Spinner,
  Field,
  FieldLabel,
  FieldContent,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Combobox,
  Pagination,
} from '@/components/common';
import { PageHeader } from '@/components/common/Header';
import Filtering from '@/components/common/Filtering';

import { AttendanceCardView } from './AttendanceCardView';
import { AttendanceTableView } from './AttendanceTableView';
import { BulkMarkPresentDialog } from './BulkMarkPresentDialog';
import { AttendanceDetailDialog } from '../AttendanceDetailDialog';
import { useAttendances, useTeamAttendance, useMarkPresentById } from '@/hooks/tanstackHooks/useAttendances';
import { useURLFilters } from '@/hooks/useURLFilters';
import { useResponsive } from '@/hooks/useResponsive';
import { useRoleBasedQuery } from '@/hooks/useRoleBasedQuery';
import type { AttendanceListItem, AttendanceFilterParams } from '@/services/attendances/types';
import type { PaginationParams } from '@/services/base/types';
import { ATTENDANCE_STATUS_OPTIONS, ATTENDANCE_FILTER_TYPE_OPTIONS } from '@/services/attendances/types';
import { useEmployeeSearch } from '@/hooks/useEmployeeSearch';
import { useOrgUnitSearch } from '@/hooks/useOrgUnitSearch';
import { useAuthStore } from '@/stores/authStore';
import { hasPermission } from '@/services/users/utils';

const AttendanceList: React.FC = () => {
  const { isDesktop } = useResponsive();

  const { userData } = useAuthStore();

  const canMarkPresent = hasPermission(userData, 'attendance:update');

  const urlFiltersHook = useURLFilters<PaginationParams & AttendanceFilterParams>({
    defaults: {
      page: 1,
      limit: 20,
      type: undefined,
      start_date: undefined,
      end_date: undefined,
      org_unit_id: undefined,
      employee_id: undefined,
      status: undefined,
    },
  });

  const filters = urlFiltersHook.getCurrentFilters();

  const employeeSearch = useEmployeeSearch();
  const orgUnitSearch = useOrgUnitSearch();

  const { shouldUseTeamFetch, query } = useRoleBasedQuery({
    adminFilters: filters,
    getTeamFilters: ({ type, org_unit_id, employee_id, ...rest }) => rest,
    useAdminQuery: useAttendances,
    useTeamQuery: useTeamAttendance,
  });

  const { data, isLoading, isError, error } = query;

  useEffect(() => {
    if (filters.employee_id && employeeSearch.loadInitialValue) {
      employeeSearch.loadInitialValue(filters.employee_id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.employee_id]);

  React.useEffect(() => {
    if (filters.org_unit_id && orgUnitSearch.loadInitialValue) {
      orgUnitSearch.loadInitialValue(filters.org_unit_id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.org_unit_id]);

  const [bulkMarkPresentDialogOpen, setBulkMarkPresentDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [attendanceToView, setAttendanceToView] = useState<AttendanceListItem | null>(null);

  // Mark present mutation
  const markPresentMutation = useMarkPresentById();

  const handlePageChange = (page: number) => {
    urlFiltersHook.updateURL({ page });
  };

  const handleItemsPerPageChange = (value: string) => {
    urlFiltersHook.updateURL({ limit: Number(value), page: 1 });
  };

  const handleBulkMarkPresent = () => {
    setBulkMarkPresentDialogOpen(true);
  };

  const handleViewAttendance = (attendance: AttendanceListItem) => {
    setAttendanceToView(attendance);
    setDetailDialogOpen(true);
  };

  const handleMarkPresent = (attendance: AttendanceListItem) => {
    markPresentMutation.mutate({
      attendanceId: attendance.id,
      request: {
        notes: undefined,
      },
    });
  };

  const handleClearFilters = () => {
    urlFiltersHook.resetFilters();
  };

  const hasActiveFilters = urlFiltersHook.hasActiveFilters();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rekap Kehadiran"
        description="Kelola data kehadiran karyawan"
        breadcrumb={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Rekap Kehadiran' },
        ]}
        actions={
          <Button onClick={handleBulkMarkPresent}>
            <CalendarCheck className="mr-2 h-4 w-4" />
            Tandai Hadir Semua Pegawai
          </Button>
        }
      />

      <Filtering onClearFilters={handleClearFilters} showSearch={false}>
        {!shouldUseTeamFetch && (
          <Field>
            <FieldLabel>Tipe Periode</FieldLabel>
            <FieldContent>
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </InputGroupAddon>
                <Select
                  value={filters.type || 'all'}
                  onValueChange={(value) => {
                    urlFiltersHook.updateURL({
                      type: value === 'all' ? undefined : (value as 'today' | 'weekly' | 'monthly'),
                      page: 1,
                    });
                  }}
                >
                  <SelectTrigger className="flex-1 border-0 shadow-none focus:ring-0">
                    <SelectValue placeholder="Semua Periode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Periode</SelectItem>
                    {ATTENDANCE_FILTER_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              />
            </InputGroup>
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>Status Kehadiran</FieldLabel>
          <FieldContent>
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <Activity className="h-4 w-4 text-muted-foreground" />
              </InputGroupAddon>
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) => {
                  urlFiltersHook.updateURL({
                    status: value === 'all' ? undefined : (value as 'present' | 'absent' | 'leave'),
                    page: 1,
                  });
                }}
              >
                <SelectTrigger className="flex-1 border-0 shadow-none focus:ring-0">
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  {ATTENDANCE_STATUS_OPTIONS.map((option) => (
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
            <FieldLabel>Employee</FieldLabel>
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
                    placeholder="Semua Employee"
                    searchPlaceholder="Cari berdasarkan nama/NIP..."
                    searchValue={employeeSearch.searchTerm}
                    onSearchChange={employeeSearch.setSearchTerm}
                    emptyMessage={
                      employeeSearch.searchTerm
                        ? 'Tidak ada employee yang ditemukan'
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

        {!shouldUseTeamFetch && (
          <Field>
            <FieldLabel>Organization Unit</FieldLabel>
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
                    placeholder="Semua Organization Unit"
                    searchPlaceholder="Cari berdasarkan kode/nama..."
                    searchValue={orgUnitSearch.searchTerm}
                    onSearchChange={orgUnitSearch.setSearchTerm}
                    emptyMessage={
                      orgUnitSearch.searchTerm
                        ? 'Tidak ada organization unit yang ditemukan'
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
        )}
      </Filtering>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Attendance</CardTitle>
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
                    : 'Gagal memuat data attendance'}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}

          {!isLoading && !isError && data?.data.length === 0 && (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>Tidak Ada Attendance</EmptyTitle>
                <EmptyDescription>
                  {hasActiveFilters
                    ? 'Tidak ada attendance yang sesuai dengan filter'
                    : 'Belum ada data attendance yang terdaftar'}
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button variant="outline" onClick={handleClearFilters}>
                  Hapus Filter
                </Button>
              </EmptyContent>
            </Empty>
          )}

          {!isLoading && !isError && data && data.data.length > 0 && (
            <>
              {isDesktop ? (
                <AttendanceTableView
                  attendances={data.data}
                  onView={handleViewAttendance}
                  onMarkPresent={canMarkPresent ? handleMarkPresent : undefined}
                  showUserInfo={true}
                />
              ) : (
                <ItemGroup>
                  {data.data.map((attendance: AttendanceListItem) => (
                    <AttendanceCardView
                      key={attendance.id}
                      attendance={attendance}
                      onView={handleViewAttendance}
                      onMarkPresent={canMarkPresent ? handleMarkPresent : undefined}
                      showUserInfo={true}
                    />
                  ))}
                </ItemGroup>
              )}

              {data.meta.total_pages > 1 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={data.meta.page}
                    totalPages={data.meta.total_pages}
                    totalItems={data.meta.total_items}
                    itemsPerPage={filters.limit || 20}
                    onPageChange={handlePageChange}
                    onItemsPerPageChange={handleItemsPerPageChange}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <BulkMarkPresentDialog
        open={bulkMarkPresentDialogOpen}
        onOpenChange={setBulkMarkPresentDialogOpen}
      />

      <AttendanceDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        attendance={attendanceToView}
      />
    </div>
  );
};

export default AttendanceList;
