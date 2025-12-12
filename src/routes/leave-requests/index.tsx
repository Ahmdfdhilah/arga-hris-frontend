import { Route } from 'react-router-dom';
import AuthGuard from '../../components/auth/AuthGuard';
import Layout from '@/components/layouts/Layout';
import { LeaveRequestList, MyLeaveRequests } from '@/pages/LeaveRequests';

export const LeaveRequestsRoutes = () => {
  return (
    <>
      <Route
        path="/leave-requests/list"
        element={
          <AuthGuard>
            <Layout>
              <LeaveRequestList />
            </Layout>
          </AuthGuard>
        }
      />
      <Route
        path="/leave-requests/my-leave-requests"
        element={
          <AuthGuard>
            <Layout>
              <MyLeaveRequests />
            </Layout>
          </AuthGuard>
        }
      />
    </>
  );
};
