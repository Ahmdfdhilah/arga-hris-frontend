import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { orgUnitsService } from '@/services/org_units';
import type {
  OrgUnit,
  OrgUnitHierarchy,
  OrgUnitTypes,
  CreateOrgUnitRequest,
  UpdateOrgUnitRequest,
  OrgUnitFilterParams,
} from '@/services/org_units/types';
import type { PaginationParams, PaginatedApiResponse, ApiResponse } from '@/services/base/types';
import { handleApiError } from '@/utils/errorHandler';

export const orgUnitsKeys = {
  all: ['orgUnits'] as const,
  lists: () => [...orgUnitsKeys.all, 'list'] as const,
  list: (filters: PaginationParams & OrgUnitFilterParams) =>
    [...orgUnitsKeys.lists(), filters] as const,
  details: () => [...orgUnitsKeys.all, 'detail'] as const,
  detail: (id: number) => [...orgUnitsKeys.details(), id] as const,
  children: (id: number, params: PaginationParams) =>
    [...orgUnitsKeys.all, 'children', id, params] as const,
  hierarchy: (id: number) => [...orgUnitsKeys.all, 'hierarchy', id] as const,
  types: () => [...orgUnitsKeys.all, 'types'] as const,
  // Deleted/Archived keys
  deletedLists: () => [...orgUnitsKeys.all, 'deleted', 'list'] as const,
  deletedList: (filters: PaginationParams & { search?: string }) =>
    [...orgUnitsKeys.deletedLists(), filters] as const,
};

