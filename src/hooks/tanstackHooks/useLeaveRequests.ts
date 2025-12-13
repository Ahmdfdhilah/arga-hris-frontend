import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { leaveRequestsService } from '@/services/leave-requests';
import type {
  LeaveRequest,
  LeaveRequestWithEmployee,
  LeaveRequestCreateRequest,
  LeaveRequestUpdateRequest,
  LeaveRequestFilterParams,
} from '@/services/leave-requests/types';
import type {
  PaginationParams,
  PaginatedApiResponse,
  ApiResponse,
} from '@/services/base/types';
import { handleApiError } from '@/utils/errorHandler';

export const leaveRequestsKeys = {
  all: ['leave-requests'] as const,
  lists: () => [...leaveRequestsKeys.all, 'list'] as const,
  list: (filters: PaginationParams & LeaveRequestFilterParams) =>
    [...leaveRequestsKeys.lists(), filters] as const,
  myLeaveRequests: () => [...leaveRequestsKeys.all, 'my-leave-requests'] as const,
  myLeaveRequestsList: (filters: PaginationParams & LeaveRequestFilterParams) =>
    [...leaveRequestsKeys.myLeaveRequests(), filters] as const,
  teamLeaveRequests: (filters: PaginationParams & Omit<LeaveRequestFilterParams, 'employee_id'>) =>
    [...leaveRequestsKeys.all, 'team', filters] as const,
  details: () => [...leaveRequestsKeys.all, 'detail'] as const,
  detail: (id: number) => [...leaveRequestsKeys.details(), id] as const,
};

export const useLeaveRequests = (
  filters: PaginationParams & LeaveRequestFilterParams,
  options?: Omit<
    UseQueryOptions<
      PaginatedApiResponse<LeaveRequestWithEmployee>,
      Error,
      PaginatedApiResponse<LeaveRequestWithEmployee>,
      ReturnType<typeof leaveRequestsKeys.list>
    >,
    'queryKey' | 'queryFn'
  >,
) => {
  return useQuery({
    queryKey: leaveRequestsKeys.list(filters),
    queryFn: () => leaveRequestsService.getLeaveRequests(filters),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useMyLeaveRequests = (
  filters: PaginationParams & LeaveRequestFilterParams,
  options?: Omit<
    UseQueryOptions<
      PaginatedApiResponse<LeaveRequestWithEmployee>,
      Error,
      PaginatedApiResponse<LeaveRequestWithEmployee>,
      ReturnType<typeof leaveRequestsKeys.myLeaveRequestsList>
    >,
    'queryKey' | 'queryFn'
  >,
) => {
  return useQuery({
    queryKey: leaveRequestsKeys.myLeaveRequestsList(filters),
    queryFn: () => leaveRequestsService.getMyLeaveRequests(filters),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useTeamLeaveRequests = (
  filters: PaginationParams & Omit<LeaveRequestFilterParams, 'employee_id'>,
  options?: Omit<
    UseQueryOptions<
      PaginatedApiResponse<LeaveRequestWithEmployee>,
      Error,
      PaginatedApiResponse<LeaveRequestWithEmployee>,
      ReturnType<typeof leaveRequestsKeys.teamLeaveRequests>
    >,
    'queryKey' | 'queryFn'
  >,
) => {
  return useQuery({
    queryKey: leaveRequestsKeys.teamLeaveRequests(filters),
    queryFn: () => leaveRequestsService.getTeamLeaveRequests(filters),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useLeaveRequest = (
  leaveRequestId: number | null,
  options?: Omit<
    UseQueryOptions<
      ApiResponse<LeaveRequest>,
      Error,
      ApiResponse<LeaveRequest>,
      ReturnType<typeof leaveRequestsKeys.detail>
    >,
    'queryKey' | 'queryFn' | 'enabled'
  >,
) => {
  return useQuery({
    queryKey: leaveRequestsKeys.detail(leaveRequestId!),
    queryFn: () => leaveRequestsService.getLeaveRequest(leaveRequestId!),
    enabled: !!leaveRequestId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useCreateLeaveRequest = (
  options?: Omit<
    UseMutationOptions<
      ApiResponse<LeaveRequest>,
      Error,
      LeaveRequestCreateRequest
    >,
    'mutationFn'
  >,
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...restOptions } = options || {};

  return useMutation({
    ...restOptions,
    mutationFn: (data: LeaveRequestCreateRequest) =>
      leaveRequestsService.createLeaveRequest(data),
    onSuccess: (response, variables, context, _mutation) => {
      queryClient.invalidateQueries({ queryKey: leaveRequestsKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: leaveRequestsKeys.myLeaveRequests(),
      });
      queryClient.invalidateQueries({
        queryKey: leaveRequestsKeys.all,
        predicate: (query) => query.queryKey[1] === 'team',
      });

      toast.success('Pengajuan cuti berhasil dibuat');

      onSuccess?.(response, variables, context, _mutation);
    },
    onError: (error, variables, context, _mutation) => {
      const apiError = handleApiError(error);

      toast.error(apiError.message);

      onError?.(error, variables, context, _mutation);
    },
  });
};

export const useUpdateLeaveRequest = (
  options?: Omit<
    UseMutationOptions<
      ApiResponse<LeaveRequest>,
      Error,
      { leaveRequestId: number; data: LeaveRequestUpdateRequest }
    >,
    'mutationFn'
  >,
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...restOptions } = options || {};

  return useMutation({
    ...restOptions,
    mutationFn: ({
      leaveRequestId,
      data,
    }: {
      leaveRequestId: number;
      data: LeaveRequestUpdateRequest;
    }) => leaveRequestsService.updateLeaveRequest(leaveRequestId, data),
    onSuccess: (response, variables, context, _mutation) => {
      queryClient.invalidateQueries({ queryKey: leaveRequestsKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: leaveRequestsKeys.myLeaveRequests(),
      });
      queryClient.invalidateQueries({
        queryKey: leaveRequestsKeys.all,
        predicate: (query) => query.queryKey[1] === 'team',
      });
      queryClient.invalidateQueries({
        queryKey: leaveRequestsKeys.detail(variables.leaveRequestId),
      });

      toast.success('Pengajuan cuti berhasil diupdate');
      onSuccess?.(response, variables, context, _mutation);
    },
    onError: (error, variables, context, _mutation) => {
      const apiError = handleApiError(error);
      toast.error(apiError.message);
      onError?.(error, variables, context, _mutation);
    },
  });
};

export const useDeleteLeaveRequest = (
  options?: Omit<
    UseMutationOptions<ApiResponse<null>, Error, number>,
    'mutationFn'
  >,
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...restOptions } = options || {};

  return useMutation({
    ...restOptions,
    mutationFn: (leaveRequestId: number) =>
      leaveRequestsService.deleteLeaveRequest(leaveRequestId),
    onSuccess: (response, variables, context, _mutation) => {
      queryClient.invalidateQueries({ queryKey: leaveRequestsKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: leaveRequestsKeys.myLeaveRequests(),
      });
      queryClient.invalidateQueries({
        queryKey: leaveRequestsKeys.all,
        predicate: (query) => query.queryKey[1] === 'team',
      });
      queryClient.invalidateQueries({
        queryKey: leaveRequestsKeys.detail(variables),
      });

      toast.success('Pengajuan cuti berhasil dihapus');
      onSuccess?.(response, variables, context, _mutation);
    },
    onError: (error, variables, context, _mutation) => {
      const apiError = handleApiError(error);
      toast.error(apiError.message);
      onError?.(error, variables, context, _mutation);
    },
  });
};
