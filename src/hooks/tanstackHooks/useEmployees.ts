import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { employeesService } from '@/services/employees';
import type {
  Employee,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  EmployeeFilterParams,
  EmployeeSubordinatesParams,
  EmployeesByOrgUnitParams,
  CreateEmployeeWithAccountRequest,
  UpdateEmployeeWithAccountRequest,
  EmployeeWithAccountFilterParams,
  EmployeeAccountResponse,
  EmployeeAccountUpdateResponse,
  EmployeeWithAccount,
  EmployeeAccountData,
} from '@/services/employees/types';
import type { PaginationParams, PaginatedApiResponse, ApiResponse } from '@/services/base/types';
import { handleApiError } from '@/utils/errorHandler';

export const employeesKeys = {
  all: ['employees'] as const,
  lists: () => [...employeesKeys.all, 'list'] as const,
  list: (filters: PaginationParams & EmployeeFilterParams) =>
    [...employeesKeys.lists(), filters] as const,
  details: () => [...employeesKeys.all, 'detail'] as const,
  detail: (id: number) => [...employeesKeys.details(), id] as const,
  subordinates: (id: number, params: PaginationParams & EmployeeSubordinatesParams) =>
    [...employeesKeys.all, 'subordinates', id, params] as const,
  byOrgUnit: (orgUnitId: number, params: PaginationParams & EmployeesByOrgUnitParams) =>
    [...employeesKeys.all, 'byOrgUnit', orgUnitId, params] as const,
  // With Account keys
  withAccountLists: () => [...employeesKeys.all, 'withAccount', 'list'] as const,
  withAccountList: (filters: PaginationParams & EmployeeWithAccountFilterParams) =>
    [...employeesKeys.withAccountLists(), filters] as const,
  withAccountDetails: () => [...employeesKeys.all, 'withAccount', 'detail'] as const,
  withAccountDetail: (userId: number) => [...employeesKeys.withAccountDetails(), userId] as const,
  deletedLists: () => [...employeesKeys.all, 'deleted', 'list'] as const,
  deletedList: (filters: PaginationParams & { search?: string }) =>
    [...employeesKeys.deletedLists(), filters] as const,
};

