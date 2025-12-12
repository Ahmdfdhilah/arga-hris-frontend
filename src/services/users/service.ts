// Users Service
// Handles user management operations

import { BaseService } from '../base/service';
import type { ApiResponse, PaginatedApiResponse, PaginationParams } from '../base/types';
import type {
  User,
  UserDetail,
  UserWithEmployee,
  Role,
  Permission,
  UserRolesPermissions,
  UserFilterParams,
  UserCreateRequest,
  UserUpdateRequest,
  LinkEmployeeRequest,
  AssignRoleRequest,
  RemoveRoleRequest,
  AssignRolesRequest,
  GuestUser,
  GuestAccount,
  GuestExpiryStatus,
  CreateGuestRequest,
  UpdateGuestAccountRequest,
  GuestUserFilterParams,
} from './types';

/**
 * Users Service Class
 * Menangani operasi user management sesuai dengan backend HRIS
 */
class UsersService extends BaseService {
  constructor() {
    super('/users');
  }

  async getUsers(params?: PaginationParams & UserFilterParams): Promise<PaginatedApiResponse<User | UserDetail>> {
    return this.get<PaginatedApiResponse<User | UserDetail>>('', { params });
  }

  async createUser(request: UserCreateRequest): Promise<ApiResponse<User>> {
    return this.post<ApiResponse<User>>('', request);
  }

  async getUser(userId: number): Promise<ApiResponse<UserWithEmployee>> {
    return this.get<ApiResponse<UserWithEmployee>>(`/${userId}`);
  }

  async updateUser(userId: number, request: UserUpdateRequest): Promise<ApiResponse<User>> {
    return this.put<ApiResponse<User>>(`/${userId}`, request);
  }

  async linkEmployee(userId: number, request: LinkEmployeeRequest): Promise<ApiResponse<User>> {
    return this.post<ApiResponse<User>>(`/${userId}/link-employee`, request);
  }

  async autoLinkEmployee(userId: number): Promise<ApiResponse<User>> {
    return this.post<ApiResponse<User>>(`/${userId}/link-employee-auto`);
  }

  async deactivateUser(userId: number): Promise<ApiResponse<User>> {
    return this.post<ApiResponse<User>>(`/${userId}/deactivate`);
  }

  async activateUser(userId: number): Promise<ApiResponse<User>> {
    return this.post<ApiResponse<User>>(`/${userId}/activate`);
  }

  async getUserRolesAndPermissions(userId: number): Promise<ApiResponse<UserRolesPermissions>> {
    return this.get<ApiResponse<UserRolesPermissions>>(`/../roles/${userId}`);
  }

  async assignRole(userId: number, request: AssignRoleRequest): Promise<ApiResponse<null>> {
    return this.post<ApiResponse<null>>(`/../roles/${userId}/assign`, request);
  }

  async removeRole(userId: number, request: RemoveRoleRequest): Promise<ApiResponse<null>> {
    return this.post<ApiResponse<null>>(`/../roles/${userId}/remove`, request);
  }

  async assignMultipleRoles(userId: number, request: AssignRolesRequest): Promise<ApiResponse<{ roles: string[] }>> {
    return this.post<ApiResponse<{ roles: string[] }>>(`/../roles/${userId}/assign-multiple`, request);
  }

  async getAllRoles(): Promise<ApiResponse<Role[]>> {
    return this.get<ApiResponse<Role[]>>('/../roles');
  }

  async getAllPermissions(): Promise<ApiResponse<Permission[]>> {
    return this.get<ApiResponse<Permission[]>>('/../roles/permissions');
  }


  async createGuestUser(request: CreateGuestRequest): Promise<ApiResponse<GuestUser>> {
    return this.post<ApiResponse<GuestUser>>('/../guests', request);
  }


  async getGuestUsers(params?: PaginationParams & GuestUserFilterParams): Promise<PaginatedApiResponse<GuestUser>> {
    return this.get<PaginatedApiResponse<GuestUser>>('/../guests', { params });
  }


  async getGuestUser(userId: number): Promise<ApiResponse<GuestUser>> {
    return this.get<ApiResponse<GuestUser>>(`/../guests/${userId}`);
  }

  async updateGuestAccount(userId: number, request: UpdateGuestAccountRequest): Promise<ApiResponse<GuestAccount>> {
    return this.patch<ApiResponse<GuestAccount>>(`/../guests/${userId}`, request);
  }

  async deactivateGuestUser(userId: number): Promise<ApiResponse<{ user_id: number; email: string; is_active: boolean }>> {
    return this.post<ApiResponse<{ user_id: number; email: string; is_active: boolean }>>(`/guests/${userId}/deactivate`);
  }

  async checkGuestExpiry(userId: number): Promise<ApiResponse<GuestExpiryStatus>> {
    return this.get<ApiResponse<GuestExpiryStatus>>(`/../guests/${userId}/expiry`);
  }
}

// Export singleton instance
export const usersService = new UsersService();
export default usersService;