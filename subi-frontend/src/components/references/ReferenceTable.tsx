import React from 'react';
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash,
  CheckCircle,
  XCircle,
  Shield,
  Globe,
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import {
  SortableTableHead,
  type SortDirection,
} from '@/components/ui/sortable-table-head';
import { AccessibleStatusBadge } from '@/components/ui/accessible-status-badge';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/hooks/useAuth';
import type {
  ReferenceListResponseDto,
  ReferenceListSortField,
} from '@/types/reference';

interface ReferenceTableProps {
  references: ReferenceListResponseDto[];
  sortField: ReferenceListSortField;
  sortDirection: SortDirection;
  onSort: (field: ReferenceListSortField) => void;
  onView: (reference: ReferenceListResponseDto) => void;
  onEdit: (reference: ReferenceListResponseDto) => void;
  onDelete: (reference: ReferenceListResponseDto) => void;
  onStatusToggle: (reference: ReferenceListResponseDto) => void;
}

export const ReferenceTable: React.FC<ReferenceTableProps> = ({
  references,
  sortField,
  sortDirection,
  onSort,
  onView,
  onEdit,
  onDelete,
  onStatusToggle,
}) => {
  const { t } = useTranslation();
  const { hasAnyRole } = useAuth();

  const getEntityTypeIcon = (entityType: string) => {
    switch (entityType) {
      case 'CURRENCIES':
        return '💱';
      case 'CREDIT_PURPOSES':
        return '🎯';
      case 'DOCUMENT_TYPES':
        return '📄';
      case 'DECISION_MAKING_BODIES':
        return '👥';
      case 'DECISION_TYPES':
        return '⚖️';
      case 'FLOATING_RATE_TYPES':
        return '📈';
      case 'REPAYMENT_ORDERS':
        return '💰';
      default:
        return '📋';
    }
  };

  const getEntityTypeName = (entityType: string) => {
    const key = entityType.toLowerCase().replace(/_/g, '');
    return t(`references.filters.entityTypes.${key}`, entityType);
  };

  return (
    <div className='overflow-x-auto rounded-lg border border-card-elevated-border shadow-sm'>
      <Table>
        <TableHeader className='bg-gradient-to-r from-table-header to-table-header/90 border-b-2 border-primary-200/30'>
          <TableRow className='group border-b-0 hover:bg-primary-50/20 transition-all duration-300'>
            <SortableTableHead
              field='nameEn'
              currentSortField={sortField}
              currentSortDirection={sortDirection}
              onSort={onSort}
            >
              {t('references.fields.nameEn')}
            </SortableTableHead>
            <SortableTableHead
              field='entityType'
              currentSortField={sortField}
              currentSortDirection={sortDirection}
              onSort={onSort}
            >
              {t('references.list.entityType')}
            </SortableTableHead>
            <TableHead className='hidden md:table-cell text-table-header-foreground font-bold border-b-2 border-b-primary-200/50 bg-gradient-to-b from-table-header to-table-header/70'>
              {t('references.list.availability')}
            </TableHead>
            <SortableTableHead
              field='status'
              currentSortField={sortField}
              currentSortDirection={sortDirection}
              onSort={onSort}
            >
              {t('references.fields.status')}
            </SortableTableHead>
            <SortableTableHead
              field='updatedAt'
              currentSortField={sortField}
              currentSortDirection={sortDirection}
              onSort={onSort}
              className='hidden lg:table-cell'
            >
              {t('references.fields.updated')}
            </SortableTableHead>
            <TableHead className='w-[100px] text-center text-table-header-foreground font-bold border-b-2 border-b-primary-200/50 bg-gradient-to-b from-table-header to-table-header/70'>
              {t('common.actions')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {references.map((reference, index) => {
            const canEdit = hasAnyRole(['ADMIN']) || !reference.adminOnly;
            const canDelete = hasAnyRole(['ADMIN']);

            return (
              <TableRow
                key={`${reference.entityType}-${reference.id}`}
                className={`group ${
                  index % 2 === 1 ? 'bg-muted/30' : 'bg-background'
                } hover:bg-primary-50/20 hover:shadow-sm transition-all duration-300 border-b border-gray-200`}
              >
                <TableCell className='py-4'>
                  <div className='space-y-1 max-w-[300px]'>
                    <button
                      onClick={() => onView(reference)}
                      className='text-left w-full'
                      disabled={!reference.isAvailable}
                    >
                      <p
                        className={`font-bold text-base leading-tight transition-colors cursor-pointer tracking-wide ${
                          reference.isAvailable
                            ? 'hover:text-primary-600'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {reference.nameEn}
                      </p>
                    </button>
                    <div className='flex flex-wrap gap-1'>
                      {reference.nameRu && (
                        <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                          <Globe className='h-3 w-3' />
                          <span className='font-mono'>RU:</span>
                          <span className='truncate max-w-[120px]'>
                            {reference.nameRu}
                          </span>
                        </div>
                      )}
                      {reference.nameKg && (
                        <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                          <Globe className='h-3 w-3' />
                          <span className='font-mono'>KG:</span>
                          <span className='truncate max-w-[120px]'>
                            {reference.nameKg}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>

                <TableCell className='py-4'>
                  <div className='flex items-center gap-2'>
                    <span className='text-lg'>
                      {getEntityTypeIcon(reference.entityType)}
                    </span>
                    <div className='flex flex-col gap-1'>
                      <span className='font-medium text-sm'>
                        {getEntityTypeName(reference.entityType)}
                      </span>
                      {reference.adminOnly && (
                        <Badge variant='secondary' className='text-xs w-fit'>
                          <Shield className='h-3 w-3 mr-1' />
                          {t('references.list.adminOnly')}
                        </Badge>
                      )}
                    </div>
                  </div>
                </TableCell>

                <TableCell className='py-4 hidden md:table-cell'>
                  <div className='flex items-center gap-2'>
                    {reference.isAvailable ? (
                      <>
                        <CheckCircle className='h-4 w-4 text-green-600' />
                        <span className='text-sm font-medium text-green-700'>
                          {t('references.list.available')}
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className='h-4 w-4 text-red-600' />
                        <span className='text-sm font-medium text-red-700'>
                          {t('references.list.notAvailable')}
                        </span>
                      </>
                    )}
                  </div>
                </TableCell>

                <TableCell className='py-4'>
                  <AccessibleStatusBadge
                    status={reference.status === 'ACTIVE' ? 'active' : 'inactive'}
                  />
                </TableCell>

                <TableCell className='py-4 hidden lg:table-cell'>
                  <div className='text-sm'>
                    <div className='font-medium'>
                      {new Date(reference.updatedAt).toLocaleDateString()}
                    </div>
                    {reference.updatedByUsername && (
                      <div className='text-xs text-muted-foreground font-mono'>
                        @{reference.updatedByUsername}
                      </div>
                    )}
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
                            item: reference.nameEn,
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
                          onClick={() => onView(reference)}
                          disabled={!reference.isAvailable}
                          className='hover:bg-accent focus:bg-accent'
                        >
                          <Eye className='mr-2 h-4 w-4' />
                          {reference.isAvailable ? t('references.actions.view') : t('common.view')}
                        </DropdownMenuItem>
                        {canEdit && reference.isAvailable && (
                          <DropdownMenuItem
                            onClick={() => onEdit(reference)}
                            className='hover:bg-accent focus:bg-accent'
                          >
                            <Edit className='mr-2 h-4 w-4' />
                            {t('common.edit')}
                          </DropdownMenuItem>
                        )}
                        {hasAnyRole(['ADMIN']) && (
                          <DropdownMenuItem
                            onClick={() => onStatusToggle(reference)}
                            className='hover:bg-accent focus:bg-accent'
                          >
                            {reference.status === 'ACTIVE' ? (
                              <>
                                <XCircle className='mr-2 h-4 w-4' />
                                {t('references.list.deactivate')}
                              </>
                            ) : (
                              <>
                                <CheckCircle className='mr-2 h-4 w-4' />
                                {t('references.list.activate')}
                              </>
                            )}
                          </DropdownMenuItem>
                        )}
                        {canDelete && (
                          <>
                            <Separator />
                            <DropdownMenuItem
                              onClick={() => onDelete(reference)}
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
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};