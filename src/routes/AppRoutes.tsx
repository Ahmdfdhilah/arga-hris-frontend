import { Routes, Route } from 'react-router-dom';
import { NotFound, Unauthorized } from '@/pages';
import { DashboardRoutes } from './dashboard';
import { EmployeesRoutes } from './employees';
import { OrgUnitsRoutes } from './org-units';
import { AttendancesRoutes } from './attendances';
import { LeaveRequestsRoutes } from './leave-requests';
import { ReportsRoutes } from './reports';
import { AssignmentsRoutes } from './assignments';
import { HolidaysRoutes } from './holidays';

const AppRoutes = () => {
  return (
    <Routes>

      {/* Dashboard Routes */}
      {DashboardRoutes()}

      {/* Employees Management Routes */}
      {EmployeesRoutes()}

      {/* Organization Management Routes */}
      {OrgUnitsRoutes()}

      {/* Attendances Management Routes */}
      {AttendancesRoutes()}

      {/* Leave Requests Management Routes */}
      {LeaveRequestsRoutes()}

      {/* Holidays Management Routes */}
      {HolidaysRoutes()}

      {/* Reports Management Routes */}
      {ReportsRoutes()}

      {/* Assignments Management Routes */}
      {AssignmentsRoutes()}

      {/* Error Routes */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<NotFound />} />

    </Routes>
  );
};

export default AppRoutes;

