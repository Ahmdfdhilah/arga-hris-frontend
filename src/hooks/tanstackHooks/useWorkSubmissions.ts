import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { workSubmissionsService } from '@/services/work-submissions';
import type {
  WorkSubmission,
  WorkSubmissionListItem,
  WorkSubmissionCreateRequest,
  WorkSubmissionUpdateRequest,
  WorkSubmissionFilterParams,
} from '@/services/work-submissions/types';
import type { PaginationParams, PaginatedApiResponse, ApiResponse } from '@/services/base/types';
import { handleApiError } from '@/utils/errorHandler';

// Query Keys
export const workSubmissionsKeys = {
  all: ['work-submissions'] as const,
  lists: () => [...workSubmissionsKeys.all, 'list'] as const,
  list: (filters: PaginationParams & WorkSubmissionFilterParams) =>
    [...workSubmissionsKeys.lists(), filters] as const,
  mySubmissions: (filters: PaginationParams & WorkSubmissionFilterParams) =>
    [...workSubmissionsKeys.all, 'my-submissions', filters] as const,
  details: () => [...workSubmissionsKeys.all, 'detail'] as const,
  detail: (id: number) => [...workSubmissionsKeys.details(), id] as const,
};


/**
 * Hook untuk mendapatkan work submissions employee sendiri
 */
export const useMyWorkSubmissions = (
  filters: PaginationParams & WorkSubmissionFilterParams,
  options?: Omit<
    UseQueryOptions<
      PaginatedApiResponse<WorkSubmission>,
      Error,
      PaginatedApiResponse<WorkSubmission>,
      ReturnType<typeof workSubmissionsKeys.mySubmissions>
    >,
    'queryKey' | 'queryFn'
  >,
) => {
  return useQuery({
    queryKey: workSubmissionsKeys.mySubmissions(filters),
    queryFn: () => workSubmissionsService.getMySubmissions(filters),
    staleTime: 2 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook untuk mendapatkan semua work submissions (admin)
 */
export const useWorkSubmissions = (
  filters: PaginationParams & WorkSubmissionFilterParams,
  options?: Omit<
    UseQueryOptions<
      PaginatedApiResponse<WorkSubmissionListItem>,
      Error,
      PaginatedApiResponse<WorkSubmissionListItem>,
      ReturnType<typeof workSubmissionsKeys.list>
    >,
    'queryKey' | 'queryFn'
  >,
) => {
  return useQuery({
    queryKey: workSubmissionsKeys.list(filters),
    queryFn: () => workSubmissionsService.getAllSubmissions(filters),
    staleTime: 2 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook untuk mendapatkan single work submission by ID
 */
export const useWorkSubmission = (
  submissionId: number | null,
  options?: Omit<
    UseQueryOptions<
      ApiResponse<WorkSubmission>,
      Error,
      ApiResponse<WorkSubmission>,
      ReturnType<typeof workSubmissionsKeys.detail>
    >,
    'queryKey' | 'queryFn' | 'enabled'
  >,
) => {
  return useQuery({
    queryKey: workSubmissionsKeys.detail(submissionId!),
    queryFn: () => workSubmissionsService.getSubmissionById(submissionId!),
    enabled: !!submissionId,
    staleTime: 2 * 60 * 1000,
    ...options,
  });
};

// ==================== Mutations ====================

/**
 * Hook untuk membuat work submission baru
 */
export const useCreateWorkSubmission = (
  options?: Omit<
    UseMutationOptions<
      ApiResponse<WorkSubmission>,
      Error,
      WorkSubmissionCreateRequest
    >,
    'mutationFn'
  >,
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...restOptions } = options || {};

  return useMutation({
    ...restOptions,
    mutationFn: (data: WorkSubmissionCreateRequest) =>
      workSubmissionsService.createSubmission(data),
    onSuccess: (response, variables, context, _mutation) => {
      queryClient.invalidateQueries({ queryKey: workSubmissionsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: workSubmissionsKeys.all });

      toast.success('Work submission berhasil dibuat');
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
 * Hook untuk update work submission
 */
export const useUpdateWorkSubmission = (
  options?: Omit<
    UseMutationOptions<
      ApiResponse<WorkSubmission>,
      Error,
      { id: number; data: WorkSubmissionUpdateRequest }
    >,
    'mutationFn'
  >,
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...restOptions } = options || {};

  return useMutation({
    ...restOptions,
    mutationFn: ({ id, data }: { id: number; data: WorkSubmissionUpdateRequest }) =>
      workSubmissionsService.updateSubmission(id, data),
    onSuccess: (response, variables, context, _mutation) => {
      queryClient.invalidateQueries({ queryKey: workSubmissionsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: workSubmissionsKeys.details() });
      queryClient.invalidateQueries({ queryKey: workSubmissionsKeys.all });

      toast.success('Work submission berhasil diupdate');
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
 * Hook untuk delete work submission
 */
export const useDeleteWorkSubmission = (
  options?: Omit<
    UseMutationOptions<ApiResponse<null>, Error, number>,
    'mutationFn'
  >,
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...restOptions } = options || {};

  return useMutation({
    ...restOptions,
    mutationFn: (id: number) => workSubmissionsService.deleteSubmission(id),
    onSuccess: (response, variables, context, _mutation) => {
      queryClient.invalidateQueries({ queryKey: workSubmissionsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: workSubmissionsKeys.all });

      toast.success('Work submission berhasil dihapus');
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
 * Hook untuk upload files ke work submission
 */
export const useUploadWorkSubmissionFiles = (
  options?: Omit<
    UseMutationOptions<
      ApiResponse<WorkSubmission>,
      Error,
      { submissionId: number; files: File[] }
    >,
    'mutationFn'
  >,
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...restOptions } = options || {};

  return useMutation({
    ...restOptions,
    mutationFn: ({ submissionId, files }: { submissionId: number; files: File[] }) =>
      workSubmissionsService.uploadFiles(submissionId, files),
    onSuccess: (response, variables, context, _mutation) => {
      queryClient.invalidateQueries({ queryKey: workSubmissionsKeys.details() });
      queryClient.invalidateQueries({ queryKey: workSubmissionsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: workSubmissionsKeys.all });

      toast.success('Files berhasil diupload');
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
 * Hook untuk delete file dari work submission
 */
export const useDeleteWorkSubmissionFile = (
  options?: Omit<
    UseMutationOptions<
      ApiResponse<WorkSubmission>,
      Error,
      { submissionId: number; filePath: string }
    >,
    'mutationFn'
  >,
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...restOptions } = options || {};

  return useMutation({
    ...restOptions,
    mutationFn: ({ submissionId, filePath }: { submissionId: number; filePath: string }) =>
      workSubmissionsService.deleteFile(submissionId, filePath),
    onSuccess: (response, variables, context, _mutation) => {
      queryClient.invalidateQueries({ queryKey: workSubmissionsKeys.details() });
      queryClient.invalidateQueries({ queryKey: workSubmissionsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: workSubmissionsKeys.all });

      toast.success('File berhasil dihapus');
      onSuccess?.(response, variables, context, _mutation);
    },
    onError: (error, variables, context, _mutation) => {
      const apiError = handleApiError(error);
      toast.error(apiError.message);
      onError?.(error, variables, context, _mutation);
    },
  });
};
