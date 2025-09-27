import React from 'react';
import {
  MoreHorizontal,
  Eye,
  Edit,
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
import { SortableTableHead, type SortDirection } from '@/components/ui/sortable-table-head';
import { cn } from '@/lib/utils';

import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/hooks/useAuth';
import type { CurrencyResponseDto } from '@/types/currency';
import type { ReferenceEntityStatus } from '@/types/reference';

type CurrencySortField = 'code' | 'nameEn' | 'nameRu' | 'nameKg' | 'status' | 'createdAt' | 'updatedAt';

interface CurrencyTableProps {
  currencies: CurrencyResponseDto[];
  loading?: boolean;
  sortField: CurrencySortField;
  sortDirection: SortDirection;
  onSort: (field: CurrencySortField) => void;
  onView: (currency: CurrencyResponseDto) => void;
  onEdit: (currency: CurrencyResponseDto) => void;
  onDelete: (currency: CurrencyResponseDto) => void;
  className?: string;
}

export const CurrencyTable: React.FC<CurrencyTableProps> = ({
  currencies,
  loading = false,
  sortField,
  sortDirection,
  onSort,
  onView,
  onEdit,
  onDelete,
  className,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const userRoles = user?.roles || [];
  const canEdit = userRoles.includes('ADMIN');

  const StatusBadge: React.FC<{ status: ReferenceEntityStatus }> = ({ status }) => {
    const getStatusStyle = (status: ReferenceEntityStatus) => {
      switch (status) {
        case 'ACTIVE':
          return 'bg-green-100 text-green-800 border-green-300';
        case 'INACTIVE':
          return 'bg-gray-100 text-gray-800 border-gray-300';
        default:
          return 'bg-gray-100 text-gray-800 border-gray-300';
      }
    };

    return (
      <Badge
        variant="outline"
        className={cn('px-2 py-1 text-xs font-medium', getStatusStyle(status))}
      >
        {t(`references.status.${status.toLowerCase()}`)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('rounded-md border', className)}>
      <Table>
        <TableHeader>
          <TableRow>
            <SortableTableHead
              field="code"
              currentSortField={sortField}
              currentSortDirection={sortDirection}
              onSort={onSort}
            >
              {t('currency.fields.code')}
            </SortableTableHead>

            <SortableTableHead
              field="nameEn"
              currentSortField={sortField}
              currentSortDirection={sortDirection}
              onSort={onSort}
              className="hidden md:table-cell"
            >
              {t('currency.fields.nameEn')}
            </SortableTableHead>

            <SortableTableHead
              field="nameRu"
              currentSortField={sortField}
              currentSortDirection={sortDirection}
              onSort={onSort}
              className="hidden lg:table-cell"
            >
              {t('currency.fields.nameRu')}
            </SortableTableHead>

            <SortableTableHead
              field="nameKg"
              currentSortField={sortField}
              currentSortDirection={sortDirection}
              onSort={onSort}
              className="hidden xl:table-cell"
            >
              {t('currency.fields.nameKg')}
            </SortableTableHead>

            <SortableTableHead
              field="status"
              currentSortField={sortField}
              currentSortDirection={sortDirection}
              onSort={onSort}
            >
              {t('currency.fields.status')}
            </SortableTableHead>

            <SortableTableHead
              field="createdAt"
              currentSortField={sortField}
              currentSortDirection={sortDirection}
              onSort={onSort}
              className="hidden lg:table-cell"
            >
              {t('references.fields.created')}
            </SortableTableHead>

            <TableHead className="w-[50px]">
              <span className="sr-only">{t('common.actions')}</span>
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {currencies.map((currency) => (
            <TableRow key={currency.id} className="hover:bg-gray-50">
              <TableCell className="font-mono font-medium">
                {currency.code}
              </TableCell>

              <TableCell className="hidden md:table-cell">
                {currency.nameEn}
              </TableCell>

              <TableCell className="hidden lg:table-cell">
                {currency.nameRu}
              </TableCell>

              <TableCell className="hidden xl:table-cell">
                {currency.nameKg}
              </TableCell>

              <TableCell>
                <StatusBadge status={currency.status} />
              </TableCell>

              <TableCell className="hidden lg:table-cell text-sm text-gray-500">
                {formatDate(currency.createdAt)}
              </TableCell>

              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      aria-label={t('common.openMenu')}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => onView(currency)}>
                      <Eye className="mr-2 h-4 w-4" />
                      {t('common.view')}
                    </DropdownMenuItem>

                    {canEdit && (
                      <>
                        <DropdownMenuItem onClick={() => onEdit(currency)}>
                          <Edit className="mr-2 h-4 w-4" />
                          {t('common.edit')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete(currency)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          {t('common.delete')}
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

      {currencies.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">{t('currency.messages.noCurrenciesFound')}</p>
        </div>
      )}
    </div>
  );
};