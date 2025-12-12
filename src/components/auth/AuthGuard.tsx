import { ReactNode, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { clearAuth, verifyAndFetchUserData } from '@/redux/features/authSlice';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { SSO_DASHBOARD_URL } from '@/config';
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
  const { isAuthenticated, accessToken, loading, userData } = useAppSelector(
    (state) => state.auth
  );
  const dispatch = useAppDispatch();

  useEffect(() => {
    const checkAuth = async () => {
      if (accessToken && !userData && !loading) {
        try {
          await dispatch(verifyAndFetchUserData()).unwrap();
        } catch (error) {
          dispatch(clearAuth());
          window.location.href = `${SSO_DASHBOARD_URL}/login`;
        }
      } else if (
        (!accessToken && isAuthenticated) ||
        (!accessToken && !isAuthenticated)
      ) {
        dispatch(clearAuth());
        window.location.href = `${SSO_DASHBOARD_URL}/login`;
      }
    };

    checkAuth();
  }, [accessToken, userData, loading, isAuthenticated, dispatch]);

  if (!isAuthenticated || !userData) {
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
