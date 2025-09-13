import React from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronsLeft,
  ChevronsRight,
  Edit,
  Eye,
  MoreHorizontal,
  Trash,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';

// Types
export interface DataTableColumn<T> {
  id: string;
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (item: T) => React.ReactNode;
}

export interface DataTablePagination {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export interface DataTableSorting {
  field: string;
  direction: 'asc' | 'desc';
  onSortChange: (field: string, direction: 'asc' | 'desc') => void;
}

export interface DataTableBulkAction {
  id: string;
  label: string;
  action: (selectedIds: string[]) => void;
}

export interface DataTableSelection {
  selectedIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  bulkActions?: DataTableBulkAction[];
}

export interface DataTableProps<T extends { id: string }> {
  data: T[];
  columns: DataTableColumn<T>[];
  loading?: boolean;
  pagination?: DataTablePagination;
  sorting?: DataTableSorting;
  selection?: DataTableSelection;
  onRowClick?: (item: T) => void;
  onRowAction?: (action: string, item: T) => void;
  className?: string;
}

// Loading skeleton component
const LoadingSkeleton: React.FC<{ columns: number; rows?: number }> = ({
  columns,
  rows = 5,
}) => (
  <div className="animate-pulse">
    <div className="flex space-x-4 mb-4">
      <div className="h-4 bg-slate-300 rounded w-24"></div>
      <div className="h-4 bg-slate-300 rounded w-32"></div>
      <div className="h-4 bg-slate-300 rounded w-28"></div>
    </div>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-4 mb-2">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <div
            key={colIndex}
            className="h-4 bg-slate-200 rounded flex-1"
          ></div>
        ))}
      </div>
    ))}
  </div>
);

