import React from 'react';
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Shield,
  Key,
  Calendar,
  Users,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { RoleResponseDto, SystemRoles } from '@/types/role';
import { formatDate } from '@/utils/date';
import { ROUTES } from '@/constants';

interface RoleCardProps {
  role: RoleResponseDto;
  onEdit: (role: RoleResponseDto) => void;
  onDelete: (role: RoleResponseDto) => void;
}

export const RoleCard: React.FC<RoleCardProps> = ({
  role,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();
  const { hasAnyRole } = useAuth();
  const navigate = useNavigate();

  const isSystemRole = (roleName: string) => {
    return SystemRoles.includes(roleName as typeof SystemRoles[number]);
  };

  const getRoleBadgeVariant = (roleName: string) => {
    switch (roleName) {
      case 'ADMIN':
        return 'destructive';
      case 'CREDIT_MANAGER':
        return 'default';
      case 'CREDIT_ANALYST':
        return 'secondary';
      case 'MODERATOR':
        return 'outline';
      case 'DECISION_MAKER':
        return 'default';
      case 'USER':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const handleViewDetails = () => {
    navigate(`${ROUTES.ADMIN}/roles/${role.id}`);
  };

  return (
    <div
      className='group card-hover-scale hover:shadow-xl hover:shadow-primary/5 hover:bg-card-elevated transition-all duration-300 border border-card-elevated-border bg-card shadow-md rounded-lg'
      role='article'
      aria-labelledby={`role-title-${role.id}`}
    >
      <div className='p-7'>
        <div className='space-y-4'>
          {/* Header with role name and actions */}
          <div className='flex items-start justify-between gap-4'>
            <div className='min-w-0 flex-1'>
              <div className='flex items-center gap-3 mb-3'>
                <div className='flex items-center justify-center h-9 w-9 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 border border-primary-300 shadow-sm'>
                  <Shield className='h-5 w-5 text-primary-700 shrink-0' />
                </div>
                <div className='flex items-center gap-2'>
                  <Badge variant={getRoleBadgeVariant(role.name)} className='font-mono font-bold'>
                    {role.name}
                  </Badge>
                  {isSystemRole(role.name) && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Shield className='h-4 w-4 text-muted-foreground' />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t('roleManagement.systemRole')}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>
              <h3
                id={`role-title-${role.id}`}
                className='text-xl font-bold leading-tight text-card-foreground tracking-wide'
              >
                {role.name}
              </h3>
              <p className='text-sm text-muted-foreground mt-2 font-medium'>
                {role.description || t('roleManagement.noDescription')}
              </p>
            </div>
            <div className='flex items-center gap-2 shrink-0'>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-8 w-8 p-0 opacity-60 group-hover:opacity-100 transition-all duration-300 hover:bg-accent hover:shadow-md hover:scale-110 focus:ring-2 focus:ring-primary/30 rounded-lg'
                    aria-label={t('common.actions', { item: role.name })}
                  >
                    <MoreHorizontal className='h-4 w-4' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align='end'
                  className='shadow-lg border-border/20'
                >
                  <DropdownMenuItem
                    onClick={handleViewDetails}
                    className='hover:bg-accent focus:bg-accent'
                  >
                    <Eye className='mr-2 h-4 w-4' />
                    {t('roleManagement.viewDetails')}
                  </DropdownMenuItem>
                  {hasAnyRole(['ADMIN']) && (
                    <>
                      <Separator />
                      <DropdownMenuItem
                        onClick={() => onEdit(role)}
                        className='hover:bg-accent focus:bg-accent'
                      >
                        <Edit className='mr-2 h-4 w-4' />
                        {t('roleManagement.editRole')}
                      </DropdownMenuItem>
                    </>
                  )}
                  {hasAnyRole(['ADMIN']) && !isSystemRole(role.name) && (
                    <>
                      <Separator />
                      <DropdownMenuItem
                        onClick={() => onDelete(role)}
                        className='text-destructive hover:text-destructive hover:bg-destructive/10'
                      >
                        <Trash2 className='mr-2 h-4 w-4' />
                        {t('roleManagement.deleteRole')}
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
              <Key className='h-5 w-5 text-muted-foreground shrink-0' />
              <div className='flex-1 min-w-0'>
                <span className='font-medium'>
                  {t('roleManagement.assignedPermissions')}:
                </span>
                <div className='mt-1'>
                  <div className='flex items-center gap-2'>
                    <span className='font-semibold'>
                      {role.permissions.length} {t('roleManagement.permissionsCount', { count: role.permissions.length })}
                    </span>
                  </div>
                  {role.permissions.length > 0 && (
                    <div className='flex flex-wrap gap-1 mt-2'>
                      {role.permissions.slice(0, 3).map((permission) => (
                        <Badge key={permission.id} variant="outline" className="text-xs">
                          {permission.name}
                        </Badge>
                      ))}
                      {role.permissions.length > 3 && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Badge variant="outline" className="text-xs cursor-help">
                                +{role.permissions.length - 3} {t('roleManagement.morePermissions')}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <div className="space-y-1">
                                {role.permissions.slice(3).map((permission) => (
                                  <div key={permission.id} className="text-xs">
                                    <strong>{permission.name}</strong>
                                    {permission.description && (
                                      <p className="text-muted-foreground">{permission.description}</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className='flex items-center gap-3'>
              <Calendar className='h-5 w-5 text-muted-foreground shrink-0' />
              <div>
                <span className='font-medium'>
                  {t('common.created')}:
                </span>
                <span className='ml-2 font-semibold'>
                  {formatDate(role.createdAt)}
                </span>
              </div>
            </div>

            {isSystemRole(role.name) && (
              <div className='flex items-center gap-3'>
                <Users className='h-5 w-5 text-muted-foreground shrink-0' />
                <div>
                  <span className='font-medium'>
                    {t('roleManagement.type')}:
                  </span>
                  <Badge variant='secondary' className='ml-2 text-xs'>
                    {t('roleManagement.systemRole')}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};