export const useEmployees = (
  filters: PaginationParams & EmployeeFilterParams,
  options?: Omit<
    UseQueryOptions<
      PaginatedApiResponse<Employee>,
      Error,
      PaginatedApiResponse<Employee>,
      ReturnType<typeof employeesKeys.list>
    >,
    'queryKey' | 'queryFn'
  >,
) => {
  return useQuery({
    queryKey: employeesKeys.list(filters),
    queryFn: () => employeesService.listEmployees(filters),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useEmployee = (
  employeeId: number | null,
  options?: Omit<
    UseQueryOptions<
      ApiResponse<Employee>,
      Error,
      ApiResponse<Employee>,
      ReturnType<typeof employeesKeys.detail>
    >,
    'queryKey' | 'queryFn' | 'enabled'
  >,
) => {
  return useQuery({
    queryKey: employeesKeys.detail(employeeId!),
    queryFn: () => employeesService.getEmployee(employeeId!),
    enabled: !!employeeId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useEmployeeSubordinates = (
  employeeId: number | null,
  params: PaginationParams & EmployeeSubordinatesParams,
  options?: Omit<
    UseQueryOptions<
      PaginatedApiResponse<Employee>,
      Error,
      PaginatedApiResponse<Employee>,
      ReturnType<typeof employeesKeys.subordinates>
    >,
    'queryKey' | 'queryFn' | 'enabled'
  >,
) => {
  return useQuery({
    queryKey: employeesKeys.subordinates(employeeId!, params),
    queryFn: () => employeesService.getEmployeeSubordinates(employeeId!, params),
    enabled: !!employeeId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useEmployeesByOrgUnit = (
  orgUnitId: number | null,
  params: PaginationParams & EmployeesByOrgUnitParams,
  options?: Omit<
    UseQueryOptions<
      PaginatedApiResponse<Employee>,
      Error,
      PaginatedApiResponse<Employee>,
      ReturnType<typeof employeesKeys.byOrgUnit>
    >,
    'queryKey' | 'queryFn' | 'enabled'
  >,
) => {
  return useQuery({
    queryKey: employeesKeys.byOrgUnit(orgUnitId!, params),
    queryFn: () => employeesService.getEmployeesByOrgUnit(orgUnitId!, params),
    enabled: !!orgUnitId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useCreateEmployee = (
  options?: Omit<
    UseMutationOptions<ApiResponse<Employee>, Error, CreateEmployeeRequest>,
    'mutationFn'
  >,
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...restOptions } = options || {};

  return useMutation({
    ...restOptions,
    mutationFn: (data: CreateEmployeeRequest) => employeesService.createEmployee(data),
    onSuccess: (response, variables, context, _mutation) => {
      queryClient.invalidateQueries({ queryKey: employeesKeys.lists() });

      toast.success('Karyawan berhasil dibuat');

      onSuccess?.(response, variables, context, _mutation);
    },
    onError: (error, variables, context, _mutation) => {
      const apiError = handleApiError(error);

      toast.error(apiError.message);

      onError?.(error, variables, context, _mutation);
    },
  });
};

export const useUpdateEmployee = (
  options?: Omit<
    UseMutationOptions<
      ApiResponse<Employee>,
      Error,
      { employeeId: number; data: UpdateEmployeeRequest }
    >,
    'mutationFn'
  >,
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...restOptions } = options || {};

  return useMutation({
    ...restOptions,
    mutationFn: ({ employeeId, data }: { employeeId: number; data: UpdateEmployeeRequest }) =>
      employeesService.updateEmployee(employeeId, data),
    onSuccess: (response, variables, context, _mutation) => {
      queryClient.invalidateQueries({ queryKey: employeesKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: employeesKeys.detail(variables.employeeId),
      });

      toast.success('Karyawan berhasil diupdate');
      onSuccess?.(response, variables, context, _mutation);
    },
    onError: (error, variables, context, _mutation) => {
      const apiError = handleApiError(error);
      toast.error(apiError.message);
      onError?.(error, variables, context, _mutation);
    },
  });
};

export const useDeactivateEmployee = (
  options?: Omit<
    UseMutationOptions<ApiResponse<Employee>, Error, number>,
    'mutationFn'
  >,
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...restOptions } = options || {};

  return useMutation({
    ...restOptions,
    mutationFn: (employeeId: number) => employeesService.deactivateEmployee(employeeId),
    onSuccess: (response, variables, context, _mutation) => {
      queryClient.invalidateQueries({ queryKey: employeesKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: employeesKeys.detail(variables),
      });

      toast.success('Karyawan berhasil dinonaktifkan');
      onSuccess?.(response, variables, context, _mutation);
    },
    onError: (error, variables, context, _mutation) => {
      const apiError = handleApiError(error);
      toast.error(apiError.message);
      onError?.(error, variables, context, _mutation);
    },
  });
};

export const useEmployeesWithAccount = (
  filters: PaginationParams & EmployeeWithAccountFilterParams,
  options?: Omit<
    UseQueryOptions<
      PaginatedApiResponse<EmployeeWithAccount>,
      Error,
      PaginatedApiResponse<EmployeeWithAccount>,
      ReturnType<typeof employeesKeys.withAccountList>
    >,
    'queryKey' | 'queryFn'
  >,
) => {
  return useQuery({
    queryKey: employeesKeys.withAccountList(filters),
    queryFn: () => employeesService.listEmployeesWithAccount(filters),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useEmployeeWithAccount = (
  userId: number | null,
  options?: Omit<
    UseQueryOptions<
      ApiResponse<EmployeeWithAccount>,
      Error,
      ApiResponse<EmployeeWithAccount>,
      ReturnType<typeof employeesKeys.withAccountDetail>
    >,
    'queryKey' | 'queryFn' | 'enabled'
  >,
) => {
  return useQuery({
    queryKey: employeesKeys.withAccountDetail(userId!),
    queryFn: () => employeesService.getEmployeeWithAccount(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useCreateEmployeeWithAccount = (
  options?: Omit<
    UseMutationOptions<
      ApiResponse<EmployeeAccountResponse>,
      Error,
      CreateEmployeeWithAccountRequest
    >,
    'mutationFn'
  >,
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...restOptions } = options || {};

  return useMutation({
    ...restOptions,
    mutationFn: (data: CreateEmployeeWithAccountRequest) =>
      employeesService.createEmployeeWithAccount(data),
    onSuccess: (response, variables, context, _mutation) => {
      // Invalidate both regular and with-account lists
      queryClient.invalidateQueries({ queryKey: employeesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: employeesKeys.withAccountLists() });

      // Show warnings if any
      const warnings = response.data.warnings;
      if (warnings && warnings.length > 0) {
        warnings.forEach((warning) => toast.warning(warning));
      }

      // Show temporary password for guest
      if (response.data.temporary_password) {
        toast.success(
          `Karyawan guest berhasil dibuat. Password temporary: ${response.data.temporary_password}`,
          { duration: 10000 }
        );
      } else {
        toast.success('Karyawan dan akun berhasil dibuat');
      }

      onSuccess?.(response, variables, context, _mutation);
    },
    onError: (error, variables, context, _mutation) => {
      const apiError = handleApiError(error);
      toast.error(apiError.message);
      onError?.(error, variables, context, _mutation);
    },
  });
};


export const useUpdateEmployeeWithAccount = (
  options?: Omit<
    UseMutationOptions<
      ApiResponse<EmployeeAccountUpdateResponse>,
      Error,
      { userId: number; data: UpdateEmployeeWithAccountRequest }
    >,
    'mutationFn'
  >,
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...restOptions } = options || {};

  return useMutation({
    ...restOptions,
    mutationFn: ({ userId, data }: { userId: number; data: UpdateEmployeeWithAccountRequest }) =>
      employeesService.updateEmployeeWithAccount(userId, data),
    onSuccess: (response, variables, context, _mutation) => {
      // Invalidate both regular and with-account lists
      queryClient.invalidateQueries({ queryKey: employeesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: employeesKeys.withAccountLists() });
      queryClient.invalidateQueries({
        queryKey: employeesKeys.withAccountDetail(variables.userId),
      });

      // Show warnings if any
      const warnings = response.data.warnings;
      if (warnings && warnings.length > 0) {
        warnings.forEach((warning) => toast.warning(warning));
      }

      toast.success('Employee dan akun berhasil diupdate');
      onSuccess?.(response, variables, context, _mutation);
    },
    onError: (error, variables, context, _mutation) => {
      const apiError = handleApiError(error);
      toast.error(apiError.message);
      onError?.(error, variables, context, _mutation);
    },
  });
};

export const useActivateEmployeeAccount = (
  options?: Omit<
    UseMutationOptions<ApiResponse<{ warnings: string[] }>, Error, number>,
    'mutationFn'
  >,
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...restOptions } = options || {};

  return useMutation({
    ...restOptions,
    mutationFn: (userId: number) => employeesService.activateEmployeeAccount(userId),
    onSuccess: (response, variables, context, _mutation) => {
      // Invalidate both regular and with-account lists
      queryClient.invalidateQueries({ queryKey: employeesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: employeesKeys.withAccountLists() });
      queryClient.invalidateQueries({
        queryKey: employeesKeys.withAccountDetail(variables),
      });

      // Show warnings if any
      const warnings = response.data.warnings;
      if (warnings && warnings.length > 0) {
        warnings.forEach((warning) => toast.warning(warning));
      }

      toast.success('Employee dan akun berhasil diaktivasi');
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
 * Hook untuk deactivate employee and account (soft delete)
 */
export const useDeactivateEmployeeAccount = (
  options?: Omit<
    UseMutationOptions<ApiResponse<{ warnings: string[] }>, Error, number>,
    'mutationFn'
  >,
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...restOptions } = options || {};

  return useMutation({
    ...restOptions,
    mutationFn: (userId: number) => employeesService.deactivateEmployeeAccount(userId),
    onSuccess: (response, variables, context, _mutation) => {
      // Invalidate both regular and with-account lists
      queryClient.invalidateQueries({ queryKey: employeesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: employeesKeys.withAccountLists() });
      queryClient.invalidateQueries({
        queryKey: employeesKeys.withAccountDetail(variables),
      });

      // Show warnings if any
      const warnings = response.data.warnings;
      if (warnings && warnings.length > 0) {
        warnings.forEach((warning) => toast.warning(warning));
      }

      toast.success('Employee dan akun berhasil dinonaktifkan');
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
 * Hook untuk manual sync user to SSO (retry mechanism)
 */
export const useSyncUserToSSO = (
  options?: Omit<
    UseMutationOptions<ApiResponse<string[]>, Error, number>,
    'mutationFn'
  >,
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...restOptions } = options || {};

  return useMutation({
    ...restOptions,
    mutationFn: (userId: number) => employeesService.syncUserToSSO(userId),
    onSuccess: (response, variables, context, _mutation) => {
      queryClient.invalidateQueries({
        queryKey: employeesKeys.withAccountDetail(variables),
      });

      const warnings = response.data;
      if (warnings && warnings.length > 0) {
        warnings.forEach((warning) => toast.warning(warning));
      }

      toast.success('User berhasil di-sync ke SSO');
      onSuccess?.(response, variables, context, _mutation);
    },
    onError: (error, variables, context, _mutation) => {
      const apiError = handleApiError(error);
      toast.error(apiError.message);
      onError?.(error, variables, context, _mutation);
    },
  });
};


export const useSoftDeleteEmployeeAccount = (
  options?: Omit<
    UseMutationOptions<ApiResponse<EmployeeAccountData>, Error, number>,
    'mutationFn'
  >,
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...restOptions } = options || {};

  return useMutation({
    ...restOptions,
    mutationFn: (userId: number) => employeesService.softDeleteEmployeeAccount(userId),
    onSuccess: (response, variables, context, _mutation) => {
      // Invalidate lists to remove archived employee from active list
      queryClient.invalidateQueries({ queryKey: employeesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: employeesKeys.withAccountLists() });
      queryClient.invalidateQueries({ queryKey: employeesKeys.deletedLists() });
      queryClient.invalidateQueries({
        queryKey: employeesKeys.withAccountDetail(variables),
      });

      // Show warnings if any
      const warnings = response.data.warnings;
      if (warnings && warnings.length > 0) {
        warnings.forEach((warning) => toast.warning(warning));
      }

      toast.success('Employee berhasil dihapus');
      onSuccess?.(response, variables, context, _mutation);
    },
    onError: (error, variables, context, _mutation) => {
      const apiError = handleApiError(error);
      toast.error(apiError.message);
      onError?.(error, variables, context, _mutation);
    },
  });
};


export const useRestoreEmployeeAccount = (
  options?: Omit<
    UseMutationOptions<ApiResponse<EmployeeAccountData>, Error, number>,
    'mutationFn'
  >,
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...restOptions } = options || {};

  return useMutation({
    ...restOptions,
    mutationFn: (userId: number) => employeesService.restoreEmployeeAccount(userId),
    onSuccess: (response, variables, context, _mutation) => {
      // Invalidate lists to add restored employee to active list
      queryClient.invalidateQueries({ queryKey: employeesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: employeesKeys.withAccountLists() });
      queryClient.invalidateQueries({ queryKey: employeesKeys.deletedLists() });
      queryClient.invalidateQueries({
        queryKey: employeesKeys.withAccountDetail(variables),
      });

      // Show warnings if any
      const warnings = response.data.warnings;
      if (warnings && warnings.length > 0) {
        warnings.forEach((warning) => toast.warning(warning));
      }

      toast.success('Employee berhasil di-restore');
      onSuccess?.(response, variables, context, _mutation);
    },
    onError: (error, variables, context, _mutation) => {
      const apiError = handleApiError(error);
      toast.error(apiError.message);
      onError?.(error, variables, context, _mutation);
    },
  });
};

export const useDeletedEmployeesWithAccount = (
  filters: PaginationParams & { search?: string },
  options?: Omit<
    UseQueryOptions<
      PaginatedApiResponse<EmployeeWithAccount>,
      Error,
      PaginatedApiResponse<EmployeeWithAccount>,
      ReturnType<typeof employeesKeys.deletedList>
    >,
    'queryKey' | 'queryFn'
  >,
) => {
  return useQuery({
    queryKey: employeesKeys.deletedList(filters),
    queryFn: () => employeesService.listDeletedEmployees(filters),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};
