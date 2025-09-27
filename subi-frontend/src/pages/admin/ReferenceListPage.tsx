import React, { useState, useMemo } from 'react';
import {
  Database,
  Grid,
  List,
  SortAsc,
  SortDesc,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { PageSkeleton } from '@/components/ui/skeleton';
import { LiveRegion } from '@/components/ui/focus-trap';
import { ErrorFallback } from '@/components/ui/error-fallback';
import { PaginationControls } from '@/components/ui/pagination-controls';

// Reference components
import { ReferenceCard } from '@/components/references/ReferenceCard';
import { ReferenceTable } from '@/components/references/ReferenceTable';
import { ReferenceFilters } from '@/components/references/ReferenceFilters';

import { useTranslation } from '@/hooks/useTranslation';
import { useSetPageTitle } from '@/hooks/useSetPageTitle';
import { useViewMode } from '@/hooks/useViewMode';
import { useReferenceFilters } from '@/hooks/useReferenceFilters';
import { useReferenceActions } from '@/hooks/useReferenceActions';
import { useAuth } from '@/hooks/useAuth';
import { getFilteredReferenceEntities } from '@/data/referenceEntities';
import { PAGINATION } from '@/constants';
import type { ReferenceListSortField } from '@/types/reference';

type SortDirection = 'asc' | 'desc';

export const ReferenceListPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  useSetPageTitle(t('references.title'));

  // State management using custom hooks
  const { viewMode, setViewMode, isMobile } = useViewMode();
  const {
    filters,
    isFilterOpen,
    setIsFilterOpen,
    filtersApplied,
    hasActiveFilters,
    hasValidationErrors,
    handleFilterChange,
    clearFilters,
    getSearchParams,
  } = useReferenceFilters();
  const {
    deleteDialogOpen,
    selectedReference,
    isDeleting,
    isReferenced,
    referenceCount,
    referencedBy,
    canDelete,
    handleCreate,
    handleView,
    handleEdit,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
    handleStatusToggle,
  } = useReferenceActions();

  // Local state for pagination and sorting
  const [page, setPage] = useState(0);
  const [size, setSize] = useState<number>(PAGINATION.DEFAULT_PAGE_SIZE);
  const [sortField, setSortField] = useState<ReferenceListSortField>('nameEn');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Get filtered data using static data provider
  const referencesData = useMemo(() => {
    return getFilteredReferenceEntities({
      page,
      size,
      sortField,
      sortDirection,
      userRoles: user?.roles || [],
      ...getSearchParams(),
    });
  }, [page, size, sortField, sortDirection, getSearchParams, user?.roles]);

  // No loading state for static data
  const isLoading = false;
  const error = null;

  // Sorting handlers
  const handleSort = (field: ReferenceListSortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setPage(0);
  };

  // Filter change handler that resets page
  const handleFilterChangeWithReset = (
    key: keyof typeof filters,
    value: string | boolean | null
  ) => {
    handleFilterChange(key, value);
    setPage(0);
  };

  // Clear filters handler that resets page
  const handleClearFilters = () => {
    clearFilters();
    setPage(0);
  };

  // Handle loading states
  if (isLoading) {
    return <PageSkeleton />;
  }

  // Handle error states
  if (error) {
    return <ErrorFallback error={error as Error} type='network' />;
  }

  return (
    <div className='space-y-3 sm:space-y-4'>
      <LiveRegion />

      {/* Search and Filter Controls */}
      <ReferenceFilters
        filters={filters}
        isFilterOpen={isFilterOpen}
        filtersApplied={filtersApplied}
        hasValidationErrors={hasValidationErrors}
        onFilterChange={handleFilterChangeWithReset}
        onToggleFilter={() => setIsFilterOpen(!isFilterOpen)}
        onClearFilters={handleClearFilters}
        onCreate={handleCreate}
      />

      {/* Results Section */}
      <div className='bg-transparent rounded-lg'>
        <div className='pb-3 border-b border-border/10'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
            <h2 className='flex items-center gap-4 text-xl font-bold tracking-wide'>
              <div className='h-11 w-11 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 border border-primary-300 flex items-center justify-center shadow-lg'>
                <Database className='h-6 w-6 text-primary-700' />
              </div>
              <span className='text-foreground'>
                {t('references.title')}
              </span>
            </h2>

            {/* View Toggle and Sort Controls */}
            <div className='flex items-center gap-2'>
              {!isMobile && (
                <>
                  <Button
                    variant={viewMode === 'card' ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => setViewMode('card')}
                    aria-label={t('common.cardView')}
                  >
                    <Grid className='h-5 w-5' />
                  </Button>
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => setViewMode('table')}
                    aria-label={t('common.tableView')}
                  >
                    <List className='h-5 w-5' />
                  </Button>
                </>
              )}

              {(viewMode === 'card' || isMobile) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='outline' size='sm'>
                      {sortDirection === 'asc' ? (
                        <SortAsc className='h-4 w-4 mr-2' />
                      ) : (
                        <SortDesc className='h-4 w-4 mr-2' />
                      )}
                      {t(`references.fields.${sortField}`)}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleSort('nameEn')}>
                      <span className='mr-2'>🇺🇸</span>
                      {t('references.fields.nameEn')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSort('nameRu')}>
                      <span className='mr-2'>🇷🇺</span>
                      {t('references.fields.nameRu')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSort('nameKg')}>
                      <span className='mr-2'>🇰🇬</span>
                      {t('references.fields.nameKg')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSort('entityType')}>
                      <Database className='mr-2 h-4 w-4' />
                      {t('references.list.entityType')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSort('status')}>
                      <span className='mr-2'>⚡</span>
                      {t('references.fields.status')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSort('updatedAt')}>
                      <span className='mr-2'>📅</span>
                      {t('references.fields.updated')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>

        <div>
          {!referencesData?.content.length ? (
            <div className='text-center py-12'>
              <div className='space-y-3'>
                <Database className='h-12 w-12 text-muted-foreground mx-auto opacity-50' />
                <div>
                  <p className='text-lg font-medium text-muted-foreground'>
                    {hasActiveFilters
                      ? t('references.messages.noResultsFiltered')
                      : t('references.messages.noResults')
                    }
                  </p>
                  <p className='text-sm text-muted-foreground mt-1'>
                    {filtersApplied > 0
                      ? t('common.tryAdjustingFilters')
                      : t('references.description')
                    }
                  </p>
                </div>
                {filtersApplied > 0 && (
                  <Button
                    variant='outline'
                    onClick={handleClearFilters}
                    className='mt-4'
                  >
                    <X className='mr-2 h-4 w-4' />
                    {t('common.clearFilters')}
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className='space-y-4'>
              {/* Card View (Mobile First) */}
              {(viewMode === 'card' || isMobile) && (
                <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
                  {referencesData.content.map(reference => (
                    <ReferenceCard
                      key={`${reference.entityType}-${reference.id}`}
                      reference={reference}
                      onView={handleView}
                      onEdit={handleEdit}
                      onDelete={handleDeleteClick}
                      onStatusToggle={handleStatusToggle}
                    />
                  ))}
                </div>
              )}

              {/* Table View (Desktop Only) */}
              {viewMode === 'table' && !isMobile && (
                <ReferenceTable
                  references={referencesData.content}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                  onStatusToggle={handleStatusToggle}
                />
              )}

              {/* Pagination */}
              {referencesData.content.length > 0 && (
                <>
                  <Separator className='opacity-30' />
                  <div className='bg-gradient-to-r from-muted/40 to-accent/30 px-6 py-6 rounded-b-lg border-t border-border/10 backdrop-blur-sm'>
                    <PaginationControls
                      data={referencesData}
                      pageSize={size}
                      onPageChange={setPage}
                      onPageSizeChange={newSize => {
                        setSize(newSize);
                        setPage(0);
                      }}
                      entityName={t('references.title').toLowerCase()}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={handleDeleteCancel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('common.confirm')}</DialogTitle>
            <DialogDescription className='space-y-2'>
              <div>
                {t('references.messages.confirmDelete', {
                  item: selectedReference?.nameEn,
                })}
              </div>
              {isReferenced && (
                <div className='p-3 bg-destructive/10 border border-destructive/20 rounded-md'>
                  <p className='text-sm text-destructive font-medium'>
                    {t('references.messages.referenced')}
                  </p>
                  {referenceCount > 0 && (
                    <p className='text-xs text-destructive mt-1'>
                      {t('references.messages.referencedBy', {
                        entities: referencedBy.join(', ')
                      })}
                    </p>
                  )}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className='flex justify-end space-x-2'>
            <Button variant='outline' onClick={handleDeleteCancel}>
              {t('common.cancel')}
            </Button>
            <Button
              variant='destructive'
              onClick={handleDeleteConfirm}
              disabled={isDeleting || !canDelete}
            >
              {isDeleting ? t('common.deleting') : t('common.delete')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};