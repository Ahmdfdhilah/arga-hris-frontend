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

  /**
   * Logout from this client
   * POST {SSO_URL}/auth/logout/client
   */
  async logout(accessToken?: string): Promise<void> {
    const { API_BASE_URL_SSO, CLIENT_ID } = await import('@/config');
    const axios = (await import('axios')).default;

    let token = accessToken;

    if (!token) {
      try {
        token = localStorage.getItem('persist:root')
          ? JSON.parse(JSON.parse(localStorage.getItem('persist:root') || '{}').auth || '{}').accessToken
          : null;
      } catch (e) {
        // Ignore parse errors
      }
    }

    if (!token) return;

    await axios.post(
      `${API_BASE_URL_SSO}/auth/logout/client`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Client-ID': CLIENT_ID
        }
      }
    );
  }
}

export const authService = new AuthService();
export default authService;
