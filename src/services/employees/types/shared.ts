export enum EmployeeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export const EMPLOYEE_STATUS_OPTIONS = [
  { value: true, label: 'Aktif' },
  { value: false, label: 'Tidak Aktif' },
];

export enum EmployeeType {
  ON_SITE = 'on_site',
  HYBRID = 'hybrid',
  HO = 'ho',
}

export const EMPLOYEE_TYPE_OPTIONS = [
  { value: 'on_site', label: 'On Site' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'ho', label: 'Head Office' },
];

export enum EmployeeGender {
  MALE = 'male',
  FEMALE = 'female',
}

export const EMPLOYEE_GENDER_OPTIONS = [
  { value: 'male', label: 'Laki-laki' },
  { value: 'female', label: 'Perempuan' },
];

export enum AccountType {
  USER = 'user',
  GUEST = 'guest',
  NONE = 'none',
}

export const ACCOUNT_TYPE_OPTIONS = [
  { value: 'user', label: 'Regular User' },
  { value: 'guest', label: 'Guest' },
  { value: 'none', label: 'Tanpa Akun' },
];
