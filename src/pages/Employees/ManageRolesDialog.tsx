// @ts-nocheck
import React from 'react';
import { Employee } from '@/services/employees/types/response';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ManageRolesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee;
  userId?: string;
}

export function ManageRolesDialog({ open, onOpenChange, employee, userId }: ManageRolesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Roles for {employee.name}</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          Feature currently unavailable during migration.
        </div>
      </DialogContent>
    </Dialog>
  );
}
