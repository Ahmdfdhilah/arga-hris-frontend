import {
  Home,
  Building,
  Users,
  Calendar,
  CalendarClock,
  BarChart3,
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
    permissions: ['dashboard:read'],
  },
  {
    title: 'Kehadiran',
    path: '/attendances',
    icon: Calendar,
    permissions: ['attendance:read'],
    subMenus: [
      {
        title: 'Rekap Kehadiran',
        path: '/attendances/list',
        permissions: ['attendance:read_all'],
        roles: ['super_admin', 'hr_admin', 'org_unit_head'],
        requireAllRoles: false,
      },
      {
        title: 'Kehadiran Saya',
        path: '/attendances/my-attendance',
        permissions: ['attendance:read'],
      },
      {
        title: 'Absen Kehadiran',
        path: '/attendances/check-in-out',
        permissions: ['attendance:write'],
      },
    ],
  },
  {
    title: 'Cuti',
    path: '/leave-requests',
    icon: CalendarClock,
    permissions: ['leave:read'],
    requireAll: false,
    subMenus: [
      {
        title: 'Daftar Cuti',
        path: '/leave-requests/list',
        permissions: ['leave:read_all'],
        roles: ['super_admin', 'hr_admin'],
        requireAllRoles: false,
      },
      {
        title: 'Cuti Saya',
        path: '/leave-requests/my-leave-requests',
        permissions: ['leave:read'],
      },
    ],
  },
  {
    title: 'Laporan',
    path: '/reports',
    icon: BarChart3,
    permissions: ['dashboard:read_all'],
    requireAll: false,
    roles: ['super_admin', 'hr_admin'],
    requireAllRoles: false,
    subMenus: [
      {
        title: 'Laporan Kehadiran',
        path: '/reports/attendances',
        permissions: ['attendance:read_all'],
        roles: ['super_admin', 'hr_admin'],
        requireAllRoles: false,
      },
    ],
  },
  {
    title: 'Manajemen Organisasi',
    path: '/organization',
    icon: Building,
    permissions: ['org_units:read'],
    roles: ['super_admin', 'hr_admin'],
    requireAllRoles: false,
    subMenus: [
      {
        title: 'Daftar Unit Organisasi',
        path: '/organization/list',
        permissions: ['org_units:read'],
        roles: ['super_admin', 'hr_admin'],
        requireAllRoles: false,
      },
      {
        title: 'Unit Terhapus',
        path: '/organization/archived',
        permissions: ['org_units:write'],
        roles: ['super_admin'],
        requireAllRoles: true,
      },
      {
        title: 'Hari Libur',
        path: '/holidays',
        permissions: ['holiday:read'],
        roles: ['super_admin'],
        requireAllRoles: true,
      },
    ],
  },
  {
    title: 'Manajemen Karyawan',
    path: '/employees',
    icon: Users,
    permissions: ['employees:read'],
    roles: ['super_admin', 'hr_admin'],
    requireAllRoles: false,
    subMenus: [
      {
        title: 'Daftar Karyawan',
        path: '/employees/list',
        permissions: ['employees:read'],
        roles: ['super_admin', 'hr_admin'],
        requireAllRoles: false,
      },
      {
        title: 'Karyawan Terhapus',
        path: '/employees/archived',
        permissions: ['employees:delete'],
        roles: ['super_admin'],
        requireAllRoles: true,
      },
    ],
  },
];