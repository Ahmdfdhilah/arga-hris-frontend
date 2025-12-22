import { ReactNode, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { CLIENT_ID, SSO_DASHBOARD_URL } from '@/config';
import { canAccessMenu } from '@/services/users/utils';

interface AuthGuardProps {
  children: ReactNode;
  requiredPermissions?: string[];
  requireAll?: boolean;
  fallbackPath?: string;
}

const AuthGuard = ({
  children,
  requiredPermissions = [],
  requireAll = false,
  fallbackPath = '/unauthorized',
}: AuthGuardProps) => {
  const { isAuthenticated, accessToken, loading, userData, clearAuth, verifyAndFetchUserData } = useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      if (accessToken && !userData && !loading) {
        try {
          await verifyAndFetchUserData();
        } catch (error) {
          clearAuth();
          window.location.href = `${SSO_DASHBOARD_URL}/login?client_id=${CLIENT_ID}`;
        }
      } else if (
        (!accessToken && isAuthenticated) ||
        (!accessToken && !isAuthenticated)
      ) {
        clearAuth();
        window.location.href = `${SSO_DASHBOARD_URL}/login?client_id=${CLIENT_ID}`;
      }
    };

    checkAuth();
  }, [accessToken, userData, loading, isAuthenticated]);

  if (!isAuthenticated || !userData) {
    const ssoLoginUrl = `${SSO_DASHBOARD_URL}/login?client_id=${CLIENT_ID}`;
    window.location.href = ssoLoginUrl;
    return null;
  }

  if (requiredPermissions.length > 0) {
    const hasAccess = canAccessMenu(userData, requiredPermissions, requireAll);
    if (!hasAccess) {
      return <Navigate to={fallbackPath} replace />;
    }
  }

  return <>{children}</>;
};

export default AuthGuard;
