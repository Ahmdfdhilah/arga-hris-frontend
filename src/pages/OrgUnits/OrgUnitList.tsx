import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty';
import { ItemGroup } from '@/components/ui/item';
import { Spinner } from '@/components/common';
import { PageHeader } from '@/components/common/Header';
import { Filtering } from '@/components/common/Filtering';
import { useAppSelector } from '@/redux/hooks';
import { hasPermission } from '@/services/users/utils';

import { useResponsive } from '@/hooks/useResponsive';
import { useURLFilters } from '@/hooks/useURLFilters';
import { useOrgUnitSearch } from '@/hooks/useOrgUnitSearch';
import { useOrgUnits, useOrgUnitTypes, useCreateOrgUnit, useUpdateOrgUnit, useDeleteOrgUnit } from '@/hooks/tanstackHooks/useOrgUnits';
import type { OrgUnit, OrgUnitFilterParams, CreateOrgUnitRequest, UpdateOrgUnitRequest } from '@/services/org_units/types';
import type { PaginationParams } from '@/services/base/types';
import OrgUnitTableView from './OrgUnitTableView';
import OrgUnitCardView from './OrgUnitCardView';
import OrgUnitFormDialog from './OrgUnitFormDialog';
import { OrgUnitDetailDialog } from './OrgUnitDetailDialog';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import {
  Field,
  FieldContent,
  FieldLabel,
} from '@/components/ui/field';
import {
  InputGroup,
  InputGroupAddon,
} from '@/components/ui/input-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building2, Layers } from 'lucide-react';
import { Combobox } from '@/components/ui/combobox';
import { Pagination } from '@/components/common';

