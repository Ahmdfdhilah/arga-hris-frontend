import React, { useState, useMemo } from 'react';
import { Shield, Plus, Trash2 } from 'lucide-react';
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
import { Spinner } from '@/components/common';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAllRoles, useUserRolesPermissions, useAssignRole, useRemoveRole } from '@/hooks/tanstackHooks/useUsers';
import type { EmployeeWithAccount } from '@/services/employees/types';

interface ManageRolesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: EmployeeWithAccount | null;
}


export const ManageRolesDialog: React.FC<ManageRolesDialogProps> = ({
  open,
  onOpenChange,
  employee: employeeWithAccount,
}) => {
  const [selectedRole, setSelectedRole] = useState<string>('');

  // Fetch all available roles
  const { data: allRolesData, isLoading: isLoadingAllRoles } = useAllRoles();

  // Fetch user's current roles and permissions
  const userId = employeeWithAccount?.user?.id || null;
  const { data: userRolesData, isLoading: isLoadingUserRoles } = useUserRolesPermissions(userId);

  // Mutations
  const assignRoleMutation = useAssignRole();
  const removeRoleMutation = useRemoveRole();

  const availableRoles = useMemo(() => {
    if (!allRolesData?.data || !userRolesData?.data) return [];

    const currentRoles = userRolesData.data.roles || [];
    // Exclude super_admin role from available roles
    return allRolesData.data.filter(role =>
      !currentRoles.includes(role.name) && role.name !== 'super_admin'
    );
  }, [allRolesData, userRolesData]);

  const handleAssignRole = () => {
    if (!selectedRole || !userId) return;

    assignRoleMutation.mutate(
      {
        userId: userId,
        data: { role_name: selectedRole },
      },
      {
        onSuccess: () => {
          setSelectedRole('');
        },
      }
    );
  };

  const handleRemoveRole = (roleName: string) => {
    if (!userId) return;

    removeRoleMutation.mutate({
      userId: userId,
      data: { role_name: roleName },
    });
  };

  const isLoading = isLoadingAllRoles || isLoadingUserRoles;
  const isProcessing = assignRoleMutation.isPending || removeRoleMutation.isPending;

  if (!employeeWithAccount) return null;

  const { employee } = employeeWithAccount;
  const displayName = employee?.name || 'Unknown';
  const displayEmail = employee?.email || '-';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[90vh] w-[95%] flex-col sm:max-w-5xl"
        style={{ maxWidth: '80rem' }}
      >
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Kelola Peran Pengguna
          </DialogTitle>
          <DialogDescription>
            Kelola peran untuk {displayName} ({displayEmail})
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          <div className="space-y-6 py-4">
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <Spinner className="h-8 w-8" />
              </div>
            )}

            {!isLoading && (
              <>
                {/* Current Roles Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Peran Saat Ini</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {userRolesData?.data?.roles && userRolesData.data.roles.length > 0 ? (
                      <div className="space-y-2">
                        {userRolesData.data.roles.map((roleName) => {
                          const roleInfo = allRolesData?.data?.find(r => r.name === roleName);
                          const isSuperAdmin = roleName === 'super_admin';
                          return (
                            <div
                              key={roleName}
                              className="flex items-center justify-between rounded-lg border p-3"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-primary/10 text-primary">
                                    {roleName}
                                  </span>
                                  {roleInfo?.is_system && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-muted text-muted-foreground border">
                                      Peran Sistem
                                    </span>
                                  )}
                                  {isSuperAdmin && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                                      Tidak dapat dihapus
                                    </span>
                                  )}
                                </div>
                                {roleInfo?.description && (
                                  <p className="text-sm text-muted-foreground">
                                    {roleInfo.description}
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">
                                  Kode: {roleName}
                                </p>
                              </div>
                              {!isSuperAdmin && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveRole(roleName)}
                                  disabled={isProcessing}
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  title="Hapus peran"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-sm text-muted-foreground">
                        Belum ada peran yang diberikan kepada pengguna ini
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Separator />

                {/* Add New Role Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Tambah Peran Baru</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {availableRoles.length > 0 ? (
                      <>
                        <div className="flex gap-2">
                          <Select
                            value={selectedRole}
                            onValueChange={setSelectedRole}
                            disabled={isProcessing}
                          >
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Pilih peran yang akan ditambahkan..." />
                            </SelectTrigger>
                            <SelectContent>
                              {availableRoles.map((role) => (
                                <SelectItem key={role.id} value={role.name}>
                                  <div className="flex flex-col py-1">
                                    <span className="font-medium">
                                      {role.name}
                                    </span>
                                    {role.is_system && (
                                      <span className="text-xs text-muted-foreground">
                                        (Peran Sistem)
                                      </span>
                                    )}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            onClick={handleAssignRole}
                            disabled={!selectedRole || isProcessing}
                            size="default"
                          >
                            {isProcessing ? (
                              <Spinner className="h-4 w-4 mr-2" />
                            ) : (
                              <Plus className="h-4 w-4 mr-2" />
                            )}
                            Tambah Peran
                          </Button>
                        </div>
                        {selectedRole && (
                          <div className="rounded-lg bg-muted/50 p-3 border">
                            <p className="text-sm font-medium mb-1">Deskripsi Peran:</p>
                            <p className="text-sm text-foreground mb-2">
                              {availableRoles.find(r => r.name === selectedRole)?.description ||
                                'Tidak ada deskripsi tersedia'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Kode peran: {selectedRole}
                            </p>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-8 text-sm text-muted-foreground">
                        Semua peran yang tersedia sudah diberikan kepada pengguna ini
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Separator />

                {/* Permissions Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Izin yang Diberikan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {userRolesData?.data?.permissions && userRolesData.data.permissions.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground mb-3">
                          Total {userRolesData.data.permissions.length} izin aktif dari peran yang dimiliki
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {userRolesData.data.permissions.map((permission) => (
                            <span
                              key={permission}
                              className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-secondary text-secondary-foreground border"
                              title={permission}
                            >
                              {permission}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-sm text-muted-foreground">
                        Tidak ada izin yang diberikan. Tambahkan peran untuk memberikan izin akses.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
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

export default ManageRolesDialog;
