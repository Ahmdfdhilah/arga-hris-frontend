import { useState, useEffect } from 'react';
import { Check, Shield } from 'lucide-react';
import { Employee } from '@/services/employees/types/response';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/common';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Spinner } from '@/components/common';
import {
  useAllRoles,
  useUserRolesPermissions,
  useAssignRole,
  useRemoveRole,
} from '@/hooks/tanstackHooks/useUsers';
import { Role } from '@/services/users/types';

interface ManageRolesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
}

export function ManageRolesDialog({ open, onOpenChange, employee }: ManageRolesDialogProps) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  // Get all available roles
  const { data: allRolesData, isLoading: isLoadingRoles } = useAllRoles();

  // Get user's current roles (using user.id from employee)
  const userId = employee?.user?.id ?? null;
  const { data: userRolesData, isLoading: isLoadingUserRoles } = useUserRolesPermissions(userId);

  // Mutations
  const assignRoleMutation = useAssignRole();
  const removeRoleMutation = useRemoveRole();

  const isProcessing = assignRoleMutation.isPending || removeRoleMutation.isPending;

  // Initialize selected roles when data loads
  useEffect(() => {
    if (userRolesData?.data?.roles) {
      // roles is already string[]
      setSelectedRoles(userRolesData.data.roles);
    }
  }, [userRolesData]);

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedRoles([]);
    }
  }, [open]);

  const handleRoleToggle = (roleName: string) => {
    if (!userId) return;

    const hasRole = selectedRoles.includes(roleName);

    if (hasRole) {
      // Remove role
      removeRoleMutation.mutate(
        { userId, data: { role_name: roleName } },
        {
          onSuccess: () => {
            setSelectedRoles((prev) => prev.filter((r) => r !== roleName));
          },
        }
      );
    } else {
      // Add role
      assignRoleMutation.mutate(
        { userId, data: { role_name: roleName } },
        {
          onSuccess: () => {
            setSelectedRoles((prev) => [...prev, roleName]);
          },
        }
      );
    }
  };

  const allRoles: Role[] = allRolesData?.data || [];
  const isLoading = isLoadingRoles || isLoadingUserRoles;

  // Role display helpers
  const getRoleBadgeVariant = (roleName: string) => {
    switch (roleName) {
      case 'super_admin':
        return 'destructive';
      case 'hr_admin':
        return 'default';
      case 'org_unit_head':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getRoleDisplayName = (roleName: string) => {
    const nameMap: Record<string, string> = {
      super_admin: 'Super Admin',
      hr_admin: 'HR Admin',
      org_unit_head: 'Kepala Unit',
      employee: 'Karyawan',
    };
    return nameMap[roleName] || roleName;
  };

  if (!employee) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Kelola Role - {employee.name}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {/* Current roles */}
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">Role saat ini:</p>
            <div className="flex flex-wrap gap-2">
              {selectedRoles.length > 0 ? (
                selectedRoles.map((roleName) => (
                  <Badge key={roleName} variant={getRoleBadgeVariant(roleName)}>
                    {getRoleDisplayName(roleName)}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground italic">Tidak ada role</span>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t my-4" />

          {/* Role selection */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Pilih Role:</p>
            {isLoading ? (
              <div className="flex justify-center py-4">
                <Spinner />
              </div>
            ) : (
              <div className="space-y-2">
                {allRoles.map((role) => {
                  const isSelected = selectedRoles.includes(role.name);
                  const isSystemRole = role.is_system;

                  return (
                    <label
                      key={role.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${isSelected
                        ? 'bg-primary/5 border-primary'
                        : 'bg-background hover:bg-muted/50'
                        } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleRoleToggle(role.name)}
                        disabled={isProcessing}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {getRoleDisplayName(role.name)}
                          </span>
                          {isSystemRole && (
                            <Badge variant="outline" className="text-xs">
                              Sistem
                            </Badge>
                          )}
                        </div>
                        {role.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {role.description}
                          </p>
                        )}
                      </div>
                      {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
