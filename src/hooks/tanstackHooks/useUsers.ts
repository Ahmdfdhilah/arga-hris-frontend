import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { usersService } from '@/services/users';
import type {
  User,
  UserDetail,
  UserWithEmployee,
  UserFilterParams,
  UserCreateRequest,
  UserUpdateRequest,
  Role,
  UserRolesPermissions,
  AssignRoleRequest,
  RemoveRoleRequest,
  AssignRolesRequest,
  GuestUser,
  CreateGuestRequest,
} from '@/services/users/types';
import type { PaginationParams, PaginatedApiResponse, ApiResponse } from '@/services/base/types';
import { handleApiError } from '@/utils/errorHandler';

// Query Keys
export const usersKeys = {
  all: ['users'] as const,
  lists: () => [...usersKeys.all, 'list'] as const,
  list: (filters: PaginationParams & UserFilterParams) =>
    [...usersKeys.lists(), filters] as const,
  details: () => [...usersKeys.all, 'detail'] as const,
  detail: (id: number) => [...usersKeys.details(), id] as const,
  roles: () => [...usersKeys.all, 'roles'] as const,
  allRoles: () => [...usersKeys.roles(), 'all'] as const,
  userRoles: (id: number) => [...usersKeys.roles(), 'user', id] as const,
};

// ==================== Queries ====================

/**
 * Hook untuk mendapatkan paginated list of users
 *
 * Filters:
 * - page, limit: Pagination
 * - search: Filter by name or email
 * - is_active: Filter by active status
 * - has_employee: Filter by employee link status
 * - org_unit_id: Filter by organization unit
 * - include_details: Include employee_data and org_unit_data (slower)
 *
 * Note: When include_details=true, response data items will be UserDetail type
 */
