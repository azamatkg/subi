import React from 'react';
import {
  X as CloseIcon,
  Edit,
  Eye,
  MoreHorizontal,
  Pause,
  Play,
  SortAsc,
  SortDesc,
  Trash,
} from 'lucide-react';

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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import { useTranslation } from '@/hooks/useTranslation';
import type {
  CreditProgramResponseDto,
  ProgramStatus,
} from '@/types/creditProgram';

type SortField =
  | 'nameEn'
  | 'status'
  | 'currencyCode'
  | 'amountMin'
  | 'amountMax'
  | 'validFrom'
  | 'validTo';
type SortDirection = 'asc' | 'desc';

interface CreditProgramTableProps {
  programs: CreditProgramResponseDto[];
  loading?: boolean;
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  onView: (program: CreditProgramResponseDto) => void;
  onEdit: (program: CreditProgramResponseDto) => void;
  onDelete: (program: CreditProgramResponseDto) => void;
  onActivate?: (program: CreditProgramResponseDto) => void;
  onSuspend?: (program: CreditProgramResponseDto) => void;
  onClose?: (program: CreditProgramResponseDto) => void;
  userRoles?: string[];
  className?: string;
}

export const CreditProgramTable: React.FC<CreditProgramTableProps> = ({
  programs,
  loading = false,
  sortField,
  sortDirection,
  onSort,
  onView,
  onEdit,
  onDelete,
  onActivate,
  onSuspend,
  onClose,
  userRoles = [],
  className,
}) => {
  const { t } = useTranslation();

  const canManageStatus =
    userRoles.includes('ADMIN') || userRoles.includes('CREDIT_MANAGER');
  const canDelete = userRoles.includes('ADMIN');
  const canEdit =
    userRoles.includes('ADMIN') ||
    userRoles.includes('CREDIT_ANALYST') ||
    userRoles.includes('CREDIT_MANAGER');

  // Status badge component
  const StatusBadge: React.FC<{ status: ProgramStatus }> = ({ status }) => {
    const getStatusColor = (status: ProgramStatus) => {
      switch (status) {
        case 'DRAFT':
          return 'secondary';
        case 'PENDING_APPROVAL':
          return 'default';
        case 'APPROVED':
          return 'default';
        case 'ACTIVE':
          return 'default';
        case 'SUSPENDED':
          return 'outline';
        case 'CLOSED':
        case 'CANCELLED':
        case 'REJECTED':
          return 'destructive';
        default:
          return 'secondary';
      }
    };

    const getStatusStyle = (status: ProgramStatus) => {
      switch (status) {
        case 'DRAFT':
          return 'bg-gray-100 text-gray-800 border-gray-300';
        case 'PENDING_APPROVAL':
          return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        case 'APPROVED':
          return 'bg-blue-100 text-blue-800 border-blue-300';
        case 'ACTIVE':
          return 'bg-green-100 text-green-800 border-green-300';
        case 'SUSPENDED':
          return 'bg-orange-100 text-orange-800 border-orange-300';
        case 'CLOSED':
        case 'CANCELLED':
        case 'REJECTED':
          return 'bg-red-100 text-red-800 border-red-300';
        default:
          return 'bg-gray-100 text-gray-800 border-gray-300';
      }
    };

    return (
      <Badge
        variant={getStatusColor(status)}
        className={cn('font-medium border', getStatusStyle(status))}
      >
        {t(`creditProgram.status.${status.toLowerCase()}`)}
      </Badge>
    );
  };

  // Sortable table header component
  const SortableTableHead: React.FC<{
    field: SortField;
    children: React.ReactNode;
    className?: string;
  }> = ({ field, children, className }) => (
    <TableHead
      className={cn(
        'cursor-pointer transition-all duration-300 select-none border-b-2 border-b-primary-200/50 bg-gradient-to-b from-table-header to-table-header/70',
        className
      )}
    >
      <button
        onClick={() => onSort(field)}
        className='flex items-center gap-2 w-full text-left font-bold text-table-header-foreground hover:text-primary-600 transition-colors duration-300 py-3 px-1 rounded-lg hover:bg-primary-50/50'
        aria-label={t('common.sortBy', { field: children })}
        disabled={loading}
      >
        {children}
        {sortField === field ? (
          sortDirection === 'asc' ? (
            <SortAsc className='h-4 w-4 text-primary animate-in slide-in-from-bottom-1 duration-200' />
          ) : (
            <SortDesc className='h-4 w-4 text-primary animate-in slide-in-from-top-1 duration-200' />
          )
        ) : (
          <div className='h-4 w-4 opacity-40 group-hover:opacity-70 transition-opacity'>
            <SortAsc className='h-4 w-4 text-table-header-foreground' />
          </div>
        )}
      </button>
    </TableHead>
  );

  // Format amount range
  const formatAmountRange = (program: CreditProgramResponseDto) => {
    if (!program.amountMin && !program.amountMax) {
      return '-';
    }
    if (program.amountMin && program.amountMax) {
      return `${program.amountMin.toLocaleString()} - ${program.amountMax.toLocaleString()} ${program.currencyCode}`;
    }
    if (program.amountMin) {
      return `${t('common.from')} ${program.amountMin.toLocaleString()} ${program.currencyCode}`;
    }
    return `${t('common.up_to')} ${program.amountMax!.toLocaleString()} ${program.currencyCode}`;
  };

  // Format term range
  const formatTermRange = (program: CreditProgramResponseDto) => {
    if (!program.termMin && !program.termMax) {
      return '-';
    }
    if (program.termMin && program.termMax) {
      return `${program.termMin} - ${program.termMax} ${t('common.months')}`;
    }
    if (program.termMin) {
      return `${t('common.from')} ${program.termMin} ${t('common.months')}`;
    }
    return `${t('common.up_to')} ${program.termMax} ${t('common.months')}`;
  };

  // Format validity period
  const formatValidityPeriod = (program: CreditProgramResponseDto) => {
    if (!program.validFrom && !program.validTo) {
      return '-';
    }
    const formatDate = (dateStr: string) =>
      new Date(dateStr).toLocaleDateString();

    if (program.validFrom && program.validTo) {
      return `${formatDate(program.validFrom)} - ${formatDate(program.validTo)}`;
    }
    if (program.validFrom) {
      return `${t('common.from')} ${formatDate(program.validFrom)}`;
    }
    return `${t('common.until')} ${formatDate(program.validTo!)}`;
  };

  if (programs.length === 0) {
    return (
      <div className='text-center py-12'>
        <p className='text-muted-foreground'>
          {t('creditProgram.messages.noPrograms')}
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'overflow-x-auto rounded-lg border border-card-elevated-border shadow-sm',
        className
      )}
    >
      <Table>
        <TableHeader className='bg-gradient-to-r from-table-header to-table-header/90 border-b-2 border-primary-200/30'>
          <TableRow className='group border-b-0 hover:bg-primary-50/20 transition-all duration-300'>
            <SortableTableHead field='nameEn'>
              {t('creditProgram.table.name')}
            </SortableTableHead>
            <SortableTableHead field='status'>
              {t('creditProgram.table.status')}
            </SortableTableHead>
            <SortableTableHead field='currencyCode'>
              {t('creditProgram.table.currency')}
            </SortableTableHead>
            <TableHead className='text-table-header-foreground font-bold border-b-2 border-b-primary-200/50 bg-gradient-to-b from-table-header to-table-header/70'>
              {t('creditProgram.table.amountRange')}
            </TableHead>
            <TableHead className='text-table-header-foreground font-bold border-b-2 border-b-primary-200/50 bg-gradient-to-b from-table-header to-table-header/70'>
              {t('creditProgram.table.termRange')}
            </TableHead>
            <TableHead className='text-table-header-foreground font-bold border-b-2 border-b-primary-200/50 bg-gradient-to-b from-table-header to-table-header/70'>
              {t('creditProgram.table.validPeriod')}
            </TableHead>
            <TableHead className='w-[100px] text-center text-table-header-foreground font-bold border-b-2 border-b-primary-200/50 bg-gradient-to-b from-table-header to-table-header/70'>
              {t('common.actions')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {programs.map((program, index) => (
            <TableRow
              key={program.id}
              className={cn(
                `group ${index % 2 === 1 ? 'bg-muted/30' : 'bg-background'} hover:bg-primary-50/20 hover:shadow-sm transition-all duration-300 border-b border-border/5`,
                loading && 'opacity-50'
              )}
            >
              <TableCell className='py-4'>
                <div className='space-y-1 max-w-[300px]'>
                  <button
                    onClick={() => onView(program)}
                    className='text-left w-full'
                    disabled={loading}
                  >
                    <p className='font-bold text-base leading-tight hover:text-primary-600 transition-colors cursor-pointer tracking-wide'>
                      {program.nameEn}
                    </p>
                  </button>
                  {program.description && (
                    <p className='text-sm text-muted-foreground line-clamp-2 font-medium'>
                      {program.description}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell className='py-4'>
                <StatusBadge status={program.status} />
              </TableCell>
              <TableCell className='py-4 font-mono'>
                {program.currencyCode}
              </TableCell>
              <TableCell className='py-4'>
                {formatAmountRange(program)}
              </TableCell>
              <TableCell className='py-4'>{formatTermRange(program)}</TableCell>
              <TableCell className='py-4'>
                {formatValidityPeriod(program)}
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
                          item: program.nameEn,
                        })}
                        disabled={loading}
                      >
                        <MoreHorizontal className='h-4 w-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align='end'
                      className='shadow-lg border-border/20'
                    >
                      <DropdownMenuItem
                        onClick={() => onView(program)}
                        className='hover:bg-accent focus:bg-accent'
                      >
                        <Eye className='mr-2 h-4 w-4' />
                        {t('common.view')}
                      </DropdownMenuItem>

                      {canEdit && (
                        <DropdownMenuItem
                          onClick={() => onEdit(program)}
                          className='hover:bg-accent focus:bg-accent'
                        >
                          <Edit className='mr-2 h-4 w-4' />
                          {t('common.edit')}
                        </DropdownMenuItem>
                      )}

                      {canManageStatus && (
                        <>
                          <DropdownMenuSeparator />

                          {program.status === 'APPROVED' && onActivate && (
                            <DropdownMenuItem
                              onClick={() => onActivate(program)}
                              className='hover:bg-green-50 text-green-700'
                            >
                              <Play className='mr-2 h-4 w-4' />
                              {t('creditProgram.actions.activate')}
                            </DropdownMenuItem>
                          )}

                          {program.status === 'ACTIVE' && onSuspend && (
                            <DropdownMenuItem
                              onClick={() => onSuspend(program)}
                              className='hover:bg-orange-50 text-orange-700'
                            >
                              <Pause className='mr-2 h-4 w-4' />
                              {t('creditProgram.actions.suspend')}
                            </DropdownMenuItem>
                          )}

                          {(program.status === 'ACTIVE' ||
                            program.status === 'SUSPENDED') &&
                            onClose && (
                              <DropdownMenuItem
                                onClick={() => onClose(program)}
                                className='hover:bg-red-50 text-red-700'
                              >
                                <CloseIcon className='mr-2 h-4 w-4' />
                                {t('creditProgram.actions.close')}
                              </DropdownMenuItem>
                            )}
                        </>
                      )}

                      {canDelete && program.canBeDeleted && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDelete(program)}
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
