// src/utils/api.ts
import axios, { AxiosInstance } from 'axios';
import { API_BASE_URL_SSO, API_BASE_URL_HRIS } from '@/config';
import { useAuthStore } from '@/stores/authStore';
import { jwtDecode } from 'jwt-decode';
import { handleApiError } from './errorHandler';

// Check if token is expired or about to expire (within 1 minute)
const isTokenExpiredOrExpiringSoon = (token: string): boolean => {
  try {
    const decoded: any = jwtDecode(token);
    // Add a 60-second buffer to handle the request time
    const currentTime = Date.now() / 1000 + 60;
    return decoded.exp < currentTime;
  } catch (error) {
    return true; // If there's an error decoding, consider token expired
  }
};

// Create axios instances for each service
export const ssoApi = axios.create({
  baseURL: API_BASE_URL_SSO,
});

export const hrisApi = axios.create({
  baseURL: API_BASE_URL_HRIS,
});

// Track if a token refresh is in progress
let isRefreshing = false;
// Store pending requests
let pendingRequests: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

// Helper to process pending requests
const processPendingRequests = (error: boolean, token?: string) => {
  pendingRequests.forEach(request => {
    if (error) {
      request.reject(new Error('Token refresh failed'));
    } else if (token) {
      request.resolve(token);
    }
  });

  pendingRequests = [];
};

// Configure interceptors for both API instances
const configureInterceptors = (api: AxiosInstance) => {
  // Request interceptor
  api.interceptors.request.use(
    async (config) => {
      const { accessToken, refreshToken: refreshTokenFn, clearAuth } = useAuthStore.getState();

      if (!accessToken) {
        return config;
      }

      // Check if token is expired or about to expire
      if (isTokenExpiredOrExpiringSoon(accessToken)) {
        let newToken;

        // If we're already refreshing, wait for that to finish
        if (isRefreshing) {
          try {
            newToken = await new Promise((resolve, reject) => {
              pendingRequests.push({ resolve, reject });
            });
            config.headers.Authorization = `Bearer ${newToken}`;
          } catch (error) {
            return Promise.reject(error);
          }
        } else {
          // Start a refresh
          isRefreshing = true;

          try {
            const success = await refreshTokenFn();
            if (success) {
              const { accessToken: newAccessToken } = useAuthStore.getState();
              newToken = newAccessToken;
              config.headers.Authorization = `Bearer ${newToken}`;
              // Notify pending requests of the new token
              processPendingRequests(false, newToken || undefined);
            } else {
              throw new Error('Token refresh failed');
            }
          } catch (error) {
            processPendingRequests(true);
            clearAuth();
            return Promise.reject(new Error('Session expired. Please login again.'));
          } finally {
            isRefreshing = false;
          }
        }
      } else {
        // Token is still valid
        config.headers.Authorization = `Bearer ${accessToken}`;
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // If error is 401 and we haven't tried to refresh the token yet
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        const { refreshToken: refreshTokenFn, clearAuth } = useAuthStore.getState();

        // If a refresh is already in progress, wait for it
        if (isRefreshing) {
          try {
            const newToken = await new Promise((resolve, reject) => {
              pendingRequests.push({ resolve, reject });
            });
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          } catch (error) {
            return Promise.reject(error);
          }
        }

        // Start the refresh process
        isRefreshing = true;

        try {
          const success = await refreshTokenFn();
          if (!success) {
            throw new Error('Token refresh failed');
          }

          const { accessToken: newAccessToken } = useAuthStore.getState();

          // Update the auth header and retry
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          // Process any pending requests
          processPendingRequests(false, newAccessToken || undefined);

          return api(originalRequest);
        } catch (error) {
          processPendingRequests(true);
          // Clear auth state if refresh fails
          clearAuth();
          return Promise.reject(new Error('Session expired. Please login again.'));
        } finally {
          isRefreshing = false;
        }
      }

      // Handle other error status codes with centralized error handler
      if (error.response?.status && [400, 403, 404, 422, 429, 500, 502, 503].includes(error.response.status)) {
        handleApiError(error, { silent: true }); // Silent here to prevent duplicate toasts in services
      }

      return Promise.reject(error);
    }
  );
};

// Apply interceptors to both API instances
configureInterceptors(ssoApi);
configureInterceptors(hrisApi);

// Export a default API that points to the HRIS service
export default hrisApi;
