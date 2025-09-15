import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronsLeft,
  ChevronsRight,
  Edit,
  Eye,
  Menu,
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
import { KeyboardNavigation, announceToScreenReader } from '@/lib/accessibility';
import {
  QuickTooltip
} from '@/components/ui/enhanced-tooltip';
import { VirtualItem, useVirtualScrolling } from '@/hooks/useVirtualScrolling';

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
  enableKeyboardNavigation?: boolean;
  ariaLabel?: string;
  /** Enable virtual scrolling for large datasets */
  enableVirtualScrolling?: boolean;
  /** Row height in pixels for virtual scrolling */
  virtualRowHeight?: number;
  /** Threshold for enabling virtual scrolling */
  virtualScrollThreshold?: number;
  /** Container height for virtual scrolling */
  virtualScrollHeight?: number;
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
  const { t: _t } = useTranslation();

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

// Enhanced mobile-responsive pagination component
const DataTablePagination: React.FC<{
  pagination: DataTablePagination;
  isMobile?: boolean;
}> = ({ pagination, isMobile = false }) => {
  const { t } = useTranslation();
  const {
    page,
    size,
    totalElements,
    totalPages,
    onPageChange,
    onPageSizeChange,
  } = pagination;

  // Filter page size options for mobile
  const pageSizeOptions = isMobile
    ? [10, 20, 50].filter(option => option <= 50)
    : [10, 20, 50, 100];

  if (isMobile) {
    return (
      <div className="flex flex-col gap-4">
        {/* Mobile-first layout */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="text-xs font-medium">Per page:</p>
            <Select
              value={size.toString()}
              onValueChange={(value) => onPageSizeChange(parseInt(value, 10))}
            >
              <SelectTrigger className="h-8 w-[60px] touch-manipulation">
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

          <div className="text-xs text-muted-foreground text-center">
            {t('common.showing')} {totalElements} total
          </div>
        </div>

        {/* Mobile pagination controls */}
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium">
            Page {page + 1} of {totalPages}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              className="h-9 w-9 p-0 touch-manipulation"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 0}
              aria-label={t('common.previous')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-9 w-9 p-0 touch-manipulation"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages - 1}
              aria-label={t('common.next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Desktop layout (existing)
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

// Main DataTable component with mobile responsiveness and virtual scrolling
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
  enableKeyboardNavigation = true,
  ariaLabel,
  enableVirtualScrolling = true,
  virtualRowHeight = 65,
  virtualScrollThreshold = 100,
  virtualScrollHeight = 600,
}: DataTableProps<T>) {
  const { t } = useTranslation();

  // Selection state - memoized to avoid infinite loops
  const selectedIds = useMemo(() => selection?.selectedIds || [], [selection?.selectedIds]);

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileActions, setShowMobileActions] = useState<string | null>(null);

  // Keyboard navigation state
  const [focusedRowIndex, setFocusedRowIndex] = useState(-1);
  const tableRef = useRef<HTMLTableElement>(null);
  const lastAnnouncementTime = useRef(0);

  // Virtual scrolling
  const shouldUseVirtualScrolling = enableVirtualScrolling && !isMobile && data.length >= virtualScrollThreshold;
  const virtualScrolling = useVirtualScrolling(data, {
    itemHeight: virtualRowHeight,
    threshold: virtualScrollThreshold,
    containerHeight: virtualScrollHeight,
    overscan: 5,
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
  const handleRowSelection = useCallback((itemId: string, checked: boolean) => {
    if (!selection) {return;}

    let newSelection: string[];
    if (checked) {
      newSelection = [...selection.selectedIds, itemId];
    } else {
      newSelection = selection.selectedIds.filter((id) => id !== itemId);
    }
    selection.onSelectionChange(newSelection);
  }, [selection]);

  // Handle sorting with keyboard support
  const handleSort = (field: string) => {
    if (!sorting) {return;}

    const newDirection =
      sorting.field === field && sorting.direction === 'asc' ? 'desc' : 'asc';
    sorting.onSortChange(field, newDirection);

    // Announce sort change to screen readers
    const now = Date.now();
    if (now - lastAnnouncementTime.current > 1000) {
      const column = columns.find(col => col.id === field);
      const directionText = newDirection === 'asc' ? 'ascending' : 'descending';
      announceToScreenReader(
        `Table sorted by ${column?.label} in ${directionText} order`,
        'polite'
      );
      lastAnnouncementTime.current = now;
    }
  };

  // Get sort icon with accessibility
  const getSortIcon = (columnId: string) => {
    if (!sorting || sorting.field !== columnId) {
      return <ChevronDown className="ml-2 h-4 w-4 opacity-50" aria-hidden="true" />;
    }
    return sorting.direction === 'asc' ? (
      <ChevronUp className="ml-2 h-4 w-4" aria-hidden="true" />
    ) : (
      <ChevronDown className="ml-2 h-4 w-4" aria-hidden="true" />
    );
  };

  // Keyboard navigation handlers
  const handleTableKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!enableKeyboardNavigation || data.length === 0) {
      return;
    }

    const isNavigationKey = KeyboardNavigation.isNavigationKey(e.key);
    const isActionKey = KeyboardNavigation.isActionKey(e.key);

    if (!isNavigationKey && !isActionKey) {
      return;
    }

    e.preventDefault();

    switch (e.key) {
      case 'ArrowDown':
        setFocusedRowIndex(prev => {
          const newIndex = prev < data.length - 1 ? prev + 1 : prev;
          return newIndex;
        });
        break;
      case 'ArrowUp':
        setFocusedRowIndex(prev => {
          const newIndex = prev > 0 ? prev - 1 : prev;
          return newIndex;
        });
        break;
      case 'Home':
        setFocusedRowIndex(0);
        break;
      case 'End':
        setFocusedRowIndex(data.length - 1);
        break;
      case 'Enter':
      case ' ':
        if (focusedRowIndex >= 0 && focusedRowIndex < data.length) {
          const focusedItem = data[focusedRowIndex];
          if (e.key === ' ' && selection) {
            // Toggle selection with spacebar
            const isSelected = selection.selectedIds.includes(focusedItem.id);
            handleRowSelection(focusedItem.id, !isSelected);
          } else if (e.key === 'Enter' && onRowClick) {
            // Activate row with enter
            onRowClick(focusedItem);
          }
        }
        break;
    }
  }, [enableKeyboardNavigation, data, focusedRowIndex, selection, onRowClick, handleRowSelection]);

  // Handle bulk selection with Ctrl+A
  const handleKeyboardBulkSelect = useCallback((e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'a' && selection) {
      e.preventDefault();
      const allIds = data.map(item => item.id);
      selection.onSelectionChange(allIds);
      announceToScreenReader(
        `Selected all ${data.length} items`,
        'polite'
      );
    }
  }, [data, selection]);

  // Update focused row element
  useEffect(() => {
    if (focusedRowIndex >= 0 && tableRef.current) {
      const rows = tableRef.current.querySelectorAll('[data-row-index]');
      const targetRow = rows[focusedRowIndex] as HTMLElement;
      if (targetRow) {
        targetRow.focus();
      }
    }
  }, [focusedRowIndex]);

  // Render virtual table row - moved before early returns
  const renderVirtualTableRow = useCallback((item: T, index: number, virtualItem: VirtualItem) => {
    return (
      <TableRow
        key={item.id}
        data-row-index={index}
        className={cn(
          'cursor-pointer focus:ring-2 focus:ring-primary/50 focus:outline-none absolute left-0 right-0',
          selectedIds.includes(item.id) && 'bg-muted/50',
          focusedRowIndex === index && 'bg-accent/50'
        )}
        style={{
          top: virtualItem.offsetTop,
          height: virtualItem.height,
        }}
        onClick={() => onRowClick?.(item)}
        onKeyDown={handleKeyboardBulkSelect}
        tabIndex={enableKeyboardNavigation ? 0 : -1}
        role="row"
        aria-selected={selectedIds.includes(item.id)}
        aria-rowindex={index + 2}
      >
        {selection && (
          <TableCell role="cell" className="h-full flex items-center">
            <Checkbox
              checked={selectedIds.includes(item.id)}
              onCheckedChange={(checked) =>
                handleRowSelection(item.id, checked as boolean)
              }
              aria-label={`Select row ${index + 1}`}
              onClick={(e) => e.stopPropagation()}
              tabIndex={-1}
            />
          </TableCell>
        )}
        {columns.map((column, _colIndex) => (
          <TableCell
            key={column.id}
            role="cell"
            aria-describedby={`col-${column.id}-header`}
            className="h-full flex items-center"
          >
            <div className="truncate w-full">
              {column.render
                ? column.render(item)
                : (item[column.key as keyof T] as React.ReactNode)
              }
            </div>
          </TableCell>
        ))}
        <TableCell className="h-full flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <QuickTooltip content={t('common.actions')}>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={(e) => e.stopPropagation()}
                  aria-label={t('common.actions', { item: item.id })}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </QuickTooltip>
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
    );
  }, [selectedIds, focusedRowIndex, selection, columns, handleRowSelection, onRowClick, handleKeyboardBulkSelect, enableKeyboardNavigation, onRowAction, t]);

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

  const allSelected = selectedIds.length === data.length && data.length > 0;
  const someSelected = selectedIds.length > 0 && selectedIds.length < data.length;

  // Mobile-optimized table with horizontal scroll and responsive features
  if (isMobile) {
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

        {/* Mobile table with horizontal scroll */}
        <div className="-mx-4 sm:mx-0">
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      {selection && (
                        <th scope="col" className="sticky left-0 z-10 bg-gray-50 px-3 py-3 text-left">
                          <Checkbox
                            checked={allSelected}
                            ref={(el) => {
                              if (el) {el.indeterminate = someSelected;}
                            }}
                            onCheckedChange={handleSelectAll}
                            aria-label={t('common.selectAll')}
                            className="touch-manipulation"
                          />
                        </th>
                      )}
                      {/* Show only the first few columns on mobile */}
                      {columns.slice(0, 2).map((column) => (
                        <th
                          key={column.id}
                          scope="col"
                          className={cn(
                            'px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                            column.id === columns[0].id && selection && 'sticky left-10 z-10 bg-gray-50'
                          )}
                        >
                          {column.sortable ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="-ml-2 h-6 text-xs touch-manipulation"
                              onClick={() => handleSort(column.id)}
                              aria-label={t('common.sortBy', { field: column.label })}
                            >
                              <span className="truncate">{column.label}</span>
                              {getSortIcon(column.id)}
                            </Button>
                          ) : (
                            <span className="truncate">{column.label}</span>
                          )}
                        </th>
                      ))}
                      <th scope="col" className="relative px-3 py-3">
                        <span className="sr-only">{t('common.actions')}</span>
                        <Menu className="h-4 w-4 text-gray-400" />
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((item) => (
                      <tr
                        key={item.id}
                        className={cn(
                          'hover:bg-gray-50 touch-manipulation',
                          selectedIds.includes(item.id) && 'bg-blue-50'
                        )}
                        onClick={() => onRowClick?.(item)}
                      >
                        {selection && (
                          <td className="sticky left-0 z-10 bg-white px-3 py-4">
                            <Checkbox
                              checked={selectedIds.includes(item.id)}
                              onCheckedChange={(checked) =>
                                handleRowSelection(item.id, checked as boolean)
                              }
                              aria-label={`Select ${item.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="touch-manipulation"
                            />
                          </td>
                        )}
                        {columns.slice(0, 2).map((column, index) => (
                          <td
                            key={column.id}
                            className={cn(
                              'px-3 py-4 text-sm',
                              index === 0 && selection && 'sticky left-10 z-10 bg-white'
                            )}
                          >
                            <div className="max-w-[150px] truncate">
                              {column.render
                                ? column.render(item)
                                : (item[column.key as keyof T] as React.ReactNode)
                              }
                            </div>
                          </td>
                        ))}
                        <td className="px-3 py-4 text-right text-sm font-medium">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 p-0 touch-manipulation"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowMobileActions(showMobileActions === item.id ? null : item.id);
                            }}
                            aria-label={t('common.actions', { item: item.id })}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>

                          {/* Mobile action menu */}
                          {showMobileActions === item.id && (
                            <div className="absolute right-2 mt-1 w-32 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-20">
                              <div className="py-1">
                                <button
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 touch-manipulation"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onRowAction?.('view', item);
                                    setShowMobileActions(null);
                                  }}
                                >
                                  <Eye className="inline mr-2 h-4 w-4" />
                                  {t('common.view')}
                                </button>
                                <button
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 touch-manipulation"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onRowAction?.('edit', item);
                                    setShowMobileActions(null);
                                  }}
                                >
                                  <Edit className="inline mr-2 h-4 w-4" />
                                  {t('common.edit')}
                                </button>
                                <button
                                  className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 touch-manipulation"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onRowAction?.('delete', item);
                                    setShowMobileActions(null);
                                  }}
                                >
                                  <Trash className="inline mr-2 h-4 w-4" />
                                  {t('common.delete')}
                                </button>
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile pagination */}
        {pagination && (
          <div className="px-2">
            <DataTablePagination pagination={pagination} isMobile={true} />
          </div>
        )}
      </div>
    );
  }


  // Desktop version with virtual scrolling support
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
        {shouldUseVirtualScrolling ? (
          /* Virtual Scrolling Table */
          <div className="relative">
            {/* Table Header */}
            <Table
              aria-label={ariaLabel || t('common.dataTable')}
              role="table"
              aria-rowcount={data.length + 1}
              aria-colcount={columns.length + (selection ? 1 : 0) + 1}
            >
              <TableHeader className="sticky top-0 z-10 bg-background">
                <TableRow>
                  {selection && (
                    <TableHead className="w-[50px]">
                      <QuickTooltip
                        content={t('userManagement.tooltips.dataTable.selection.header')}
                      >
                        <Checkbox
                          checked={allSelected}
                          ref={(el) => {
                            if (el) {el.indeterminate = someSelected;}
                          }}
                          onCheckedChange={handleSelectAll}
                          aria-label={t('common.selectAll')}
                        />
                      </QuickTooltip>
                    </TableHead>
                  )}
                  {columns.map((column, _colIndex) => (
                    <TableHead
                      key={column.id}
                      className={cn(
                        sorting?.field === column.id && 'bg-muted/50'
                      )}
                      role="columnheader"
                      aria-sort={sorting?.field === column.id ?
                        (sorting.direction === 'asc' ? 'ascending' : 'descending') :
                        (column.sortable ? 'none' : undefined)
                      }
                    >
                      {column.sortable ? (
                        <QuickTooltip
                          content={`${t('userManagement.tooltips.dataTable.sorting.description')} ${sorting?.field === column.id ?
                            `(${sorting.direction === 'asc' ? 'ascending' : 'descending'})` :
                            ''}`}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="-ml-3 h-8 data-[state=open]:bg-accent"
                            onClick={() => handleSort(column.id)}
                            onKeyDown={(e) => {
                              if (KeyboardNavigation.isActionKey(e.key)) {
                                e.preventDefault();
                                handleSort(column.id);
                              }
                            }}
                            aria-label={`Sort by ${column.label}. Current sort: ${sorting?.field === column.id ?
                              (sorting.direction === 'asc' ? 'ascending' : 'descending') :
                              'none'}`}
                            tabIndex={0}
                          >
                            <span>{column.label}</span>
                            {getSortIcon(column.id)}
                          </Button>
                        </QuickTooltip>
                      ) : (
                        <span role="presentation">{column.label}</span>
                      )}
                    </TableHead>
                  ))}
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
            </Table>

            {/* Virtual Scrolling Container */}
            <div
              ref={virtualScrolling.containerRef}
              className="overflow-auto"
              style={{
                height: virtualScrollHeight,
                position: 'relative',
              }}
              onKeyDown={handleTableKeyDown}
              tabIndex={enableKeyboardNavigation ? 0 : -1}
              aria-label="Virtual scrolling table content"
            >
              <div
                ref={virtualScrolling.totalHeightRef}
                style={{
                  height: virtualScrolling.totalHeight,
                  position: 'relative',
                }}
              >
                <table className="w-full">
                  <tbody className="relative">
                    {virtualScrolling.virtualItems.map((virtualItem) => {
                      const item = data[virtualItem.index];
                      if (!item) {return null;}
                      return renderVirtualTableRow(item, virtualItem.index, virtualItem);
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Virtual scrolling info */}
            <div className="p-2 text-xs text-muted-foreground border-t bg-muted/30">
              Showing {virtualScrolling.virtualItems.length} of {data.length} rows
              {virtualScrolling.isVirtual && ' (Virtual scrolling active)'}
            </div>
          </div>
        ) : (
          /* Standard Table */
          <Table
            ref={tableRef}
            aria-label={ariaLabel || t('common.dataTable')}
            onKeyDown={handleTableKeyDown}
            tabIndex={enableKeyboardNavigation ? 0 : -1}
            role="table"
            aria-rowcount={data.length + 1}
            aria-colcount={columns.length + (selection ? 1 : 0) + 1}
          >
            <TableHeader>
              <TableRow>
                {selection && (
                  <TableHead className="w-[50px]">
                    <QuickTooltip
                      content={t('userManagement.tooltips.dataTable.selection.header')}
                    >
                      <Checkbox
                        checked={allSelected}
                        ref={(el) => {
                          if (el) {el.indeterminate = someSelected;}
                        }}
                        onCheckedChange={handleSelectAll}
                        aria-label={t('common.selectAll')}
                      />
                    </QuickTooltip>
                  </TableHead>
                )}
                {columns.map((column, _colIndex) => (
                  <TableHead
                    key={column.id}
                    className={cn(
                      sorting?.field === column.id && 'bg-muted/50'
                    )}
                    role="columnheader"
                    aria-sort={sorting?.field === column.id ?
                      (sorting.direction === 'asc' ? 'ascending' : 'descending') :
                      (column.sortable ? 'none' : undefined)
                    }
                  >
                    {column.sortable ? (
                      <QuickTooltip
                        content={`${t('userManagement.tooltips.dataTable.sorting.description')} ${sorting?.field === column.id ?
                          `(${sorting.direction === 'asc' ? 'ascending' : 'descending'})` :
                          ''}`}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="-ml-3 h-8 data-[state=open]:bg-accent"
                          onClick={() => handleSort(column.id)}
                          onKeyDown={(e) => {
                            if (KeyboardNavigation.isActionKey(e.key)) {
                              e.preventDefault();
                              handleSort(column.id);
                            }
                          }}
                          aria-label={`Sort by ${column.label}. Current sort: ${sorting?.field === column.id ?
                            (sorting.direction === 'asc' ? 'ascending' : 'descending') :
                            'none'}`}
                          tabIndex={0}
                        >
                          <span>{column.label}</span>
                          {getSortIcon(column.id)}
                        </Button>
                      </QuickTooltip>
                    ) : (
                      <span role="presentation">{column.label}</span>
                    )}
                  </TableHead>
                ))}
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, rowIndex) => (
                <TableRow
                  key={item.id}
                  data-row-index={rowIndex}
                  className={cn(
                    'cursor-pointer focus:ring-2 focus:ring-primary/50 focus:outline-none',
                    selectedIds.includes(item.id) && 'bg-muted/50',
                    focusedRowIndex === rowIndex && 'bg-accent/50'
                  )}
                  onClick={() => onRowClick?.(item)}
                  onKeyDown={handleKeyboardBulkSelect}
                  tabIndex={enableKeyboardNavigation ? 0 : -1}
                  role="row"
                  aria-selected={selectedIds.includes(item.id)}
                  aria-rowindex={rowIndex + 2}
                >
                  {selection && (
                    <TableCell role="cell">
                      <Checkbox
                        checked={selectedIds.includes(item.id)}
                        onCheckedChange={(checked) =>
                          handleRowSelection(item.id, checked as boolean)
                        }
                        aria-label={`Select row ${rowIndex + 1}`}
                        onClick={(e) => e.stopPropagation()}
                        tabIndex={-1}
                      />
                    </TableCell>
                  )}
                  {columns.map((column, _colIndex) => (
                    <TableCell
                      key={column.id}
                      role="cell"
                      aria-describedby={`col-${column.id}-header`}
                    >
                      {column.render
                        ? column.render(item)
                        : (item[column.key as keyof T] as React.ReactNode)
                      }
                    </TableCell>
                  ))}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <QuickTooltip content={t('common.actions')}>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={(e) => e.stopPropagation()}
                            aria-label={t('common.actions', { item: item.id })}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </QuickTooltip>
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
        )}
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