// Bulk actions toolbar
const BulkActionsToolbar: React.FC<{
  selectedCount: number;
  bulkActions: DataTableBulkAction[];
  selectedIds: string[];
  onClearSelection: () => void;
}> = ({ selectedCount, bulkActions, selectedIds, onClearSelection }) => {
  const { t } = useTranslation();

  if (selectedCount === 0) {return null;}

  return (
    <div className="flex items-center justify-between p-4 bg-muted/50 border-b">
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium">
          {selectedCount} items selected
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={onClearSelection}
          className="h-8"
        >
          Clear
        </Button>
      </div>
      <div className="flex items-center space-x-2">
        {bulkActions.map((action) => (
          <Button
            key={action.id}
            variant="outline"
            size="sm"
            onClick={() => action.action(selectedIds)}
            className="h-8"
          >
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

// Pagination component
const DataTablePagination: React.FC<{ pagination: DataTablePagination }> = ({
  pagination,
}) => {
  const { t } = useTranslation();
  const {
    page,
    size,
    totalElements,
    totalPages,
    onPageChange,
    onPageSizeChange,
  } = pagination;

  const pageSizeOptions = [10, 20, 50, 100];

  return (
    <div className="flex items-center justify-between space-x-6 lg:space-x-8">
      <div className="flex items-center space-x-2">
        <p className="text-sm font-medium">{t('common.rowsPerPage')}</p>
        <Select
          value={size.toString()}
          onValueChange={(value) => onPageSizeChange(parseInt(value, 10))}
        >
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent side="top">
            {pageSizeOptions.map((pageSize) => (
              <SelectItem key={pageSize} value={pageSize.toString()}>
                {pageSize}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          {t('common.showing')} {totalElements} {t('common.of')} {totalElements}
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex w-[120px] items-center justify-center text-sm font-medium">
            {t('common.page')} {page + 1} {t('common.of')} {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => onPageChange(0)}
              disabled={page === 0}
              aria-label={t('common.first')}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 0}
              aria-label={t('common.previous')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages - 1}
              aria-label={t('common.next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => onPageChange(totalPages - 1)}
              disabled={page >= totalPages - 1}
              aria-label={t('common.last')}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main DataTable component
export function DataTable<T extends { id: string }>({
  data,
  columns,
  loading = false,
  pagination,
  sorting,
  selection,
  onRowClick,
  onRowAction,
  className,
}: DataTableProps<T>) {
  const { t } = useTranslation();

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (!selection) {return;}

    if (checked) {
      const allIds = data.map((item) => item.id);
      selection.onSelectionChange(allIds);
    } else {
      selection.onSelectionChange([]);
    }
  };

  // Handle individual row selection
  const handleRowSelection = (itemId: string, checked: boolean) => {
    if (!selection) {return;}

    let newSelection: string[];
    if (checked) {
      newSelection = [...selection.selectedIds, itemId];
    } else {
      newSelection = selection.selectedIds.filter((id) => id !== itemId);
    }
    selection.onSelectionChange(newSelection);
  };

  // Handle sorting
  const handleSort = (field: string) => {
    if (!sorting) {return;}

    const newDirection =
      sorting.field === field && sorting.direction === 'asc' ? 'desc' : 'asc';
    sorting.onSortChange(field, newDirection);
  };

  // Get sort icon
  const getSortIcon = (columnId: string) => {
    if (!sorting || sorting.field !== columnId) {
      return <ChevronDown className="ml-2 h-4 w-4 opacity-50" />;
    }
    return sorting.direction === 'asc' ? (
      <ChevronUp className="ml-2 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-2 h-4 w-4" />
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className={cn('space-y-4', className)}>
        <LoadingSkeleton columns={columns.length} />
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {selection && (
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={false}
                      onCheckedChange={() => {}}
                      aria-label={t('common.selectAll')}
                    />
                  </TableHead>
                )}
                {columns.map((column) => (
                  <TableHead key={column.id}>{column.label}</TableHead>
                ))}
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell
                  colSpan={columns.length + (selection ? 1 : 0) + 1}
                  className="h-24 text-center"
                >
                  {t('common.noResults')}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  const selectedIds = selection?.selectedIds || [];
  const allSelected = selectedIds.length === data.length && data.length > 0;
  const someSelected = selectedIds.length > 0 && selectedIds.length < data.length;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Bulk actions toolbar */}
      {selection && selection.bulkActions && (
        <BulkActionsToolbar
          selectedCount={selectedIds.length}
          bulkActions={selection.bulkActions}
          selectedIds={selectedIds}
          onClearSelection={() => selection.onSelectionChange([])}
        />
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table aria-label="Data table">
          <TableHeader>
            <TableRow>
              {selection && (
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={allSelected}
                    ref={(el) => {
                      if (el) {el.indeterminate = someSelected;}
                    }}
                    onCheckedChange={handleSelectAll}
                    aria-label={t('common.selectAll')}
                  />
                </TableHead>
              )}
              {columns.map((column) => (
                <TableHead
                  key={column.id}
                  className={cn(
                    sorting?.field === column.id && 'bg-muted/50'
                  )}
                >
                  {column.sortable ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-3 h-8 data-[state=open]:bg-accent"
                      onClick={() => handleSort(column.id)}
                      aria-label={t('common.sortBy', { field: column.label })}
                    >
                      <span>{column.label}</span>
                      {getSortIcon(column.id)}
                    </Button>
                  ) : (
                    column.label
                  )}
                </TableHead>
              ))}
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow
                key={item.id}
                className={cn(
                  'cursor-pointer',
                  selectedIds.includes(item.id) && 'bg-muted/50'
                )}
                onClick={() => onRowClick?.(item)}
              >
                {selection && (
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(item.id)}
                      onCheckedChange={(checked) =>
                        handleRowSelection(item.id, checked as boolean)
                      }
                      aria-label={`Select ${item.id}`}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>
                )}
                {columns.map((column) => (
                  <TableCell key={column.id}>
                    {column.render
                      ? column.render(item)
                      : (item[column.key as keyof T] as React.ReactNode)
                    }
                  </TableCell>
                ))}
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={(e) => e.stopPropagation()}
                        aria-label={t('common.actions', { item: item.id })}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onRowAction?.('view', item);
                        }}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        {t('common.view')}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onRowAction?.('edit', item);
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        {t('common.edit')}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onRowAction?.('delete', item);
                        }}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        {t('common.delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="px-2">
          <DataTablePagination pagination={pagination} />
        </div>
      )}
    </div>
  );
}