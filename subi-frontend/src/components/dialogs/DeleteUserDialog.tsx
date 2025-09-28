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

interface DeleteUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  user: UserResponseDto | undefined;
  isLoading?: boolean;
}

export const DeleteUserDialog: React.FC<DeleteUserDialogProps> = ({
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
          <DialogTitle>{t('userManagement.confirmDeleteTitle')}</DialogTitle>
          <DialogDescription>
            {t('userManagement.messages.confirmDelete', {
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
            {isLoading ? t('common.deleting') : t('common.delete')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};