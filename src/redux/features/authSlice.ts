// src/redux/features/authSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL_SSO } from '@/config';
import { authService } from '@/services';
import type { CurrentUser } from '@/services/auth/types';

export type { CurrentUser };


interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  userData: CurrentUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  userData: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Async thunk to verify token and fetch user data
export const verifyAndFetchUserData = createAsyncThunk(
  'auth/verifyAndFetchUserData',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const token = state.auth.accessToken;

      if (!token) {
        return rejectWithValue('No access token available');
      }

      // Fetch user data from HRIS API using service
      const response = await authService.getCurrentUser();

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user data');
    }
  }
);

// Async thunk to refresh token
export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const refresh = state.auth.refreshToken;

      console.log('[refreshToken] Attempting to refresh with token:', refresh ? refresh.substring(0, 20) + '...' : 'MISSING');

      if (!refresh) {
        console.error('[refreshToken] No refresh token available');
        return rejectWithValue('No refresh token available');
      }

      console.log('[refreshToken] Sending refresh request to SSO...');
      const response = await axios.post(`${API_BASE_URL_SSO}/auth/refresh`, {}, {
        headers: {
          Authorization: `Bearer ${refresh}`
        }
      });

      console.log('[refreshToken] Refresh successful, got new tokens');
      return response.data;
    } catch (error: any) {
      console.error('[refreshToken] Refresh failed:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.detail || error.response?.data?.message || 'Failed to refresh token');
    }
  }
);

// Async thunk to logout
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      return null;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to logout');
    }
  }
);

// Async thunk to logout from all sessions
export const logoutAllSessions = createAsyncThunk(
  'auth/logoutAllSessions',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logoutAllSessions();
      return null;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to logout from all sessions');
    }
  }
);

import { REHYDRATE } from 'redux-persist';

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setTokens: (state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) => {
      console.log('[authSlice] setTokens - clearing old tokens and setting new ones');
      console.log('[authSlice] Old refresh token:', state.refreshToken ? state.refreshToken.substring(0, 20) + '...' : 'none');
      console.log('[authSlice] New refresh token:', action.payload.refreshToken.substring(0, 20) + '...');
      
      // Clear any existing tokens first to prevent stale token issues
      state.accessToken = null;
      state.refreshToken = null;
      // Set new tokens
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      state.error = null;
    },
    setUserData: (state, action: PayloadAction<CurrentUser>) => {
      state.userData = action.payload;
    },
    clearAuth: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.userData = null;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle REHYDRATE from redux-persist
      .addCase(REHYDRATE, (state: any, action: any) => {
        if (action.payload?.auth) {
          console.log('[authSlice] REHYDRATE - restoring auth from localStorage');
          console.log('[authSlice] REHYDRATE refresh token:', action.payload.auth.refreshToken?.substring(0, 20) + '...');
          return action.payload.auth;
        }
        return state;
      })
      // Verify and fetch user data
      .addCase(verifyAndFetchUserData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyAndFetchUserData.fulfilled, (state, action) => {
        state.loading = false;
        state.userData = action.payload;
      })
      .addCase(verifyAndFetchUserData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Refresh token
      .addCase(refreshToken.fulfilled, (state, action) => {
        console.log('[authSlice] Refresh token fulfilled, updating tokens');
        state.accessToken = action.payload.access_token;
        state.refreshToken = action.payload.refresh_token;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        console.error('[authSlice] Refresh token rejected:', action.payload);
        state.accessToken = null;
        state.refreshToken = null;
        state.userData = null;
        state.isAuthenticated = false;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.accessToken = null;
        state.refreshToken = null;
        state.userData = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        // Even if logout fails, clear local state
        state.accessToken = null;
        state.refreshToken = null;
        state.userData = null;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      })
      // Logout all sessions
      .addCase(logoutAllSessions.fulfilled, (state) => {
        state.accessToken = null;
        state.refreshToken = null;
        state.userData = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutAllSessions.rejected, (state, action) => {
        // Even if logout fails, clear local state
        state.accessToken = null;
        state.refreshToken = null;
        state.userData = null;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      });
  },
});

export const { setTokens, setUserData, clearAuth } = authSlice.actions;
export default authSlice.reducer;
