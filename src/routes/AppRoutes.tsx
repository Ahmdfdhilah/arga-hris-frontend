import { Routes, Route } from 'react-router-dom';
import { NotFound, Unauthorized } from '@/pages';
import { DashboardRoutes } from './dashboard';
import { EmployeesRoutes } from './employees';
import { OrgUnitsRoutes } from './org-units';
import { AttendancesRoutes } from './attendances';
import { LeaveRequestsRoutes } from './leave-requests';
import { ReportsRoutes } from './reports';
import { WorkSubmissionsRoutes } from './work-submissions';

const AppRoutes = () => {
  return (
    <Routes>

      {/* Dashboard Routes */}
      {DashboardRoutes()}

      {/* Users Management Routes - digabung dengan Employee management */}
      {/* {UsersRoutes()} */}

      {/* Employees Management Routes */}
      {EmployeesRoutes()}

      {/* Organization Management Routes */}
      {OrgUnitsRoutes()}

      {/* Attendances Management Routes */}
      {AttendancesRoutes()}

      {/* Leave Requests Management Routes */}
      {LeaveRequestsRoutes()}

      {/* Reports Management Routes */}
      {ReportsRoutes()}

      {/* Work Submissions Management Routes */}
      {WorkSubmissionsRoutes()}

      {/* Error Routes */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<NotFound />} />

    </Routes>
  );
};

export default AppRoutes;
