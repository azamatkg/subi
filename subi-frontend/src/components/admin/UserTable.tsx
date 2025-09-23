import React from 'react';
import { MoreHorizontal, Eye, Edit, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { Separator } from '@/components/ui/separator';
import {
  SortableTableHead,
  type SortDirection,
} from '@/components/ui/sortable-table-head';
import { AccessibleStatusBadge } from '@/components/ui/accessible-status-badge';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/hooks/useAuth';
import type { UserListResponseDto } from '@/types/user';

type SortField = 'lastName' | 'username' | 'email' | 'status' | 'createdAt';

interface UserTableProps {
  users: UserListResponseDto[];
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (user: UserListResponseDto) => void;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  sortField,
  sortDirection,
  onSort,
  onView,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();
  const { hasAnyRole } = useAuth();

  return (
    <div className='overflow-x-auto rounded-lg border border-card-elevated-border shadow-sm'>
      <Table>
        <TableHeader className='bg-gradient-to-r from-table-header to-table-header/90 border-b-2 border-primary-200/30'>
          <TableRow className='group border-b-0 hover:bg-primary-50/20 transition-all duration-300'>
            <SortableTableHead
              field='lastName'
              currentSortField={sortField}
              currentSortDirection={sortDirection}
              onSort={onSort}
            >
              {t('userManagement.fields.name')}
            </SortableTableHead>
            <SortableTableHead
              field='username'
              currentSortField={sortField}
              currentSortDirection={sortDirection}
              onSort={onSort}
            >
              {t('userManagement.fields.username')}
            </SortableTableHead>
            <SortableTableHead
              field='email'
              currentSortField={sortField}
              currentSortDirection={sortDirection}
              onSort={onSort}
              className='hidden sm:table-cell'
            >
              {t('userManagement.fields.email')}
            </SortableTableHead>
            <SortableTableHead
              field='status'
              currentSortField={sortField}
              currentSortDirection={sortDirection}
              onSort={onSort}
            >
              {t('userManagement.fields.status')}
            </SortableTableHead>
            <TableHead className='w-[100px] text-center text-table-header-foreground font-bold border-b-2 border-b-primary-200/50 bg-gradient-to-b from-table-header to-table-header/70'>
              {t('common.actions')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user, index) => (
            <TableRow
              key={user.id}
              className={`group ${index % 2 === 1 ? 'bg-muted/30' : 'bg-background'} hover:bg-primary-50/20 hover:shadow-sm transition-all duration-300 border-b border-gray-200`}
            >
              <TableCell className='py-4'>
                <div className='space-y-1 max-w-[200px]'>
                  <button
                    onClick={() => onView(user.id)}
                    className='text-left w-full'
                  >
                    <p className='font-bold text-base leading-tight hover:text-primary-600 transition-colors cursor-pointer tracking-wide'>
                      {user.fullName ||
                        `${user.firstName} ${user.lastName}`.trim()}
                    </p>
                  </button>
                  {user.department && (
                    <p className='text-xs text-muted-foreground truncate font-medium'>
                      {user.department}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell className='font-mono font-semibold tabular-nums py-4'>
                @{user.username}
              </TableCell>
              <TableCell className='py-4 max-w-[200px] truncate hidden sm:table-cell'>
                {user.email}
              </TableCell>
              <TableCell className='py-4'>
                <AccessibleStatusBadge
                  status={user.status}
                  isActive={user.isActive}
                  enabled={user.enabled}
                  mode='user'
                />
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
                          item:
                            user.fullName ||
                            `${user.firstName} ${user.lastName}`.trim(),
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
