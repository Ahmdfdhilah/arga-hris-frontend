import { ReactNode, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  const { isAuthenticated, accessToken, setTokens, clearAuth, verifyAndFetchUserData } = useAuthStore();
  const [initializing, setInitializing] = useState(true);
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
          // If we're already authenticated with the same token, just clean the URL
          if (isAuthenticated && accessToken === ssoToken) {
            navigate(location.pathname, { replace: true });
          } else {
            // Clear any existing auth state first to prevent stale token issues
            if (isAuthenticated) {
              clearAuth();
            }

            // Set new tokens including device_id
            setTokens(ssoToken, refreshTokenValue, deviceIdValue || undefined);

            // Fetch user data
            await verifyAndFetchUserData();

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
