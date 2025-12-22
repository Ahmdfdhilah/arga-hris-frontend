import React, { useState } from 'react';
import { RotateCcw, Archive, MoreVertical, Eye, Building2, User, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty';
import { Spinner } from '@/components/common';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PageHeader } from '@/components/common/Header';
import { Filtering } from '@/components/common/Filtering';
import { Pagination } from '@/components/common';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useAppSelector } from '@/redux/hooks';
import { hasPermission } from '@/services/users/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useURLFilters } from '@/hooks/useURLFilters';
import {
  useDeletedOrgUnits,
  useRestoreOrgUnit,
} from '@/hooks/tanstackHooks/useOrgUnits';
import type { OrgUnit } from '@/services/org_units/types';
import type { PaginationParams } from '@/services/base/types';
import { OrgUnitDetailDialog } from './OrgUnitDetailDialog';

const ArchivedOrgUnitList: React.FC = () => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [orgUnitToRestore, setOrgUnitToRestore] = useState<OrgUnit | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [orgUnitToView, setOrgUnitToView] = useState<OrgUnit | null>(null);

  // Get current user from Redux store
  const { userData } = useAppSelector((state) => state.auth);

  // Check permissions
  const canRestore = hasPermission(userData, 'org_units:restore');

  const urlFiltersHook = useURLFilters<PaginationParams & { search?: string }>({
    defaults: {
      page: 1,
      limit: 20,
      search: '',
    },
  });

  const filters = urlFiltersHook.getCurrentFilters();

  const { data, isLoading, isError, error } = useDeletedOrgUnits(filters);
  const restoreOrgUnitMutation = useRestoreOrgUnit();

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

  const handleView = (orgUnit: OrgUnit) => {
    setOrgUnitToView(orgUnit);
    setDetailDialogOpen(true);
  };

  const handleRestore = (orgUnit: OrgUnit) => {
    setOrgUnitToRestore(orgUnit);
    setConfirmOpen(true);
  };

  const confirmRestore = () => {
    if (!orgUnitToRestore) return;

    restoreOrgUnitMutation.mutate(orgUnitToRestore.id, {
      onSuccess: () => {
        setConfirmOpen(false);
        setOrgUnitToRestore(null);
      },
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Unit Organisasi Terhapus"
        description="Daftar unit organisasi yang telah dihapus"
        breadcrumb={[
          { label: 'Dashboard', href: '/' },
          { label: 'Unit Organisasi', href: '/org-units' },
          { label: 'Terhapus' },
        ]}
      />

      <Filtering
        searchValue={filters.search || ''}
        onSearchChange={handleSearch}
        searchPlaceholder="Cari berdasarkan kode atau nama..."
        onClearFilters={handleClearFilters}
      />

      <Card>
        <CardHeader>
          <CardTitle>Daftar Unit Organisasi Terhapus</CardTitle>
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
                  {error?.message || 'Gagal memuat data unit organisasi terhapus'}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : !data?.data || data.data.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <Archive className="h-12 w-12" />
                <EmptyTitle>Tidak ada unit organisasi terhapus</EmptyTitle>
                <EmptyDescription>
                  {hasActiveFilters
                    ? 'Tidak ada data yang cocok dengan filter. Coba ubah filter pencarian.'
                    : 'Belum ada unit organisasi yang dihapus.'}
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
                      <TableHead>Kode</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>Tipe</TableHead>
                      <TableHead>Parent Unit</TableHead>
                      <TableHead>Kepala Unit</TableHead>
                      <TableHead>Tanggal Hapus</TableHead>
                      <TableHead className="w-[70px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.data.map((orgUnit) => (
                      <TableRow key={orgUnit.id}>
                        <TableCell className="font-medium">
                          {orgUnit.code}
                        </TableCell>

                        <TableCell className="font-medium">
                          {orgUnit.name}
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Layers className="h-3.5 w-3.5" />
                            <span className="capitalize">{orgUnit.type}</span>
                          </div>
                        </TableCell>

                        <TableCell>
                          {orgUnit.parent ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Building2 className="h-3.5 w-3.5" />
                              <span>{orgUnit.parent.name}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </TableCell>

                        <TableCell>
                          {orgUnit.head ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <User className="h-3.5 w-3.5" />
                              <span>{orgUnit.head.name}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </TableCell>

                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {orgUnit.deleted_at ? formatDate(orgUnit.deleted_at) : '-'}
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
                              <DropdownMenuItem onClick={() => handleView(orgUnit)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Lihat Detail
                              </DropdownMenuItem>
                              {canRestore && (
                                <DropdownMenuItem
                                  onClick={() => handleRestore(orgUnit)}
                                  disabled={restoreOrgUnitMutation.isPending}
                                >
                                  <RotateCcw className="mr-2 h-4 w-4" />
                                  Pulihkan
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
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
      {orgUnitToView && (
        <OrgUnitDetailDialog
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
          orgUnit={orgUnitToView}
        />
      )}

      {/* Confirm Restore Dialog */}
      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setOrgUnitToRestore(null);
        }}
        onConfirm={confirmRestore}
        title="Pulihkan Unit Organisasi"
        description={`Apakah Anda yakin ingin memulihkan unit organisasi ${orgUnitToRestore?.name}? Unit akan diaktifkan kembali.`}
        confirmText="Pulihkan"
        cancelText="Batal"
        isProcessing={restoreOrgUnitMutation.isPending}
      />
    </div>
  );
};

export default ArchivedOrgUnitList;
