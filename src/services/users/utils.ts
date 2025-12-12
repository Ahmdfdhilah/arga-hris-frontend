import { usersService } from './service';
import type { CurrentUser } from '../auth/types';

/**
 * Check if user has specific permission (sync - dari userData yang sudah ada di Redux)
 */
export function hasPermission(user: CurrentUser | null, permissionCode: string): boolean {
  if (!user || !user.permissions) return false;
  return user.permissions.includes(permissionCode);
}

/**
 * Check if user has ANY of the required permissions (OR logic)
 */
export function hasAnyPermission(user: CurrentUser | null, permissionCodes: string[]): boolean {
  if (!user || !user.permissions || permissionCodes.length === 0) return false;
  return permissionCodes.some(code => user.permissions.includes(code));
}

/**
 * Check if user has ALL required permissions (AND logic)
 */
export function hasAllPermissions(user: CurrentUser | null, permissionCodes: string[]): boolean {
  if (!user || !user.permissions || permissionCodes.length === 0) return false;
  return permissionCodes.every(code => user.permissions.includes(code));
}

/**
 * Check if user can access a menu based on required permissions and roles
 * @param user - User data dari Redux store
 * @param requiredPermissions - Array of required permissions
 * @param requireAll - true = AND logic (butuh semua permissions), false = OR logic (cukup salah satu permission)
 * @param requiredRoles - Array of required roles (optional)
 * @param requireAllRoles - true = AND logic (butuh semua roles), false = OR logic (cukup salah satu role)
 */
export function canAccessMenu(
  user: CurrentUser | null,
  requiredPermissions: string[],
  requireAll: boolean = false,
  requiredRoles?: string[],
  requireAllRoles: boolean = false
): boolean {
  if (!user) return false;
  
  // Check permissions
  let hasPermissionAccess = true;
  if (requiredPermissions.length > 0) {
    hasPermissionAccess = requireAll
      ? hasAllPermissions(user, requiredPermissions)
      : hasAnyPermission(user, requiredPermissions);
  }

  // Check roles (if specified)
  let hasRoleAccess = true;
  if (requiredRoles && requiredRoles.length > 0) {
    hasRoleAccess = requireAllRoles
      ? hasAllRoles(user, requiredRoles)
      : hasAnyRole(user, requiredRoles);
  }

  // Both permission and role checks must pass
  return hasPermissionAccess && hasRoleAccess;
}

/**
 * Check if user has specific role (sync - dari userData)
 */
export function hasRole(user: CurrentUser | null, roleName: string): boolean {
  if (!user || !user.roles) return false;
  return user.roles.includes(roleName);
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(user: CurrentUser | null, roleNames: string[]): boolean {
  if (!user || !user.roles || roleNames.length === 0) return false;
  return roleNames.some(roleName => user.roles.includes(roleName));
}

/**
 * Check if user has all of the specified roles
 */
export function hasAllRoles(user: CurrentUser | null, roleNames: string[]): boolean {
  if (!user || !user.roles || roleNames.length === 0) return false;
  return roleNames.every(roleName => user.roles.includes(roleName));
}

/**
 * Check if user is super admin
 */
export function isSuperAdmin(user: CurrentUser | null): boolean {
  return hasRole(user, 'super_admin');
}

/**
 * Check if user is HR admin
 */
export function isHRAdmin(user: CurrentUser | null): boolean {
  return hasRole(user, 'hr_admin');
}

/**
 * Check if user is org unit head
 */
export function isOrgUnitHead(user: CurrentUser | null): boolean {
  return hasRole(user, 'org_unit_head');
}

/**
 * Check if user is regular employee only
 */
export function isEmployeeOnly(user: CurrentUser | null): boolean {
  if (!user || !user.roles || user.roles.length === 0) return true;
  return user.roles.length === 1 && user.roles[0] === 'employee';
}

/**
 * Async function: Check if user has specific role (fetch dari backend)
 */
export async function checkUserRole(userId: number, roleName: string): Promise<boolean> {
  try {
    const response = await usersService.getUserRolesAndPermissions(userId);
    return response.data.roles.includes(roleName);
  } catch (error) {
    console.error('Error checking user role:', error);
    return false;
  }
}

/**
 * Async function: Check if user has specific permission (fetch dari backend)
 */
export async function checkUserPermission(userId: number, permissionCode: string): Promise<boolean> {
  try {
    const response = await usersService.getUserRolesAndPermissions(userId);
    return response.data.permissions.includes(permissionCode);
  } catch (error) {
    console.error('Error checking user permission:', error);
    return false;
  }
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Format user full name
 */
export function formatFullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

/**
 * Get user initials from first name and last name
 */
export function getUserInitials(firstName: string, lastName:string): string {
  if (!firstName && !lastName) return '';
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

/**
 * Truncate email for display
 */
export function truncateEmail(email: string, maxLength: number = 8): string {
  if (!email) return '';
  if (email.length <= maxLength) return email;

  const [localPart, domain] = email.split('@');
  if (localPart.length > maxLength - 3) {
    return `${localPart.substring(0, maxLength - 6)}...@${domain}`;
  }
  return email;
}
