import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import type { UserResponseDto } from '@/types/user';

interface SuspendUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  user: UserResponseDto | undefined;
  isLoading?: boolean;
}

export const SuspendUserDialog: React.FC<SuspendUserDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  user,
  isLoading = false,
}) => {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('userManagement.confirmSuspendTitle')}</DialogTitle>
          <DialogDescription>
            {t('userManagement.messages.confirmSuspend', {
              item: user
                ? `"${user.firstName} ${user.lastName}"`
                : t('userManagement.user').toLowerCase(),
            })}
          </DialogDescription>
        </DialogHeader>
        <div className='flex justify-end space-x-2'>
          <Button variant='outline' onClick={onClose} disabled={isLoading}>
            {t('common.cancel')}
          </Button>
          <Button
            variant='destructive'
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading
              ? t('userManagement.suspending')
              : t('userManagement.actions.suspend')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};