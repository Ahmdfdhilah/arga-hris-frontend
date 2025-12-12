// Users module - Response types
import { OrgUnit } from '@/services/org_units';
import type { Employee } from '../../employees/types';


/**
 * User response
 * From POST /users, PUT /users/{id}, etc.
 */
export interface User {
  id: number;
  sso_id: number | null;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  is_active: boolean;
  employee_id: number | null;
  org_unit_id: number | null;
  created_at: string;
  updated_at: string;
}

/**
 * Role response
 * From GET /users/roles/list
 */
export interface Role {
  id: number;
  name: string;
  description: string | null;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Permission response
 * From GET /users/permissions/list
 */
export interface Permission {
  id: number;
  code: string;
  name: string;
  description: string | null;
  resource_type: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * User with employee data
 * From GET /users/me, GET /users/{id}
 */
export interface UserWithEmployee extends User {
  employee: Employee | null;
}

/**
 * User detail response with employee and org unit data
 * From GET /users?include_details=true
 */
export interface UserDetail extends User {
  employee_data: Employee | null;
  org_unit_data: OrgUnit | null;
}

/**
 * User roles and permissions response
 * From GET /users/{id}/roles-permissions
 */
export interface UserRolesPermissions {
  user_id: number;
  email: string;
  full_name: string;
  roles: string[];
  permissions: string[];
}

/**
 * Guest account response
 * Guest account details for a user
 */
export interface GuestAccount {
  id: number;
  user_id: number;
  guest_type: 'intern' | 'contractor' | 'guest';
  valid_from: string; // ISO datetime
  valid_until: string; // ISO datetime
  sponsor_id: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Guest user response
 * From GET /guests, GET /guests/{id}, POST /guests
 */
export interface GuestUser {
  id: number;
  sso_id: number | null;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  account_type: 'guest';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  guest_account: GuestAccount | null;
  sso_sync_status?: 'success' | 'failed'; // Only on creation
  temporary_password?: string | null; // Only on creation
}

/**
 * Guest expiry status response
 * From GET /guests/{id}/expiry
 */
export interface GuestExpiryStatus {
  user_id: number;
  email: string;
  full_name: string;
  guest_type: 'intern' | 'contractor' | 'guest';
  valid_from: string; // ISO datetime
  valid_until: string; // ISO datetime
  is_expired: boolean;
  days_remaining: number;
}
