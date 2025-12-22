import { Route } from 'react-router-dom';
import AuthGuard from '@/components/auth/AuthGuard';
import Layout from '@/components/layouts/Layout';
import { AssignmentList } from '@/pages/Assignments';

export const AssignmentsRoutes = () => {
    return (
        <>
            <Route
                path="/assignments"
                element={
                    <AuthGuard>
                        <Layout>
                            <AssignmentList />
                        </Layout>
                    </AuthGuard>
                }
            />
        </>
    );
};
