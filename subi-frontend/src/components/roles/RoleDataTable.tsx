import React from 'react';
import { MoreHorizontal, Edit, Trash2, Shield, Calendar, Key, Eye } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  SortableTableHead,
  type SortDirection,
} from '@/components/ui/sortable-table-head';
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

type SortField = 'name' | 'createdAt' | 'permissions';

interface RoleDataTableProps {
  roles: RoleResponseDto[];
  sortField?: SortField;
  sortDirection?: SortDirection;
  onSort?: (field: SortField) => void;
  onEdit: (role: RoleResponseDto) => void;
  onDelete: (role: RoleResponseDto) => void;
  isLoading?: boolean;
}

export const RoleDataTable: React.FC<RoleDataTableProps> = ({
  roles,
  sortField = 'name',
  sortDirection = 'asc',
  onSort,
  onEdit,
  onDelete,
  isLoading,
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

  const handleViewDetails = (role: RoleResponseDto) => {
    navigate(`${ROUTES.ADMIN}/roles/${role.id}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="h-16 bg-muted rounded-md"></div>
          </div>
        ))}
      </div>
    );
  }

  if (roles.length === 0) {
    return (
      <div className="text-center py-12">
        <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">{t('roleManagement.noRoles')}</h3>
        <p className="mt-2 text-muted-foreground">{t('roleManagement.noRolesYet')}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-card-elevated-border bg-card shadow-md backdrop-blur-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border/5 hover:bg-transparent">
            <SortableTableHead
              field="name"
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={onSort}
              className="w-[200px] pl-6"
            >
              <Shield className="mr-2 h-4 w-4" />
              {t('roleManagement.roleName')}
            </SortableTableHead>
            <TableHead className="text-muted-foreground font-medium">
              {t('roleManagement.roleDescription')}
            </TableHead>
            <SortableTableHead
              field="permissions"
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={onSort}
              className="w-[150px]"
            >
              <Key className="mr-2 h-4 w-4" />
              {t('roleManagement.assignedPermissions')}
            </SortableTableHead>
            <SortableTableHead
              field="createdAt"
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={onSort}
              className="w-[120px]"
            >
              <Calendar className="mr-2 h-4 w-4" />
              {t('common.created')}
            </SortableTableHead>
            <TableHead className="w-[60px] pr-6"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.map((role) => (
            <TableRow
              key={role.id}
              className="group hover:bg-accent/30 transition-colors border-border/5"
            >
              <TableCell className="pl-6">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 border border-primary-300 shadow-sm">
                    <Shield className="h-4 w-4 text-primary-700" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getRoleBadgeVariant(role.name)} className="font-medium">
                      {role.name}
                    </Badge>
                    {isSystemRole(role.name) && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Shield className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t('roleManagement.systemRole')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="max-w-[300px]">
                  {role.description ? (
                    <p className="text-sm truncate font-medium">{role.description}</p>
                  ) : (
                    <span className="text-muted-foreground text-sm italic">
                      {t('roleManagement.noDescription')}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Key className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold">{role.permissions.length}</span>
                  <span className="text-muted-foreground text-xs">
                    {t('roleManagement.permissionsCount', { count: role.permissions.length })}
                  </span>
                </div>
                {role.permissions.length > 0 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {role.permissions.slice(0, 2).map((permission) => (
                            <Badge key={permission.id} variant="outline" className="text-xs">
                              {permission.name}
                            </Badge>
                          ))}
                          {role.permissions.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{role.permissions.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <div className="space-y-1">
                          {role.permissions.map((permission) => (
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
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">{formatDate(role.createdAt)}</span>
                </div>
              </TableCell>
              <TableCell className="pr-6">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-8 w-8 p-0 opacity-60 group-hover:opacity-100 transition-opacity hover:bg-accent hover:shadow-md hover:scale-110 rounded-lg"
                      aria-label={t('common.actions', { item: role.name })}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="shadow-lg border-border/20">
                    <DropdownMenuItem
                      onClick={() => handleViewDetails(role)}
                      className="hover:bg-accent focus:bg-accent"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      {t('roleManagement.viewDetails')}
                    </DropdownMenuItem>
                    {hasAnyRole(['ADMIN']) && (
                      <>
                        <Separator />
                        <DropdownMenuItem
                          onClick={() => onEdit(role)}
                          className="hover:bg-accent focus:bg-accent"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          {t('roleManagement.editRole')}
                        </DropdownMenuItem>
                      </>
                    )}
                    {hasAnyRole(['ADMIN']) && !isSystemRole(role.name) && (
                      <>
                        <Separator />
                        <DropdownMenuItem
                          onClick={() => onDelete(role)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t('roleManagement.deleteRole')}
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};