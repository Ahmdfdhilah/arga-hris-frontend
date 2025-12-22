export type AssignmentStatus = 'pending' | 'active' | 'expired' | 'cancelled';

export const ASSIGNMENT_STATUS_OPTIONS = [
    { value: 'pending', label: 'Menunggu' },
    { value: 'active', label: 'Aktif' },
    { value: 'expired', label: 'Selesai' },
    { value: 'cancelled', label: 'Dibatalkan' },
] as const;

export const getAssignmentStatusLabel = (status: AssignmentStatus): string => {
    const option = ASSIGNMENT_STATUS_OPTIONS.find((opt) => opt.value === status);
    return option?.label || status;
};

export const getAssignmentStatusColor = (status: AssignmentStatus): string => {
    switch (status) {
        case 'pending':
            return 'bg-yellow-100 text-yellow-800';
        case 'active':
            return 'bg-primary/10 text-primary';
        case 'expired':
            return 'bg-muted text-muted-foreground';
        case 'cancelled':
            return 'bg-destructive/10 text-destructive';
        default:
            return 'bg-muted text-muted-foreground';
    }
};
