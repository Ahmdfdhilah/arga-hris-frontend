import { useMemo } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { hasAnyRole } from '@/services/users/utils';
import type { UseQueryResult } from '@tanstack/react-query';

/**
 * Configuration for role-based query behavior
 */
export interface RoleBasedQueryConfig<TAdminFilters, TTeamFilters> {
  /**
   * All filters including admin-only filters
   */
  adminFilters: TAdminFilters;
  
  /**
   * Function to extract team-only filters from admin filters
   * Should remove admin-only filters like employee_id, org_unit_id, type, etc.
   */
  getTeamFilters: (adminFilters: TAdminFilters) => TTeamFilters;
  
  /**
   * Hook for admin query (full access)
   */
  useAdminQuery: (filters: TAdminFilters, options?: any) => UseQueryResult<any, Error>;
  
  /**
   * Hook for team query (subordinates only)
   */
  useTeamQuery: (filters: TTeamFilters, options?: any) => UseQueryResult<any, Error>;
  
  /**
   * Optional: Custom role check logic
   * Default: checks for hr_admin or super_admin
   */
  isAdminRole?: (roles: string[]) => boolean;
  
  /**
   * Optional: Custom role check for team access
   * Default: checks for org_unit_head
   */
  isTeamRole?: (roles: string[]) => boolean;
}

/**
 * Result from useRoleBasedQuery hook
 */
export interface RoleBasedQueryResult<TData = any> {
  /**
   * Whether to use team fetch (true) or admin fetch (false)
   */
  shouldUseTeamFetch: boolean;
  
  /**
   * Combined query result from either admin or team query
   */
  query: UseQueryResult<TData, Error>;
  
  /**
   * Current user data from Redux store
   */
  userData: any;
}

/**
 * Custom hook for role-based data fetching
 * 
 * This hook handles the common pattern of:
 * 1. Checking user roles (priority: admin > team lead)
 * 2. Deciding which query to use (admin full access vs team subordinates)
 * 3. Preparing appropriate filters
 * 4. Returning the correct query result
 * 
 * @example
 * ```tsx
 * const { shouldUseTeamFetch, query } = useRoleBasedQuery({
 *   adminFilters: filters,
 *   getTeamFilters: ({ type, org_unit_id, employee_id, ...rest }) => rest,
 *   useAdminQuery: useAttendances,
 *   useTeamQuery: useTeamAttendance,
 * });
 * 
 * const { data, isLoading, error } = query;
 * ```
 */
export function useRoleBasedQuery<TAdminFilters = any, TTeamFilters = any, TData = any>(
  config: RoleBasedQueryConfig<TAdminFilters, TTeamFilters>
): RoleBasedQueryResult<TData> {
  const { userData } = useAppSelector((state) => state.auth);
  
  const {
    adminFilters,
    getTeamFilters,
    useAdminQuery,
    useTeamQuery,
    isAdminRole = (roles: string[]) => hasAnyRole({ roles } as any, ['hr_admin', 'super_admin']),
    isTeamRole = (roles: string[]) => hasAnyRole({ roles } as any, ['org_unit_head']),
  } = config;

  /**
   * Determine which fetch method to use based on user roles
   * Priority: admin roles (hr_admin/super_admin) > team role (org_unit_head)
   */
  const shouldUseTeamFetch = useMemo(() => {
    if (!userData?.roles) return false;
    
    // If user has admin role, always use full list (admin access)
    if (isAdminRole(userData.roles)) return false;
    
    // If user only has team role (and not admin), use team fetch
    return isTeamRole(userData.roles);
  }, [userData?.roles, isAdminRole, isTeamRole]);

  /**
   * Prepare filters based on fetch type
   */
  const teamFilters = useMemo(() => {
    return getTeamFilters(adminFilters);
  }, [adminFilters, getTeamFilters]);

  /**
   * Conditional queries
   * Only one query will be enabled at a time based on role
   */
  const adminQuery = useAdminQuery(adminFilters, {
    enabled: !shouldUseTeamFetch,
  });
  
  const teamQuery = useTeamQuery(teamFilters, {
    enabled: shouldUseTeamFetch,
  });

  /**
   * Return the appropriate query result
   */
  const query = shouldUseTeamFetch ? teamQuery : adminQuery;

  return {
    shouldUseTeamFetch,
    query,
    userData,
  };
}

/**
 * Helper function to determine if admin-only filters should be hidden
 * Use this in your UI to conditionally render filter components
 * 
 * @example
 * ```tsx
 * const { shouldUseTeamFetch } = useRoleBasedQuery(...);
 * 
 * {!shouldUseTeamFetch && (
 *   <EmployeeFilter />
 * )}
 * ```
 */
export function shouldHideAdminFilters(shouldUseTeamFetch: boolean): boolean {
  return shouldUseTeamFetch;
}
