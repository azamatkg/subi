import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  Edit,
  Eye,
  Grid,
  List,
  Mail,
  MoreHorizontal,
  Plus,
  Shield,
  SortAsc,
  SortDesc,
  Trash,
  User,
  Users,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { PageSkeleton } from '@/components/ui/skeleton';
import { AccessibleStatusBadge } from '@/components/ui/accessible-status-badge';
import { LiveRegion } from '@/components/ui/focus-trap';
import { ErrorFallback } from '@/components/ui/error-fallback';
import { DataTable, DataTableColumn } from '@/components/ui/DataTable';
import { BulkActionsToolbar } from '@/components/admin/BulkActionsToolbar';
import { SearchAndFilterPanel } from '@/components/admin/SearchAndFilterPanel';

import { useTranslation } from '@/hooks/useTranslation';
import { useSetPageTitle } from '@/hooks/useSetPageTitle';
import { useAuth } from '@/hooks/useAuth';
import {
  useBulkUpdateUserRolesMutation,
  useBulkUpdateUserStatusMutation,
  useDeleteUserMutation,
  useGetUsersQuery,
  useSearchAndFilterUsersQuery,
} from '@/store/api/userApi';
import { useGetRolesQuery } from '@/store/api/roleApi';
import type {
  UserFilterState,
  UserListResponseDto,
  UserSearchAndFilterParams,
  UserStatus,
} from '@/types/user';
import { PAGINATION, ROUTES } from '@/constants';
import { getStoredViewMode, setStoredViewMode } from '@/utils/auth';

type SortField =
  | 'lastName'
  | 'username'
  | 'email'
  | 'status'
  | 'createdAt'
  | 'lastLoginAt';
type SortDirection = 'asc' | 'desc';
type ViewMode = 'table' | 'card';

