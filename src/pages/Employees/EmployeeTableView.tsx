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
} from '@/components/common';
import { Mail, MoreVertical, Edit, UserX, UserCheck, Building2, Eye, Shield, Briefcase, Trash2 } from 'lucide-react';
import type { Employee } from '@/services/employees/types';
import { getEmployeeTypeLabel } from '@/services/employees/utils';

interface EmployeeTableViewProps {
  employees: Employee[];
  onView?: (employee: Employee) => void;
  onEdit: (employee: Employee) => void;
  onDeactivate: (employee: Employee) => void;
  onActivate: (employee: Employee) => void;
  onDelete?: (employee: Employee) => void;
  onManageRoles?: (employee: Employee) => void;
}

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
            <TableHead>Nama</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Unit Organisasi</TableHead>
            <TableHead>Tipe Karyawan</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="w-[70px]">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => {
            const displayName = employee.name || 'Unknown';
            const displayEmail = employee.email || '-';
            const isActive = employee.is_active;

            return (
              <TableRow key={employee.id}>
                <TableCell className="font-medium">
                  {displayName}
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    <span>{displayEmail}</span>
                  </div>
                </TableCell>

                <TableCell>
                  {employee.org_unit && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building2 className="h-3.5 w-3.5" />
                      <span>{employee.org_unit.name}</span>
                    </div>
                  )}
                </TableCell>

                <TableCell>
                  {employee && (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Briefcase className="h-3.5 w-3.5" />
                        <span>{getEmployeeTypeLabel(employee.type)}</span>
                      </div>
                      {employee.site && (
                        <span className="text-xs text-muted-foreground ml-5 capitalize">
                          {employee.site.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                  )}
                </TableCell>

                <TableCell className="text-center">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${isActive
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
                        <DropdownMenuItem onClick={() => onView(employee)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Lihat Detail
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => onEdit(employee)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      {onManageRoles && (
                        <DropdownMenuItem onClick={() => onManageRoles(employee)}>
                          <Shield className="mr-2 h-4 w-4" />
                          Kelola Hak Akses
                        </DropdownMenuItem>
                      )}
                      {isActive ? (
                        <DropdownMenuItem
                          onClick={() => onDeactivate(employee)}
                          className="text-orange-600 focus:text-orange-600"
                        >
                          <UserX className="mr-2 h-4 w-4" />
                          Nonaktifkan
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => onActivate(employee)}
                          className="text-primary focus:text-primary"
                        >
                          <UserCheck className="mr-2 h-4 w-4" />
                          Aktifkan
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <DropdownMenuItem
                          onClick={() => onDelete(employee)}
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
