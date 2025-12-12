import React from 'react';
import { Building2, User, Users, FolderTree, Calendar, Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import type { OrgUnit } from '@/services/org_units/types';

interface OrgUnitDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgUnit: OrgUnit | null;
}

export const OrgUnitDetailDialog: React.FC<OrgUnitDetailDialogProps> = ({
  open,
  onOpenChange,
  orgUnit,
}) => {
  if (!orgUnit) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="flex max-h-[90vh] w-[95%] flex-col sm:max-w-5xl"
        style={{ maxWidth: '80rem' }}
      >
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Detail Organization Unit</DialogTitle>
          <DialogDescription>
            Informasi lengkap organization unit {orgUnit.name}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          <div className="space-y-6 py-4">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Informasi Unit
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Nama Unit</div>
                      <div className="text-sm font-medium">{orgUnit.name}</div>
                    </div>

                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Kode Unit</div>
                      <div className="text-sm font-medium">{orgUnit.code}</div>
                    </div>

                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Tipe</div>
                      <div className="text-sm font-medium">{orgUnit.type}</div>
                    </div>

                    <div>
                      <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                        <FolderTree className="h-3 w-3" />
                        Level
                      </div>
                      <div className="text-sm font-medium">Level {orgUnit.level}</div>
                    </div>

                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Status</div>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          orgUnit.is_active
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {orgUnit.is_active ? 'Aktif' : 'Tidak Aktif'}
                      </span>
                    </div>

                    {orgUnit.description && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                          <Info className="h-3 w-3" />
                          Deskripsi
                        </div>
                        <div className="text-sm">{orgUnit.description}</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Informasi Organisasi
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    {orgUnit.parent && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          Unit Induk
                        </div>
                        <div className="text-sm font-medium">{orgUnit.parent.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {orgUnit.parent.code} • {orgUnit.parent.type}
                        </div>
                      </div>
                    )}

                    {orgUnit.head && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                          <User className="h-3 w-3" />
                          Kepala Unit
                        </div>
                        <div className="text-sm font-medium">{orgUnit.head.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {orgUnit.head.employee_number}
                          {orgUnit.head.position && ` • ${orgUnit.head.position}`}
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        Jumlah Employee
                      </div>
                      <div className="text-sm font-medium">
                        {orgUnit.employee_count} employee langsung
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {orgUnit.total_employee_count} total (termasuk sub-unit)
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Hierarki Path</div>
                      <div className="text-sm font-mono bg-muted/30 p-2 rounded">
                        {orgUnit.path}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {orgUnit.org_unit_metadata && Object.keys(orgUnit.org_unit_metadata).length > 0 && (
              <>
                <Separator />
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Metadata Tambahan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {Object.entries(orgUnit.org_unit_metadata).map(([key, value]) => (
                        <div key={key}>
                          <div className="text-xs text-muted-foreground mb-1 capitalize">
                            {key.replace(/_/g, ' ')}
                          </div>
                          <div className="text-sm">{value}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                <div>
                  <div>Dibuat pada</div>
                  <div className="font-medium text-foreground">
                    {new Date(orgUnit.created_at).toLocaleString('id-ID')}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                <div>
                  <div>Diupdate pada</div>
                  <div className="font-medium text-foreground">
                    {new Date(orgUnit.updated_at).toLocaleString('id-ID')}
                  </div>
                </div>
              </div>
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

export default OrgUnitDetailDialog;
