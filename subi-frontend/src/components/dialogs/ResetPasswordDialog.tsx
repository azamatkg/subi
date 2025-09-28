import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface ResetPasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  newPassword: string;
  isLoading?: boolean;
}

export const ResetPasswordDialog: React.FC<ResetPasswordDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  newPassword,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('userManagement.resetPasswordTitle')}</DialogTitle>
          <DialogDescription>
            {t('userManagement.resetPasswordDescription')}
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-4'>
          <div className='p-4 bg-muted/50 rounded-lg'>
            <Label className='text-sm font-medium'>
              {t('userManagement.newPassword')}
            </Label>
            <div className='flex items-center gap-2 mt-2'>
              <code className='flex-1 p-2 bg-background border rounded font-mono text-sm'>
                {showPassword ? newPassword : '••••••••••••'}
              </code>
              <Button
                variant='outline'
                size='icon'
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className='h-4 w-4' />
                ) : (
                  <Eye className='h-4 w-4' />
                )}
              </Button>
            </div>
            <p className='text-xs text-muted-foreground mt-2'>
              {t('userManagement.passwordChangeRequired')}
            </p>
          </div>
        </div>
        <div className='flex justify-end space-x-2'>
          <Button variant='outline' onClick={onClose} disabled={isLoading}>
            {t('common.cancel')}
          </Button>
          <Button onClick={onConfirm} disabled={isLoading}>
            {isLoading
              ? t('userManagement.resetting')
              : t('userManagement.actions.resetPassword')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};