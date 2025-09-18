import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash,
  ChevronDown,
  ChevronUp,
  Users,
  User,
  X,
  Grid,
  List,
  SortAsc,
  SortDesc,
  RefreshCw,
  Shield,
  Clock,
  Mail,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { PageSkeleton } from '@/components/ui/skeleton';
import {
  AccessibleStatusBadge,
} from '@/components/ui/accessible-status-badge';
import { LiveRegion } from '@/components/ui/focus-trap';
import { ErrorFallback } from '@/components/ui/error-fallback';
import { cn } from '@/lib/utils';

import { useTranslation } from '@/hooks/useTranslation';
import { useSetPageTitle } from '@/hooks/useSetPageTitle';
import { useAuth } from '@/hooks/useAuth';
import {
  useGetUsersQuery,
  useDeleteUserMutation,
} from '@/store/api/userApi';
import type {
  UserListResponseDto,
  UserFilterState,
  UserStatus,
} from '@/types/user';
import { UserStatus as UserStatusEnum } from '@/types/user';
import { UserRole } from '@/types';
import { ROUTES, PAGINATION } from '@/constants';
import { getStoredViewMode, setStoredViewMode } from '@/utils/auth';

type SortField = 'lastName' | 'username' | 'email' | 'status' | 'createdAt' | 'lastLoginAt';
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
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserListResponseDto | null>(null);
  const [sortField, setSortField] = useState<SortField>('lastName');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return getStoredViewMode() || 'card';
  });
  const [isMobile, setIsMobile] = useState(false);
  const [filtersApplied, setFiltersApplied] = useState(0);

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

  // Count applied filters
  useEffect(() => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.roles.length > 0) count++;
    if (filters.status) count++;
    if (filters.isActive !== null) count++;
    if (filters.department) count++;
    if (filters.createdDateFrom) count++;
    if (filters.createdDateTo) count++;
    if (filters.lastLoginFrom) count++;
    if (filters.lastLoginTo) count++;
    setFiltersApplied(count);
  }, [filters]);

  // Build query parameters
  const queryParams = {
    page,
    size,
    sort: `${sortField},${sortDirection}`,
  };

  // API queries
  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
  } = useGetUsersQuery(queryParams);

  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

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
    if (!selectedUser) return;

    try {
      await deleteUser(selectedUser.id).unwrap();
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  // Format user roles for display
  const formatRoles = (roles: UserRole[]) => {
    if (!roles || roles.length === 0) return t('common.none');
    const roleName = String(roles[0]);
    const firstRole = roleName.toLowerCase();
    if (roles.length === 1) return t(`userManagement.roles.${firstRole}`);
    return `${t(`userManagement.roles.${firstRole}`)} +${roles.length - 1}`;
  };

  // Enhanced mobile-first card component
  const UserCard: React.FC<{ user: UserListResponseDto }> = ({ user }) => (
    <div
      className="group hover:shadow-xl hover:shadow-primary/5 hover:bg-card-elevated hover:scale-[1.02] transition-all duration-300 border border-card-elevated-border bg-card shadow-md backdrop-blur-sm rounded-lg"
      role="article"
      aria-labelledby={`user-title-${user.id}`}
    >
      <div className="p-7">
        <div className="space-y-4">
          {/* Header with status and actions */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 border border-primary-300 shadow-sm">
                  <User className="h-5 w-5 text-primary-700 shrink-0" />
                </div>
                <span className="text-sm font-mono font-bold text-primary-700 tabular-nums tracking-wide">
                  @{user.username}
                </span>
              </div>
              <button
                onClick={() => handleView(user.id)}
                className="text-left w-full"
              >
                <h3
                  id={`user-title-${user.id}`}
                  className="text-xl font-bold leading-tight text-card-foreground hover:text-primary-600 transition-colors cursor-pointer tracking-wide"
                >
                  {user.fullName}
                </h3>
              </button>
              <p className="text-sm text-muted-foreground mt-2 font-medium">
                {user.email}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <AccessibleStatusBadge
                status={user.status}
                className="shrink-0 shadow-sm"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 opacity-60 group-hover:opacity-100 transition-all duration-300 hover:bg-accent hover:shadow-md hover:scale-110 focus:ring-2 focus:ring-primary/30 rounded-lg"
                    aria-label={t('common.actions', { item: user.fullName })}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="shadow-lg border-border/20"
                >
                  <DropdownMenuItem
                    onClick={() => handleView(user.id)}
                    className="hover:bg-accent focus:bg-accent"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    {t('common.view')}
                  </DropdownMenuItem>
                  {hasAnyRole(['ADMIN']) && (
                    <DropdownMenuItem
                      onClick={() => handleEdit(user.id)}
                      className="hover:bg-accent focus:bg-accent"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      {t('common.edit')}
                    </DropdownMenuItem>
                  )}
                  {hasAnyRole(['ADMIN']) && (
                    <>
                      <Separator />
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(user)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        {t('common.delete')}
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Details grid */}
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-muted-foreground shrink-0" />
              <div>
                <span className="font-medium">{t('userManagement.fields.roles')}:</span>
                <span className="ml-2 font-semibold">
                  {formatRoles(user.roles)}
                </span>
              </div>
            </div>
            
            {user.department && (
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-muted-foreground shrink-0" />
                <div>
                  <span className="font-medium">{t('userManagement.fields.department')}:</span>
                  <span className="ml-2 font-semibold">{user.department}</span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground shrink-0" />
              <div>
                <span className="font-medium">{t('userManagement.fields.lastLogin')}:</span>
                <span className="ml-2 font-semibold">
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

  // Enhanced table header with sorting
  const SortableTableHead: React.FC<{
    field: SortField;
    children: React.ReactNode;
    className?: string;
  }> = ({ field, children, className }) => (
    <TableHead
      className={cn(
        'cursor-pointer transition-all duration-300 select-none border-b-2 border-b-primary-200/50 bg-gradient-to-b from-table-header to-table-header/70',
        className
      )}
    >
      <button
        onClick={() => handleSort(field)}
        className="flex items-center gap-2 w-full text-left font-bold text-table-header-foreground hover:text-primary-600 transition-colors duration-300 py-3 px-1 rounded-lg hover:bg-primary-50/50"
        aria-label={t('common.sortBy', { field: children })}
      >
        {children}
        {sortField === field ? (
          sortDirection === 'asc' ? (
            <SortAsc className="h-4 w-4 text-primary animate-in slide-in-from-bottom-1 duration-200" />
          ) : (
            <SortDesc className="h-4 w-4 text-primary animate-in slide-in-from-top-1 duration-200" />
          )
        ) : (
          <div className="h-4 w-4 opacity-40 group-hover:opacity-70 transition-opacity">
            <SortAsc className="h-4 w-4 text-table-header-foreground" />
          </div>
        )}
      </button>
    </TableHead>
  );

  // Pagination component
  const PaginationControls: React.FC = () => {
    if (!usersData) return null;

    const totalPages = usersData.totalPages;
    const currentPage = usersData.number;

    return (
      <div className="flex items-center justify-between">
        <div className="flex-1 text-sm text-muted-foreground">
          {t('common.showing')} {usersData.numberOfElements}{' '}
          {t('common.of')} {usersData.totalElements}{' '}
          {t('userManagement.users').toLowerCase()}
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">{t('common.rowsPerPage')}</p>
            <Select
              value={size.toString()}
              onValueChange={value => {
                setSize(Number(value));
                setPage(0);
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
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
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            {t('common.page')} {currentPage + 1} {t('common.of')}{' '}
            {totalPages || 1}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => setPage(0)}
              disabled={currentPage === 0}
            >
              <span className="sr-only">{t('common.first')}</span>
              ««
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => setPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
            >
              <span className="sr-only">{t('common.previous')}</span>«
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => setPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage >= totalPages - 1}
            >
              <span className="sr-only">{t('common.next')}</span>»
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => setPage(totalPages - 1)}
              disabled={currentPage >= totalPages - 1}
            >
              <span className="sr-only">{t('common.last')}</span>
              »»
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Handle loading states
  if (usersLoading) {
    return <PageSkeleton />;
  }

  // Handle error states
  if (usersError) {
    return <ErrorFallback error={usersError as Error} type="network" />;
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <LiveRegion />

      {/* Search and Filter Controls */}
      <div className="bg-muted/10 rounded-lg border border-border/20 shadow-sm">
        <div className="p-3 sm:p-4">
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t('userManagement.searchPlaceholder')}
                  value={filters.searchTerm}
                  onChange={e =>
                    handleFilterChange('searchTerm', e.target.value)
                  }
                  className="pl-10"
                  aria-label={t('userManagement.searchPlaceholder')}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={cn(
                  'relative gap-2 transition-all duration-200',
                  isFilterOpen && 'bg-primary text-primary-foreground'
                )}
                aria-expanded={isFilterOpen}
              >
                <Filter className="h-4 w-4" />
                {t('userManagement.advancedFilters')}
                {filtersApplied > 0 && (
                  <Badge
                    variant={isFilterOpen ? 'secondary' : 'destructive'}
                    className="ml-2 px-1.5 py-0.5 text-xs -mr-1"
                  >
                    {filtersApplied}
                  </Badge>
                )}
                {isFilterOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>

              {filtersApplied > 0 && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={clearFilters}
                  aria-label={t('common.clearFilters')}
                  className="shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {hasAnyRole(['ADMIN']) && (
              <div className="flex gap-2">
                <Button
                  onClick={handleCreate}
                  className="add-new-user-button shadow-md hover:shadow-lg transition-shadow w-full sm:w-auto relative group"
                  size={isMobile ? 'default' : 'default'}
                >
                  <Plus className="h-4 w-4" />
                  <span
                    className="absolute left-1/2 -translate-x-1/2 top-full mt-2 bg-background border border-border rounded-md px-2 py-1 text-xs text-foreground shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10"
                    role="tooltip"
                    aria-hidden="true"
                  >
                    {t('userManagement.createUser')}
                  </span>
                </Button>
              </div>
            )}
          </div>

          {/* Collapsible Advanced Filters */}
          {isFilterOpen && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6 bg-gradient-to-br from-muted/60 to-accent/40 rounded-xl transition-all duration-300 ease-out mt-6 border border-border/10 shadow-inner">
              {/* Status Filter */}
              <div className="space-y-2">
                <Label htmlFor="status-filter">
                  {t('userManagement.fields.status')}
                </Label>
                <Select
                  value={filters.status || 'all'}
                  onValueChange={value =>
                    handleFilterChange('status', value === 'all' ? null : value as UserStatus)
                  }
                >
                  <SelectTrigger id="status-filter">
                    <SelectValue placeholder={t('common.selectStatus')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('common.all')}</SelectItem>
                    {Object.values(UserStatusEnum).map(status => (
                      <SelectItem key={status} value={status}>
                        {t(`userManagement.status.${status.toLowerCase()}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Active Status Filter */}
              <div className="space-y-2">
                <Label htmlFor="active-filter">
                  {t('userManagement.fields.activeStatus')}
                </Label>
                <Select
                  value={
                    filters.isActive === null
                      ? 'all'
                      : filters.isActive.toString()
                  }
                  onValueChange={value =>
                    handleFilterChange(
                      'isActive',
                      value === 'all' ? null : value === 'true'
                    )
                  }
                >
                  <SelectTrigger id="active-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('common.all')}</SelectItem>
                    <SelectItem value="true">{t('userManagement.active')}</SelectItem>
                    <SelectItem value="false">{t('userManagement.inactive')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Department Filter */}
              <div className="space-y-2">
                <Label htmlFor="department-filter">
                  {t('userManagement.fields.department')}
                </Label>
                <Input
                  id="department-filter"
                  placeholder={t('userManagement.enterDepartment')}
                  value={filters.department}
                  onChange={e =>
                    handleFilterChange('department', e.target.value)
                  }
                />
              </div>

              {/* Filter Actions */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2 col-span-full">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  disabled={filtersApplied === 0}
                  className="w-full sm:w-auto"
                >
                  <X className="mr-2 h-4 w-4" />
                  {t('common.clear')}
                  {filtersApplied > 0 && ` (${filtersApplied})`}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="w-full sm:w-auto"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {t('common.refresh')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      <div className="bg-transparent rounded-lg">
        <div className="pb-3 border-b border-border/10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="flex items-center gap-4 text-xl font-bold tracking-wide">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 border border-primary-300 flex items-center justify-center shadow-lg">
                <Users className="h-6 w-6 text-primary-700" />
              </div>
              <span className="text-foreground">{t('userManagement.users')}</span>
            </h2>

            {/* View Toggle and Sort Controls */}
            <div className="flex items-center gap-2">
              {!isMobile && (
                <>
                  <Button
                    variant={viewMode === 'card' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSetViewMode('card')}
                    aria-label={t('common.cardView')}
                  >
                    <Grid className="h-5 w-5" />
                  </Button>
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSetViewMode('table')}
                    aria-label={t('common.tableView')}
                  >
                    <List className="h-5 w-5" />
                  </Button>
                </>
              )}

              {(viewMode === 'card' || isMobile) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      {sortDirection === 'asc' ? (
                        <SortAsc className="h-4 w-4 mr-2" />
                      ) : (
                        <SortDesc className="h-4 w-4 mr-2" />
                      )}
                      {t(`userManagement.fields.${sortField}`)}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleSort('lastName')}>
                      <User className="mr-2 h-4 w-4" />
                      {t('userManagement.fields.lastName')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSort('username')}>
                      <User className="mr-2 h-4 w-4" />
                      {t('userManagement.fields.username')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSort('email')}>
                      <Mail className="mr-2 h-4 w-4" />
                      {t('userManagement.fields.email')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSort('status')}>
                      <Shield className="mr-2 h-4 w-4" />
                      {t('userManagement.fields.status')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSort('createdAt')}>
                      <Clock className="mr-2 h-4 w-4" />
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
            <div className="text-center py-12">
              <div className="space-y-3">
                <Users className="h-12 w-12 text-muted-foreground mx-auto opacity-50" />
                <div>
                  <p className="text-lg font-medium text-muted-foreground">
                    {t('userManagement.messages.noResults')}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {filtersApplied > 0
                      ? t('common.tryAdjustingFilters')
                      : t('userManagement.messages.noUsersYet')}
                  </p>
                </div>
                {filtersApplied > 0 && (
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="mt-4"
                  >
                    <X className="mr-2 h-4 w-4" />
                    {t('common.clearFilters')}
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Card View (Mobile First) */}
              {(viewMode === 'card' || isMobile) && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {usersData.content.map(user => (
                    <UserCard key={user.id} user={user} />
                  ))}
                </div>
              )}

              {/* Table View (Desktop Only) */}
              {viewMode === 'table' && !isMobile && (
                <div className="overflow-x-auto rounded-lg border border-card-elevated-border shadow-sm">
                  <Table>
                    <TableHeader className="bg-gradient-to-r from-table-header to-table-header/90 border-b-2 border-primary-200/30">
                      <TableRow className="group border-b-0 hover:bg-primary-50/20 transition-all duration-300">
                        <SortableTableHead field="lastName">
                          {t('userManagement.fields.name')}
                        </SortableTableHead>
                        <SortableTableHead field="username">
                          {t('userManagement.fields.username')}
                        </SortableTableHead>
                        <SortableTableHead field="email">
                          {t('userManagement.fields.email')}
                        </SortableTableHead>
                        <TableHead className="text-table-header-foreground font-bold border-b-2 border-b-primary-200/50 bg-gradient-to-b from-table-header to-table-header/70">
                          {t('userManagement.fields.roles')}
                        </TableHead>
                        <SortableTableHead field="status">
                          {t('userManagement.fields.status')}
                        </SortableTableHead>
                        <SortableTableHead field="lastLoginAt">
                          {t('userManagement.fields.lastLogin')}
                        </SortableTableHead>
                        <TableHead className="w-[100px] text-center text-table-header-foreground font-bold border-b-2 border-b-primary-200/50 bg-gradient-to-b from-table-header to-table-header/70">
                          {t('common.actions')}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usersData.content.map((user, index) => (
                        <TableRow
                          key={user.id}
                          className={`group ${index % 2 === 1 ? 'bg-muted/30' : 'bg-background'} hover:bg-primary-50/20 hover:shadow-sm transition-all duration-300 border-b border-border/5`}
                        >
                          <TableCell className="py-4">
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
                          </TableCell>
                          <TableCell className="font-mono font-semibold tabular-nums py-4">
                            @{user.username}
                          </TableCell>
                          <TableCell className="py-4 max-w-[200px] truncate">
                            {user.email}
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex flex-wrap gap-1">
                              {user.roles.slice(0, 2).map((role, index) => {
                                const roleName = String(role);
                                const roleKey = roleName.toLowerCase();
                                return (
                                  <Badge key={`${roleName}-${index}`} variant="secondary" className="text-xs">
                                    {t(`userManagement.roles.${roleKey}`)}
                                  </Badge>
                                );
                              })}
                              {user.roles.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{user.roles.length - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <AccessibleStatusBadge status={user.status} />
                          </TableCell>
                          <TableCell className="py-4">
                            {user.lastLoginAt ? (
                              <div className="text-sm">
                                <div>{new Date(user.lastLoginAt).toLocaleDateString()}</div>
                                <div className="text-muted-foreground">
                                  {new Date(user.lastLoginAt).toLocaleTimeString()}
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">{t('userManagement.never')}</span>
                            )}
                          </TableCell>
                          <TableCell className="w-[100px] py-4">
                            <div className="flex items-center justify-center">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 opacity-70 hover:opacity-100 transition-all duration-200 hover:bg-accent hover:shadow-lg focus:ring-2 focus:ring-primary/20"
                                    aria-label={t('common.actions', {
                                      item: user.fullName,
                                    })}
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="shadow-lg border-border/20"
                                >
                                  <DropdownMenuItem
                                    onClick={() => handleView(user.id)}
                                    className="hover:bg-accent focus:bg-accent"
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    {t('common.view')}
                                  </DropdownMenuItem>
                                  {hasAnyRole(['ADMIN']) && (
                                    <DropdownMenuItem
                                      onClick={() => handleEdit(user.id)}
                                      className="hover:bg-accent focus:bg-accent"
                                    >
                                      <Edit className="mr-2 h-4 w-4" />
                                      {t('common.edit')}
                                    </DropdownMenuItem>
                                  )}
                                  {hasAnyRole(['ADMIN']) && (
                                    <>
                                      <Separator />
                                      <DropdownMenuItem
                                        onClick={() => handleDeleteClick(user)}
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                      >
                                        <Trash className="mr-2 h-4 w-4" />
                                        {t('common.delete')}
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Pagination */}
              {usersData.content.length > 0 && (
                <>
                  <Separator className="opacity-30" />
                  <div className="bg-gradient-to-r from-muted/40 to-accent/30 px-6 py-6 rounded-b-lg border-t border-border/10 backdrop-blur-sm">
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
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="destructive"
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