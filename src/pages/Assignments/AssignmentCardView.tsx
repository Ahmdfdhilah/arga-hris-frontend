import { Calendar, User, Users, Building } from 'lucide-react';
import {
    Item,
    ItemContent,
    ItemTitle,
    ItemDescription,
    ItemFooter,
} from '@/components/common';
import type { Assignment } from '@/services/assignments/types';
import { getAssignmentStatusLabel, getAssignmentStatusColor } from '@/services/assignments/types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface AssignmentCardViewProps {
    assignment: Assignment;
}

const AssignmentCardView: React.FC<AssignmentCardViewProps> = ({
    assignment,
}) => {
    const formatDate = (dateStr: string) => {
        return format(new Date(dateStr), 'd MMM yyyy', { locale: id });
    };

    return (
        <Item variant="outline" className="mt-3">
            <ItemContent className="gap-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <ItemTitle className="truncate">
                        {assignment.employee?.name || '-'}
                    </ItemTitle>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getAssignmentStatusColor(assignment.status)}`}>
                        {getAssignmentStatusLabel(assignment.status)}
                    </span>
                </div>

                <ItemDescription className="space-y-1.5">
                    <div className="flex items-start gap-2 text-sm">
                        <Users className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        <span className="break-words flex-1 min-w-0">
                            Menggantikan: {assignment.replaced_employee?.name || '-'}
                        </span>
                    </div>

                    <div className="flex items-start gap-2 text-sm">
                        <User className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        <span className="break-words flex-1 min-w-0">
                            {assignment.employee?.position || '-'}
                        </span>
                    </div>

                    <div className="flex items-start gap-2 text-sm">
                        <Calendar className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        <span className="break-words flex-1 min-w-0">
                            {formatDate(assignment.start_date)} - {formatDate(assignment.end_date)}
                        </span>
                    </div>

                    {assignment.org_unit && (
                        <div className="flex items-start gap-2 text-sm">
                            <Building className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                            <span className="break-words flex-1 min-w-0">
                                {assignment.org_unit.name}
                            </span>
                        </div>
                    )}
                </ItemDescription>

                {assignment.reason && (
                    <ItemFooter>
                        <div className="text-xs text-muted-foreground line-clamp-2">
                            {assignment.reason}
                        </div>
                    </ItemFooter>
                )}
            </ItemContent>
        </Item>
    );
};

export default AssignmentCardView;