export const useOrgUnits = (
  filters: PaginationParams & OrgUnitFilterParams,
  options?: Omit<
    UseQueryOptions<
      PaginatedApiResponse<OrgUnit>,
      Error,
      PaginatedApiResponse<OrgUnit>,
      ReturnType<typeof orgUnitsKeys.list>
    >,
    'queryKey' | 'queryFn'
  >,
) => {
  return useQuery({
    queryKey: orgUnitsKeys.list(filters),
    queryFn: () => orgUnitsService.listOrgUnits(filters),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useOrgUnit = (
  orgUnitId: number | null,
  options?: Omit<
    UseQueryOptions<
      ApiResponse<OrgUnit>,
      Error,
      ApiResponse<OrgUnit>,
      ReturnType<typeof orgUnitsKeys.detail>
    >,
    'queryKey' | 'queryFn' | 'enabled'
  >,
) => {
  return useQuery({
    queryKey: orgUnitsKeys.detail(orgUnitId!),
    queryFn: () => orgUnitsService.getOrgUnit(orgUnitId!),
    enabled: !!orgUnitId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useOrgUnitChildren = (
  orgUnitId: number | null,
  params: PaginationParams,
  options?: Omit<
    UseQueryOptions<
      PaginatedApiResponse<OrgUnit>,
      Error,
      PaginatedApiResponse<OrgUnit>,
      ReturnType<typeof orgUnitsKeys.children>
    >,
    'queryKey' | 'queryFn' | 'enabled'
  >,
) => {
  return useQuery({
    queryKey: orgUnitsKeys.children(orgUnitId!, params),
    queryFn: () => orgUnitsService.getOrgUnitChildren(orgUnitId!, params),
    enabled: !!orgUnitId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useOrgUnitHierarchy = (
  orgUnitId: number | null,
  options?: Omit<
    UseQueryOptions<
      ApiResponse<OrgUnitHierarchy>,
      Error,
      ApiResponse<OrgUnitHierarchy>,
      ReturnType<typeof orgUnitsKeys.hierarchy>
    >,
    'queryKey' | 'queryFn' | 'enabled'
  >,
) => {
  return useQuery({
    queryKey: orgUnitsKeys.hierarchy(orgUnitId!),
    queryFn: () => orgUnitsService.getOrgUnitHierarchy(orgUnitId!),
    enabled: !!orgUnitId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useOrgUnitTypes = (
  options?: Omit<
    UseQueryOptions<
      ApiResponse<OrgUnitTypes>,
      Error,
      ApiResponse<OrgUnitTypes>,
      ReturnType<typeof orgUnitsKeys.types>
    >,
    'queryKey' | 'queryFn'
  >,
) => {
  return useQuery({
    queryKey: orgUnitsKeys.types(),
    queryFn: () => orgUnitsService.getOrgUnitTypes(),
    staleTime: 30 * 60 * 1000,
    ...options,
  });
};

export const useCreateOrgUnit = (
  options?: Omit<
    UseMutationOptions<ApiResponse<OrgUnit>, Error, CreateOrgUnitRequest>,
    'mutationFn'
  >,
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...restOptions } = options || {};

  return useMutation({
    ...restOptions,
    mutationFn: (data: CreateOrgUnitRequest) => orgUnitsService.createOrgUnit(data),
    onSuccess: (response, variables, context, _mutation) => {
      queryClient.invalidateQueries({ queryKey: orgUnitsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orgUnitsKeys.types() });

      toast.success('Unit organisasi berhasil dibuat');

      onSuccess?.(response, variables, context, _mutation);
    },
    onError: (error, variables, context, _mutation) => {
      const apiError = handleApiError(error);

      toast.error(apiError.message);

      onError?.(error, variables, context, _mutation);
    },
  });
};

export const useUpdateOrgUnit = (
  options?: Omit<
    UseMutationOptions<
      ApiResponse<OrgUnit>,
      Error,
      { orgUnitId: number; data: UpdateOrgUnitRequest }
    >,
    'mutationFn'
  >,
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...restOptions } = options || {};

  return useMutation({
    ...restOptions,
    mutationFn: ({ orgUnitId, data }: { orgUnitId: number; data: UpdateOrgUnitRequest }) =>
      orgUnitsService.updateOrgUnit(orgUnitId, data),
    onSuccess: (response, variables, context, _mutation) => {
      queryClient.invalidateQueries({ queryKey: orgUnitsKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: orgUnitsKeys.detail(variables.orgUnitId),
      });
      queryClient.invalidateQueries({
        queryKey: orgUnitsKeys.hierarchy(variables.orgUnitId),
      });

      toast.success('Unit organisasi berhasil diupdate');
      onSuccess?.(response, variables, context, _mutation);
    },
    onError: (error, variables, context, _mutation) => {
      const apiError = handleApiError(error);
      toast.error(apiError.message);
      onError?.(error, variables, context, _mutation);
    },
  });
};

export const useSoftDeleteOrgUnit = (
  options?: Omit<
    UseMutationOptions<ApiResponse<OrgUnit>, Error, number>,
    'mutationFn'
  >,
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...restOptions } = options || {};

  return useMutation({
    ...restOptions,
    mutationFn: (orgUnitId: number) => orgUnitsService.softDeleteOrgUnit(orgUnitId),
    onSuccess: (response, variables, context, _mutation) => {
      queryClient.invalidateQueries({ queryKey: orgUnitsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orgUnitsKeys.deletedLists() });
      queryClient.invalidateQueries({
        queryKey: orgUnitsKeys.detail(variables),
      });

      toast.success('Unit organisasi berhasil dihapus');
      onSuccess?.(response, variables, context, _mutation);
    },
    onError: (error, variables, context, _mutation) => {
      const apiError = handleApiError(error);
      toast.error(apiError.message);
      onError?.(error, variables, context, _mutation);
    },
  });
};

export const useRestoreOrgUnit = (
  options?: Omit<
    UseMutationOptions<ApiResponse<OrgUnit>, Error, number>,
    'mutationFn'
  >,
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...restOptions } = options || {};

  return useMutation({
    ...restOptions,
    mutationFn: (orgUnitId: number) => orgUnitsService.restoreOrgUnit(orgUnitId),
    onSuccess: (response, variables, context, _mutation) => {
      // Invalidate lists to add restored org unit to active list
      queryClient.invalidateQueries({ queryKey: orgUnitsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orgUnitsKeys.deletedLists() });
      queryClient.invalidateQueries({
        queryKey: orgUnitsKeys.detail(variables),
      });

      toast.success('Unit organisasi berhasil di-restore');
      onSuccess?.(response, variables, context, _mutation);
    },
    onError: (error, variables, context, _mutation) => {
      const apiError = handleApiError(error);
      toast.error(apiError.message);
      onError?.(error, variables, context, _mutation);
    },
  });
};

export const useDeletedOrgUnits = (
  filters: PaginationParams & { search?: string },
  options?: Omit<
    UseQueryOptions<
      PaginatedApiResponse<OrgUnit>,
      Error,
      PaginatedApiResponse<OrgUnit>,
      ReturnType<typeof orgUnitsKeys.deletedList>
    >,
    'queryKey' | 'queryFn'
  >,
) => {
  return useQuery({
    queryKey: orgUnitsKeys.deletedList(filters),
    queryFn: () => orgUnitsService.listDeletedOrgUnits(filters),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};
