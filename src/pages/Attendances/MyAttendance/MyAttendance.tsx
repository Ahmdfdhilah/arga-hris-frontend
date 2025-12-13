import React, { useState } from 'react';
import { Calendar, Activity } from 'lucide-react';
import {
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
  Button,
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
  Pagination,
} from '@/components/common';
import { PageHeader } from '@/components/common/Header';
import Filtering from '@/components/common/Filtering';

import { AttendanceCardView } from '../List/AttendanceCardView';
import { AttendanceTableView } from '../List/AttendanceTableView';
import { AttendanceDetailDialog } from '../AttendanceDetailDialog';
import { useMyAttendance } from '@/hooks/tanstackHooks/useAttendances';
import { useURLFilters } from '@/hooks/useURLFilters';
import { useResponsive } from '@/hooks/useResponsive';
import type { AttendanceFilterParams, AttendanceListItem } from '@/services/attendances/types';
import type { PaginationParams } from '@/services/base/types';
import { ATTENDANCE_STATUS_OPTIONS, ATTENDANCE_FILTER_TYPE_OPTIONS } from '@/services/attendances/types';

const MyAttendance: React.FC = () => {
  const { isDesktop } = useResponsive();
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [attendanceToView, setAttendanceToView] = useState<AttendanceListItem | null>(null);

  const urlFiltersHook = useURLFilters<PaginationParams & AttendanceFilterParams>({
    defaults: {
      page: 1,
      limit: 20,
      type: undefined,
      start_date: undefined,
      end_date: undefined,
      status: undefined,
    },
  });

  const filters = urlFiltersHook.getCurrentFilters();

  const { data, isLoading, isError, error } = useMyAttendance(filters);

  const handlePageChange = (page: number) => {
    urlFiltersHook.updateURL({ page });
  };

  const handleItemsPerPageChange = (value: string) => {
    urlFiltersHook.updateURL({ limit: Number(value), page: 1 });
  };

  const handleViewAttendance = (attendance: AttendanceListItem) => {
    setAttendanceToView(attendance);
    setDetailDialogOpen(true);
  };

  const handleClearFilters = () => {
    urlFiltersHook.resetFilters();
  };

  const hasActiveFilters = urlFiltersHook.hasActiveFilters();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance Saya"
        description="Riwayat kehadiran Anda"
        breadcrumb={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Attendance Saya' },
        ]}
      />

      <Filtering onClearFilters={handleClearFilters} showSearch={false}>
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
      </Filtering>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Kehadiran</CardTitle>
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
                    : 'Belum ada data attendance Anda'}
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={handleClearFilters}>
                    Hapus Filter
                  </Button>
                )}
              </EmptyContent>
            </Empty>
          )}

          {!isLoading && !isError && data && data.data.length > 0 && (
            <>
              {isDesktop ? (
                <AttendanceTableView
                  attendances={data.data}
                  onView={handleViewAttendance}
                  showUserInfo={false}
                />
              ) : (
                <ItemGroup>
                  {data.data.map((attendance) => (
                    <AttendanceCardView
                      key={attendance.id}
                      attendance={attendance}
                      onView={handleViewAttendance}
                      showUserInfo={false}
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

      <AttendanceDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        attendance={attendanceToView}
      />
    </div>
  );
};

export default MyAttendance;