const OrgUnitList: React.FC = () => {
  const { isDesktop } = useResponsive();
  const [formOpen, setFormOpen] = useState(false);
  const [selectedOrgUnit, setSelectedOrgUnit] = useState<OrgUnit | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [orgUnitToDelete, setOrgUnitToDelete] = useState<OrgUnit | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [orgUnitToView, setOrgUnitToView] = useState<OrgUnit | null>(null);

  // Get current user from Redux store
  const { userData } = useAppSelector((state) => state.auth);

  // Check permissions
  const canCreate = hasPermission(userData, 'org_unit.create');
  const canUpdate = hasPermission(userData, 'org_unit.update');
  const canDelete = hasPermission(userData, 'org_unit.delete');

  const urlFiltersHook = useURLFilters<PaginationParams & OrgUnitFilterParams>({
    defaults: {
      page: 1,
      limit: 20,
      search: '',
      parent_id: undefined,
      type_filter: undefined,
    },
  });

  const filters = urlFiltersHook.getCurrentFilters();
  const parentSearch = useOrgUnitSearch();

  useEffect(() => {
    if (filters.parent_id && parentSearch.loadInitialValue) {
      parentSearch.loadInitialValue(filters.parent_id);
    }
  }, [filters.parent_id]);

  const { data, isLoading, isError, error } = useOrgUnits(filters);
  const { data: typesData } = useOrgUnitTypes();
  const createMutation = useCreateOrgUnit();
  const updateMutation = useUpdateOrgUnit();
  const deleteMutation = useDeleteOrgUnit();

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
    setSelectedOrgUnit(null);
    setFormOpen(true);
  };

  const handleView = (orgUnit: OrgUnit) => {
    setOrgUnitToView(orgUnit);
    setDetailDialogOpen(true);
  };

  const handleEdit = (orgUnit: OrgUnit) => {
    setSelectedOrgUnit(orgUnit);
    setFormOpen(true);
  };

  const handleDelete = (orgUnit: OrgUnit) => {
    setOrgUnitToDelete(orgUnit);
    setConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!orgUnitToDelete) return;
    deleteMutation.mutate(orgUnitToDelete.id, {
      onSuccess: () => {
        setConfirmOpen(false);
        setOrgUnitToDelete(null);
      },
    });
  };

  const handleSubmit = (formData: CreateOrgUnitRequest | UpdateOrgUnitRequest) => {
    if (selectedOrgUnit) {
      updateMutation.mutate(
        { orgUnitId: selectedOrgUnit.id, data: formData as UpdateOrgUnitRequest },
        {
          onSuccess: () => {
            setFormOpen(false);
            setSelectedOrgUnit(null);
          },
        },
      );
    } else {
      createMutation.mutate(formData as CreateOrgUnitRequest, {
        onSuccess: () => {
          setFormOpen(false);
        },
      });
    }
  };

  const orgUnitTypes = typesData?.data?.types || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manajemen Unit Organisasi"
        description="Kelola data unit organisasi"
        breadcrumb={[
          { label: 'Dashboard', href: '/' },
          { label: 'Unit Organisasi' },
        ]}
        actions={
          canCreate && (
            <Button onClick={handleCreate} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Unit Organisasi
            </Button>
          )
        }
      />

      <Filtering
        searchValue={filters.search || ''}
        onSearchChange={handleSearch}
        searchPlaceholder="Cari berdasarkan kode atau nama..."
        onClearFilters={handleClearFilters}
      >
        <Field>
          <FieldLabel>Tipe Unit</FieldLabel>
          <FieldContent>
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <Layers className="h-4 w-4 text-muted-foreground" />
              </InputGroupAddon>
              <Select
                value={filters.type_filter || 'all'}
                onValueChange={(value) => {
                  urlFiltersHook.updateURL({
                    type_filter: value === 'all' ? undefined : value,
                    page: 1,
                  });
                }}
              >
                <SelectTrigger className="flex-1 border-0 shadow-none focus:ring-0">
                  <SelectValue placeholder="Semua Tipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tipe</SelectItem>
                  {orgUnitTypes.map((type: string) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </InputGroup>
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>Parent Unit</FieldLabel>
          <FieldContent>
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </InputGroupAddon>
              <div className="flex-1">
                <Combobox
                  options={parentSearch.options}
                  value={filters.parent_id}
                  onChange={(value) => {
                    urlFiltersHook.updateURL({
                      parent_id: value as number,
                      page: 1,
                    });
                  }}
                  placeholder="Semua Parent Unit"
                  searchPlaceholder="Cari berdasarkan kode/nama..."
                  searchValue={parentSearch.searchTerm}
                  onSearchChange={parentSearch.setSearchTerm}
                  emptyMessage={
                    parentSearch.searchTerm
                      ? 'Tidak ada unit organisasi yang ditemukan'
                      : 'Pilih unit organisasi induk'
                  }
                  isLoading={parentSearch.isSearching}
                  enableInfiniteScroll={true}
                  onLoadMore={parentSearch.loadMore}
                  hasNextPage={parentSearch.hasMoreData}
                  isLoadingMore={parentSearch.isLoadingMore}
                  pagination={parentSearch.pagination}
                  className="border-0 shadow-none focus:ring-0"
                />
              </div>
            </InputGroup>
          </FieldContent>
        </Field>
      </Filtering>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Unit Organisasi</CardTitle>
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
                    : 'Gagal memuat data unit organisasi'}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}

          {!isLoading && !isError && data && data.data.length === 0 && (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>
                  {hasActiveFilters ? 'Tidak Ada Hasil' : 'Tidak Ada Data'}
                </EmptyTitle>
                <EmptyDescription>
                  {hasActiveFilters
                    ? 'Tidak ada unit organisasi yang sesuai dengan filter'
                    : 'Belum ada unit organisasi yang terdaftar'}
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
                      Tambah Unit Organisasi
                    </Button>
                  )
                )}
              </EmptyContent>
            </Empty>
          )}

          {!isLoading && !isError && data && data.data.length > 0 && (
            <>
              {isDesktop ? (
                <OrgUnitTableView
                  orgUnits={data.data}
                  onView={handleView}
                  onEdit={canUpdate ? handleEdit : undefined}
                  onDelete={canDelete ? handleDelete : undefined}
                />
              ) : (
                <ItemGroup>
                  {data.data.map((orgUnit) => (
                    <OrgUnitCardView
                      key={orgUnit.id}
                      orgUnit={orgUnit}
                      onView={handleView}
                      onEdit={canUpdate ? handleEdit : undefined}
                      onDelete={canDelete ? handleDelete : undefined}
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

      <OrgUnitFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        orgUnit={selectedOrgUnit}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        orgUnitTypes={orgUnitTypes}
      />

      <OrgUnitDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        orgUnit={orgUnitToView}
      />

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Hapus Unit Organisasi?"
        description={`Apakah Anda yakin ingin menghapus unit organisasi "${orgUnitToDelete?.name}"? Data yang dihapus dapat dipulihkan kembali dari menu Unit Terhapus.`}
        variant="danger"
        onConfirm={confirmDelete}
        isProcessing={deleteMutation.isPending}
        confirmText="Hapus"
        cancelText="Batal"
      />
    </div>
  );
};

export default OrgUnitList;
