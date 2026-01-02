import {
    useQuery,
    useMutation,
    useQueryClient,
    type UseQueryOptions,
    type UseMutationOptions,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { holidaysService } from '@/services/holidays';
import type {
    Holiday,
    HolidayListItem,
    IsHolidayResponse,
    CreateHolidayRequest,
    UpdateHolidayRequest,
    HolidayFilterParams,
} from '@/services/holidays/types';
import type {
    PaginationParams,
    PaginatedApiResponse,
    ApiResponse,
} from '@/services/base/types';
import { handleApiError } from '@/utils/errorHandler';

export const holidaysKeys = {
    all: ['holidays'] as const,
    lists: () => [...holidaysKeys.all, 'list'] as const,
    list: (filters: PaginationParams & HolidayFilterParams) =>
        [...holidaysKeys.lists(), filters] as const,
    details: () => [...holidaysKeys.all, 'detail'] as const,
    detail: (id: number) => [...holidaysKeys.details(), id] as const,
    check: (date: string) => [...holidaysKeys.all, 'check', date] as const,
};

export const useHolidays = (
    filters: PaginationParams & HolidayFilterParams,
    options?: Omit<
        UseQueryOptions<
            PaginatedApiResponse<HolidayListItem>,
            Error,
            PaginatedApiResponse<HolidayListItem>,
            ReturnType<typeof holidaysKeys.list>
        >,
        'queryKey' | 'queryFn'
    >,
) => {
    return useQuery({
        queryKey: holidaysKeys.list(filters),
        queryFn: () => holidaysService.getHolidays(filters),
        staleTime: 5 * 60 * 1000,
        ...options,
    });
};

export const useHoliday = (
    holidayId: number | null,
    options?: Omit<
        UseQueryOptions<
            ApiResponse<Holiday>,
            Error,
            ApiResponse<Holiday>,
            ReturnType<typeof holidaysKeys.detail>
        >,
        'queryKey' | 'queryFn' | 'enabled'
    >,
) => {
    return useQuery({
        queryKey: holidaysKeys.detail(holidayId!),
        queryFn: () => holidaysService.getHoliday(holidayId!),
        enabled: !!holidayId,
        staleTime: 5 * 60 * 1000,
        ...options,
    });
};

export const useCheckIsHoliday = (
    date: string | null,
    options?: Omit<
        UseQueryOptions<
            ApiResponse<IsHolidayResponse>,
            Error,
            ApiResponse<IsHolidayResponse>,
            ReturnType<typeof holidaysKeys.check>
        >,
        'queryKey' | 'queryFn' | 'enabled'
    >,
) => {
    return useQuery({
        queryKey: holidaysKeys.check(date!),
        queryFn: () => holidaysService.checkIsHoliday(date!),
        enabled: !!date,
        staleTime: 5 * 60 * 1000,
        ...options,
    });
};

export const useCreateHoliday = (
    options?: Omit<
        UseMutationOptions<ApiResponse<Holiday>, Error, CreateHolidayRequest>,
        'mutationFn'
    >,
) => {
    const queryClient = useQueryClient();
    const { onSuccess, onError, ...restOptions } = options || {};

    return useMutation({
        ...restOptions,
        mutationFn: (data: CreateHolidayRequest) => holidaysService.createHoliday(data),
        onSuccess: (response, variables, context, _mutation) => {
            queryClient.invalidateQueries({ queryKey: holidaysKeys.lists() });
            toast.success('Hari libur berhasil ditambahkan');
            onSuccess?.(response, variables, context, _mutation);
        },
        onError: (error, variables, context, _mutation) => {
            const apiError = handleApiError(error);
            toast.error(apiError.message);
            onError?.(error, variables, context, _mutation);
        },
    });
};

export const useUpdateHoliday = (
    options?: Omit<
        UseMutationOptions<
            ApiResponse<Holiday>,
            Error,
            { holidayId: number; data: UpdateHolidayRequest }
        >,
        'mutationFn'
    >,
) => {
    const queryClient = useQueryClient();
    const { onSuccess, onError, ...restOptions } = options || {};

    return useMutation({
        ...restOptions,
        mutationFn: ({ holidayId, data }: { holidayId: number; data: UpdateHolidayRequest }) =>
            holidaysService.updateHoliday(holidayId, data),
        onSuccess: (response, variables, context, _mutation) => {
            queryClient.invalidateQueries({ queryKey: holidaysKeys.lists() });
            queryClient.invalidateQueries({
                queryKey: holidaysKeys.detail(variables.holidayId),
            });
            toast.success('Hari libur berhasil diupdate');
            onSuccess?.(response, variables, context, _mutation);
        },
        onError: (error, variables, context, _mutation) => {
            const apiError = handleApiError(error);
            toast.error(apiError.message);
            onError?.(error, variables, context, _mutation);
        },
    });
};

export const useDeleteHoliday = (
    options?: Omit<
        UseMutationOptions<ApiResponse<null>, Error, number>,
        'mutationFn'
    >,
) => {
    const queryClient = useQueryClient();
    const { onSuccess, onError, ...restOptions } = options || {};

    return useMutation({
        ...restOptions,
        mutationFn: (holidayId: number) => holidaysService.deleteHoliday(holidayId),
        onSuccess: (response, variables, context, _mutation) => {
            queryClient.invalidateQueries({ queryKey: holidaysKeys.lists() });
            queryClient.invalidateQueries({
                queryKey: holidaysKeys.detail(variables),
            });
            toast.success('Hari libur berhasil dihapus');
            onSuccess?.(response, variables, context, _mutation);
        },
        onError: (error, variables, context, _mutation) => {
            const apiError = handleApiError(error);
            toast.error(apiError.message);
            onError?.(error, variables, context, _mutation);
        },
    });
};
