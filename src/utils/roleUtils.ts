// Role and Permission utilities

export const RoleTypes = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  HR_MANAGER: 'hr_manager',
  HR_STAFF: 'hr_staff',
  EMPLOYEE: 'employee',
} as const;

export type RoleType = typeof RoleTypes[keyof typeof RoleTypes];

/**
 * Check if user has admin role
 */
export const isAdmin = (roles: string[]): boolean => {
  return roles.some(role =>
    role === RoleTypes.ADMIN || role === RoleTypes.SUPER_ADMIN
  );
};

/**
 * Check if user has super admin role
 */
export const isSuperAdmin = (roles: string[]): boolean => {
  return roles.includes(RoleTypes.SUPER_ADMIN);
};

/**
 * Check if user has HR role (manager or staff)
 */
export const isHR = (roles: string[]): boolean => {
  return roles.some(role =>
    role === RoleTypes.HR_MANAGER ||
    role === RoleTypes.HR_STAFF ||
    role === RoleTypes.ADMIN ||
    role === RoleTypes.SUPER_ADMIN
  );
};

/**
 * Check if user has HR manager role
 */
export const isHRManager = (roles: string[]): boolean => {
  return roles.includes(RoleTypes.HR_MANAGER) || isAdmin(roles);
};

/**
 * Check if user has specific role
 */
export const hasRole = (roles: string[], targetRole: string): boolean => {
  return roles.includes(targetRole);
};

/**
 * Check if user has any of the specified roles
 */
export const hasAnyRole = (roles: string[], targetRoles: string[]): boolean => {
  return targetRoles.some(targetRole => roles.includes(targetRole));
};

/**
 * Check if user has all of the specified roles
 */
export const hasAllRoles = (roles: string[], targetRoles: string[]): boolean => {
  return targetRoles.every(targetRole => roles.includes(targetRole));
};

/**
 * Get role display name
 */
export const getRoleDisplayName = (role: string): string => {
  const roleMap: Record<string, string> = {
    [RoleTypes.SUPER_ADMIN]: 'Super Admin',
    [RoleTypes.ADMIN]: 'Administrator',
    [RoleTypes.HR_MANAGER]: 'HR Manager',
    [RoleTypes.HR_STAFF]: 'HR Staff',
    [RoleTypes.EMPLOYEE]: 'Employee',
  };

  return roleMap[role] || role;
};

/**
 * Get role badge color
 */
export const getRoleBadgeColor = (role: string): string => {
  const colorMap: Record<string, string> = {
    [RoleTypes.SUPER_ADMIN]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    [RoleTypes.ADMIN]: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    [RoleTypes.HR_MANAGER]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    [RoleTypes.HR_STAFF]: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
    [RoleTypes.EMPLOYEE]: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  };

  return colorMap[role] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
};
