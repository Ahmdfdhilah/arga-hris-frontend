import { employeesService } from '@/services/employees';
import type { Employee } from '@/services/employees/types';
import type { PaginatedApiResponse, ApiResponse } from '@/services/base/types';
import { createSearchHook } from '@/utils/createSearchHook';

export function useEmployeeSearch() {
  const searchFunction = (
    term: string,
    limit = 50,
    page = 1,
  ): Promise<PaginatedApiResponse<Employee>> =>
    employeesService.listEmployees({ page, limit, search: term });

  const getByIdFunction = (id: number): Promise<ApiResponse<Employee>> =>
    employeesService.getEmployee(id);

  return createSearchHook<Employee>({
    searchFunction,
    getByIdFunction,
    formatter: (employee) => ({
      value: employee.id,
      label: `${employee.employee_number} - ${employee.name}`,
      description: employee.position || employee.email || undefined,
    }),
  });
}
