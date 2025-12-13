import { Route } from 'react-router-dom';
import AuthGuard from '../../components/auth/AuthGuard';
import Layout from '@/components/layouts/Layout';
// import { Dashboard } from '@/pages';
import CheckInOut from '@/pages/Attendances/CheckInOut';

export const DashboardRoutes = () => {
  return (
    <>
      <Route
        path="/"
        element={
          < AuthGuard >
            <Layout>
              <CheckInOut />
            </Layout>
          </AuthGuard>
        }
      />
  </>
  );
};