export const UserListPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { hasAnyRole } = useAuth();
  useSetPageTitle(t('userManagement.users'));

  // State management
  const [filters, setFilters] = useState<UserFilterState>({
    searchTerm: '',
    roles: [],
    status: null,
    isActive: null,
    department: '',
    createdDateFrom: '',
    createdDateTo: '',
    lastLoginFrom: '',
    lastLoginTo: '',
  });
  const [page, setPage] = useState(0);
  const [size, setSize] = useState<number>(PAGINATION.DEFAULT_PAGE_SIZE);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserListResponseDto | null>(
    null
  );
  const [sortField, setSortField] = useState<SortField>('lastName');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return getStoredViewMode() || 'card';
  });
  const [isMobile, setIsMobile] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [bulkOperationLoading, setBulkOperationLoading] = useState(false);
  const [bulkOperationError, setBulkOperationError] = useState<string | null>(null);
  const [bulkProgressMessage, setBulkProgressMessage] = useState<string | null>(null);

  // Custom view mode setter that persists to localStorage
  const handleSetViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    setStoredViewMode(mode);
  };

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const isMobileView = window.innerWidth < 768;
      setIsMobile(isMobileView);
      if (isMobileView && viewMode === 'table') {
        setViewMode('card');
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [viewMode]);


  // Build query parameters
  const baseParams = {
    page,
    size,
    sort: `${sortField},${sortDirection}`,
  };

  // Build search parameters when filters are applied
  const searchParams: UserSearchAndFilterParams = {
    ...baseParams,
    searchTerm: filters.searchTerm || undefined,
    roles: filters.roles.length > 0 ? filters.roles : undefined,
    status: filters.status || undefined,
    isActive: filters.isActive,
    department: filters.department || undefined,
    createdDateFrom: filters.createdDateFrom || undefined,
    createdDateTo: filters.createdDateTo || undefined,
    lastLoginFrom: filters.lastLoginFrom || undefined,
    lastLoginTo: filters.lastLoginTo || undefined,
  };

  // Use search API when filters are applied, otherwise use basic list API
  const hasFilters =
    filters.searchTerm ||
    filters.roles.length > 0 ||
    filters.status ||
    filters.isActive !== null ||
    filters.department ||
    filters.createdDateFrom ||
    filters.createdDateTo ||
    filters.lastLoginFrom ||
    filters.lastLoginTo;

  // API queries - conditional based on whether filters are applied
  const {
    data: listData,
    isLoading: listLoading,
    error: listError,
  } = useGetUsersQuery(baseParams, { skip: hasFilters });

  const {
    data: searchData,
    isLoading: searchLoading,
    error: searchError,
  } = useSearchAndFilterUsersQuery(searchParams, { skip: !hasFilters });

  // Use appropriate data based on which query is active
  const finalData = hasFilters ? searchData : listData;
  const finalLoading = hasFilters ? searchLoading : listLoading;
  const finalError = hasFilters ? searchError : listError;

  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [bulkUpdateUserStatus] = useBulkUpdateUserStatusMutation();
  const [bulkUpdateUserRoles] = useBulkUpdateUserRolesMutation();
  const { data: rolesData } = useGetRolesQuery();

  // Handle filter changes
  const handleFilterChange = (
    key: keyof UserFilterState,
    value: string | string[] | boolean | UserStatus | null
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      roles: [],
      status: null,
      isActive: null,
      department: '',
      createdDateFrom: '',
      createdDateTo: '',
      lastLoginFrom: '',
      lastLoginTo: '',
    });
    setPage(0);
  };

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

  // Navigation handlers
  const handleCreate = () => {
    navigate(`${ROUTES.ADMIN}/users/new`);
  };

  const handleView = (id: string) => {
    navigate(`${ROUTES.ADMIN}/users/${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`${ROUTES.ADMIN}/users/${id}/edit`);
  };

  const handleDeleteClick = (user: UserListResponseDto) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) {
      return;
    }

    try {
      await deleteUser(selectedUser.id).unwrap();
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  // Bulk operations handlers
  const handleBulkOperation = async (operation: string, params: Record<string, unknown>) => {
    if (selectedUserIds.length === 0) {
      return;
    }

    setBulkOperationLoading(true);
    setBulkOperationError(null);

    try {
      switch (operation) {
        case 'status-change':
          setBulkProgressMessage(t('userManagement.bulkActions.updatingStatus'));
          await bulkUpdateUserStatus({
            userIds: selectedUserIds,
            status: params.status as UserStatus
          }).unwrap();
          break;

        case 'role-assignment':
          setBulkProgressMessage(t('userManagement.bulkActions.assigningRole'));
          await bulkUpdateUserRoles({
            userIds: selectedUserIds,
            roleIds: [params.roleId as string]
          }).unwrap();
          break;

        case 'delete':
          setBulkProgressMessage(t('userManagement.bulkActions.deletingUsers'));
          // Perform individual deletes since bulk delete API is not available
          for (const userId of selectedUserIds) {
            await deleteUser(userId).unwrap();
          }
          break;
      }

      // Clear selection after successful operation
      setSelectedUserIds([]);
    } catch (error) {
      setBulkOperationError(t('userManagement.bulkActions.operationFailed'));
      console.error('Bulk operation failed:', error);
    } finally {
      setBulkOperationLoading(false);
      setBulkProgressMessage(null);
    }
  };

  // Clear bulk selection
  const handleClearSelection = () => {
    setSelectedUserIds([]);
    setBulkOperationError(null);
  };

  // Format user roles for display
  const formatRoles = (roles: string[]) => {
    if (!roles || roles.length === 0) {
      return t('common.none');
    }
    const firstRole = String(roles[0] || '').toLowerCase();
    if (roles.length === 1) {
      return t(`userManagement.roles.${firstRole}`);
    }
    return `${t(`userManagement.roles.${firstRole}`)} +${roles.length - 1}`;
  };

  // DataTable columns definition
  const columns: DataTableColumn<UserListResponseDto>[] = [
    {
      id: 'name',
      key: 'fullName',
      label: t('userManagement.fields.name'),
      sortable: true,
      render: (user) => (
        <div className="space-y-1 max-w-[200px]">
          <button
            onClick={() => handleView(user.id)}
            className="text-left w-full"
          >
            <p className="font-bold text-base leading-tight hover:text-primary-600 transition-colors cursor-pointer tracking-wide">
              {user.fullName}
            </p>
          </button>
          {user.department && (
            <p className="text-xs text-muted-foreground truncate font-medium">
              {user.department}
            </p>
          )}
        </div>
      ),
    },
    {
      id: 'username',
      key: 'username',
      label: t('userManagement.fields.username'),
      sortable: true,
      render: (user) => (
        <span className="font-mono font-semibold tabular-nums">
          @{user.username}
        </span>
      ),
    },
    {
      id: 'email',
      key: 'email',
      label: t('userManagement.fields.email'),
      sortable: true,
      render: (user) => (
        <span className="max-w-[200px] truncate block">
          {user.email}
        </span>
      ),
    },
    {
      id: 'roles',
      key: 'roles',
      label: t('userManagement.fields.roles'),
      render: (user) => (
        <div className="flex flex-wrap gap-1">
          {user.roles.slice(0, 2).map(role => (
            <Badge
              key={role}
              variant="secondary"
              className="text-xs"
            >
              {t(`userManagement.roles.${String(role || '').toLowerCase()}`)}
            </Badge>
          ))}
          {user.roles.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{user.roles.length - 2}
            </Badge>
          )}
        </div>
      ),
    },
    {
      id: 'status',
      key: 'status',
      label: t('userManagement.fields.status'),
      sortable: true,
      render: (user) => <AccessibleStatusBadge status={user.status} />,
    },
    {
      id: 'lastLoginAt',
      key: 'lastLoginAt',
      label: t('userManagement.fields.lastLogin'),
      sortable: true,
      render: (user) => (
        user.lastLoginAt ? (
          <div className="text-sm">
            <div>
              {new Date(user.lastLoginAt).toLocaleDateString()}
            </div>
            <div className="text-muted-foreground">
              {new Date(user.lastLoginAt).toLocaleTimeString()}
            </div>
          </div>
        ) : (
          <span className="text-muted-foreground">
            {t('userManagement.never')}
          </span>
        )
      ),
    },
  ];

  // Enhanced mobile-first card component
  const UserCard: React.FC<{ user: UserListResponseDto }> = ({ user }) => (
    <div
      className='group hover:shadow-xl hover:shadow-primary/5 hover:bg-card-elevated hover:scale-[1.02] transition-all duration-300 border border-card-elevated-border bg-card shadow-md backdrop-blur-sm rounded-lg'
      role='article'
      aria-labelledby={`user-title-${user.id}`}
    >
      <div className='p-7'>
        <div className='space-y-4'>
          {/* Header with status and actions */}
          <div className='flex items-start justify-between gap-4'>
            <div className='min-w-0 flex-1'>
              <div className='flex items-center gap-3 mb-3'>
                <div className='flex items-center justify-center h-9 w-9 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 border border-primary-300 shadow-sm'>
                  <User className='h-5 w-5 text-primary-700 shrink-0' />
                </div>
                <span className='text-sm font-mono font-bold text-primary-700 tabular-nums tracking-wide'>
                  @{user.username}
                </span>
              </div>
              <button
                onClick={() => handleView(user.id)}
                className='text-left w-full'
              >
                <h3
                  id={`user-title-${user.id}`}
                  className='text-xl font-bold leading-tight text-card-foreground hover:text-primary-600 transition-colors cursor-pointer tracking-wide'
                >
                  {user.fullName}
                </h3>
              </button>
              <p className='text-sm text-muted-foreground mt-2 font-medium'>
                {user.email}
              </p>
            </div>
            <div className='flex items-center gap-2 shrink-0'>
              <AccessibleStatusBadge
                status={user.status}
                className='shrink-0 shadow-sm'
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-8 w-8 p-0 opacity-60 group-hover:opacity-100 transition-all duration-300 hover:bg-accent hover:shadow-md hover:scale-110 focus:ring-2 focus:ring-primary/30 rounded-lg'
                    aria-label={t('common.actions', { item: user.fullName })}
                  >
                    <MoreHorizontal className='h-4 w-4' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align='end'
                  className='shadow-lg border-border/20'
                >
                  <DropdownMenuItem
                    onClick={() => handleView(user.id)}
                    className='hover:bg-accent focus:bg-accent'
                  >
                    <Eye className='mr-2 h-4 w-4' />
                    {t('common.view')}
                  </DropdownMenuItem>
                  {hasAnyRole(['ADMIN']) && (
                    <DropdownMenuItem
                      onClick={() => handleEdit(user.id)}
                      className='hover:bg-accent focus:bg-accent'
                    >
                      <Edit className='mr-2 h-4 w-4' />
                      {t('common.edit')}
                    </DropdownMenuItem>
                  )}
                  {hasAnyRole(['ADMIN']) && (
                    <>
                      <Separator />
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(user)}
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
          </div>

          {/* Details grid */}
          <div className='space-y-3 text-sm'>
            <div className='flex items-center gap-3'>
              <Shield className='h-5 w-5 text-muted-foreground shrink-0' />
              <div>
                <span className='font-medium'>
                  {t('userManagement.fields.roles')}:
                </span>
                <span className='ml-2 font-semibold'>
                  {formatRoles(user.roles)}
                </span>
              </div>
            </div>

            {user.department && (
              <div className='flex items-center gap-3'>
                <Users className='h-5 w-5 text-muted-foreground shrink-0' />
                <div>
                  <span className='font-medium'>
                    {t('userManagement.fields.department')}:
                  </span>
                  <span className='ml-2 font-semibold'>{user.department}</span>
                </div>
              </div>
            )}

            <div className='flex items-center gap-3'>
              <Clock className='h-5 w-5 text-muted-foreground shrink-0' />
              <div>
                <span className='font-medium'>
                  {t('userManagement.fields.lastLogin')}:
                </span>
                <span className='ml-2 font-semibold'>
                  {user.lastLoginAt
                    ? new Date(user.lastLoginAt).toLocaleDateString()
                    : t('userManagement.never')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );


  // Pagination component
  const PaginationControls: React.FC = () => {
    if (!finalData) {
      return null;
    }

    const totalPages = finalData.totalPages;
    const currentPage = finalData.number;

    return (
      <div className='flex items-center justify-between'>
        <div className='flex-1 text-sm text-muted-foreground'>
          {t('common.showing')} {finalData.numberOfElements} {t('common.of')}{' '}
          {finalData.totalElements} {t('userManagement.users').toLowerCase()}
        </div>
        <div className='flex items-center space-x-6 lg:space-x-8'>
          <div className='flex items-center space-x-2'>
            <p className='text-sm font-medium'>{t('common.rowsPerPage')}</p>
            <Select
              value={size.toString()}
              onValueChange={value => {
                setSize(Number(value));
                setPage(0);
              }}
            >
              <SelectTrigger className='h-8 w-[70px]'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGINATION.PAGE_SIZE_OPTIONS.map(pageSize => (
                  <SelectItem key={pageSize} value={pageSize.toString()}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='flex w-[100px] items-center justify-center text-sm font-medium'>
            {t('common.page')} {currentPage + 1} {t('common.of')}{' '}
            {totalPages || 1}
          </div>
          <div className='flex items-center space-x-2'>
            <Button
              variant='outline'
              className='h-8 w-8 p-0'
              onClick={() => setPage(0)}
              disabled={currentPage === 0}
            >
              <span className='sr-only'>{t('common.first')}</span>
              ««
            </Button>
            <Button
              variant='outline'
              className='h-8 w-8 p-0'
              onClick={() => setPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
            >
              <span className='sr-only'>{t('common.previous')}</span>«
            </Button>
            <Button
              variant='outline'
              className='h-8 w-8 p-0'
              onClick={() => setPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage >= totalPages - 1}
            >
              <span className='sr-only'>{t('common.next')}</span>»
            </Button>
            <Button
              variant='outline'
              className='h-8 w-8 p-0'
              onClick={() => setPage(totalPages - 1)}
              disabled={currentPage >= totalPages - 1}
            >
              <span className='sr-only'>{t('common.last')}</span>
              »»
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Handle loading states
  if (finalLoading) {
    return <PageSkeleton />;
  }

  // Handle error states
  if (finalError) {
    return <ErrorFallback error={finalError as Error} type='network' />;
  }

  return (
    <div className='space-y-3 sm:space-y-4'>
      <LiveRegion />

      {/* Enhanced Search and Filter Panel */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="flex-1">
          <SearchAndFilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
            isLoading={finalLoading}
            onRefresh={() => window.location.reload()}
            showDateFilters={true}
            showRoleFilters={false}
          />
        </div>

        {hasAnyRole(['ADMIN']) && (
          <div className="flex items-start pt-3 sm:pt-4">
            <Button
              onClick={handleCreate}
              className='add-new-user-button shadow-md hover:shadow-lg transition-shadow relative group'
            >
              <Plus className='h-4 w-4 mr-2' />
              {t('userManagement.createUser')}
            </Button>
          </div>
        )}
      </div>

      {/* Bulk Actions Toolbar */}
      {selectedUserIds.length > 0 && (
        <BulkActionsToolbar
          selectedUserIds={selectedUserIds}
          selectedUsers={finalData?.content.filter(user => selectedUserIds.includes(user.id)) || []}
          onClearSelection={handleClearSelection}
          onBulkOperation={handleBulkOperation}
          availableRoles={rolesData?.content || []}
          isLoading={bulkOperationLoading}
          progressMessage={bulkProgressMessage || undefined}
          error={bulkOperationError || undefined}
        />
      )}

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
                    onClick={() => handleSetViewMode('card')}
                    aria-label={t('common.cardView')}
                  >
                    <Grid className='h-5 w-5' />
                  </Button>
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => handleSetViewMode('table')}
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
          {!finalData?.content.length ? (
            <div className='text-center py-12'>
              <div className='space-y-3'>
                <Users className='h-12 w-12 text-muted-foreground mx-auto opacity-50' />
                <div>
                  <p className='text-lg font-medium text-muted-foreground'>
                    {t('userManagement.messages.noResults')}
                  </p>
                  <p className='text-sm text-muted-foreground mt-1'>
                    {hasFilters
                      ? t('common.tryAdjustingFilters')
                      : t('userManagement.messages.noUsersYet')}
                  </p>
                </div>
                {hasFilters && (
                  <Button
                    variant='outline'
                    onClick={clearFilters}
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
                  {finalData.content.map(user => (
                    <UserCard key={user.id} user={user} />
                  ))}
                </div>
              )}

              {/* Enhanced Table View (Desktop Only) */}
              {viewMode === 'table' && !isMobile && (
                <DataTable
                  data={finalData.content}
                  columns={columns}
                  loading={finalLoading}
                  pagination={{
                    page: finalData.number,
                    size: finalData.size,
                    totalElements: finalData.totalElements,
                    totalPages: finalData.totalPages,
                    onPageChange: setPage,
                    onPageSizeChange: (newSize) => {
                      setSize(newSize);
                      setPage(0);
                    },
                  }}
                  sorting={{
                    field: sortField,
                    direction: sortDirection,
                    onSortChange: (field, direction) => {
                      setSortField(field as SortField);
                      setSortDirection(direction);
                      setPage(0);
                    },
                  }}
                  selection={{
                    selectedIds: selectedUserIds,
                    onSelectionChange: setSelectedUserIds,
                  }}
                  onRowClick={(user) => handleView(user.id)}
                  onRowAction={(action, user) => {
                    switch (action) {
                      case 'view':
                        handleView(user.id);
                        break;
                      case 'edit':
                        if (hasAnyRole(['ADMIN'])) {
                          handleEdit(user.id);
                        }
                        break;
                      case 'delete':
                        if (hasAnyRole(['ADMIN'])) {
                          handleDeleteClick(user);
                        }
                        break;
                    }
                  }}
                />
              )}

              {/* Pagination for Card View Only */}
              {(viewMode === 'card' || isMobile) && finalData.content.length > 0 && (
                <>
                  <Separator className='opacity-30' />
                  <div className='bg-gradient-to-r from-muted/40 to-accent/30 px-6 py-6 rounded-b-lg border-t border-border/10 backdrop-blur-sm'>
                    <PaginationControls />
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('common.confirm')}</DialogTitle>
            <DialogDescription>
              {t('userManagement.messages.confirmDelete', {
                item: selectedUser
                  ? `"${selectedUser.fullName}"`
                  : t('userManagement.user').toLowerCase(),
              })}
            </DialogDescription>
          </DialogHeader>
          <div className='flex justify-end space-x-2'>
            <Button
              variant='outline'
              onClick={() => setDeleteDialogOpen(false)}
            >
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
