import React from 'react';
import { User, Mail, Phone, Briefcase, Building2, UserCheck, Calendar } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { EmployeeWithAccount } from '@/services/employees/types';

interface EmployeeDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: EmployeeWithAccount | null;
}

export const EmployeeDetailDialog: React.FC<EmployeeDetailDialogProps> = ({
  open,
  onOpenChange,
  employee: employeeWithAccount,
}) => {
  if (!employeeWithAccount) return null;

  const { employee, user } = employeeWithAccount;
  const displayName = employee?.name || 'Unknown';
  const displayEmail = employee?.email || '-';
  const isActive = (user?.is_active ?? true) && (employee?.is_active ?? true);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[90vh] w-[95%] flex-col sm:max-w-5xl"
        style={{ maxWidth: '80rem' }}
      >
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Detail Employee</DialogTitle>
          <DialogDescription>
            Informasi lengkap employee {displayName}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          <div className="space-y-6 py-4">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Informasi Pribadi
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Nama Lengkap</div>
                      <div className="text-sm font-medium">{displayName}</div>
                    </div>

                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Nomor Employee</div>
                      <div className="text-sm font-medium">{employee?.employee_number || '-'}</div>
                    </div>

                    <div>
                      <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        Email
                      </div>
                      <div className="text-sm">{displayEmail}</div>
                    </div>

                    {employee?.phone && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          Nomor Telepon
                        </div>
                        <div className="text-sm">{employee.phone}</div>
                      </div>
                    )}

                    <div>
                      <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                        <UserCheck className="h-3 w-3" />
                        Status
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${isActive
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted text-muted-foreground'
                          }`}
                      >
                        {isActive ? 'Aktif' : 'Tidak Aktif'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Informasi Pekerjaan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    {employee?.position && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Posisi</div>
                        <div className="text-sm font-medium">{employee.position}</div>
                      </div>
                    )}

                    {employee?.employee_type && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Tipe Employee</div>
                        <div className="text-sm font-medium capitalize">{employee.employee_type.replace('_', ' ')}</div>
                      </div>
                    )}

                    {employee?.employee_gender && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Jenis Kelamin</div>
                        <div className="text-sm font-medium capitalize">{employee.employee_gender === 'male' ? 'Laki-laki' : 'Perempuan'}</div>
                      </div>
                    )}

                    {employee?.org_unit && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          Organization Unit
                        </div>
                        <div className="text-sm font-medium">{employee.org_unit.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {employee.org_unit.code} • {employee.org_unit.type}
                        </div>
                      </div>
                    )}

                    {employee?.supervisor && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                          <User className="h-3 w-3" />
                          Atasan Langsung
                        </div>
                        <div className="text-sm font-medium">{employee.supervisor.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {employee.supervisor.employee_number}
                          {employee.supervisor.position && ` • ${employee.supervisor.position}`}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
              {employee?.created_at && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  <div>
                    <div>Employee dibuat pada</div>
                    <div className="font-medium text-foreground">
                      {new Date(employee.created_at).toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>
              )}
              {employee?.updated_at && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  <div>
                    <div>Employee diupdate pada</div>
                    <div className="font-medium text-foreground">
                      {new Date(employee.updated_at).toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeDetailDialog;
