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

  const urlParams = new URLSearchParams(window.location.search);
  const hasSsoTokenInUrl = urlParams.has('sso_token');

  useEffect(() => {
    const checkAuth = async () => {
      if (hasSsoTokenInUrl) return;

      if (accessToken && !userData && !loading) {
        try {
          await verifyAndFetchUserData();
        } catch (error) {
          clearAuth();
          window.location.href = `${SSO_DASHBOARD_URL}/login?client_id=${CLIENT_ID}`;
        }
      } else if (!accessToken && !hasSsoTokenInUrl) {
        clearAuth();
        window.location.href = `${SSO_DASHBOARD_URL}/login?client_id=${CLIENT_ID}`;
      }
    };

    checkAuth();
  }, [accessToken, userData, loading, isAuthenticated, clearAuth, verifyAndFetchUserData, hasSsoTokenInUrl]);

  if (hasSsoTokenInUrl || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || !userData) {
    if (!hasSsoTokenInUrl && !loading) {
      window.location.href = `${SSO_DASHBOARD_URL}/login?client_id=${CLIENT_ID}`;
    }
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
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
