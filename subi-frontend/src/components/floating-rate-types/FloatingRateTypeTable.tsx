import React from 'react';
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash,
  TrendingUp,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { SortableTableHead } from '@/components/ui/sortable-table-head';
import { cn } from '@/lib/utils';

import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/hooks/useAuth';
import type { FloatingRateTypeResponseDto, FloatingRateCalculationType } from '@/types/floatingRateType';
import type { ReferenceEntityStatus } from '@/types/reference';
import type { SortDirection } from '@/types/reference';

interface FloatingRateTypeTableProps {
  floatingRateTypes: FloatingRateTypeResponseDto[];
  onView: (floatingRateType: FloatingRateTypeResponseDto) => void;
  onEdit: (floatingRateType: FloatingRateTypeResponseDto) => void;
  onDelete: (floatingRateType: FloatingRateTypeResponseDto) => void;
  onSort?: (field: string, direction: SortDirection) => void;
  sortField?: string;
  sortDirection?: SortDirection;
  loading?: boolean;
  className?: string;
}

export const FloatingRateTypeTable: React.FC<FloatingRateTypeTableProps> = ({
  floatingRateTypes,
  onView,
  onEdit,
  onDelete,
  onSort,
  sortField,
  sortDirection,
  loading = false,
  className,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const userRoles = user?.roles || [];
  const canEdit = userRoles.includes('ADMIN');
  const canDelete = userRoles.includes('ADMIN');

  const getStatusBadgeColor = (status: ReferenceEntityStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'INACTIVE':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getRateCalculationTypeBadgeColor = (type: FloatingRateCalculationType) => {
    switch (type) {
      case 'FIXED_SPREAD':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'VARIABLE_SPREAD':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'BASE_RATE_PLUS':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'MARKET_LINKED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'INDEXED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'TIERED':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatSpreadRange = (min?: number, max?: number) => {
    if (min !== undefined && max !== undefined) {
      return `${min}% - ${max}%`;
    }
    if (min !== undefined) {
      return `${min}%+`;
    }
    if (max !== undefined) {
      return `≤${max}%`;
    }
    return '-';
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('rounded-md border', className)}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <TrendingUp className="h-4 w-4 text-gray-500" />
            </TableHead>
            <SortableTableHead
              field="nameEn"
              onSort={(field) => onSort?.(field, sortDirection === 'asc' ? 'desc' : 'asc')}
              currentSortField={sortField || ''}
              currentSortDirection={sortDirection || 'asc'}
              className="min-w-[200px]"
            >
              {t('floatingRateType.fields.name')}
            </SortableTableHead>
            <SortableTableHead
              field="rateCalculationType"
              onSort={(field) => onSort?.(field, sortDirection === 'asc' ? 'desc' : 'asc')}
              currentSortField={sortField || ''}
              currentSortDirection={sortDirection || 'asc'}
              className="min-w-[160px]"
            >
              {t('floatingRateType.fields.rateCalculationType')}
            </SortableTableHead>
            <TableHead className="min-w-[120px]">
              {t('floatingRateType.fields.spreadRange')}
            </TableHead>
            <TableHead className="min-w-[200px] hidden lg:table-cell">
              {t('floatingRateType.fields.baseRateDescription')}
            </TableHead>
            <SortableTableHead
              field="status"
              onSort={(field) => onSort?.(field, sortDirection === 'asc' ? 'desc' : 'asc')}
              currentSortField={sortField || ''}
              currentSortDirection={sortDirection || 'asc'}
              className="min-w-[100px]"
            >
              {t('common.status')}
            </SortableTableHead>
            <SortableTableHead
              field="updatedAt"
              onSort={(field) => onSort?.(field, sortDirection === 'asc' ? 'desc' : 'asc')}
              currentSortField={sortField || ''}
              currentSortDirection={sortDirection || 'asc'}
              className="min-w-[120px] hidden md:table-cell"
            >
              {t('common.updated')}
            </SortableTableHead>
            <TableHead className="w-12">
              <span className="sr-only">{t('common.actions')}</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {floatingRateTypes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                {t('floatingRateType.messages.noResults')}
              </TableCell>
            </TableRow>
          ) : (
            floatingRateTypes.map((floatingRateType) => (
              <TableRow
                key={floatingRateType.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => onView(floatingRateType)}
              >
                <TableCell>
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium text-gray-900">
                      {floatingRateType.nameEn}
                    </div>
                    <div className="text-sm text-gray-600">
                      {floatingRateType.nameRu}
                    </div>
                    <div className="text-xs text-gray-500 lg:hidden">
                      {floatingRateType.nameKg}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn("text-xs", getRateCalculationTypeBadgeColor(floatingRateType.rateCalculationType))}
                  >
                    {t(`floatingRateType.rateCalculationTypes.${floatingRateType.rateCalculationType.toLowerCase()}`)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-medium">
                    {formatSpreadRange(floatingRateType.spreadMin, floatingRateType.spreadMax)}
                  </span>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="max-w-[200px] truncate text-sm text-gray-600">
                    {floatingRateType.baseRateDescription || '-'}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn("text-xs", getStatusBadgeColor(floatingRateType.status))}
                  >
                    {t(`references.status.${floatingRateType.status.toLowerCase()}`)}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="text-sm text-gray-600">
                    {new Date(floatingRateType.updatedAt).toLocaleDateString()}
                  </div>
                  {floatingRateType.updatedByUsername && (
                    <div className="text-xs text-gray-500">
                      {floatingRateType.updatedByUsername}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">{t('common.openMenu')}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onView(floatingRateType);
                        }}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        {t('common.view')}
                      </DropdownMenuItem>
                      {canEdit && (
                        <>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(floatingRateType);
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            {t('common.edit')}
                          </DropdownMenuItem>
                          {canDelete && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDelete(floatingRateType);
                                }}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                {t('common.delete')}
                              </DropdownMenuItem>
                            </>
                          )}
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};