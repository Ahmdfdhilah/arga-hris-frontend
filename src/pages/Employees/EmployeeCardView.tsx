import { MoreHorizontal, Mail, Building2, User, UserCog, Ban, CheckCircle, Trash2, Shield } from 'lucide-react';
import { Employee } from '@/services/employees/types/response';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface EmployeeCardViewProps {
  employees: Employee[];
  isLoading: boolean;
  onView: (employee: Employee) => void;
  onEdit: (employee: Employee) => void;
  onDeactivate: (employee: Employee) => void;
  onActivate: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
  onManageRoles?: (employee: Employee) => void;
}

export function EmployeeCardView({
  employees,
  isLoading,
  onView,
  onEdit,
  onDeactivate,
  onActivate,
  onDelete,
  onManageRoles,
}: EmployeeCardViewProps) {

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-muted" />
              <div className="space-y-2">
                <div className="h-4 w-32 bg-muted rounded" />
                <div className="h-3 w-24 bg-muted rounded" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 w-full bg-muted rounded" />
                <div className="h-3 w-full bg-muted rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.map((employee) => (
          <Card key={employee.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="flex flex-row items-center gap-3">
                <Avatar>
                  <AvatarImage src={''} alt={employee.name} />
                  <AvatarFallback>
                    {employee.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <CardTitle className="text-base font-medium">
                    {employee.name}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {employee.code}
                  </CardDescription>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => onView(employee)}>
                    <User className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(employee)}>
                    <UserCog className="mr-2 h-4 w-4" />
                    Edit Employee
                  </DropdownMenuItem>
                  {onManageRoles && (
                    <DropdownMenuItem onClick={() => onManageRoles(employee)}>
                      <Shield className="mr-2 h-4 w-4" />
                      Kelola Hak Akses
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  {employee.is_active ? (
                    <DropdownMenuItem
                      onClick={() => onDeactivate(employee)}
                      className="text-yellow-600 focus:text-yellow-600"
                    >
                      <Ban className="mr-2 h-4 w-4" />
                      Deactivate
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      onClick={() => onActivate(employee)}
                      className="text-green-600 focus:text-green-600"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Activate
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => onDelete(employee)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 text-sm mt-2">
                <div className="flex items-center text-muted-foreground break-all">
                  <Mail className="mr-2 h-4 w-4 flex-shrink-0" />
                  {employee.email}
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Building2 className="mr-2 h-4 w-4 flex-shrink-0" />
                  {employee.org_unit?.name || 'No Org Unit'}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">{employee.type}</Badge>
                  {employee.site && <Badge variant="secondary" className="capitalize">{employee.site.replace('_', ' ')}</Badge>}
                  <Badge
                    variant={employee.is_active ? 'default' : 'secondary'}
                    className={cn(
                      employee.is_active
                        ? 'bg-green-100 text-green-800 hover:bg-green-100'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
                    )}
                  >
                    {employee.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
