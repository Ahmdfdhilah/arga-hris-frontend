import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { AlertTriangle, CheckCircle, XCircle, Trash2, AlertCircle } from 'lucide-react';
import React from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isProcessing: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'success' | 'info';
  icon?: React.ReactNode;
}

const getVariantStyles = (variant: string) => {
  switch (variant) {
    case 'danger':
      return {
        iconColor: 'text-destructive',
        buttonClass: 'bg-destructive hover:bg-destructive/90 focus:ring-destructive',
        bannerColor: 'border-destructive/20 bg-destructive/10',
        bannerTextColor: 'text-destructive',
        bannerIconColor: 'text-destructive',
        defaultIcon: <Trash2 className="h-5 w-5" />,
      };
    case 'warning':
      return {
        iconColor: 'text-yellow-600 dark:text-yellow-500',
        buttonClass: 'bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600 focus:ring-yellow-600',
        bannerColor: 'border-yellow-600/20 bg-yellow-600/10 dark:border-yellow-500/20 dark:bg-yellow-500/10',
        bannerTextColor: 'text-yellow-700 dark:text-yellow-400',
        bannerIconColor: 'text-yellow-600 dark:text-yellow-500',
        defaultIcon: <AlertTriangle className="h-5 w-5" />,
      };
    case 'success':
      return {
        iconColor: 'text-green-600 dark:text-green-500',
        buttonClass: 'bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 focus:ring-green-600',
        bannerColor: 'border-green-600/20 bg-green-600/10 dark:border-green-500/20 dark:bg-green-500/10',
        bannerTextColor: 'text-green-700 dark:text-green-400',
        bannerIconColor: 'text-green-600 dark:text-green-500',
        defaultIcon: <CheckCircle className="h-5 w-5" />,
      };
    case 'info':
    default:
      return {
        iconColor: 'text-blue-600 dark:text-blue-500',
        buttonClass: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:ring-blue-600',
        bannerColor: 'border-blue-600/20 bg-blue-600/10 dark:border-blue-500/20 dark:bg-blue-500/10',
        bannerTextColor: 'text-blue-700 dark:text-blue-400',
        bannerIconColor: 'text-blue-600 dark:text-blue-500',
        defaultIcon: <AlertCircle className="h-5 w-5" />,
      };
  }
};

export const ConfirmDialog = React.memo(
  ({
    isOpen,
    onClose,
    onConfirm,
    isProcessing,
    title,
    description,
    confirmText = 'Konfirmasi',
    cancelText = 'Batal',
    variant = 'danger',
    icon,
  }: ConfirmDialogProps) => {
    const variantStyles = getVariantStyles(variant);
    const displayIcon = icon || variantStyles.defaultIcon;

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="flex max-h-[85vh] w-[95%] max-w-md flex-col rounded-lg lg:max-w-lg">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="mt-4 flex items-center gap-2 lg:mt-0">
              <span className={variantStyles.iconColor}>{displayIcon}</span>
              {title}
            </DialogTitle>
            <DialogDescription className="text-left py-4 text-foreground">
              {description}
            </DialogDescription>
          </DialogHeader>

          {
            (variant === 'danger' || variant === 'warning') && (
              <div className="flex-1 overflow-y-auto pr-2">
                <div>
                  {variant === 'danger' && (
                    <div className={`rounded-lg border p-4 ${variantStyles.bannerColor}`}>
                      <div className="flex items-center">
                        <XCircle className={`mr-2 h-5 w-5 ${variantStyles.bannerIconColor}`} />
                        <p className={`text-sm font-medium ${variantStyles.bannerTextColor}`}>
                          Tindakan ini tidak dapat dibatalkan.
                        </p>
                      </div>
                    </div>
                  )}

                  {variant === 'warning' && (
                    <div className={`rounded-lg border p-4 ${variantStyles.bannerColor}`}>
                      <div className="flex items-center">
                        <AlertTriangle className={`mr-2 h-5 w-5 ${variantStyles.bannerIconColor}`} />
                        <p className={`text-sm font-medium ${variantStyles.bannerTextColor}`}>
                          Harap tinjau tindakan ini dengan hati-hati.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          }

          <DialogFooter className="flex-shrink-0 space-y-4">
            <div className="flex w-full flex-col gap-2 lg:flex-row">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isProcessing}
                className="w-full lg:w-auto"
              >
                {cancelText}
              </Button>
              <Button
                onClick={onConfirm}
                disabled={isProcessing}
                className={`w-full lg:w-auto ${variantStyles.buttonClass} text-primary-foreground transition-colors duration-200 focus:ring-2 focus:ring-opacity-50`}
              >
                {displayIcon &&
                  React.cloneElement(displayIcon as React.ReactElement, {})}
                {isProcessing ? 'Memproses...' : confirmText}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },
);

ConfirmDialog.displayName = 'ConfirmDialog';
