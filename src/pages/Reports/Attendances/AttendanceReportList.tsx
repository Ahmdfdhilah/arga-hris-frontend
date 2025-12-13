import React, { useState } from 'react';
import { FileSpreadsheet, Calendar, Building2 } from 'lucide-react';
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
  Spinner,
  Field,
  FieldLabel,
  FieldContent,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  Combobox,
  Pagination,
} from '@/components/common';
import { PageHeader } from '@/components/common/Header';
import Filtering from '@/components/common/Filtering';
import { useAppSelector } from '@/redux/hooks';
import { hasPermission } from '@/services/users/utils';

import { OverviewCardView } from './OverviewCardView';
import { OverviewTableView } from './OverviewTableView';
import { useAttendanceOverview } from '@/hooks/tanstackHooks/useAttendances';
import { useURLFilters } from '@/hooks/useURLFilters';
import { useResponsive } from '@/hooks/useResponsive';
import { useOrgUnitSearch } from '@/hooks/useOrgUnitSearch';
import { attendancesService } from '@/services/attendances/service';
import { orgUnitsService } from '@/services/org_units/service';
import { generateAttendanceReportExcel } from '@/services/attendances/utils';
import { generateExcelFile, downloadBlob } from '@/utils/excelGenerator';
import { toast } from 'sonner';
import type { PaginationParams } from '@/services/base/types';
import type { EmployeeAttendanceReport } from '@/services/attendances/types/response';

interface AttendanceReportFilters extends PaginationParams {
  org_unit_id?: number;
  start_date?: string;
  end_date?: string;
}

