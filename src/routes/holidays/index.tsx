import { Route } from 'react-router-dom';
import AuthGuard from '../../components/auth/AuthGuard';
import Layout from '@/components/layouts/Layout';
import { HolidayList } from '@/pages/Holidays';

export const HolidaysRoutes = () => {
    return (
        <>
            <Route
                path="/holidays"
                element={
                    <AuthGuard requiredPermissions={['holiday:read']}>
                        <Layout>
                            <HolidayList />
                        </Layout>
                    </AuthGuard>
                }
            />
        </>
    );
};
