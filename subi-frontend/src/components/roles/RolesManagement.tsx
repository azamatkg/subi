import React, { useState } from 'react';
import {
  Shield,
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
import { Separator } from '@/components/ui/separator';
import { PageSkeleton } from '@/components/ui/skeleton';
import { LiveRegion } from '@/components/ui/focus-trap';
import { ErrorFallback } from '@/components/ui/error-fallback';
import { PaginationControls } from '@/components/ui/pagination-controls';
import { RoleCard } from './RoleCard';
import { RoleDataTable } from './RoleDataTable';
import { RoleFilters } from './RoleFilters';
import { RoleEditForm } from './RoleEditForm';
import { RoleDeleteDialog } from './RoleDeleteDialog';

import { useTranslation } from '@/hooks/useTranslation';
import { useViewMode } from '@/hooks/useViewMode';
import { useGetRolesQuery } from '@/store/api/roleApi';
import { RoleResponseDto } from '@/types/role';
import { PAGINATION } from '@/constants';

type SortField = 'name' | 'createdAt' | 'permissions';
type SortDirection = 'asc' | 'desc';

interface RoleFilterState {
  searchTerm: string;
  roleType: 'all' | 'system' | 'custom';
  permissionCountMin: string;
  permissionCountMax: string;
}

export const RolesManagement: React.FC = () => {
  const { t } = useTranslation();

  // View mode and responsive state
  const { viewMode, setViewMode, isMobile } = useViewMode();

  // Filter state
  const [filters, setFilters] = useState<RoleFilterState>({
    searchTerm: '',
    roleType: 'all',
    permissionCountMin: '',
    permissionCountMax: '',
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Pagination and sorting
  const [page, setPage] = useState(0);
  const [size, setSize] = useState<number>(PAGINATION.DEFAULT_PAGE_SIZE);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Dialog state
  const [selectedRole, setSelectedRole] = useState<RoleResponseDto | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Build query parameters with filters
  const queryParams = {
    page,
    size,
    sort: `${sortField},${sortDirection}`,
    searchTerm: filters.searchTerm || undefined,
  };

  const { data: rolesData, isLoading, error } = useGetRolesQuery(queryParams);


  // Filter and sorting handlers
  const handleFilterChange = (key: keyof RoleFilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const handleClearFilters = () => {
    setFilters({
      searchTerm: '',
      roleType: 'all',
      permissionCountMin: '',
      permissionCountMax: '',
    });
    setPage(0);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setPage(0);
  };

  // Role action handlers
  const handleEdit = (role: RoleResponseDto) => {
    setSelectedRole(role);
    setEditDialogOpen(true);
  };

  const handleDelete = (role: RoleResponseDto) => {
    setSelectedRole(role);
    setDeleteDialogOpen(true);
  };

  const handleCreate = () => {
    // This will be handled by the RoleCreateForm trigger button
  };

  // Calculate applied filters count
  const filtersApplied = Object.values(filters).filter(value =>
    value !== '' && value !== 'all'
  ).length;

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
      <RoleFilters
        filters={filters}
        isFilterOpen={isFilterOpen}
        filtersApplied={filtersApplied}
        isMobile={isMobile}
        onFilterChange={handleFilterChange}
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
                <Shield className='h-6 w-6 text-primary-700' />
              </div>
              <span className='text-foreground'>
                {t('roleManagement.title')}
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
                      {t(`roleManagement.fields.${sortField}`)}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleSort('name')}>
                      <Shield className='mr-2 h-4 w-4' />
                      {t('roleManagement.fields.name')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSort('createdAt')}>
                      <Shield className='mr-2 h-4 w-4' />
                      {t('common.created')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>

        <div>
          {!rolesData?.content.length ? (
            <div className='text-center py-12'>
              <div className='space-y-3'>
                <Shield className='h-12 w-12 text-muted-foreground mx-auto opacity-50' />
                <div>
                  <p className='text-lg font-medium text-muted-foreground'>
                    {t('roleManagement.messages.noResults')}
                  </p>
                  <p className='text-sm text-muted-foreground mt-1'>
                    {filtersApplied > 0
                      ? t('common.tryAdjustingFilters')
                      : t('roleManagement.messages.noRolesYet')}
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
                  {rolesData.content.map(role => (
                    <RoleCard
                      key={role.id}
                      role={role}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}

              {/* Table View (Desktop Only) */}
              {viewMode === 'table' && !isMobile && (
                <RoleDataTable
                  roles={rolesData.content}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  isLoading={isLoading}
                />
              )}

              {/* Pagination */}
              {rolesData.content.length > 0 && (
                <>
                  <Separator className='opacity-30' />
                  <div className='bg-gradient-to-r from-muted/40 to-accent/30 px-6 py-6 rounded-b-lg border-t border-border/10 backdrop-blur-sm'>
                    <PaginationControls
                      data={rolesData}
                      pageSize={size}
                      onPageChange={setPage}
                      onPageSizeChange={newSize => {
                        setSize(newSize);
                        setPage(0);
                      }}
                      entityName={t('roleManagement.roles').toLowerCase()}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <RoleEditForm
        role={selectedRole}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />

      {/* Delete Dialog */}
      <RoleDeleteDialog
        role={selectedRole}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </div>
  );
};