export const useUsers = (
  filters: PaginationParams & UserFilterParams,
  options?: Omit<
    UseQueryOptions<
      PaginatedApiResponse<User | UserDetail>,
      Error,
      PaginatedApiResponse<User | UserDetail>,
      ReturnType<typeof usersKeys.list>
    >,
    'queryKey' | 'queryFn'
  >,
) => {
  return useQuery({
    queryKey: usersKeys.list(filters),
    queryFn: () => usersService.getUsers(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Hook untuk mendapatkan single user by ID
 */
export const useUser = (
  userId: number | null,
  options?: Omit<
    UseQueryOptions<
      ApiResponse<UserWithEmployee>,
      Error,
      ApiResponse<UserWithEmployee>,
      ReturnType<typeof usersKeys.detail>
    >,
    'queryKey' | 'queryFn' | 'enabled'
  >,
) => {
  return useQuery({
    queryKey: usersKeys.detail(userId!),
    queryFn: () => usersService.getUser(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

// ==================== Mutations ====================

/**
 * Hook untuk membuat user baru
 */
export const useCreateUser = (
  options?: Omit<
    UseMutationOptions<ApiResponse<User>, Error, UserCreateRequest>,
    'mutationFn'
  >,
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...restOptions } = options || {};

  return useMutation({
    ...restOptions,
    mutationFn: (data: UserCreateRequest) => usersService.createUser(data),
    onSuccess: (response, variables, context, _mutation) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      toast.success('User berhasil dibuat');
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
 * Hook untuk membuat guest user baru
 */
export const useCreateGuestUser = (
  options?: Omit<
    UseMutationOptions<ApiResponse<GuestUser>, Error, CreateGuestRequest>,
    'mutationFn'
  >,
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...restOptions } = options || {};

  return useMutation({
    ...restOptions,
    mutationFn: (data: CreateGuestRequest) => usersService.createGuestUser(data),
    onSuccess: (response, variables, context, _mutation) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      toast.success('Guest user berhasil dibuat');
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
 * Hook untuk update user
 */
export const useUpdateUser = (
  options?: Omit<
    UseMutationOptions<
      ApiResponse<User>,
      Error,
      { userId: number; data: UserUpdateRequest }
    >,
    'mutationFn'
  >,
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...restOptions } = options || {};

  return useMutation({
    ...restOptions,
    mutationFn: ({ userId, data }: { userId: number; data: UserUpdateRequest }) =>
      usersService.updateUser(userId, data),
    onSuccess: (response, variables, context, _mutation) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: usersKeys.detail(variables.userId),
      });
      toast.success('User berhasil diupdate');
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
 * Hook untuk deactivate user
 */
export const useDeactivateUser = (
  options?: Omit<
    UseMutationOptions<ApiResponse<User>, Error, number>,
    'mutationFn'
  >,
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...restOptions } = options || {};

  return useMutation({
    ...restOptions,
    mutationFn: (userId: number) => usersService.deactivateUser(userId),
    onSuccess: (response, variables, context, _mutation) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: usersKeys.detail(variables),
      });
      toast.success('User berhasil dinonaktifkan');
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
 * Hook untuk activate user
 */
export const useActivateUser = (
  options?: Omit<
    UseMutationOptions<ApiResponse<User>, Error, number>,
    'mutationFn'
  >,
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...restOptions } = options || {};

  return useMutation({
    ...restOptions,
    mutationFn: (userId: number) => usersService.activateUser(userId),
    onSuccess: (response, variables, context, _mutation) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: usersKeys.detail(variables),
      });
      toast.success('User berhasil diaktifkan');
      onSuccess?.(response, variables, context, _mutation);
    },
    onError: (error, variables, context, _mutation) => {
      const apiError = handleApiError(error);
      toast.error(apiError.message);
      onError?.(error, variables, context, _mutation);
    },
  });
};

// ==================== Role Management ====================

/**
 * Hook untuk mendapatkan semua roles yang tersedia
 */
export const useAllRoles = (
  options?: Omit<
    UseQueryOptions<
      ApiResponse<Role[]>,
      Error,
      ApiResponse<Role[]>,
      ReturnType<typeof usersKeys.allRoles>
    >,
    'queryKey' | 'queryFn'
  >,
) => {
  return useQuery({
    queryKey: usersKeys.allRoles(),
    queryFn: () => usersService.getAllRoles(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

/**
 * Hook untuk mendapatkan roles dan permissions user
 */
export const useUserRolesPermissions = (
  userId: number | null,
  options?: Omit<
    UseQueryOptions<
      ApiResponse<UserRolesPermissions>,
      Error,
      ApiResponse<UserRolesPermissions>,
      ReturnType<typeof usersKeys.userRoles>
    >,
    'queryKey' | 'queryFn' | 'enabled'
  >,
) => {
  return useQuery({
    queryKey: usersKeys.userRoles(userId!),
    queryFn: () => usersService.getUserRolesAndPermissions(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook untuk assign role ke user
 */
export const useAssignRole = (
  options?: Omit<
    UseMutationOptions<
      ApiResponse<null>,
      Error,
      { userId: number; data: AssignRoleRequest }
    >,
    'mutationFn'
  >,
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...restOptions } = options || {};

  return useMutation({
    ...restOptions,
    mutationFn: ({ userId, data }: { userId: number; data: AssignRoleRequest }) =>
      usersService.assignRole(userId, data),
    onSuccess: (response, variables, context, _mutation) => {
      queryClient.invalidateQueries({
        queryKey: usersKeys.userRoles(variables.userId),
      });
      toast.success('Role berhasil ditambahkan');
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
 * Hook untuk remove role dari user
 */
export const useRemoveRole = (
  options?: Omit<
    UseMutationOptions<
      ApiResponse<null>,
      Error,
      { userId: number; data: RemoveRoleRequest }
    >,
    'mutationFn'
  >,
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...restOptions } = options || {};

  return useMutation({
    ...restOptions,
    mutationFn: ({ userId, data }: { userId: number; data: RemoveRoleRequest }) =>
      usersService.removeRole(userId, data),
    onSuccess: (response, variables, context, _mutation) => {
      queryClient.invalidateQueries({
        queryKey: usersKeys.userRoles(variables.userId),
      });
      toast.success('Role berhasil dihapus');
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
 * Hook untuk assign multiple roles sekaligus
 */
export const useAssignMultipleRoles = (
  options?: Omit<
    UseMutationOptions<
      ApiResponse<{ roles: string[] }>,
      Error,
      { userId: number; data: AssignRolesRequest }
    >,
    'mutationFn'
  >,
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...restOptions } = options || {};

  return useMutation({
    ...restOptions,
    mutationFn: ({ userId, data }: { userId: number; data: AssignRolesRequest }) =>
      usersService.assignMultipleRoles(userId, data),
    onSuccess: (response, variables, context, _mutation) => {
      queryClient.invalidateQueries({
        queryKey: usersKeys.userRoles(variables.userId),
      });
      toast.success('Roles berhasil ditambahkan');
      onSuccess?.(response, variables, context, _mutation);
    },
    onError: (error, variables, context, _mutation) => {
      const apiError = handleApiError(error);
      toast.error(apiError.message);
      onError?.(error, variables, context, _mutation);
    },
  });
};
