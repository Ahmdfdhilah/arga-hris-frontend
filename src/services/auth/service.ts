// Auth Service
// Handles authentication operations: logout, token validation, etc.

import { BaseService } from '../base/service';
import type { ApiResponse } from '../base/types';
import type { TokenInfo, TokenValidation, BlacklistStats, CurrentUser } from './types';

/**
 * Auth Service Class
 * Menangani operasi authentication sesuai dengan backend HRIS
 */
class AuthService extends BaseService {
  constructor() {
    super('/auth');
  }

  /**
   * POST /auth/logout
   * Logout user by blacklisting current token
   *
   * This will:
   * - Blacklist the current access token
   * - Invalidate user cache
   * - Token remains blacklisted until it expires naturally
   *
   * Note: This only logs out the current device/token.
   */
  async logout(): Promise<ApiResponse<null>> {
    return this.post<ApiResponse<null>>('/logout');
  }

  /**
   * POST /auth/logout-all
   * Logout user from ALL devices/sessions
   *
   * Use cases:
   * - User changes password
   * - Security breach detected
   * - User wants to terminate all active sessions
   */
  async logoutAllSessions(): Promise<ApiResponse<null>> {
    return this.post<ApiResponse<null>>('/logout-all');
  }

  /**
   * POST /auth/validate-token
   * Validate if a token is still valid
   *
   * Checks:
   * - Token signature validity
   * - Token not expired
   * - Token not blacklisted
   * - User not globally revoked
   */
  async validateToken(): Promise<ApiResponse<TokenValidation>> {
    return this.post<ApiResponse<TokenValidation>>('/validate-token');
  }

  /**
   * GET /auth/token-info
   * Get information about current token
   *
   * Returns token metadata including:
   * - user_id
   * - jti (token ID)
   * - exp (expiration time)
   * - is_blacklisted status
   */
  async getTokenInfo(): Promise<ApiResponse<TokenInfo>> {
    return this.get<ApiResponse<TokenInfo>>('/token-info');
  }

  /**
   * POST /auth/refresh-user-cache
   * Manually refresh user cache (Admin only)
   *
   * @param userId - User ID to refresh cache
   */
  async refreshUserCache(userId: number): Promise<ApiResponse<{ user_id: number; refreshed: boolean }>> {
    return this.post<ApiResponse<{ user_id: number; refreshed: boolean }>>(
      '/refresh-user-cache',
      null,
      { params: { user_id: userId } }
    );
  }

  /**
   * GET /auth/blacklist-stats
   * Get blacklist statistics (Admin only)
   *
   * Returns:
   * - Number of blacklisted tokens
   * - Number of globally revoked users
   */
  async getBlacklistStats(): Promise<ApiResponse<BlacklistStats>> {
    return this.get<ApiResponse<BlacklistStats>>('/blacklist-stats');
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

// Export singleton instance
export const authService = new AuthService();
export default authService;
