import type { Employee } from '../../employees/types';

/**
 * Current user response
 * From GET /auth/me
 * Combines SSO data with HRIS data
 */
export interface CurrentUser {
  id: string;
  employee_id: number | null;
  org_unit_id: number | null;

  sso_id: string;
  name: string;
  email: string | null;
  avatar_url: string | null;
  sso_role: string;

  roles: string[];
  permissions: string[];

  is_active: boolean;

  employee: Employee | null;
}

export const getDisplayName = (user: CurrentUser | null): string => {
  if (!user) return '';
  return user.name || user.email || 'User';
};

export const hasRole = (user: CurrentUser | null, role: string): boolean => {
  if (!user) return false;
  return user.roles.includes(role);
};

export const hasPermission = (user: CurrentUser | null, permission: string): boolean => {
  if (!user) return false;
  return user.permissions.includes(permission);
};
