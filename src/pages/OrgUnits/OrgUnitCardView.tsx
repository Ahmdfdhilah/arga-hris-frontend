import {
  Item,
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
} from '@/components/common';
import { MoreVertical, Edit, Trash2, Building2, User, Layers, Eye } from 'lucide-react';
import type { OrgUnit } from '@/services/org_units/types';
import { getOrgUnitTypeBadgeClassName } from '@/services/org_units/utils';

interface OrgUnitCardViewProps {
  orgUnit: OrgUnit;
  onView?: (orgUnit: OrgUnit) => void;
  onEdit?: (orgUnit: OrgUnit) => void;
  onDelete?: (orgUnit: OrgUnit) => void;
}

const OrgUnitCardView: React.FC<OrgUnitCardViewProps> = ({
  orgUnit,
  onView,
  onEdit,
  onDelete,
}) => {
  return (
    <Item variant="outline" className="mt-3">
      <ItemContent className="gap-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <ItemTitle className="truncate">{orgUnit.name}</ItemTitle>
          <span
            className={`h-2 w-2 rounded-full shrink-0 ${orgUnit.is_active ? 'bg-primary' : 'bg-muted-foreground/50'
              }`}
          />
        </div>

        <ItemDescription className="space-y-1.5">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${getOrgUnitTypeBadgeClassName(orgUnit.type)}`}>
            <Layers className="h-3 w-3" />
            {orgUnit.type}
          </span>
          {orgUnit.parent && (
            <div className="flex items-start gap-2 text-sm">
              <Building2 className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span className="break-words flex-1 min-w-0">Parent: {orgUnit.parent.name}</span>
            </div>
          )}
          {orgUnit.head && (
            <div className="flex items-start gap-2 text-sm">
              <User className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span className="break-words flex-1 min-w-0">Kepala: {orgUnit.head.name}</span>
            </div>
          )}
        </ItemDescription>

        <ItemFooter>
          <div className="text-xs text-muted-foreground">
            Status:{' '}
            <span className={orgUnit.is_active ? 'text-primary' : 'text-muted-foreground'}>
              {orgUnit.is_active ? 'Aktif' : 'Tidak Aktif'}
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
      </ItemActions>
    </Item>
  );
};

export default OrgUnitCardView;
