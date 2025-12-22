import { BaseService } from '../base/service';
import type { ApiResponse } from '../base/types';
import type { CurrentUser } from './types';

/**
 * Auth Service Class
 * HRIS v2 - Hanya menyediakan endpoint /auth/me
 * Untuk logout dan token management, gunakan SSO Service
 */
class AuthService extends BaseService {
  constructor() {
    super('/auth');
  }

  /**
   * GET /auth/me
   * Get current authenticated user information
   *
   * Returns complete user data including:
   * - User profile
   * - Roles
   * - Permissions
   * - Employee ID (if linked)
   */
  async getCurrentUser(): Promise<ApiResponse<CurrentUser>> {
    return this.get<ApiResponse<CurrentUser>>('/me');
  }
}

export const authService = new AuthService();
export default authService;
