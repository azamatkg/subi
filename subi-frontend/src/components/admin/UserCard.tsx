import React from 'react';
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash,
  Shield,
  Users,
  Clock,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { AccessibleStatusBadge } from '@/components/ui/accessible-status-badge';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/hooks/useAuth';
import type { UserListResponseDto } from '@/types/user';
import { UserRole } from '@/types';

interface UserCardProps {
  user: UserListResponseDto;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (user: UserListResponseDto) => void;
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  onView,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();
  const { hasAnyRole } = useAuth();

  const formatRoles = (roles: UserRole[]) => {
    if (!roles || roles.length === 0) return t('common.none');
    const roleName = String(roles[0]);
    const firstRole = roleName.toLowerCase();
    if (roles.length === 1) return t(`userManagement.roles.${firstRole}`);
    return `${t(`userManagement.roles.${firstRole}`)} +${roles.length - 1}`;
  };

  return (
    <div
      className='group hover:shadow-xl hover:shadow-primary/5 hover:bg-card-elevated hover:scale-[1.02] transition-all duration-300 border border-card-elevated-border bg-card shadow-md backdrop-blur-sm rounded-lg'
      role='article'
      aria-labelledby={`user-title-${user.id}`}
    >
      <div className='p-7'>
        <div className='space-y-4'>
          {/* Header with status and actions */}
          <div className='flex items-start justify-between gap-4'>
            <div className='min-w-0 flex-1'>
              <div className='flex items-center gap-3 mb-3'>
                <div className='flex items-center justify-center h-9 w-9 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 border border-primary-300 shadow-sm'>
                  <User className='h-5 w-5 text-primary-700 shrink-0' />
                </div>
                <span className='text-sm font-mono font-bold text-primary-700 tabular-nums tracking-wide'>
                  @{user.username}
                </span>
              </div>
              <button
                onClick={() => onView(user.id)}
                className='text-left w-full'
              >
                <h3
                  id={`user-title-${user.id}`}
                  className='text-xl font-bold leading-tight text-card-foreground hover:text-primary-600 transition-colors cursor-pointer tracking-wide'
                >
                  {user.fullName || `${user.firstName} ${user.lastName}`.trim()}
                </h3>
              </button>
              <p className='text-sm text-muted-foreground mt-2 font-medium'>
                {user.email}
              </p>
            </div>
            <div className='flex items-center gap-2 shrink-0'>
              <AccessibleStatusBadge
                status={user.status}
                isActive={user.isActive}
                enabled={user.enabled}
                mode="user"
                className='shrink-0 shadow-sm'
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-8 w-8 p-0 opacity-60 group-hover:opacity-100 transition-all duration-300 hover:bg-accent hover:shadow-md hover:scale-110 focus:ring-2 focus:ring-primary/30 rounded-lg'
                    aria-label={t('common.actions', { item: user.fullName || `${user.firstName} ${user.lastName}`.trim() })}
                  >
                    <MoreHorizontal className='h-4 w-4' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align='end'
                  className='shadow-lg border-border/20'
                >
                  <DropdownMenuItem
                    onClick={() => onView(user.id)}
                    className='hover:bg-accent focus:bg-accent'
                  >
                    <Eye className='mr-2 h-4 w-4' />
                    {t('common.view')}
                  </DropdownMenuItem>
                  {hasAnyRole(['ADMIN']) && (
                    <DropdownMenuItem
                      onClick={() => onEdit(user.id)}
                      className='hover:bg-accent focus:bg-accent'
                    >
                      <Edit className='mr-2 h-4 w-4' />
                      {t('common.edit')}
                    </DropdownMenuItem>
                  )}
                  {hasAnyRole(['ADMIN']) && (
                    <>
                      <Separator />
                      <DropdownMenuItem
                        onClick={() => onDelete(user)}
                        className='text-destructive hover:text-destructive hover:bg-destructive/10'
                      >
                        <Trash className='mr-2 h-4 w-4' />
                        {t('common.delete')}
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Details grid */}
          <div className='space-y-3 text-sm'>
            <div className='flex items-center gap-3'>
              <Shield className='h-5 w-5 text-muted-foreground shrink-0' />
              <div>
                <span className='font-medium'>
                  {t('userManagement.fields.roles')}:
                </span>
                <span className='ml-2 font-semibold'>
                  {formatRoles(user.roles)}
                </span>
              </div>
            </div>

            {user.department && (
              <div className='flex items-center gap-3'>
                <Users className='h-5 w-5 text-muted-foreground shrink-0' />
                <div>
                  <span className='font-medium'>
                    {t('userManagement.fields.department')}:
                  </span>
                  <span className='ml-2 font-semibold'>{user.department}</span>
                </div>
              </div>
            )}

            <div className='flex items-center gap-3'>
              <Clock className='h-5 w-5 text-muted-foreground shrink-0' />
              <div>
                <span className='font-medium'>
                  {t('userManagement.fields.lastLogin')}:
                </span>
                <span className='ml-2 font-semibold'>
                  {user.lastLoginAt
                    ? new Date(user.lastLoginAt).toLocaleDateString()
                    : t('userManagement.never')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
