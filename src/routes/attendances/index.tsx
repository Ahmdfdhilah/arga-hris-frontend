import { Route } from 'react-router-dom';
import Layout from '@/components/layouts/Layout';
import { AttendanceList } from '@/pages/Attendances/List';
import { MyAttendance } from '@/pages/Attendances/MyAttendance';
import CheckInOut from '@/pages/Attendances/CheckInOut';
import AuthGuard from '../../components/auth/AuthGuard';

export const AttendancesRoutes = () => {
  return (
    <>
      <Route
        path="/attendances/list"
        element={
          <AuthGuard>
            <Layout>
              <AttendanceList />
            </Layout>
          </AuthGuard>
        }
      />
      <Route
        path="/attendances/my-attendance"
        element={
          <AuthGuard>
            <Layout>
              <MyAttendance />
            </Layout>
          </AuthGuard>
        }
      />
      <Route
        path="/attendances/check-in-out"
        element={
          <AuthGuard>
            <Layout>
              <CheckInOut />
            </Layout>
          </AuthGuard>
        }
      />
    </>
  );
};
