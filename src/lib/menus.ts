import {
  Home,
  Building,
  Users,
  Calendar,
  CalendarClock,
  BarChart3,
  // DraftingCompass
} from 'lucide-react';
import { SSO_DASHBOARD_URL } from '../config';

export interface MenuItem {
  title: string;
  path: string;
  icon?: any;
  permissions: string[];
  requireAll?: boolean;
  roles?: string[];
  requireAllRoles?: boolean;
  subMenus?: MenuItem[];
}

export const hrisMenus: MenuItem[] = [
   {
    title: 'Home',
    path: SSO_DASHBOARD_URL,
    icon: Home,
    permissions: [],
  },
  {
    title: 'Kehadiran',
    path: '/attendances',
    icon: Calendar,
    permissions: ['attendance.read', 'attendance.read_own'],
    subMenus: [
      {
        title: 'Rekap Kehadiran',
        path: '/attendances/list',
        permissions: ['attendance.read'],
        roles: ['super_admin', 'hr_admin', 'org_unit_head'],
        requireAllRoles: false,
      },
      {
        title: 'Kehadiran Saya',
        path: '/attendances/my-attendance',
        permissions: ['attendance.read_own'],
      },
      {
        title: 'Absen Kehadiran',
        path: '/attendances/check-in-out',
        permissions: ['attendance.read_own', 'attendance.create'],
      },
    ],
  },

  //  {
  //   title: 'Report Bulanan',
  //   path: '/work-submissions',
  //   icon: DraftingCompass,
  //   permissions: ['attendance.read', 'attendance.read_own'],
  //   subMenus: [
  //     {
  //       title: 'Rekap Report',
  //       path: '/work-submissions/list',
  //       permissions: ['work_submission.read'],
  //       roles: ['super_admin', 'hr_admin', 'org_unit_head'],
  //       requireAllRoles: false,
  //     },
  //     {
  //       title: 'Report Saya',
  //       path: '/work-submissions/my-submissions',
  //       permissions: ['work_submission.read_own'],
  //     },
  //     {
  //       title: 'Kumpulkan Report',
  //       path: '/work-submissions/submit',
  //       permissions: ['work_submission.read_own', 'work_submission.create'],
  //     },
  //   ],
  // },
  {
    title: 'Cuti',
    path: '/leave-requests',
    icon: CalendarClock,
    permissions: ['leave_request.read', 'leave_request.read_own'],
    requireAll: false,
    subMenus: [
      {
        title: 'Daftar Cuti',
        path: '/leave-requests/list',
        permissions: ['leave_request.read_all'],
        roles: ['super_admin', 'hr_admin'],
        requireAllRoles: false,
      },
      {
        title: 'Cuti Saya',
        path: '/leave-requests/my-leave-requests',
        permissions: ['leave_request.read_own'],
      },
    ],
  },
  {
    title: 'Laporan',
    path: '/reports',
    icon: BarChart3,
    permissions: ['employee.export', 'attendance.export', 'payroll.export'],
    requireAll: false,
    roles: ['super_admin', 'hr_admin'],
    requireAllRoles: false,
    subMenus: [
      {
        title: 'Laporan Kehadiran',
        path: '/reports/attendances',
        permissions: ['attendance.export'],
        roles: ['super_admin', 'hr_admin'],
        requireAllRoles: false,
      },
    ],
  },
  {
    title: 'Manajemen Organisasi',
    path: '/organization',
    icon: Building,
    permissions: ['org_unit.read'],
    roles: ['super_admin', 'hr_admin'],
    requireAllRoles: false,
    subMenus: [
      {
        title: 'Daftar Unit Organisasi',
        path: '/organization/list',
        permissions: ['org_unit.read'],
        roles: ['super_admin', 'hr_admin'],
        requireAllRoles: false,
      },
      {
        title: 'Unit Terhapus',
        path: '/organization/archived',
        permissions: ['org_unit.view_deleted'],
        roles: ['super_admin'],
        requireAllRoles: true,
      },
      // {
      //   title: 'Struktur Organisasi',
      //   path: '/organization/structure',
      //   permissions: ['org_unit.read'],
      // },
    ],
  },
  {
    title: 'Manajemen Karyawan',
    path: '/employees',
    icon: Users,
    permissions: ['employee.read'],
    roles: ['super_admin', 'hr_admin'],
    requireAllRoles: false,
    subMenus: [
      {
        title: 'Daftar Karyawan',
        path: '/employees/list',
        permissions: ['employee.read'],
        roles: ['super_admin', 'hr_admin'],
        requireAllRoles: false,
      },
      {
        title: 'Karyawan Terhapus',
        path: '/employees/archived',
        permissions: ['employee.view_deleted'],
        roles: ['super_admin'],
        requireAllRoles: true,
      },
      // {
      //   title: 'Hirarki Karyawan',
      //   path: '/employees/hierarchy',
      //   permissions: ['employee.read'],
      // },
    ],
  },
  // User management digabung dengan Employee management
  // {
  //   title: 'Manajemen User',
  //   path: '/users',
  //   icon: UserCog,
  //   permissions: ['user.read'],
  //   roles: ['super_admin'],
  //   requireAllRoles: true,
  //   subMenus: [
  //     {
  //       title: 'Daftar Users',
  //       path: '/users/list',
  //       permissions: ['user.read'],
  //       roles: ['super_admin'],
  //       requireAllRoles: true,
  //     },
  //   ],
  // },

];
