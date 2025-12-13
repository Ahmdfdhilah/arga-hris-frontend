import { Route } from 'react-router-dom';
import AuthGuard from '../../components/auth/AuthGuard';
import Layout from '@/components/layouts/Layout';
import { AttendanceReportList } from '@/pages';

export const ReportsRoutes = () => {
  return (
    <>
      <Route
        path="/reports/attendances"
        element={
          <AuthGuard>
            <Layout>
              <AttendanceReportList />
            </Layout>
          </AuthGuard>
        }
      />
    </>
  );
};
