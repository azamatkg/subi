import React, { useState } from 'react';
import {
  Key,
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
import { PermissionCard } from '@/components/permissions/PermissionCard';
import { PermissionDataTable } from '@/components/permissions/PermissionDataTable';
import { PermissionFilters } from '@/components/permissions/PermissionFilters';
import { PermissionCreateForm } from '@/components/permissions/PermissionCreateForm';
import { PermissionEditForm } from '@/components/permissions/PermissionEditForm';

import { useTranslation } from '@/hooks/useTranslation';
import { useSetPageTitle } from '@/hooks/useSetPageTitle';
import { useViewMode } from '@/hooks/useViewMode';
import { usePermissionFilters } from '@/hooks/usePermissionFilters';
import { usePermissionActions } from '@/hooks/usePermissionActions';
import { useGetPermissionsQuery } from '@/store/api/permissionApi';
import { PAGINATION } from '@/constants';

type SortField = 'name' | 'description' | 'createdAt';
type SortDirection = 'asc' | 'desc';

export const PermissionListPage: React.FC = () => {
  const { t } = useTranslation();
  useSetPageTitle(t('permissionManagement.title'));

  // State management using custom hooks
  const { viewMode, setViewMode, isMobile } = useViewMode();
  const {
    filters,
    isFilterOpen,
    setIsFilterOpen,
    filtersApplied,
    handleFilterChange,
    clearFilters,
  } = usePermissionFilters();
  const {
    deleteDialogOpen,
    editDialogOpen,
    createDialogOpen,
    selectedPermission,
    isDeleting,
    handleCreate,
    handleView,
    handleEdit,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
    handleEditClose,
    handleCreateClose,
  } = usePermissionActions();

  // Local state for pagination and sorting
  const [page, setPage] = useState(0);
  const [size, setSize] = useState<number>(PAGINATION.DEFAULT_PAGE_SIZE);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Build query parameters with filters
  const queryParams = {
    page,
    size,
    sort: `${sortField},${sortDirection}`,
    searchTerm: filters.searchTerm || undefined,
  };

  // API queries
  const {
    data: permissionsData,
    isLoading: permissionsLoading,
    error: permissionsError,
  } = useGetPermissionsQuery(queryParams);

  // Helper functions
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

  const getCategoryCounts = () => {
    if (!permissionsData?.content) return {};
    return permissionsData.content.reduce((acc, permission) => {
      const category = getPermissionCategory(permission.name);
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };

  // Filter permissions by category if a category filter is selected
  const filteredPermissions = filters.category === 'all' || !permissionsData?.content
    ? permissionsData?.content || []
    : permissionsData.content.filter(permission => {
        const category = getPermissionCategory(permission.name);
        return category === filters.category;
      });

  // Apply date filters
  const finalFilteredPermissions = filteredPermissions.filter(permission => {
    if (filters.createdDateFrom && new Date(permission.createdAt) < new Date(filters.createdDateFrom)) {
      return false;
    }
    if (filters.createdDateTo && new Date(permission.createdAt) > new Date(filters.createdDateTo)) {
      return false;
    }
    return true;
  });

  // Sorting handlers
  const handleSort = (field: SortField) => {
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
    value: string
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
  if (permissionsLoading) {
    return <PageSkeleton />;
  }

  // Handle error states
  if (permissionsError) {
    return <ErrorFallback error={permissionsError as Error} type='network' />;
  }

  const categoryCounts = getCategoryCounts();

  return (
    <div className='space-y-3 sm:space-y-4'>
      <LiveRegion />

      {/* Search and Filter Controls */}
      <PermissionFilters
        filters={filters}
        isFilterOpen={isFilterOpen}
        filtersApplied={filtersApplied}
        isMobile={isMobile}
        categoryCounts={categoryCounts}
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
                <Key className='h-6 w-6 text-primary-700' />
              </div>
              <span className='text-foreground'>
                {t('permissionManagement.title')}
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
                      {t(`permissionManagement.fields.${sortField}` as keyof typeof t) || sortField}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleSort('name')}>
                      <Key className='mr-2 h-4 w-4' />
                      {t('permissionManagement.permissionName')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSort('description')}>
                      <Key className='mr-2 h-4 w-4' />
                      {t('permissionManagement.permissionDescription')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSort('createdAt')}>
                      <Key className='mr-2 h-4 w-4' />
                      {t('common.created')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>

        <div>
          {!finalFilteredPermissions.length ? (
            <div className='text-center py-12'>
              <div className='space-y-3'>
                <Key className='h-12 w-12 text-muted-foreground mx-auto opacity-50' />
                <div>
                  <p className='text-lg font-medium text-muted-foreground'>
                    {t('permissionManagement.noPermissions')}
                  </p>
                  <p className='text-sm text-muted-foreground mt-1'>
                    {filtersApplied > 0
                      ? t('common.tryAdjustingFilters')
                      : t('permissionManagement.noPermissionsYet')}
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
                  {finalFilteredPermissions.map(permission => (
                    <PermissionCard
                      key={permission.id}
                      permission={permission}
                      onView={handleView}
                      onEdit={handleEdit}
                      onDelete={handleDeleteClick}
                    />
                  ))}
                </div>
              )}

              {/* Table View (Desktop Only) */}
              {viewMode === 'table' && !isMobile && (
                <PermissionDataTable
                  permissions={finalFilteredPermissions}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                />
              )}

              {/* Pagination */}
              {finalFilteredPermissions.length > 0 && permissionsData && (
                <>
                  <Separator className='opacity-30' />
                  <div className='bg-gradient-to-r from-muted/40 to-accent/30 px-6 py-6 rounded-b-lg border-t border-border/10 backdrop-blur-sm'>
                    <PaginationControls
                      data={permissionsData}
                      pageSize={size}
                      onPageChange={setPage}
                      onPageSizeChange={newSize => {
                        setSize(newSize);
                        setPage(0);
                      }}
                      entityName={t('permissionManagement.permissions').toLowerCase()}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Dialog */}
      <PermissionCreateForm
        open={createDialogOpen}
        onOpenChange={handleCreateClose}
      />

      {/* Edit Dialog */}
      <PermissionEditForm
        permission={selectedPermission}
        open={editDialogOpen}
        onOpenChange={handleEditClose}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={handleDeleteCancel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('common.confirm')}</DialogTitle>
            <DialogDescription>
              {t('permissionManagement.confirmDelete', {
                item: selectedPermission
                  ? `"${selectedPermission.name}"`
                  : t('permissionManagement.permission').toLowerCase(),
              })}
            </DialogDescription>
          </DialogHeader>
          <div className='flex justify-end space-x-2'>
            <Button variant='outline' onClick={handleDeleteCancel}>
              {t('common.cancel')}
            </Button>
            <Button
              variant='destructive'
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? t('common.deleting') : t('common.delete')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};