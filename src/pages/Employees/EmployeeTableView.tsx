import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Button,
  Avatar,
  AvatarFallback,
  Badge,
} from '@/components/common';
import { Mail, MoreVertical, Edit, UserX, UserCheck, Building2, Eye, Shield, Users, Briefcase, Trash2 } from 'lucide-react';
import type { EmployeeWithAccount } from '@/services/employees/types';
import { EMPLOYEE_TYPE_OPTIONS } from '@/services/employees/types/shared';

interface EmployeeTableViewProps {
  employees: EmployeeWithAccount[];
  onView?: (employeeWithAccount: EmployeeWithAccount) => void;
  onEdit: (employeeWithAccount: EmployeeWithAccount) => void;
  onDeactivate: (employeeWithAccount: EmployeeWithAccount) => void;
  onActivate: (employeeWithAccount: EmployeeWithAccount) => void;
  onDelete?: (employeeWithAccount: EmployeeWithAccount) => void;
  onManageRoles?: (employeeWithAccount: EmployeeWithAccount) => void;
}

const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName[0]}${lastName[0]}`.toUpperCase();
};

const getEmployeeTypeLabel = (employeeType: string | null | undefined): string => {
  if (!employeeType) return '-';
  const option = EMPLOYEE_TYPE_OPTIONS.find(opt => opt.value === employeeType);
  return option?.label || employeeType;
};

const EmployeeTableView: React.FC<EmployeeTableViewProps> = ({
  employees,
  onView,
  onEdit,
  onDeactivate,
  onActivate,
  onDelete,
  onManageRoles,
}) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead>Nomor Karyawan</TableHead>
            <TableHead>Nama</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Unit Organisasi</TableHead>
            <TableHead>Tipe Karyawan</TableHead>
            <TableHead className="text-center">Tipe Akun</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employeeWithAccount) => {
            const { employee, user } = employeeWithAccount;
            const displayName = employee?.name || `${user.first_name} ${user.last_name}`;
            const isActive = user.is_active && (employee?.is_active ?? true);

            return (
              <TableRow key={user.id}>
                <TableCell>
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(user.first_name, user.last_name)}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>

                <TableCell className="font-medium">
                  {employee?.employee_number || '-'}
                </TableCell>

                <TableCell className="font-medium">
                  {displayName}
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    <span>{user.email}</span>
                  </div>
                </TableCell>

                <TableCell>
                  {employee?.org_unit && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building2 className="h-3.5 w-3.5" />
                      <span>{employee.org_unit.name}</span>
                    </div>
                  )}
                </TableCell>

                <TableCell>
                  {employee && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Briefcase className="h-3.5 w-3.5" />
                      <span>{getEmployeeTypeLabel(employee.employee_type)}</span>
                    </div>
                  )}
                </TableCell>

                <TableCell className="text-center">
                  <Badge variant={user.account_type === 'guest' ? 'secondary' : 'default'} className="text-xs">
                    {user.account_type === 'guest' ? (
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>Guest</span>
                      </div>
                    ) : (
                      'Regular'
                    )}
                  </Badge>
                </TableCell>

                <TableCell className="text-center">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {isActive ? 'Aktif' : 'Tidak Aktif'}
                  </span>
                </TableCell>

                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onView && (
                        <DropdownMenuItem onClick={() => onView(employeeWithAccount)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Lihat Detail
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => onEdit(employeeWithAccount)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      {onManageRoles && (
                        <DropdownMenuItem onClick={() => onManageRoles(employeeWithAccount)}>
                          <Shield className="mr-2 h-4 w-4" />
                          Kelola Hak Akses
                        </DropdownMenuItem>
                      )}
                      {isActive ? (
                        <DropdownMenuItem
                          onClick={() => onDeactivate(employeeWithAccount)}
                          className="text-orange-600 focus:text-orange-600"
                        >
                          <UserX className="mr-2 h-4 w-4" />
                          Nonaktifkan
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => onActivate(employeeWithAccount)}
                          className="text-primary focus:text-primary"
                        >
                          <UserCheck className="mr-2 h-4 w-4" />
                          Aktifkan
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <DropdownMenuItem
                          onClick={() => onDelete(employeeWithAccount)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Hapus
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default EmployeeTableView;
