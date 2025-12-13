/**
 * Dashboard API Service
 */
import { BaseService } from '../base/service';
import type { ApiResponse } from '../base/types';
import type { DashboardSummary, DashboardRolesResponse } from './types';

class DashboardService extends BaseService {
  constructor() {
    super('/dashboard');
  }

  /**
   * Get dashboard summary for current user
   * Returns role-based widgets for all user's roles
   *
   * @param targetDate - Optional target date (YYYY-MM-DD), defaults to today
   */
  async getSummary(targetDate?: string): Promise<ApiResponse<DashboardSummary>> {
    const params = targetDate ? { target_date: targetDate } : undefined;
    return this.get<ApiResponse<DashboardSummary>>('/summary', { params });
  }

  /**
   * Get dashboard roles available to current user
   * Useful to determine which widgets to expect
   */
  async getDashboardRoles(): Promise<ApiResponse<DashboardRolesResponse>> {
    return this.get<ApiResponse<DashboardRolesResponse>>('/summary/roles');
  }
}

// Export singleton instance
export const dashboardService = new DashboardService();
export default dashboardService;
