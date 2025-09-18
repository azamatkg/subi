import React from 'react';
import { SortAsc, SortDesc } from 'lucide-react';
import { TableHead } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';

export type SortDirection = 'asc' | 'desc';

interface SortableTableHeadProps<T extends string = string> {
  field: T;
  currentSortField: string;
  currentSortDirection: SortDirection;
  onSort: (field: T) => void;
  children: React.ReactNode;
  className?: string;
}

export const SortableTableHead = <T extends string = string>({
  field,
  currentSortField,
  currentSortDirection,
  onSort,
  children,
  className,
}: SortableTableHeadProps<T>) => {
  const { t } = useTranslation();

  return (
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
      >
        {children}
        {currentSortField === field ? (
          currentSortDirection === 'asc' ? (
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
};
