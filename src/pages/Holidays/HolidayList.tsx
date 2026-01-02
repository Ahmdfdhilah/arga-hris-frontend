import React, { useState } from 'react';
import { Plus, Calendar, Filter, MoreHorizontal } from 'lucide-react';
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
    Badge,
} from '@/components/common';
import { useURLFilters } from '@/hooks/useURLFilters';
import { useAuthStore } from '@/stores/authStore';
import { hasPermission } from '@/services/users/utils';
import {
    useHolidays,
    useCreateHoliday,
    useUpdateHoliday,
    useDeleteHoliday,
} from '@/hooks/tanstackHooks/useHolidays';
import type {
    HolidayListItem,
    HolidayFilterParams,
    CreateHolidayRequest,
    UpdateHolidayRequest,
} from '@/services/holidays/types';
import type { PaginationParams } from '@/services/base/types';
import HolidayFormDialog from './HolidayFormDialog';

const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
};

const HolidayList: React.FC = () => {
    const [formOpen, setFormOpen] = useState(false);
    const [selectedHoliday, setSelectedHoliday] = useState<HolidayListItem | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [holidayToDelete, setHolidayToDelete] = useState<HolidayListItem | null>(null);

    const { userData } = useAuthStore();

    const canWrite = hasPermission(userData, 'holiday:write');
    const canDelete = hasPermission(userData, 'holiday:delete');

    const urlFiltersHook = useURLFilters<PaginationParams & HolidayFilterParams>({
        defaults: {
            page: 1,
            limit: 20,
            year: undefined,
            is_active: undefined,
        },
    });

    const filters = urlFiltersHook.getCurrentFilters();

    const { data, isLoading, isError, error } = useHolidays(filters);

    const createMutation = useCreateHoliday();
    const updateMutation = useUpdateHoliday();
    const deleteMutation = useDeleteHoliday();

    const handleClearFilters = () => {
        urlFiltersHook.resetFilters();
    };

    const handleItemsPerPageChange = (value: string) => {
        urlFiltersHook.updateURL({ limit: parseInt(value), page: 1 });
    };

    const hasActiveFilters = urlFiltersHook.hasActiveFilters();

    const handleCreate = () => {
        setSelectedHoliday(null);
        setFormOpen(true);
    };

    const handleEdit = (holiday: HolidayListItem) => {
        setSelectedHoliday(holiday);
        setFormOpen(true);
    };

    const handleDelete = (holiday: HolidayListItem) => {
        setHolidayToDelete(holiday);
        setConfirmOpen(true);
    };

    const confirmDelete = () => {
        if (!holidayToDelete) return;

        deleteMutation.mutate(holidayToDelete.id, {
            onSuccess: () => {
                setConfirmOpen(false);
                setHolidayToDelete(null);
            },
        });
    };

    const handleSubmit = (formData: CreateHolidayRequest | UpdateHolidayRequest) => {
        if (selectedHoliday) {
            updateMutation.mutate(
                {
                    holidayId: selectedHoliday.id,
                    data: formData as UpdateHolidayRequest,
                },
                {
                    onSuccess: () => {
                        setFormOpen(false);
                        setSelectedHoliday(null);
                    },
                },
            );
        } else {
            createMutation.mutate(formData as CreateHolidayRequest, {
                onSuccess: () => {
                    setFormOpen(false);
                },
            });
        }
    };

    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear + i - 2);

    return (
        <div className="space-y-6">
            <PageHeader
                title="Hari Libur Nasional"
                description="Kelola kalender hari libur nasional dan cuti bersama"
                breadcrumb={[
                    { label: 'Dashboard', href: '/' },
                    { label: 'Hari Libur' },
                ]}
                actions={
                    canWrite && (
                        <Button size="sm" onClick={handleCreate}>
                            <Plus className="h-4 w-4 mr-2" />
                            Tambah Hari Libur
                        </Button>
                    )
                }
            />

            <Card>
                <CardHeader>
                    <CardTitle>Filter Hari Libur</CardTitle>
                </CardHeader>
                <CardContent>
                    <Filtering onClearFilters={handleClearFilters} showSearch={false}>
                        <Field>
                            <FieldLabel>Tahun</FieldLabel>
                            <FieldContent>
                                <InputGroup>
                                    <InputGroupAddon align="inline-start">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                    </InputGroupAddon>
                                    <Select
                                        value={filters.year?.toString() || 'all'}
                                        onValueChange={(value) => {
                                            urlFiltersHook.updateURL({
                                                year: value === 'all' ? undefined : parseInt(value),
                                                page: 1,
                                            });
                                        }}
                                    >
                                        <SelectTrigger className="flex-1 border-0 shadow-none focus:ring-0">
                                            <SelectValue placeholder="Semua Tahun" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua Tahun</SelectItem>
                                            {yearOptions.map((year) => (
                                                <SelectItem key={year} value={year.toString()}>
                                                    {year}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
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
                                        value={filters.is_active === undefined ? 'all' : filters.is_active.toString()}
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
                                            <SelectItem value="true">Aktif</SelectItem>
                                            <SelectItem value="false">Tidak Aktif</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </InputGroup>
                            </FieldContent>
                        </Field>
                    </Filtering>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Daftar Hari Libur</CardTitle>
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
                                    {error instanceof Error ? error.message : 'Gagal memuat data hari libur'}
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
                                        ? 'Tidak ada hari libur yang sesuai dengan filter'
                                        : 'Belum ada hari libur yang terdaftar'}
                                </EmptyDescription>
                            </EmptyHeader>
                            <EmptyContent>
                                {hasActiveFilters ? (
                                    <Button variant="outline" onClick={handleClearFilters}>
                                        Hapus Filter
                                    </Button>
                                ) : (
                                    canWrite && (
                                        <Button onClick={handleCreate}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Tambah Hari Libur
                                        </Button>
                                    )
                                )}
                            </EmptyContent>
                        </Empty>
                    )}

                    {!isLoading && !isError && data && data.data.length > 0 && (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Tanggal</TableHead>
                                        <TableHead>Nama</TableHead>
                                        <TableHead>Status</TableHead>
                                        {(canWrite || canDelete) && <TableHead className="w-[80px]">Aksi</TableHead>}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.data.map((holiday) => (
                                        <TableRow key={holiday.id}>
                                            <TableCell>{formatDate(holiday.date)}</TableCell>
                                            <TableCell className="font-medium">{holiday.name}</TableCell>
                                            <TableCell>
                                                <Badge variant={holiday.is_active ? 'default' : 'secondary'}>
                                                    {holiday.is_active ? 'Aktif' : 'Tidak Aktif'}
                                                </Badge>
                                            </TableCell>
                                            {(canWrite || canDelete) && (
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            {canWrite && (
                                                                <DropdownMenuItem onClick={() => handleEdit(holiday)}>
                                                                    Edit
                                                                </DropdownMenuItem>
                                                            )}
                                                            {canDelete && (
                                                                <DropdownMenuItem
                                                                    className="text-destructive"
                                                                    onClick={() => handleDelete(holiday)}
                                                                >
                                                                    Hapus
                                                                </DropdownMenuItem>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
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

            <HolidayFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                holiday={selectedHoliday}
                onSubmit={handleSubmit}
                isLoading={createMutation.isPending || updateMutation.isPending}
            />

            <ConfirmDialog
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                title="Hapus Hari Libur?"
                description={`Apakah Anda yakin ingin menghapus "${holidayToDelete?.name}"? Tindakan ini tidak dapat dibatalkan.`}
                variant="danger"
                onConfirm={confirmDelete}
                isProcessing={deleteMutation.isPending}
                confirmText="Hapus"
                cancelText="Batal"
            />
        </div>
    );
};

export default HolidayList;
