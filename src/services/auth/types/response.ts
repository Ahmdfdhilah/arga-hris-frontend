// Auth module - Response types (SSO-first)
import type { Employee } from '../../employees/types';

/**
 * Token information response
 * From GET /auth/token-info
 */
export interface TokenInfo {
  user_id: number;
  jti: string;
  exp: number;
  is_blacklisted: boolean;
}

/**
 * Token validation response
 * From POST /auth/validate-token
 */
export interface TokenValidation {
  valid: boolean;
}

/**
 * Blacklist statistics response (Admin only)
 * From GET /auth/blacklist-stats
 */
export interface BlacklistStats {
  blacklisted_tokens: number;
  globally_revoked_users: number;
}

/**
 * Current user response
 * From GET /auth/me
 * Combines SSO data with HRIS data
 */
export interface CurrentUser {
  // HRIS local data
  id: number;
  employee_id: number | null;
  org_unit_id: number | null;

  // SSO data
  sso_id: string;
  name: string;  // Full name from SSO
  email: string | null;
  avatar_url: string | null;
  sso_role: string;  // Role in SSO (user, admin, guest)

  // HRIS RBAC
  roles: string[];  // HRIS roles
  permissions: string[];  // HRIS permissions

  is_active: boolean;

  // Connected employee data (optional)
  employee: Employee | null;
}

// Helper to get display name
export const getDisplayName = (user: CurrentUser | null): string => {
  if (!user) return '';
  return user.name || user.email || 'User';
};

// Helper to check if user has role
export const hasRole = (user: CurrentUser | null, role: string): boolean => {
  if (!user) return false;
  return user.roles.includes(role);
};

// Helper to check if user has permission
export const hasPermission = (user: CurrentUser | null, permission: string): boolean => {
  if (!user) return false;
  return user.permissions.includes(permission);
};
