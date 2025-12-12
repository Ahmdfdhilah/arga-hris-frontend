import { Calendar, Filter } from 'lucide-react';
import {
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
  Button,
} from '@/components/common';
import { useResponsive } from '@/hooks/useResponsive';
import { useURLFilters } from '@/hooks/useURLFilters';
import { useMyLeaveRequests } from '@/hooks/tanstackHooks/useLeaveRequests';
import type {
  LeaveRequestFilterParams,
  LeaveType,
} from '@/services/leave-requests/types';
import type { PaginationParams } from '@/services/base/types';
import { LEAVE_TYPE_OPTIONS } from '@/services/leave-requests/types';
import LeaveRequestTableView from './LeaveRequestTableView';
import LeaveRequestCardView from './LeaveRequestCardView';

const MyLeaveRequests: React.FC = () => {
  const { isDesktop } = useResponsive();

  const urlFiltersHook = useURLFilters<PaginationParams & LeaveRequestFilterParams>({
    defaults: {
      page: 1,
      limit: 10,
      start_date: undefined,
      end_date: undefined,
      leave_type: undefined,
    },
  });

  const filters = urlFiltersHook.getCurrentFilters();

  const { data, isLoading, isError, error } = useMyLeaveRequests(filters);

  const handleClearFilters = () => {
    urlFiltersHook.resetFilters();
  };

  const handleItemsPerPageChange = (value: string) => {
    urlFiltersHook.updateURL({ limit: parseInt(value), page: 1 });
  };

  const hasActiveFilters = urlFiltersHook.hasActiveFilters();

  const handleEdit = () => {
  };

  const handleDelete = () => {
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cuti Saya"
        description="Lihat riwayat cuti Anda"
        breadcrumb={[
          { label: 'Dashboard', href: '/' },
          { label: 'Cuti Saya' },
        ]}
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
          <CardTitle>Riwayat Cuti</CardTitle>
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
                    : 'Anda belum memiliki riwayat cuti'}
                </EmptyDescription>
              </EmptyHeader>
              {hasActiveFilters && (
                <EmptyContent>
                  <Button variant="outline" onClick={handleClearFilters}>
                    Hapus Filter
                  </Button>
                </EmptyContent>
              )}
            </Empty>
          )}

          {!isLoading && !isError && data && data.data.length > 0 && (
            <>
              {isDesktop ? (
                <LeaveRequestTableView
                  leaveRequests={data.data}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ) : (
                <ItemGroup>
                  {data.data.map((leaveRequest) => (
                    <LeaveRequestCardView
                      key={leaveRequest.id}
                      leaveRequest={leaveRequest}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </ItemGroup>
              )}
              <Pagination 
                currentPage={data.meta.page}
                totalPages={data.meta.total_pages}
                totalItems={data.meta.total_items}
                itemsPerPage={data.meta.limit}
                onPageChange={(page) => urlFiltersHook.updateURL({ page })}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MyLeaveRequests;
