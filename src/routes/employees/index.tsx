import { Route } from 'react-router-dom';
import AuthGuard from '../../components/auth/AuthGuard';
import Layout from '@/components/layouts/Layout';
import EmployeeList from '@/pages/Employees';
import { ArchivedEmployeeList } from '@/pages/Employees';

export const EmployeesRoutes = () => {
  return (
    <>
      <Route
        path="/employees/list"
        element={
          <AuthGuard requiredPermissions={['employees:read']}>
            <Layout>
              <EmployeeList />
            </Layout>
          </AuthGuard>
        }
      />
      <Route
        path="/employees/archived"
        element={
          <AuthGuard requiredPermissions={['employees:view_deleted']}>
            <Layout>
              <ArchivedEmployeeList />
            </Layout>
          </AuthGuard>
        }
      />
    </>
  );
};
