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
import { MoreVertical, Edit, Trash2, Building2, User, Layers, Eye } from 'lucide-react';
import type { OrgUnit } from '@/services/org_units/types';
import { getOrgUnitTypeBadgeClassName } from '@/services/org_units/utils';

interface OrgUnitTableViewProps {
  orgUnits: OrgUnit[];
  onView?: (orgUnit: OrgUnit) => void;
  onEdit?: (orgUnit: OrgUnit) => void;
  onDelete?: (orgUnit: OrgUnit) => void;
}

const OrgUnitTableView: React.FC<OrgUnitTableViewProps> = ({
  orgUnits,
  onView,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama</TableHead>
            <TableHead>Tipe</TableHead>
            <TableHead>Parent Unit</TableHead>
            <TableHead>Kepala Unit</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orgUnits.map((orgUnit) => (
            <TableRow key={orgUnit.id}>
              <TableCell className="font-medium">
                {orgUnit.name}
              </TableCell>

              <TableCell>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${getOrgUnitTypeBadgeClassName(orgUnit.type)}`}>
                  <Layers className="h-3 w-3" />
                  {orgUnit.type}
                </span>
              </TableCell>

              <TableCell>
                {orgUnit.parent ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="h-3.5 w-3.5" />
                    <span>{orgUnit.parent.name}</span>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">-</span>
                )}
              </TableCell>

              <TableCell>
                {orgUnit.head ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-3.5 w-3.5" />
                    <span>{orgUnit.head.name}</span>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">-</span>
                )}
              </TableCell>

              <TableCell className="text-center">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${orgUnit.is_active
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted text-muted-foreground'
                  }`}>
                  {orgUnit.is_active ? 'Aktif' : 'Tidak Aktif'}
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
                      <DropdownMenuItem onClick={() => onView(orgUnit)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Lihat Detail
                      </DropdownMenuItem>
                    )}
                    {onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(orgUnit)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem
                        onClick={() => onDelete(orgUnit)}
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default OrgUnitTableView;
