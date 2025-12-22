import { ReactNode, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { setTokens, verifyAndFetchUserData, clearAuth } from '@/redux/features/authSlice';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { RootState, persistor } from '@/redux/store';

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  const { isAuthenticated, accessToken } = useAppSelector((state: RootState) => state.auth);
  const [initializing, setInitializing] = useState(true);
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  // Handle SSO token processing
  useEffect(() => {
    const handleSsoTokens = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const ssoToken = urlParams.get('sso_token');
        const refreshTokenValue = urlParams.get('refresh_token');
        const deviceIdValue = urlParams.get('device_id');

        // Check if we have SSO tokens in the URL
        if (ssoToken && refreshTokenValue) {
          console.log('[AuthProvider] SSO token detected in URL');
          console.log('[AuthProvider] SSO refresh token:', refreshTokenValue.substring(0, 20) + '...');
          console.log('[AuthProvider] Device ID:', deviceIdValue || 'not provided');
          console.log('[AuthProvider] Current auth state - isAuthenticated:', isAuthenticated, 'has accessToken:', !!accessToken);

          // If we're already authenticated with the same token, just clean the URL
          if (isAuthenticated && accessToken === ssoToken) {
            console.log('[AuthProvider] Same token as current, just cleaning URL');
            navigate(location.pathname, { replace: true });
          } else {
            // Clear any existing auth state first to prevent stale token issues
            if (isAuthenticated) {
              console.log('[AuthProvider] Clearing previous auth state before setting new tokens');
              // Pause persist during cleanup
              persistor.pause();
              dispatch(clearAuth());
              // Purge localStorage completely
              await persistor.purge();
              console.log('[AuthProvider] Persist purged');
            } else {
              // Even if not authenticated, pause to set new tokens cleanly
              persistor.pause();
            }

            console.log('[AuthProvider] Setting new tokens from SSO');
            // Set new tokens including device_id
            dispatch(setTokens({
              accessToken: ssoToken,
              refreshToken: refreshTokenValue,
              deviceId: deviceIdValue || undefined
            }));

            // Resume and flush to persist new tokens
            persistor.persist();
            await persistor.flush();
            console.log('[AuthProvider] New tokens persisted to localStorage');

            console.log('[AuthProvider] Fetching user data...');
            // Fetch user data
            await dispatch(verifyAndFetchUserData()).unwrap();

            console.log('[AuthProvider] Login complete, cleaning URL');
            // Clean up URL after processing the tokens
            navigate(location.pathname, { replace: true });
          }
        }
      } catch (error) {
        console.error('Auth token processing error:', error);
      } finally {
        setInitializing(false);
      }
    };

    handleSsoTokens();
  }, [location.search]);

  // Initial loading complete after first check
  useEffect(() => {
    if (!initializing) return;

    // If we don't have SSO tokens in URL and auth state is determined, we're done initializing
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.has('sso_token') && !urlParams.has('refresh_token')) {
      setInitializing(false);
    }
  }, [initializing]);

  // Show loading spinner while initializing
  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthProvider;
