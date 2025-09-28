import React from 'react';
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash,
  Key,
  Calendar,
  Tag,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/hooks/useAuth';
import type { PermissionResponseDto } from '@/types/role';
import { formatDate } from '@/utils/date';

interface PermissionCardProps {
  permission: PermissionResponseDto;
  onView: (permission: PermissionResponseDto) => void;
  onEdit: (permission: PermissionResponseDto) => void;
  onDelete: (permission: PermissionResponseDto) => void;
}

export const PermissionCard: React.FC<PermissionCardProps> = ({
  permission,
  onView,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();
  const { hasAnyRole } = useAuth();

  const getPermissionCategory = (permissionName: string) => {
    if (permissionName.includes('USER')) return 'userManagement';
    if (permissionName.includes('ROLE')) return 'roleManagement';
    if (permissionName.includes('PERMISSION')) return 'permissionManagement';
    if (permissionName.includes('SYSTEM')) return 'system';
    if (permissionName.includes('CREDIT')) return 'creditProgram';
    if (permissionName.includes('DECISION')) return 'decision';
    if (permissionName.includes('REFERENCE')) return 'referenceData';
    return 'other';
  };

  const getCategoryBadgeVariant = (category: string) => {
    switch (category) {
      case 'userManagement':
        return 'default';
      case 'roleManagement':
        return 'secondary';
      case 'permissionManagement':
        return 'outline';
      case 'system':
        return 'destructive';
      case 'creditProgram':
        return 'default';
      case 'decision':
        return 'secondary';
      case 'referenceData':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const isSystemPermission = (permissionName: string) => {
    const systemPermissions = [
      'READ_USER', 'WRITE_USER', 'DELETE_USER',
      'READ_ROLE', 'WRITE_ROLE', 'DELETE_ROLE',
      'READ_PERMISSION', 'WRITE_PERMISSION', 'DELETE_PERMISSION',
      'MANAGE_SYSTEM'
    ];
    return systemPermissions.includes(permissionName);
  };

  const category = getPermissionCategory(permission.name);

  return (
    <div
      className='group card-hover-scale hover:shadow-xl hover:shadow-primary/5 hover:bg-card-elevated transition-all duration-300 border border-card-elevated-border bg-card shadow-md rounded-lg'
      role='article'
      aria-labelledby={`permission-title-${permission.id}`}
    >
      <div className='p-7'>
        <div className='space-y-4'>
          {/* Header with category and actions */}
          <div className='flex items-start justify-between gap-4'>
            <div className='min-w-0 flex-1'>
              <div className='flex items-center gap-3 mb-3'>
                <div className='flex items-center justify-center h-9 w-9 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 border border-primary-300 shadow-sm'>
                  <Key className='h-5 w-5 text-primary-700 shrink-0' />
                </div>
                <Badge variant={getCategoryBadgeVariant(category)}>
                  <Tag className='mr-1 h-3 w-3' />
                  {t(`permissionManagement.categories.${category}` as keyof typeof t) || category}
                </Badge>
              </div>
              <button
                onClick={() => onView(permission)}
                className='text-left w-full'
              >
                <h3
                  id={`permission-title-${permission.id}`}
                  className='text-xl font-bold leading-tight text-card-foreground hover:text-primary-600 transition-colors cursor-pointer tracking-wide'
                >
                  <code className='font-mono bg-muted px-2 py-1 rounded text-sm'>
                    {permission.name}
                  </code>
                </h3>
              </button>
              {permission.description && (
                <p className='text-sm text-muted-foreground mt-2 font-medium'>
                  {permission.description}
                </p>
              )}
            </div>
            <div className='flex items-center gap-2 shrink-0'>
              {isSystemPermission(permission.name) && (
                <Badge variant="outline" className="text-xs shrink-0 shadow-sm">
                  <Shield className='mr-1 h-3 w-3' />
                  System
                </Badge>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-8 w-8 p-0 opacity-60 group-hover:opacity-100 transition-all duration-300 hover:bg-accent hover:shadow-md hover:scale-110 focus:ring-2 focus:ring-primary/30 rounded-lg'
                    aria-label={t('common.actions', {
                      item: permission.name,
                    })}
                  >
                    <MoreHorizontal className='h-4 w-4' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align='end'
                  className='shadow-lg border-border/20'
                >
                  <DropdownMenuItem
                    onClick={() => onView(permission)}
                    className='hover:bg-accent focus:bg-accent'
                  >
                    <Eye className='mr-2 h-4 w-4' />
                    {t('common.view')}
                  </DropdownMenuItem>
                  {hasAnyRole(['ADMIN']) && (
                    <DropdownMenuItem
                      onClick={() => onEdit(permission)}
                      className='hover:bg-accent focus:bg-accent'
                    >
                      <Edit className='mr-2 h-4 w-4' />
                      {t('common.edit')}
                    </DropdownMenuItem>
                  )}
                  {hasAnyRole(['ADMIN']) && !isSystemPermission(permission.name) && (
                    <>
                      <Separator />
                      <DropdownMenuItem
                        onClick={() => onDelete(permission)}
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
              <Calendar className='h-5 w-5 text-muted-foreground shrink-0' />
              <div>
                <span className='font-medium'>
                  {t('common.created')}:
                </span>
                <span className='ml-2 font-semibold'>
                  {formatDate(permission.createdAt)}
                </span>
              </div>
            </div>

            {permission.updatedAt && (
              <div className='flex items-center gap-3'>
                <Calendar className='h-5 w-5 text-muted-foreground shrink-0' />
                <div>
                  <span className='font-medium'>
                    {t('common.updated')}:
                  </span>
                  <span className='ml-2 font-semibold'>
                    {formatDate(permission.updatedAt)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};