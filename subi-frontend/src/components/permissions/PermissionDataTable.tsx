import React from 'react';
import { MoreHorizontal, Edit, Trash2, Key, Calendar, Tag, Eye, Shield } from 'lucide-react';
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
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/hooks/useAuth';
import { PermissionResponseDto } from '@/types/role';
import { formatDate } from '@/utils/date';

type SortField = 'name' | 'description' | 'createdAt';

interface PermissionDataTableProps {
  permissions: PermissionResponseDto[];
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  onView: (permission: PermissionResponseDto) => void;
  onEdit: (permission: PermissionResponseDto) => void;
  onDelete: (permission: PermissionResponseDto) => void;
  isLoading?: boolean;
}

export const PermissionDataTable: React.FC<PermissionDataTableProps> = ({
  permissions,
  sortField,
  sortDirection,
  onSort,
  onView,
  onEdit,
  onDelete,
  isLoading,
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

  if (permissions.length === 0) {
    return (
      <div className="text-center py-12">
        <Key className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">{t('permissionManagement.noPermissions')}</h3>
        <p className="mt-2 text-muted-foreground">{t('permissionManagement.noPermissionsYet')}</p>
      </div>
    );
  }

  return (
    <div className='overflow-x-auto rounded-lg border border-card-elevated-border shadow-sm'>
      <Table>
        <TableHeader className='bg-gradient-to-r from-table-header to-table-header/90 border-b-2 border-primary-200/30'>
          <TableRow className='group border-b-0 hover:bg-primary-50/20 transition-all duration-300'>
            <SortableTableHead
              field='name'
              currentSortField={sortField}
              currentSortDirection={sortDirection}
              onSort={onSort}
              className="w-[200px]"
            >
              {t('permissionManagement.permissionName')}
            </SortableTableHead>
            <TableHead className='text-table-header-foreground font-bold border-b-2 border-b-primary-200/50 bg-gradient-to-b from-table-header to-table-header/70'>
              {t('permissionManagement.permissionDescription')}
            </TableHead>
            <TableHead className="w-[140px] text-table-header-foreground font-bold border-b-2 border-b-primary-200/50 bg-gradient-to-b from-table-header to-table-header/70">
              Category
            </TableHead>
            <SortableTableHead
              field='createdAt'
              currentSortField={sortField}
              currentSortDirection={sortDirection}
              onSort={onSort}
              className="w-[120px]"
            >
              {t('common.created')}
            </SortableTableHead>
            <TableHead className='w-[100px] text-center text-table-header-foreground font-bold border-b-2 border-b-primary-200/50 bg-gradient-to-b from-table-header to-table-header/70'>
              {t('common.actions')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {permissions.map((permission, index) => {
            const category = getPermissionCategory(permission.name);
            return (
              <TableRow
                key={permission.id}
                className={`group ${index % 2 === 1 ? 'bg-muted/30' : 'bg-background'} hover:bg-primary-50/20 hover:shadow-sm transition-all duration-300 border-b border-gray-200`}
              >
                <TableCell className='py-4'>
                  <div className='space-y-1 max-w-[200px]'>
                    <button
                      onClick={() => onView(permission)}
                      className='text-left w-full'
                    >
                      <code className="font-mono font-semibold tabular-nums py-1 text-sm bg-muted px-2 rounded hover:text-primary-600 transition-colors cursor-pointer">
                        {permission.name}
                      </code>
                    </button>
                    {isSystemPermission(permission.name) && (
                      <Badge variant="outline" className="text-xs">
                        <Shield className='mr-1 h-3 w-3' />
                        System
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className='py-4 max-w-[300px]'>
                  {permission.description ? (
                    <p className="text-sm">{permission.description}</p>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </TableCell>
                <TableCell className='py-4'>
                  <Badge variant={getCategoryBadgeVariant(category)}>
                    <Tag className="mr-1 h-3 w-3" />
                    {t(`permissionManagement.categories.${category}` as keyof typeof t) || category}
                  </Badge>
                </TableCell>
                <TableCell className='py-4'>
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(permission.createdAt)}</span>
                  </div>
                </TableCell>
                <TableCell className='w-[100px] py-4'>
                  <div className='flex items-center justify-center'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-8 w-8 p-0 opacity-70 hover:opacity-100 transition-all duration-200 hover:bg-accent hover:shadow-lg focus:ring-2 focus:ring-primary/20'
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
                              <Trash2 className='mr-2 h-4 w-4' />
                              {t('common.delete')}
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};