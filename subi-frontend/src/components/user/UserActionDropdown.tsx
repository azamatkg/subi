import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  MoreHorizontal,
  UserCheck,
  UserX,
  Key,
  Trash,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { UserResponseDto } from '@/types/user';

interface UserActionDropdownProps {
  user: UserResponseDto;
  onSuspend: () => void;
  onActivate: () => void;
  onResetPassword: () => void;
  onDelete: () => void;
  isActivating?: boolean;
}

export const UserActionDropdown: React.FC<UserActionDropdownProps> = ({
  user,
  onSuspend,
  onActivate,
  onResetPassword,
  onDelete,
  isActivating = false,
}) => {
  const { t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' size='icon'>
          <MoreHorizontal className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        {user.isActive ? (
          <DropdownMenuItem onClick={onSuspend} className='text-orange-600'>
            <UserX className='mr-2 h-4 w-4' />
            {t('userManagement.actions.suspend')}
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onClick={onActivate}
            disabled={isActivating}
            className='text-green-600'
          >
            <UserCheck className='mr-2 h-4 w-4' />
            {t('userManagement.actions.activate')}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={onResetPassword}>
          <Key className='mr-2 h-4 w-4' />
          {t('userManagement.actions.resetPassword')}
        </DropdownMenuItem>
        <Separator />
        <DropdownMenuItem onClick={onDelete} className='text-destructive'>
          <Trash className='mr-2 h-4 w-4' />
          {t('common.delete')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};