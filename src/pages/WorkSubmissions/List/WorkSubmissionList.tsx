import React, { useEffect, useState } from 'react';
import { FileText, Calendar, User, Filter } from 'lucide-react';
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
  Combobox,
  Pagination,
} from '@/components/common';
import { PageHeader } from '@/components/common/Header';
import Filtering from '@/components/common/Filtering';

import { WorkSubmissionCardView } from '../WorkSubmissionCardView';
import { WorkSubmissionTableView } from '../WorkSubmissionTableView';
import { WorkSubmissionDetailDialog } from '../WorkSubmissionDetailDialog';
import { useWorkSubmissions } from '@/hooks/tanstackHooks/useWorkSubmissions';
import { useURLFilters } from '@/hooks/useURLFilters';
import { useResponsive } from '@/hooks/useResponsive';
import type { WorkSubmissionFilterParams, WorkSubmission, WorkSubmissionListItem } from '@/services/work-submissions/types';
import type { PaginationParams } from '@/services/base/types';
import { SUBMISSION_STATUS_OPTIONS } from '@/services/work-submissions/types';
import { useEmployeeSearch } from '@/hooks/useEmployeeSearch';

const WorkSubmissionList: React.FC = () => {
  const { isDesktop } = useResponsive();
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [submissionToView, setSubmissionToView] = useState<WorkSubmission | WorkSubmissionListItem | null>(null);

  const urlFiltersHook = useURLFilters<PaginationParams & WorkSubmissionFilterParams>({
    defaults: {
      page: 1,
      limit: 20,
      submission_month: undefined,
      employee_id: undefined,
      status: undefined,
    },
  });

  const filters = urlFiltersHook.getCurrentFilters();
  const employeeSearch = useEmployeeSearch();

  const { data, isLoading, isError, error } = useWorkSubmissions(filters);

  useEffect(() => {
    if (filters.employee_id && employeeSearch.loadInitialValue) {
      employeeSearch.loadInitialValue(filters.employee_id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.employee_id]);

  const handlePageChange = (page: number) => {
    urlFiltersHook.updateURL({ page });
  };

  const handleItemsPerPageChange = (value: string) => {
    urlFiltersHook.updateURL({ limit: Number(value), page: 1 });
  };

  const handleViewSubmission = (submission: WorkSubmission | WorkSubmissionListItem) => {
    setSubmissionToView(submission);
    setDetailDialogOpen(true);
  };

  const handleClearFilters = () => {
    urlFiltersHook.resetFilters();
  };

  const hasActiveFilters = urlFiltersHook.hasActiveFilters();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rekap Pengumpulan Kerja"
        description="Kelola data pengumpulan kerja seluruh karyawan"
        breadcrumb={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Rekap Pengumpulan Kerja' },
        ]}
      />

      <Filtering onClearFilters={handleClearFilters} showSearch={false}>
        <Field>
          <FieldLabel>Bulan</FieldLabel>
          <FieldContent>
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                type="month"
                value={filters.submission_month ? filters.submission_month.substring(0, 7) : ''}
                onChange={(e) => {
                  // Convert YYYY-MM to YYYY-MM-DD format for backend
                  const monthValue = e.target.value ? `${e.target.value}-01` : undefined;
                  urlFiltersHook.updateURL({
                    submission_month: monthValue,
                    page: 1,
                  });
                }}
              />
            </InputGroup>
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>Status</FieldLabel>
          <FieldContent>
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <Filter className="h-4 w-4 text-muted-foreground" />
              </InputGroupAddon>
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) => {
                  urlFiltersHook.updateURL({
                    status: value === 'all' ? undefined : value as 'draft' | 'submitted',
                    page: 1,
                  });
                }}
              >
                <SelectTrigger className="flex-1 border-0 shadow-none focus:ring-0">
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  {SUBMISSION_STATUS_OPTIONS.map((option) => (
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
      </Filtering>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Submission</CardTitle>
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
                    : 'Gagal memuat data submission'}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}

          {!isLoading && !isError && data?.data.length === 0 && (
            <Empty>
              <EmptyHeader>
                <FileText className="h-12 w-12 text-muted-foreground/50" />
                <EmptyTitle>Tidak Ada Submission</EmptyTitle>
                <EmptyDescription>
                  {hasActiveFilters
                    ? 'Tidak ada submission yang sesuai dengan filter'
                    : 'Belum ada data submission yang terdaftar'}
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
                <WorkSubmissionTableView
                  submissions={data.data}
                  onView={handleViewSubmission}
                  showUserInfo={true}
                />
              ) : (
                <ItemGroup>
                  {data.data.map((submission: WorkSubmissionListItem) => (
                    <WorkSubmissionCardView
                      key={submission.id}
                      submission={submission}
                      onView={handleViewSubmission}
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

      <WorkSubmissionDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        submission={submissionToView}
      />
    </div>
  );
};

export default WorkSubmissionList;
