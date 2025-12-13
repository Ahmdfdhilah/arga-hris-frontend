import { Route } from 'react-router-dom';
import Layout from '@/components/layouts/Layout';
import { WorkSubmissionList } from '@/pages/WorkSubmissions/List';
import { MySubmissions } from '@/pages/WorkSubmissions/MySubmissions';
import { SubmitWork } from '@/pages/WorkSubmissions/Submit';
import AuthGuard from '../../components/auth/AuthGuard';

export const WorkSubmissionsRoutes = () => {
  return (
    <>
      <Route
        path="/work-submissions/list"
        element={
          <AuthGuard>
            <Layout>
              <WorkSubmissionList />
            </Layout>
          </AuthGuard>
        }
      />
      <Route
        path="/work-submissions/my-submissions"
        element={
          <AuthGuard>
            <Layout>
              <MySubmissions />
            </Layout>
          </AuthGuard>
        }
      />
      <Route
        path="/work-submissions/submit"
        element={
          <AuthGuard>
            <Layout>
              <SubmitWork />
            </Layout>
          </AuthGuard>
        }
      />
    </>
  );
};
