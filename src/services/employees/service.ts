import { BaseService } from '../base/service';
import type { ApiResponse, PaginatedApiResponse, PaginationParams } from '../base/types';
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
} from './types';

class EmployeesService extends BaseService {
  constructor() {
    super('/employees');
  }

  /**
   * List employees with account (unified approach)
   * Includes employee, user, and guest_account data in one request
   */
  async listEmployeesWithAccount(
    params?: PaginationParams & EmployeeWithAccountFilterParams
  ): Promise<PaginatedApiResponse<EmployeeWithAccount>> {
    return this.get<PaginatedApiResponse<EmployeeWithAccount>>('/with-account', { params });
  }

  /**
   * Get employee with account by user_id
   * Returns employee, user, and guest_account (if applicable)
   */
  async getEmployeeWithAccount(userId: number): Promise<ApiResponse<EmployeeWithAccount>> {
    return this.get<ApiResponse<EmployeeWithAccount>>(`/${userId}/with-account`);
  }

  /**
   * Create employee with account (unified)
   * Creates employee + user account (regular/guest) in one operation
   * Requires super_admin role
   */
  async createEmployeeWithAccount(
    request: CreateEmployeeWithAccountRequest
  ): Promise<ApiResponse<EmployeeAccountResponse>> {
    return this.post<ApiResponse<EmployeeAccountResponse>>('/with-account', request);
  }

  /**
   * Update employee with account (unified)
   * Smart field routing: intersection, employee-only, and guest-only fields
   * Requires super_admin role
   */
  async updateEmployeeWithAccount(
    userId: number,
    request: UpdateEmployeeWithAccountRequest
  ): Promise<ApiResponse<EmployeeAccountUpdateResponse>> {
    return this.put<ApiResponse<EmployeeAccountUpdateResponse>>(`/${userId}/with-account`, request);
  }

  /**
   * Activate employee and account
   * Activates employee + user/guest account in one operation
   * Requires super_admin role
   */
  async activateEmployeeAccount(userId: number): Promise<ApiResponse<{ warnings: string[] }>> {
    return this.post<ApiResponse<{ warnings: string[] }>>(`/${userId}/activate`, {});
  }

  /**
   * Deactivate employee and account (soft delete)
   * Deactivates employee + user/guest account in one operation
   * Requires super_admin role
   */
  async deactivateEmployeeAccount(userId: number): Promise<ApiResponse<{ warnings: string[] }>> {
    return this.post<ApiResponse<{ warnings: string[] }>>(`/${userId}/deactivate`, {});
  }

  /**
   * Manual sync user to SSO (retry mechanism)
   * Used when SSO sync failed during create and needs manual retry
   * Requires super_admin role
   */
  async syncUserToSSO(userId: number): Promise<ApiResponse<string[]>> {
    return this.post<ApiResponse<string[]>>(`/${userId}/sync-to-sso`, {});
  }

  /**
   * Soft delete (archive) employee account
   * Archives employee + deactivates user account in one operation
   * Requires employee.soft_delete permission (super_admin, hr_admin)
   */
  async softDeleteEmployeeAccount(userId: number): Promise<ApiResponse<EmployeeAccountData>> {
    return this.delete<ApiResponse<EmployeeAccountData>>(`/${userId}/soft-delete`);
  }

  /**
   * Restore archived employee account
   * Restores employee + activates user account in one operation
   * Requires employee.restore permission (super_admin only)
   */
  async restoreEmployeeAccount(userId: number): Promise<ApiResponse<EmployeeAccountData>> {
    return this.post<ApiResponse<EmployeeAccountData>>(`/${userId}/restore`, {});
  }

  /**
   * List archived/deleted employees
   * Returns paginated list of archived employees with their account details
   * Requires employee.view_deleted permission (super_admin only)
   */
  async listDeletedEmployees(
    params?: PaginationParams & { search?: string }
  ): Promise<PaginatedApiResponse<EmployeeWithAccount>> {
    return this.get<PaginatedApiResponse<EmployeeWithAccount>>('/deleted', { params });
  }

  async getEmployee(employeeId: number): Promise<ApiResponse<Employee>> {
    return this.get<ApiResponse<Employee>>(`/${employeeId}`);
  }

  async getEmployeeByEmail(email: string): Promise<ApiResponse<Employee | null>> {
    return this.get<ApiResponse<Employee | null>>(`/by-email/${email}`);
  }

  async getEmployeeByNumber(employeeNumber: string): Promise<ApiResponse<Employee | null>> {
    return this.get<ApiResponse<Employee | null>>(`/by-number/${employeeNumber}`);
  }

  async listEmployees(
    params?: PaginationParams & EmployeeFilterParams
  ): Promise<PaginatedApiResponse<Employee>> {
    return this.get<PaginatedApiResponse<Employee>>('', { params });
  }

  async getEmployeeSubordinates(
    employeeId: number,
    params?: PaginationParams & EmployeeSubordinatesParams
  ): Promise<PaginatedApiResponse<Employee>> {
    return this.get<PaginatedApiResponse<Employee>>(`/${employeeId}/subordinates`, { params });
  }

  async getEmployeesByOrgUnit(
    orgUnitId: number,
    params?: PaginationParams & EmployeesByOrgUnitParams
  ): Promise<PaginatedApiResponse<Employee>> {
    return this.get<PaginatedApiResponse<Employee>>(`/org-unit/${orgUnitId}/employees`, { params });
  }

  async createEmployee(request: CreateEmployeeRequest): Promise<ApiResponse<Employee>> {
    return this.post<ApiResponse<Employee>>('', request);
  }

  async updateEmployee(
    employeeId: number,
    request: UpdateEmployeeRequest
  ): Promise<ApiResponse<Employee>> {
    return this.put<ApiResponse<Employee>>(`/${employeeId}`, request);
  }

  async deactivateEmployee(employeeId: number): Promise<ApiResponse<Employee>> {
    return this.delete<ApiResponse<Employee>>(`/${employeeId}`);
  }
}

export const employeesService = new EmployeesService();
export default employeesService;
