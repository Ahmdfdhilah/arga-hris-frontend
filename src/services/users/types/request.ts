// Users module - Request types

/**
 * User filter params
 * Extends PaginationParams with user-specific filters
 */
export interface UserFilterParams {
  search?: string;
  is_active?: boolean;
  has_employee?: boolean;
  org_unit_id?: number;
  include_details?: boolean;
}

/**
 * Create user request
 * POST /users
 */
export interface UserCreateRequest {
  email: string;
  first_name: string;
  last_name: string;
  employee_id?: number | null;
  org_unit_id?: number | null;
  is_active?: boolean;
}

/**
 * Update user request
 * PUT /users/{id}
 */
export interface UserUpdateRequest {
  first_name?: string;
  last_name?: string;
  org_unit_id?: number | null;
}

/**
 * Link employee request
 * POST /users/{id}/link-employee
 */
export interface LinkEmployeeRequest {
  employee_id: number;
}

/**
 * Assign role request
 * POST /users/{id}/assign-role
 */
export interface AssignRoleRequest {
  role_name: string;
}

/**
 * Remove role request
 * POST /users/{id}/remove-role
 */
export interface RemoveRoleRequest {
  role_name: string;
}

/**
 * Assign multiple roles request
 * POST /users/{id}/assign-roles
 */
export interface AssignRolesRequest {
  role_names: string[];
}

/**
 * Create guest user request
 * POST /guests
 */
export interface CreateGuestRequest {
  email: string;
  first_name: string;
  last_name: string;
  guest_type: 'intern' | 'contractor' | 'guest';
  valid_until: string; // ISO datetime
  valid_from?: string; // ISO datetime (optional)
  sponsor_id?: number | null;
  notes?: string | null;
}

/**
 * Update guest account request
 * PATCH /guests/{id}
 */
export interface UpdateGuestAccountRequest {
  guest_type?: 'intern' | 'contractor' | 'guest';
  valid_from?: string; // ISO datetime
  valid_until?: string; // ISO datetime
  sponsor_id?: number | null;
  notes?: string | null;
}

/**
 * Guest user filter params
 * For GET /guests
 */
export interface GuestUserFilterParams {
  search?: string;
  is_active?: boolean;
}
