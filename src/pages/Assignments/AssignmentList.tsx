import { PageHeader } from '@/components/common/Header';
import {
    Card,
    CardContent,
    Spinner,
    Empty,
    EmptyHeader,
    EmptyTitle,
    EmptyDescription,
    Pagination,
    ItemGroup,
} from '@/components/common';
import { useURLFilters } from '@/hooks/useURLFilters';
import { useResponsive } from '@/hooks/useResponsive';
import { useAssignments } from '@/hooks/tanstackHooks/useAssignments';
import type { AssignmentFilterParams } from '@/services/assignments/types';
import type { PaginationParams } from '@/services/base/types';
import AssignmentTableView from './AssignmentTableView';
import AssignmentCardView from './AssignmentCardView';

const AssignmentList: React.FC = () => {
    const { isDesktop } = useResponsive();

    const urlFiltersHook = useURLFilters<PaginationParams & AssignmentFilterParams>({
        defaults: {
            page: 1,
            limit: 10,
        },
    });

    const filters = urlFiltersHook.getCurrentFilters();
    const { data, isLoading, isError, error } = useAssignments(filters);

    const handlePageChange = (page: number) => {
        urlFiltersHook.updateURL({ page });
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Penggantian Sementara"
                description="Daftar penggantian sementara selama karyawan cuti"
                breadcrumb={[
                    { label: 'Dashboard', href: '/' },
                    { label: 'Penggantian Sementara' },
                ]}
            />

            <Card>
                <CardContent className="pt-6">
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
                                        : 'Gagal memuat data'}
                                </EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    )}

                    {!isLoading && !isError && data?.data.length === 0 && (
                        <Empty>
                            <EmptyHeader>
                                <EmptyTitle>Tidak Ada Data</EmptyTitle>
                                <EmptyDescription>
                                    Belum ada data penggantian sementara
                                </EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    )}

                    {!isLoading && !isError && data && data.data.length > 0 && (
                        <>
                            {isDesktop ? (
                                <AssignmentTableView assignments={data.data} />
                            ) : (
                                <ItemGroup>
                                    {data.data.map((assignment) => (
                                        <AssignmentCardView
                                            key={assignment.id}
                                            assignment={assignment}
                                        />
                                    ))}
                                </ItemGroup>
                            )}

                            {data.meta && data.meta.total_pages > 1 && (
                                <div className="mt-4">
                                    <Pagination
                                        currentPage={data.meta.page}
                                        totalPages={data.meta.total_pages}
                                        itemsPerPage={data.meta.limit}
                                        totalItems={data.meta.total_items}
                                        onPageChange={handlePageChange}
                                        onItemsPerPageChange={(value) => {
                                            urlFiltersHook.updateURL({ limit: parseInt(value), page: 1 });
                                        }}
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

export default AssignmentList;
