import { Route } from 'react-router-dom';
import AuthGuard from '../../components/auth/AuthGuard';
import Layout from '@/components/layouts/Layout';
import { OrgUnitList } from '@/pages';
import { ArchivedOrgUnitList } from '@/pages/OrgUnits';

export const OrgUnitsRoutes = () => {
    return (
        <>
            <Route
                path="/organization/list"
                element={
                    <AuthGuard >
                        <Layout>
                            <OrgUnitList />
                        </Layout>
                    </AuthGuard>
                }
            />
            <Route
                path="/organization/archived"
                element={
                    <AuthGuard requiredPermissions={['org_unit.view_deleted']}>
                        <Layout>
                            <ArchivedOrgUnitList />
                        </Layout>
                    </AuthGuard>
                }
            />
        </>
    );
};
