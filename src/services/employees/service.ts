import { BaseService } from '../base/service';
import type { ApiResponse, PaginatedApiResponse, PaginationParams } from '../base/types';
import type {
  Employee,
  UpdateEmployeeRequest,
  EmployeeFilterParams,
  EmployeeSubordinatesParams,
} from './types';

/**
 * Employees Service Class
 * HRIS v2 - Employee management dengan SSO integration via events
 *
 * Note: Employee creation sekarang via SSO event (RabbitMQ).
 * Tidak ada endpoint POST untuk create employee.
 */
class EmployeesService extends BaseService {
  constructor() {
    super('/employees');
  }

  /**
   * GET /employees
   * List employees dengan pagination dan filter
   */
  async listEmployees(
    params?: PaginationParams & EmployeeFilterParams
  ): Promise<PaginatedApiResponse<Employee>> {
    return this.get<PaginatedApiResponse<Employee>>('', { params });
  }

  /**
   * GET /employees/{id}
   * Get employee by ID
   */
  async getEmployee(employeeId: number): Promise<ApiResponse<Employee>> {
    return this.get<ApiResponse<Employee>>(`/${employeeId}`);
  }

  /**
   * PATCH /employees/{id}
   * Update employee data
   */
  async updateEmployee(
    employeeId: number,
    request: UpdateEmployeeRequest
  ): Promise<ApiResponse<Employee>> {
    return this.patch<ApiResponse<Employee>>(`/${employeeId}`, request);
  }

  /**
   * GET /employees/{id}/subordinates
   * Get employee subordinates
   */
  async getEmployeeSubordinates(
    employeeId: number,
    params?: PaginationParams & EmployeeSubordinatesParams
  ): Promise<PaginatedApiResponse<Employee>> {
    return this.get<PaginatedApiResponse<Employee>>(`/${employeeId}/subordinates`, { params });
  }

  /**
   * POST /employees
   * Create new employee (Admin only)
   */
  async createEmployee(request: any): Promise<ApiResponse<Employee>> {
    return this.post<ApiResponse<Employee>>('', request);
  }

  /**
   * DELETE /employees/{id}
   * Soft delete employee
   */
  async deleteEmployee(employeeId: number): Promise<ApiResponse<any>> {
    return this.delete<ApiResponse<any>>(`/${employeeId}`);
  }

  /**
   * POST /employees/{id}/restore
   * Restore deleted employee
   */
  async restoreEmployee(employeeId: number): Promise<ApiResponse<Employee>> {
    return this.post<ApiResponse<Employee>>(`/${employeeId}/restore`, {});
  }

  /**
   * POST /employees/bulk-insert
   * Bulk insert employees from Excel
   */
  async bulkInsertEmployees(formData: FormData): Promise<ApiResponse<any>> {
    return this.post<ApiResponse<any>>('/bulk-insert', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * GET /employees/by-email/{email}
   * Get employee by email
   */
  async getEmployeeByEmail(email: string): Promise<ApiResponse<Employee | null>> {
    return this.get<ApiResponse<Employee | null>>(`/by-email/${email}`);
  }

  /**
   * GET /employees/by-code/{code}
   * Get employee by code
   */
  async getEmployeeByCode(code: string): Promise<ApiResponse<Employee | null>> {
    return this.get<ApiResponse<Employee | null>>(`/by-code/${code}`);
  }

  /**
   * GET /employees/org-unit/{org_unit_id}
   * List employees by org unit
   */
  async getEmployeesByOrgUnit(
    orgUnitId: number,
    params?: PaginationParams
  ): Promise<PaginatedApiResponse<Employee>> {
    return this.get<PaginatedApiResponse<Employee>>(`/org-unit/${orgUnitId}`, { params });
  }

  /**
   * GET /employees/deleted
   * List deleted employees
   */
  async getDeletedEmployees(
    params?: PaginationParams
  ): Promise<PaginatedApiResponse<Employee>> {
    return this.get<PaginatedApiResponse<Employee>>('/deleted', { params });
  }
}

export const employeesService = new EmployeesService();
export default employeesService;