const AttendanceReportList: React.FC = () => {
  const { isDesktop } = useResponsive();
  const [isExporting, setIsExporting] = useState(false);

  // Get current user from Redux store
  const { userData } = useAppSelector((state) => state.auth);

  const canExport = hasPermission(userData, 'attendance.export');

  const urlFiltersHook = useURLFilters<AttendanceReportFilters>({
    defaults: {
      page: 1,
      limit: 20,
      org_unit_id: undefined,
      start_date: undefined,
      end_date: undefined,
    },
  });

  const filters = urlFiltersHook.getCurrentFilters();
  const orgUnitSearch = useOrgUnitSearch();

  React.useEffect(() => {
    if (filters.org_unit_id && orgUnitSearch.loadInitialValue) {
      orgUnitSearch.loadInitialValue(filters.org_unit_id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.org_unit_id]);

  const isFiltersComplete = filters.start_date && filters.end_date;

  const { data, isLoading, isError, error } = useAttendanceOverview(
    {
      org_unit_id: filters.org_unit_id,
      start_date: filters.start_date!,
      end_date: filters.end_date!,
      page: filters.page,
      limit: filters.limit,
    },
    {
      enabled: !!isFiltersComplete,
    },
  );

  const handlePageChange = (page: number) => {
    urlFiltersHook.updateURL({ page });
  };

  const handleItemsPerPageChange = (value: string) => {
    urlFiltersHook.updateURL({ limit: Number(value), page: 1 });
  };

  const handleExportToExcel = async () => {
    if (!filters.start_date || !filters.end_date) {
      toast.error('Tanggal mulai dan tanggal akhir harus diisi');
      return;
    }

    setIsExporting(true);

    try {
      // Step 1: Fetch all org units
      toast.info('Mengambil daftar unit organisasi...');
      const orgUnitsResponse = await orgUnitsService.listOrgUnits({
        page: 1,
        limit: 100,
      });

      const orgUnits = orgUnitsResponse.data;

      if (!orgUnits || orgUnits.length === 0) {
        toast.error('Tidak ada unit organisasi yang ditemukan');
        setIsExporting(false);
        return;
      }

      // Step 2: Fetch attendance report for each org unit
      toast.info(`Mengambil laporan kehadiran untuk ${orgUnits.length} unit organisasi...`);

      const allReports: EmployeeAttendanceReport[] = [];
      let successCount = 0;
      let errorCount = 0;

      for (const orgUnit of orgUnits) {
        try {
          const reportResponse = await attendancesService.getAttendanceReport({
            org_unit_id: orgUnit.id,
            start_date: filters.start_date,
            end_date: filters.end_date,
          });

          // Add reports from this org unit to the combined array
          if (reportResponse.data && reportResponse.data.length > 0) {
            allReports.push(...reportResponse.data);
            successCount++;
          }
        } catch (err) {
          console.error(`Error fetching report for org unit ${orgUnit.code}:`, err);
          errorCount++;
          // Continue with other org units even if one fails
        }
      }

      if (allReports.length === 0) {
        toast.warning('Tidak ada data kehadiran ditemukan untuk periode yang dipilih');
        setIsExporting(false);
        return;
      }

      // Step 3: Generate Excel file with multiple sheets (one per org unit)
      toast.info('Membuat file Excel...');
      const excelConfig = generateAttendanceReportExcel(
        allReports,
        filters.start_date,
        filters.end_date
      );

      const blob = await generateExcelFile(excelConfig);
      downloadBlob(blob, excelConfig.filename);

      toast.success(
        `Excel berhasil diexport! ${successCount} unit organisasi, ${allReports.length} karyawan${errorCount > 0 ? ` (${errorCount} unit gagal)` : ''}`
      );
    } catch (err) {
      console.error('Error exporting to Excel:', err);
      toast.error('Gagal mengexport data ke Excel');
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearFilters = () => {
    urlFiltersHook.resetFilters();
  };

  const employees = data?.data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laporan Kehadiran"
        description="Lihat ringkasan kehadiran karyawan berdasarkan unit organisasi dan periode"
        breadcrumb={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Laporan' },
          { label: 'Laporan Kehadiran' },
        ]}
        actions={
          canExport && (
            <Button
              size="sm"
              onClick={handleExportToExcel}
              disabled={!filters.start_date || !filters.end_date || isExporting}
            >
              {isExporting ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Exporting...
                </>
              ) : (
                <>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Export to Excel
                </>
              )}
            </Button>
          )
        }
      />

      <Filtering onClearFilters={handleClearFilters} showSearch={false}>
        <Field>
          <FieldLabel>
            Unit Organisasi <span className="text-xs text-muted-foreground">(Opsional)</span>
          </FieldLabel>
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
      </Filtering>

      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Kehadiran</CardTitle>
        </CardHeader>
        <CardContent>
          {!isFiltersComplete && (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>Pilih Filter Terlebih Dahulu</EmptyTitle>
                <EmptyDescription>
                  Silakan pilih tanggal mulai dan tanggal akhir untuk melihat ringkasan kehadiran
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}

          {isFiltersComplete && isLoading && (
            <div className="flex items-center justify-center py-12">
              <Spinner className="h-8 w-8" />
            </div>
          )}

          {isFiltersComplete && isError && (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>Terjadi Kesalahan</EmptyTitle>
                <EmptyDescription>
                  {error instanceof Error
                    ? error.message
                    : 'Gagal memuat data ringkasan kehadiran'}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}

          {isFiltersComplete &&
            !isLoading &&
            !isError &&
            employees.length === 0 && (
              <Empty>
                <EmptyHeader>
                  <EmptyTitle>Tidak Ada Data</EmptyTitle>
                  <EmptyDescription>
                    Tidak ada data kehadiran untuk filter yang dipilih
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}

          {isFiltersComplete &&
            !isLoading &&
            !isError &&
            employees.length > 0 && (
              <>
                {isDesktop ? (
                  <OverviewTableView data={employees} />
                ) : (
                  <ItemGroup>
                    {employees.map((employee) => (
                      <OverviewCardView
                        key={employee.employee_id}
                        employee={employee}
                      />
                    ))}
                  </ItemGroup>
                )}

                {data && data.meta.total_pages > 1 && (
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
    </div>
  );
};

export default AttendanceReportList;
