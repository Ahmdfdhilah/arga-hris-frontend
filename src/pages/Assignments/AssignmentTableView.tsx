import { Calendar, Building } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/common';
import type { Assignment } from '@/services/assignments/types';
import { getAssignmentStatusLabel, getAssignmentStatusColor } from '@/services/assignments/types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface AssignmentTableViewProps {
    assignments: Assignment[];
}

const AssignmentTableView: React.FC<AssignmentTableViewProps> = ({
    assignments,
}) => {
    const formatDate = (dateStr: string) => {
        return format(new Date(dateStr), 'd MMM yyyy', { locale: id });
    };

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Pengganti</TableHead>
                        <TableHead>Menggantikan</TableHead>
                        <TableHead>Unit Organisasi</TableHead>
                        <TableHead>Periode</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead>Alasan</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {assignments.map((assignment) => (
                        <TableRow key={assignment.id}>
                            <TableCell>
                                <div className="space-y-1">
                                    <p className="font-medium">{assignment.employee?.name || '-'}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {assignment.employee?.number || ''}
                                    </p>
                                </div>
                            </TableCell>

                            <TableCell>
                                <div className="space-y-1">
                                    <p className="font-medium">{assignment.replaced_employee?.name || '-'}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {assignment.replaced_employee?.number || ''}
                                    </p>
                                </div>
                            </TableCell>

                            <TableCell>
                                {assignment.org_unit ? (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Building className="h-3.5 w-3.5 text-muted-foreground" />
                                        <span>{assignment.org_unit.name}</span>
                                    </div>
                                ) : (
                                    <span className="text-muted-foreground">-</span>
                                )}
                            </TableCell>

                            <TableCell>
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span>
                                        {formatDate(assignment.start_date)} - {formatDate(assignment.end_date)}
                                    </span>
                                </div>
                            </TableCell>

                            <TableCell className="text-center">
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getAssignmentStatusColor(assignment.status)}`}>
                                    {getAssignmentStatusLabel(assignment.status)}
                                </span>
                            </TableCell>

                            <TableCell>
                                <p className="line-clamp-2 text-sm text-muted-foreground">
                                    {assignment.reason || '-'}
                                </p>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default AssignmentTableView;
