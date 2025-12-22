import { employeesService } from './service';
import { EMPLOYEE_TYPE_OPTIONS, type Employee } from './types';

export async function isEmployeeActive(employeeId: number): Promise<boolean> {
  try {
    const response = await employeesService.getEmployee(employeeId);
    return response.data.is_active;
  } catch (error) {
    console.error('Error mengecek status karyawan:', error);
    return false;
  }
}

export function formatEmployeeName(employee: Employee): string {
  return employee.name;
}

export function formatEmployeeDisplay(employee: Employee): string {
  return `${employee.code} - ${employee.name}`;
}

export function getEmployeeInitials(employee: Employee): string {
  const nameParts = employee.name.trim().split(' ');
  if (nameParts.length === 1) {
    return nameParts[0].substring(0, 2).toUpperCase();
  }
  return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
}

export function validateEmployeeEmail(email: string): { valid: boolean; error?: string } {
  if (!email || !email.trim()) {
    return { valid: false, error: 'Email tidak boleh kosong' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Format email tidak valid' };
  }

  return { valid: true };
}

export function validateEmployeePhone(phone: string): { valid: boolean; error?: string } {
  if (!phone || !phone.trim()) {
    return { valid: true };
  }

  const cleaned = phone.replace(/[-\s()]/g, '');
  const phoneRegex = /^\+?[0-9]+$/;

  if (!phoneRegex.test(cleaned)) {
    return { valid: false, error: 'Nomor telepon hanya boleh mengandung angka dan tanda +' };
  }

  return { valid: true };
}

export function validateEmployeeNumber(number: string): { valid: boolean; error?: string } {
  if (!number || !number.trim()) {
    return { valid: false, error: 'Nomor karyawan tidak boleh kosong' };
  }

  if (number.length > 50) {
    return { valid: false, error: 'Nomor karyawan maksimal 50 karakter' };
  }

  return { valid: true };
}

export async function getEmployeeSupervisor(employeeId: number): Promise<Employee | null> {
  try {
    const response = await employeesService.getEmployee(employeeId);
    if (response.data.supervisor_id) {
      const supervisorResponse = await employeesService.getEmployee(response.data.supervisor_id);
      return supervisorResponse.data;
    }
    return null;
  } catch (error) {
    console.error('Error mendapatkan supervisor karyawan:', error);
    return null;
  }
}
export const getEmployeeTypeLabel = (employeeType: string | null | undefined): string => {
  if (!employeeType) return '-';
  const option = EMPLOYEE_TYPE_OPTIONS.find(opt => opt.value === employeeType);
  return option?.label || employeeType;
};


export async function hasSubordinates(employeeId: number): Promise<boolean> {
  try {
    const response = await employeesService.getEmployeeSubordinates(employeeId, { page: 1, limit: 1 });
    return (response.meta.total_items ?? 0) > 0;
  } catch (error) {
    console.error('Error mengecek subordinate karyawan:', error);
    return false;
  }
}

export function filterActiveEmployees(employees: Employee[]): Employee[] {
  return employees.filter(emp => emp.is_active);
}

export function sortEmployeesByName(employees: Employee[]): Employee[] {
  return [...employees].sort((a, b) => a.name.localeCompare(b.name));
}

export function sortEmployeesByNumber(employees: Employee[]): Employee[] {
  return [...employees].sort((a, b) => (a.code || '').localeCompare(b.code || ''));
}

export function groupEmployeesByOrgUnit(employees: Employee[]): Map<number | null, Employee[]> {
  const grouped = new Map<number | null, Employee[]>();

  employees.forEach(employee => {
    const orgUnitId = employee.org_unit_id ?? null;
    if (!grouped.has(orgUnitId)) {
      grouped.set(orgUnitId, []);
    }
    grouped.get(orgUnitId)?.push(employee);
  });

  return grouped;
}
