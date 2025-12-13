/**
 * TanStack Query hooks for dashboard
 */
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard/service';
import type { ApiResponse } from '@/services/base/types';
import type { DashboardSummary, DashboardRolesResponse } from '@/services/dashboard/types';

/**
 * Hook to fetch dashboard summary
 * Automatically refetches every 5 minutes to keep data fresh
 */
export const useDashboardSummary = (
  targetDate?: string,
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
  }
): UseQueryResult<ApiResponse<DashboardSummary>, Error> => {
  return useQuery({
    queryKey: ['dashboard', 'summary', targetDate],
    queryFn: () => dashboardService.getSummary(targetDate),
    refetchInterval: options?.refetchInterval ?? 5 * 60 * 1000, // 5 minutes
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: options?.enabled ?? true,
  });
};

/**
 * Hook to fetch dashboard roles for current user
 */
export const useDashboardRoles = (): UseQueryResult<ApiResponse<DashboardRolesResponse>, Error> => {
  return useQuery({
    queryKey: ['dashboard', 'roles'],
    queryFn: () => dashboardService.getDashboardRoles(),
    staleTime: 10 * 60 * 1000, // 10 minutes (roles don't change often)
  });
};
