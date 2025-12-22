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
  UpdateEmployeeRequest,
  EmployeeFilterParams,
  EmployeeSubordinatesParams,
} from '@/services/employees/types';
import type { PaginationParams, PaginatedApiResponse, ApiResponse } from '@/services/base/types';
import { handleApiError } from '@/utils/errorHandler';

// ... (existing imports)

/**
 * Query keys untuk employees
 * HRIS v2 - simplified
 */
export const employeesKeys = {
  all: ['employees'] as const,
  lists: () => [...employeesKeys.all, 'list'] as const,
  list: (filters: PaginationParams & EmployeeFilterParams) =>
    [...employeesKeys.lists(), filters] as const,
  details: () => [...employeesKeys.all, 'detail'] as const,
  detail: (id: number) => [...employeesKeys.details(), id] as const,
  subordinates: (id: number, params: PaginationParams & EmployeeSubordinatesParams) =>
    [...employeesKeys.all, 'subordinates', id, params] as const,
  deleted: (params?: PaginationParams) => [...employeesKeys.all, 'deleted', params] as const,
  byEmail: (email: string) => [...employeesKeys.all, 'byEmail', email] as const,
  byCode: (code: string) => [...employeesKeys.all, 'byCode', code] as const,
  byOrgUnit: (orgUnitId: number, params?: PaginationParams) => [...employeesKeys.all, 'byOrgUnit', orgUnitId, params] as const,
};

/**
 * Hook untuk mendapatkan list employees dengan pagination dan filter
 */
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

/**
 * Hook untuk mendapatkan single employee by ID
 */
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

/**
 * Hook untuk mendapatkan subordinates dari employee
 */
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

/**
 * Hook untuk update employee (PATCH)
 */
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

/**
 * Hook untuk create employee
 */
export const useCreateEmployee = (
  options?: Omit<
    UseMutationOptions<ApiResponse<Employee>, Error, any>,
    'mutationFn'
  >,
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...restOptions } = options || {};

  return useMutation({
    ...restOptions,
    mutationFn: (data: any) => employeesService.createEmployee(data),
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

/**
 * Hook untuk delete employee
 */
export const useDeleteEmployee = (
  options?: Omit<
    UseMutationOptions<ApiResponse<any>, Error, number>,
    'mutationFn'
  >,
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...restOptions } = options || {};

  return useMutation({
    ...restOptions,
    mutationFn: (id: number) => employeesService.deleteEmployee(id),
    onSuccess: (response, variables, context, _mutation) => {
      queryClient.invalidateQueries({ queryKey: employeesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: employeesKeys.detail(variables) });
      queryClient.invalidateQueries({
        predicate: (query) =>
          Array.isArray(query.queryKey) &&
          query.queryKey[0] === 'employees' &&
          query.queryKey[1] === 'deleted'
      });
      toast.success('Karyawan berhasil dihapus');
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
 * Hook untuk restore employee
 */
export const useRestoreEmployee = (
  options?: Omit<
    UseMutationOptions<ApiResponse<Employee>, Error, number>,
    'mutationFn'
  >,
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...restOptions } = options || {};

  return useMutation({
    ...restOptions,
    mutationFn: (id: number) => employeesService.restoreEmployee(id),
    onSuccess: (response, variables, context, _mutation) => {
      queryClient.invalidateQueries({ queryKey: employeesKeys.lists() });
      queryClient.invalidateQueries({
        predicate: (query) =>
          Array.isArray(query.queryKey) &&
          query.queryKey[0] === 'employees' &&
          query.queryKey[1] === 'deleted'
      });
      queryClient.invalidateQueries({ queryKey: employeesKeys.detail(variables) });
      toast.success('Karyawan berhasil direstore');
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
 * Hook untuk bulk insert employees
 */
export const useBulkInsertEmployees = (
  options?: Omit<
    UseMutationOptions<ApiResponse<any>, Error, FormData>,
    'mutationFn'
  >,
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...restOptions } = options || {};

  return useMutation({
    ...restOptions,
    mutationFn: (formData: FormData) => employeesService.bulkInsertEmployees(formData),
    onSuccess: (response, variables, context, _mutation) => {
      queryClient.invalidateQueries({ queryKey: employeesKeys.lists() });
      toast.success('Bulk insert berhasil');
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
 * Hook untuk mendapatkan list deleted employees
 */
export const useDeletedEmployees = (
  params?: PaginationParams,
  options?: Omit<
    UseQueryOptions<
      PaginatedApiResponse<Employee>,
      Error,
      PaginatedApiResponse<Employee>,
      ReturnType<typeof employeesKeys.deleted>
    >,
    'queryKey' | 'queryFn'
  >,
) => {
  return useQuery({
    queryKey: employeesKeys.deleted(params),
    queryFn: () => employeesService.getDeletedEmployees(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

