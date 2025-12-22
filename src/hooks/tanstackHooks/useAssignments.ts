import {
    useQuery,
    useMutation,
    useQueryClient,
    type UseQueryOptions,
    type UseMutationOptions,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { assignmentsService } from '@/services/assignments';
import type {
    Assignment,
    AssignmentCreateRequest,
    AssignmentFilterParams,
} from '@/services/assignments/types';
import type { PaginationParams, PaginatedApiResponse, ApiResponse } from '@/services/base/types';
import { handleApiError } from '@/utils/errorHandler';

/**
 * Query keys untuk assignments
 */
export const assignmentsKeys = {
    all: ['assignments'] as const,
    lists: () => [...assignmentsKeys.all, 'list'] as const,
    list: (filters: PaginationParams & AssignmentFilterParams) =>
        [...assignmentsKeys.lists(), filters] as const,
    details: () => [...assignmentsKeys.all, 'detail'] as const,
    detail: (id: number) => [...assignmentsKeys.details(), id] as const,
};

/**
 * Hook untuk mendapatkan list assignments dengan pagination dan filter
 */
export const useAssignments = (
    filters: PaginationParams & AssignmentFilterParams,
    options?: Omit<
        UseQueryOptions<
            PaginatedApiResponse<Assignment>,
            Error,
            PaginatedApiResponse<Assignment>,
            ReturnType<typeof assignmentsKeys.list>
        >,
        'queryKey' | 'queryFn'
    >,
) => {
    return useQuery({
        queryKey: assignmentsKeys.list(filters),
        queryFn: () => assignmentsService.getAssignments(filters),
        staleTime: 5 * 60 * 1000,
        ...options,
    });
};

/**
 * Hook untuk mendapatkan single assignment by ID
 */
export const useAssignment = (
    assignmentId: number | null,
    options?: Omit<
        UseQueryOptions<
            ApiResponse<Assignment>,
            Error,
            ApiResponse<Assignment>,
            ReturnType<typeof assignmentsKeys.detail>
        >,
        'queryKey' | 'queryFn' | 'enabled'
    >,
) => {
    return useQuery({
        queryKey: assignmentsKeys.detail(assignmentId!),
        queryFn: () => assignmentsService.getAssignment(assignmentId!),
        enabled: !!assignmentId,
        staleTime: 5 * 60 * 1000,
        ...options,
    });
};

/**
 * Hook untuk create assignment
 */
export const useCreateAssignment = (
    options?: Omit<
        UseMutationOptions<ApiResponse<Assignment>, Error, AssignmentCreateRequest>,
        'mutationFn'
    >,
) => {
    const queryClient = useQueryClient();
    const { onSuccess, onError, ...restOptions } = options || {};

    return useMutation({
        ...restOptions,
        mutationFn: (data: AssignmentCreateRequest) => assignmentsService.createAssignment(data),
        onSuccess: (response, variables, context, _mutation) => {
            queryClient.invalidateQueries({ queryKey: assignmentsKeys.lists() });

            toast.success('Assignment berhasil dibuat');
            onSuccess?.(response, variables, context, _mutation);
        },
        onError: (error, variables, context, _mutation) => {
            const apiError = handleApiError(error);
            toast.error(apiError.message);
            onError?.(error, variables, context, _mutation);
        },
    });
};

/**
 * Hook untuk cancel assignment
 */
export const useCancelAssignment = (
    options?: Omit<
        UseMutationOptions<ApiResponse<Assignment>, Error, number>,
        'mutationFn'
    >,
) => {
    const queryClient = useQueryClient();
    const { onSuccess, onError, ...restOptions } = options || {};

    return useMutation({
        ...restOptions,
        mutationFn: (id: number) => assignmentsService.cancelAssignment(id),
        onSuccess: (response, variables, context, _mutation) => {
            queryClient.invalidateQueries({ queryKey: assignmentsKeys.lists() });
            queryClient.invalidateQueries({
                queryKey: assignmentsKeys.detail(variables),
            });

            toast.success('Assignment berhasil dibatalkan');
            onSuccess?.(response, variables, context, _mutation);
        },
        onError: (error, variables, context, _mutation) => {
            const apiError = handleApiError(error);
            toast.error(apiError.message);
            onError?.(error, variables, context, _mutation);
        },
    });
};
