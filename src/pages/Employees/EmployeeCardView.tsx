import {
  Item,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
  ItemFooter,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Button,
  Avatar,
  AvatarFallback,
  Badge,
} from '@/components/common';
import { Mail, MoreVertical, Edit, UserX, UserCheck, Building2, Briefcase, Eye, Shield, Users, UserCog, Trash2 } from 'lucide-react';
import type { EmployeeWithAccount } from '@/services/employees/types';
import { EMPLOYEE_TYPE_OPTIONS } from '@/services/employees/types/shared';

interface EmployeeCardViewProps {
  employee: EmployeeWithAccount;
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

const EmployeeCardView: React.FC<EmployeeCardViewProps> = ({
  employee: employeeWithAccount,
  onView,
  onEdit,
  onDeactivate,
  onActivate,
  onDelete,
  onManageRoles,
}) => {
  const { employee, user } = employeeWithAccount;
  const displayName = employee?.name || `${user.first_name} ${user.last_name}`;
  const isActive = user.is_active && (employee?.is_active ?? true);

  return (
    <Item variant="outline" className="mt-3">
      <ItemMedia className="hidden sm:flex shrink-0">
        <Avatar>
          <AvatarFallback className="bg-primary/10 text-primary">
            {getInitials(user.first_name, user.last_name)}
          </AvatarFallback>
        </Avatar>
      </ItemMedia>

      <ItemContent className="gap-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <ItemTitle className="truncate">{displayName}</ItemTitle>
          <span
            className={`h-2 w-2 rounded-full shrink-0 ${
              isActive ? 'bg-primary' : 'bg-muted-foreground/50'
            }`}
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="text-xs text-muted-foreground">
            {employee?.employee_number || '-'}
          </div>
          <Badge variant={user.account_type === 'guest' ? 'secondary' : 'default'} className="text-xs shrink-0">
            {user.account_type === 'guest' ? (
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>Guest</span>
              </div>
            ) : (
              'Regular'
            )}
          </Badge>
        </div>

        <ItemDescription className="space-y-0.5">
          <div className="flex items-start gap-2 text-sm">
            <Mail className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span className="break-words flex-1 min-w-0">{user.email}</span>
          </div>
          {employee?.position && (
            <div className="flex items-start gap-2 text-sm">
              <Briefcase className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span className="break-words flex-1 min-w-0">{employee.position}</span>
            </div>
          )}
          {employee?.employee_type && (
            <div className="flex items-start gap-2 text-sm">
              <UserCog className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span className="break-words flex-1 min-w-0">{getEmployeeTypeLabel(employee.employee_type)}</span>
            </div>
          )}
          {employee?.org_unit && (
            <div className="flex items-start gap-2 text-sm">
              <Building2 className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span className="truncate flex-1 min-w-0">{employee.org_unit.name}</span>
            </div>
          )}
        </ItemDescription>

        <ItemFooter>
          <div className="text-xs text-muted-foreground">
            Status:{' '}
            <span className={isActive ? 'text-primary' : 'text-muted-foreground'}>
              {isActive ? 'Aktif' : 'Tidak Aktif'}
            </span>
          </div>
        </ItemFooter>
      </ItemContent>

      <ItemActions>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
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
                className="text-destructive focus:text-destructive"
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
      </ItemActions>
    </Item>
  );
};

export default EmployeeCardView;
