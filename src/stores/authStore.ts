import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import axios from 'axios';
import { API_BASE_URL_SSO } from '@/config';
import type { CurrentUser } from '@/services/auth/types';

export type { CurrentUser };

interface AuthState {
    accessToken: string | null;
    refreshTokenValue: string | null;
    deviceId: string | null;
    userData: CurrentUser | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}

interface AuthActions {
    setTokens: (accessToken: string, refreshToken: string, deviceId?: string) => void;
    setUserData: (userData: CurrentUser) => void;
    clearAuth: () => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    verifyAndFetchUserData: () => Promise<CurrentUser | null>;
    refreshToken: () => Promise<boolean>;
    logout: () => Promise<void>;
}

const initialState: AuthState = {
    accessToken: null,
    refreshTokenValue: null,
    deviceId: null,
    userData: null,
    isAuthenticated: false,
    loading: false,
    error: null,
};

export const useAuthStore = create<AuthState & AuthActions>()(
    persist(
        (set, get) => ({
            ...initialState,

            setTokens: (accessToken, refreshToken, deviceId) => {
                set({
                    accessToken,
                    refreshTokenValue: refreshToken,
                    deviceId: deviceId || null,
                    isAuthenticated: true,
                    error: null,
                });
            },

            setUserData: (userData) => {
                set({ userData });
            },

            clearAuth: () => {
                set(initialState);
            },

            setLoading: (loading) => {
                set({ loading });
            },

            setError: (error) => {
                set({ error });
            },

            verifyAndFetchUserData: async () => {
                const { accessToken } = get();
                if (!accessToken) {
                    set({ error: 'No access token available' });
                    return null;
                }

                set({ loading: true, error: null });
                try {
                    const { authService } = await import('@/services/auth/service');
                    const response = await authService.getCurrentUser();
                    const userData = response.data;
                    set({ userData, loading: false });
                    return userData;
                } catch (error: any) {
                    const errorMessage = error.response?.data?.message || 'Failed to fetch user data';
                    set({ loading: false, error: errorMessage });
                    throw new Error(errorMessage);
                }
            },


            refreshToken: async () => {
                const { refreshTokenValue, deviceId } = get();
                if (!refreshTokenValue) {
                    console.error('[refreshToken] No refresh token available');
                    return false;
                }

                let finalDeviceId = deviceId;
                if (!finalDeviceId && refreshTokenValue) {
                    try {
                        const payload = JSON.parse(atob(refreshTokenValue.split('.')[1]));
                        finalDeviceId = payload.device_id;
                    } catch {
                        // Ignore decode errors
                    }
                }

                try {
                    const response = await axios.post(`${API_BASE_URL_SSO}/auth/refresh`, {
                        refresh_token: refreshTokenValue,
                        device_id: finalDeviceId,
                    });

                    set({
                        accessToken: response.data.data.access_token,
                        refreshTokenValue: response.data.data.refresh_token,
                    });
                    return true;
                } catch (error: any) {
                    console.error('[refreshToken] Refresh failed:', error.response?.data || error.message);
                    set({
                        accessToken: null,
                        refreshTokenValue: null,
                        userData: null,
                        isAuthenticated: false,
                    });
                    return false;
                }
            },

            logout: async () => {
                const { accessToken, deviceId } = get();
                try {
                    if (accessToken) {
                        const { authService } = await import('@/services/auth/service');
                        await authService.logout(accessToken, deviceId || undefined);
                    }
                } catch (error: any) {
                    console.error('Backend logout failed:', error);
                }
                set(initialState);
            },
        }),
        {
            name: 'arga-hris-auth',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                accessToken: state.accessToken,
                refreshTokenValue: state.refreshTokenValue,
                deviceId: state.deviceId,
                userData: state.userData,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
