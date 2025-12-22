import React, { useState } from 'react';
import { RotateCcw, Archive, MoreVertical, Eye, Mail, Building2 } from 'lucide-react';
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
  Spinner,
  PageHeader,
  Filtering,
  Pagination,
  ConfirmDialog,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/common';
import { useURLFilters } from '@/hooks/useURLFilters';
import {
  useDeletedEmployees,
  useRestoreEmployee,
} from '@/hooks/tanstackHooks/useEmployees';
import type { Employee } from '@/services/employees/types/response';
import type { PaginationParams } from '@/services/base/types';
import { EmployeeDetailDialog } from './EmployeeDetailDialog';

const ArchivedEmployeeList: React.FC = () => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [employeeToRestore, setEmployeeToRestore] = useState<Employee | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [employeeToView, setEmployeeToView] = useState<Employee | null>(null);

  const urlFiltersHook = useURLFilters<PaginationParams & { search?: string }>({
    defaults: {
      page: 1,
      limit: 20,
      search: '',
    },
  });

  const filters = urlFiltersHook.getCurrentFilters();

  const { data, isLoading, isError, error } = useDeletedEmployees(filters);
  const restoreEmployeeMutation = useRestoreEmployee();

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

  const handleView = (employee: Employee) => {
    setEmployeeToView(employee);
    setDetailDialogOpen(true);
  };

  const handleRestore = (employee: Employee) => {
    setEmployeeToRestore(employee);
    setConfirmOpen(true);
  };

  const confirmRestore = () => {
    if (!employeeToRestore || !employeeToRestore.id) return;

    restoreEmployeeMutation.mutate(employeeToRestore.id, {
      onSuccess: () => {
        setConfirmOpen(false);
        setEmployeeToRestore(null);
      },
    });
  };



  return (
    <div className="space-y-6">
      <PageHeader
        title="Karyawan Terhapus"
        description="Daftar karyawan yang telah dihapus"
        breadcrumb={[
          { label: 'Dashboard', href: '/' },
          { label: 'Karyawan', href: '/employees' },
          { label: 'Terhapus' },
        ]}
      />

      <Filtering
        searchValue={filters.search || ''}
        onSearchChange={handleSearch}
        searchPlaceholder="Cari berdasarkan nomor atau nama..."
        onClearFilters={handleClearFilters}
      />

      <Card>
        <CardHeader>
          <CardTitle>Daftar Karyawan Terhapus</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Spinner />
            </div>
          ) : isError ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>Error</EmptyTitle>
                <EmptyDescription>
                  {error?.message || 'Gagal memuat data karyawan terhapus'}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : !data?.data || data.data.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <Archive className="h-12 w-12" />
                <EmptyTitle>Tidak ada karyawan terhapus</EmptyTitle>
                <EmptyDescription>
                  {hasActiveFilters
                    ? 'Tidak ada data yang cocok dengan filter. Coba ubah filter pencarian.'
                    : 'Belum ada karyawan yang dihapus.'}
                </EmptyDescription>
              </EmptyHeader>
              {hasActiveFilters && (
                <EmptyContent>
                  <Button variant="outline" onClick={handleClearFilters}>
                    Reset Filter
                  </Button>
                </EmptyContent>
              )}
            </Empty>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nomor Karyawan</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Unit Organisasi</TableHead>
                      <TableHead>Tanggal Hapus</TableHead>
                      <TableHead className="w-[70px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.data.map((employee) => {
                      return (
                        <TableRow key={employee.id}>
                          <TableCell className="font-medium">
                            {employee.code || '-'}
                          </TableCell>

                          <TableCell className="font-medium">
                            {employee.name}
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Mail className="h-3.5 w-3.5" />
                              <span>{employee.email}</span>
                            </div>
                          </TableCell>

                          <TableCell>
                            {employee.org_unit && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Building2 className="h-3.5 w-3.5" />
                                <span>{employee.org_unit.name}</span>
                              </div>
                            )}
                          </TableCell>

                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {employee.deleted_at ? new Date(employee.deleted_at).toLocaleDateString('id-ID') : '-'}
                            </span>
                          </TableCell>

                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleView(employee)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Lihat Detail
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleRestore(employee)}
                                  disabled={restoreEmployeeMutation.isPending}
                                >
                                  <RotateCcw className="mr-2 h-4 w-4" />
                                  Pulihkan
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {data.meta && (
                <Pagination
                  currentPage={data.meta.page}
                  totalPages={data.meta.total_pages}
                  totalItems={data.meta.total_items}
                  itemsPerPage={data.meta.limit}
                  onPageChange={(page) => urlFiltersHook.updateURL({ page })}
                  onItemsPerPageChange={handleItemsPerPageChange}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      {employeeToView && (
        <EmployeeDetailDialog
          open={detailDialogOpen}
          onOpenChange={(open) => {
            setDetailDialogOpen(open);
            if (!open) setEmployeeToView(null);
          }}
          employee={employeeToView}
        />
      )}

      {/* Confirm Restore Dialog */}
      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setEmployeeToRestore(null);
        }}
        onConfirm={confirmRestore}
        title="Pulihkan Karyawan"
        description={`Apakah Anda yakin ingin memulihkan karyawan ${employeeToRestore?.name || 'ini'}? Karyawan akan diaktifkan kembali.`}
        confirmText="Pulihkan"
        cancelText="Batal"
        isProcessing={restoreEmployeeMutation.isPending}
      />
    </div>
  );
};

export default ArchivedEmployeeList;
