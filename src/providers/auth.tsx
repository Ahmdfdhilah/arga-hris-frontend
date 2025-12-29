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

  useEffect(() => {
    const handleSsoTokens = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const ssoToken = urlParams.get('sso_token');
        const refreshTokenValue = urlParams.get('refresh_token');
        const deviceIdValue = urlParams.get('device_id');

        if (ssoToken && refreshTokenValue) {
          if (isAuthenticated && accessToken === ssoToken) {
            navigate(location.pathname, { replace: true });
          } else {
            if (isAuthenticated) {
              clearAuth();
            }

            setTokens(ssoToken, refreshTokenValue, deviceIdValue || undefined);
            await verifyAndFetchUserData();
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

  useEffect(() => {
    if (!initializing) return;

    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.has('sso_token') && !urlParams.has('refresh_token')) {
      setInitializing(false);
    }
  }, [initializing]);

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