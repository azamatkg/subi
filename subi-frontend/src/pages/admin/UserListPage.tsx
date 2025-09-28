import React, { useState } from 'react';
import {
  Users,
  User,
  Grid,
  List,
  SortAsc,
  SortDesc,
  Shield,
  Clock,
  Mail,
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
import { UserCard } from '@/components/admin/UserCard';
import { UserTable } from '@/components/admin/UserTable';
import { UserFilters } from '@/components/admin/UserFilters';

import { useTranslation } from '@/hooks/useTranslation';
import { useSetPageTitle } from '@/hooks/useSetPageTitle';
import { useViewMode } from '@/hooks/useViewMode';
import { useUserFilters } from '@/hooks/useUserFilters';
import { useUserActions } from '@/hooks/useUserActions';
import { useSearchAndFilterUsersQuery } from '@/store/api/userApi';
import { PAGINATION } from '@/constants';
import { isUserDataSafe, logUserValidationIssues } from '@/utils/userValidation';

type SortField = 'lastName' | 'username' | 'email' | 'status' | 'createdAt';
type SortDirection = 'asc' | 'desc';

export const UserListPage: React.FC = () => {
  const { t } = useTranslation();
  useSetPageTitle(t('userManagement.users'));

  // State management using custom hooks
  const { viewMode, setViewMode, isMobile } = useViewMode();
  const {
    filters,
    isFilterOpen,
    setIsFilterOpen,
    filtersApplied,
    handleFilterChange,
    clearFilters,
  } = useUserFilters();
  const {
    deleteDialogOpen,
    selectedUser,
    isDeleting,
    handleCreate,
    handleView,
    handleEdit,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
  } = useUserActions();

  // Local state for pagination and sorting
  const [page, setPage] = useState(0);
  const [size, setSize] = useState<number>(PAGINATION.DEFAULT_PAGE_SIZE);
  const [sortField, setSortField] = useState<SortField>('lastName');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Build query parameters with filters
  const queryParams = {
    page,
    size,
    sort: `${sortField},${sortDirection}`,
    searchTerm: filters.searchTerm,
    roles: filters.roles,
    status: filters.status,
    isActive: filters.isActive,
    department: filters.department,
    createdDateFrom: filters.createdDateFrom,
    createdDateTo: filters.createdDateTo,
    lastLoginFrom: filters.lastLoginFrom,
    lastLoginTo: filters.lastLoginTo,
  };

  // API queries
  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
  } = useSearchAndFilterUsersQuery(queryParams);

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
    value: string | string[] | boolean | null
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
  if (usersLoading) {
    return <PageSkeleton />;
  }

  // Handle error states
  if (usersError) {
    console.error('UserListPage: API error:', usersError);
    return <ErrorFallback error={usersError as Error} type='network' />;
  }

  // Validate API response structure with detailed logging
  if (usersData && !Array.isArray(usersData.content)) {
    console.error('UserListPage: Invalid API response structure:', usersData);
    return <ErrorFallback error={new Error('Invalid API response')} type='network' />;
  }

  // Log API response for debugging empty cards
  if (usersData?.content) {
    console.log('UserListPage: API response received:', {
      totalUsers: usersData.content.length,
      sampleUser: usersData.content[0],
      allUsers: usersData.content
    });

    // Check for missing required fields in each user
    usersData.content.forEach((user, index) => {
      if (!user) {
        console.warn(`UserListPage: User at index ${index} is null/undefined`);
        return;
      }

      const missingFields = [];
      if (!user.id) missingFields.push('id');
      if (!user.username) missingFields.push('username');
      if (!user.email) missingFields.push('email');
      if (!user.firstName && !user.lastName && !user.fullName) {
        missingFields.push('firstName/lastName/fullName');
      }

      if (missingFields.length > 0) {
        console.warn(`UserListPage: User at index ${index} missing fields: ${missingFields.join(', ')}`, user);
      }
    });
  }

  return (
    <div className='space-y-3 sm:space-y-4'>
      <LiveRegion />

      {/* Search and Filter Controls */}
      <UserFilters
        filters={filters}
        isFilterOpen={isFilterOpen}
        filtersApplied={filtersApplied}
        isMobile={isMobile}
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
                <Users className='h-6 w-6 text-primary-700' />
              </div>
              <span className='text-foreground'>
                {t('userManagement.users')}
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
                      {t(`userManagement.fields.${sortField}`)}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleSort('lastName')}>
                      <User className='mr-2 h-4 w-4' />
                      {t('userManagement.fields.lastName')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSort('username')}>
                      <User className='mr-2 h-4 w-4' />
                      {t('userManagement.fields.username')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSort('email')}>
                      <Mail className='mr-2 h-4 w-4' />
                      {t('userManagement.fields.email')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSort('status')}>
                      <Shield className='mr-2 h-4 w-4' />
                      {t('userManagement.fields.status')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSort('createdAt')}>
                      <Clock className='mr-2 h-4 w-4' />
                      {t('common.created')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>

        <div>
          {!usersData?.content.length ? (
            <div className='text-center py-12'>
              <div className='space-y-3'>
                <Users className='h-12 w-12 text-muted-foreground mx-auto opacity-50' />
                <div>
                  <p className='text-lg font-medium text-muted-foreground'>
                    {t('userManagement.messages.noResults')}
                  </p>
                  <p className='text-sm text-muted-foreground mt-1'>
                    {filtersApplied > 0
                      ? t('common.tryAdjustingFilters')
                      : t('userManagement.messages.noUsersYet')}
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
                  {usersData.content
                    .filter(user => {
                      // Use validation utility for consistent filtering
                      if (!isUserDataSafe(user)) {
                        logUserValidationIssues(user, 'UserListPage Card Filter');
                        return false;
                      }
                      return true;
                    })
                    .map(user => {
                      try {
                        return (
                          <UserCard
                            key={user.id}
                            user={user}
                            onView={handleView}
                            onEdit={handleEdit}
                            onDelete={handleDeleteClick}
                          />
                        );
                      } catch (error) {
                        console.error('UserListPage: Error rendering UserCard for user:', user, error);
                        return (
                          <div key={user.id} className='p-4 border border-red-200 rounded-lg bg-red-50'>
                            <p className='text-red-600 text-sm'>Error rendering user card</p>
                            <p className='text-xs text-red-500'>User ID: {user.id}</p>
                          </div>
                        );
                      }
                    })}
                </div>
              )}

              {/* Table View (Desktop Only) */}
              {viewMode === 'table' && !isMobile && (
                <UserTable
                  users={usersData.content.filter(user => {
                    // Use validation utility for consistent filtering
                    if (!isUserDataSafe(user)) {
                      logUserValidationIssues(user, 'UserListPage Table Filter');
                      return false;
                    }
                    return true;
                  })}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                />
              )}

              {/* Pagination */}
              {usersData.content.length > 0 && (
                <>
                  <Separator className='opacity-30' />
                  <div className='bg-gradient-to-r from-muted/40 to-accent/30 px-6 py-6 rounded-b-lg border-t border-border/10 backdrop-blur-sm'>
                    <PaginationControls
                      data={usersData}
                      pageSize={size}
                      onPageChange={setPage}
                      onPageSizeChange={newSize => {
                        setSize(newSize);
                        setPage(0);
                      }}
                      entityName={t('userManagement.users').toLowerCase()}
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
            <DialogDescription>
              {t('userManagement.messages.confirmDelete', {
                item: selectedUser
                  ? `"${selectedUser.fullName || `${selectedUser.firstName} ${selectedUser.lastName}`.trim()}"`
                  : t('userManagement.user').toLowerCase(),
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
