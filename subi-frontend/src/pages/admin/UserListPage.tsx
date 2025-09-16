import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  Edit,
  Eye,
  Grid,
  List,
  Mail,
  MoreHorizontal,
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
import {
  SearchFilterSkeleton,
  TableSkeleton,
  UserCardSkeleton
} from '@/components/ui/skeleton';
import { AccessibleStatusBadge } from '@/components/ui/accessible-status-badge';
import { Landmark, LiveRegion, SkipLink } from '@/components/ui/focus-trap';
import { ErrorFallback, ServerErrorFallback } from '@/components/ui/error-fallback';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { DataTable, DataTableColumn } from '@/components/ui/DataTable';
import { BulkActionsToolbar } from '@/components/admin/BulkActionsToolbar';
import { SearchAndFilterPanel } from '@/components/admin/SearchAndFilterPanel';
import { VirtualList } from '@/components/ui/VirtualList';

import { useTranslation } from '@/hooks/useTranslation';
import { useSetPageTitle } from '@/hooks/useSetPageTitle';
import { useAuth } from '@/hooks/useAuth';
import { useUserListAccess } from '@/hooks/useAccessControl';
import { useUserManagementSessionContext } from '@/contexts/UserManagementSessionContext';
import { cn } from '@/lib/utils';
import { useProgressiveLoading, useSmartLoading, useStaggeredLoading } from '@/hooks/useSmartLoading';
import {
  ButtonLoadingState,
  LoadingOverlay,
  SkeletonToContentTransition
} from '@/components/ui/loading-transitions';
import {
  useBulkUpdateUserRolesMutation,
  useBulkUpdateUserStatusMutation,
  useDeleteUserMutation,
  useGetUsersQuery,
  useSearchAndFilterUsersQuery,
} from '@/store/api/userApi';
import { useGetRolesQuery } from '@/store/api/roleApi';
import type {
  BulkOperationProgress,
  UserFilterState,
  UserListParams,
  UserListResponseDto,
  UserSearchAndFilterParams,
  UserStatus,
} from '@/types/user';
import { PAGINATION, ROUTES } from '@/constants';
import { getStoredViewMode, setStoredViewMode } from '@/utils/auth';
import {
  NetworkErrorRecovery,
  ValidationUtils,
  handleApiError,
  showInfoMessage,
  showSuccessMessage,
  showWarningMessage
} from '@/utils/errorHandling';

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
  const { hasAnyRole: _hasAnyRole } = useAuth();
  const accessControl = useUserListAccess();
  const sessionContext = useUserManagementSessionContext();
  useSetPageTitle(t('userManagement.users'));

  // State management - must be called before any conditional returns
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
  const [_windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
    isSmall: window.innerWidth < 480,
  });
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
  const [bulkProgress, setBulkProgress] = useState<BulkOperationProgress | null>(null);
  const [operationCancelled, setOperationCancelled] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [_validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Build query parameters
  const baseParams: UserListParams = {
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

  // Smart loading with smooth transitions
  const smartLoading = useSmartLoading(finalLoading);
  const { showLoading, shouldShowContent } = useProgressiveLoading(
    finalData,
    finalLoading,
    { minDelay: 200, minDuration: 300 }
  );

  // Staggered loading for card view
  const visibleItemCount = useStaggeredLoading(
    finalData?.content,
    finalLoading,
    80 // Stagger delay in ms
  );

  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [bulkUpdateUserStatus] = useBulkUpdateUserStatusMutation();
  const [bulkUpdateUserRoles] = useBulkUpdateUserRolesMutation();
  const { data: rolesData } = useGetRolesQuery();

  // Enhanced mobile detection with improved breakpoints
  useEffect(() => {
    const checkMobile = () => {
      const isMobileView = window.innerWidth < 768;
      const isSmallMobile = window.innerWidth < 480;
      setIsMobile(isMobileView);

      // Force card view on mobile for better usability
      if (isMobileView && viewMode === 'table') {
        setViewMode('card');
        setStoredViewMode('card');
      }

      // Additional mobile-specific size information
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
        isSmall: isSmallMobile,
      });
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [viewMode]);

  // Memoize validation errors to prevent cascading re-renders
  const memoizedValidationErrors = useMemo(() => _validationErrors, [_validationErrors]);

  // Stable selection props to prevent DataTable re-renders and infinite loops
  const selectionProps = useMemo(() => ({
    selectedIds: selectedUserIds,
    onSelectionChange: setSelectedUserIds,
  }), [selectedUserIds]);

  // Clear filters callback
  const clearFilters = useCallback(() => {
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
  }, []);


  // Handle filter changes with validation - optimized to prevent infinite loops
  const handleFilterChange = useCallback((
    key: keyof UserFilterState,
    value: string | string[] | boolean | UserStatus | null
  ) => {
    // Batch state updates to prevent multiple re-renders
    let newValidationErrors = { ...memoizedValidationErrors };

    // Clear previous validation error for this field
    if (newValidationErrors[key]) {
      newValidationErrors = { ...newValidationErrors, [key]: '' };
    }

    // Validate input based on filter type
    if (key === 'searchTerm' && typeof value === 'string') {
      // Only validate search terms that are long enough for meaningful search
      // Allow typing of shorter terms but show validation for complete searches
      if (value.length >= 2) {
        const searchValidation = ValidationUtils.validateSearchTerm(value);
        if (!searchValidation.isValid) {
          newValidationErrors = { ...newValidationErrors, searchTerm: searchValidation.error || '' };
          showWarningMessage(t('userManagement.validation.invalidSearch'), searchValidation.error);
          // Don't return here - still allow the input to be updated so user can continue typing
        }
      }
    }

    if ((key === 'createdDateFrom' || key === 'createdDateTo' || key === 'lastLoginFrom' || key === 'lastLoginTo') && typeof value === 'string') {
      const otherDateKey = key === 'createdDateFrom' ? 'createdDateTo' :
                          key === 'createdDateTo' ? 'createdDateFrom' :
                          key === 'lastLoginFrom' ? 'lastLoginTo' : 'lastLoginFrom';
      const otherDateValue = filters[otherDateKey as keyof UserFilterState] as string;

      const dateValidation = ValidationUtils.validateDateRange(
        key.includes('From') ? value : otherDateValue,
        key.includes('To') ? value : otherDateValue
      );

      if (!dateValidation.isValid) {
        newValidationErrors = { ...newValidationErrors, [key]: dateValidation.error || '' };
        showWarningMessage(t('userManagement.validation.invalidDateRange'), dateValidation.error);
        return;
      }
    }

    // Batch all state updates together to prevent cascading re-renders
    setValidationErrors(newValidationErrors);
    setFilters(prev => ({ ...prev, [key]: value }));

    // Only reset page for non-search filters or when search is meaningful
    if (key !== 'searchTerm' || (typeof value === 'string' && value.length >= 2)) {
      setPage(0);
    }
  }, [memoizedValidationErrors, filters, t]);

  // Session recovery effect - restore bulk operation state (run only once)
  useEffect(() => {
    const restoreBulkOperation = () => {
      const bulkState = sessionContext.restoreBulkOperationState();
      if (bulkState) {
        // Restore bulk operation selection and state
        setSelectedUserIds(bulkState.selectedIds);
        setBulkOperationLoading(false);

        // Show recovery message
        showInfoMessage(
          t('userManagement.session.recovery.bulkOperationRestored'),
          t('userManagement.session.recovery.bulkOperationRestoredDescription', {
            operation: bulkState.operationType,
            count: bulkState.selectedIds.length
          })
        );

        // If operation was in progress, offer to continue
        if (bulkState.progress && bulkState.progress.completed < bulkState.progress.total) {
          showWarningMessage(
            t('userManagement.session.recovery.bulkOperationIncomplete'),
            t('userManagement.session.recovery.bulkOperationIncompleteDescription')
          );
        }
      }

      // Restore navigation state
      const navState = sessionContext.restoreNavigationState();
      if (navState) {
        if (navState.filters) {
          setFilters(prevFilters => ({ ...prevFilters, ...navState.filters }));
        }
        if (navState.pagination) {
          setPage(navState.pagination.page);
          setSize(navState.pagination.limit);
        }
      }
    };

    restoreBulkOperation();
  }, []); // Empty dependency array - run only once on mount

  // Early access control check
  if (!accessControl.canAccessPage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-muted-foreground mb-2">
            {t('accessControl.unauthorized')}
          </h2>
          <p className="text-muted-foreground">
            {t('accessControl.userManagementRestricted')}
          </p>
        </div>
      </div>
    );
  }

  // Virtual scrolling config
  const shouldUseVirtualScrollingCards = (finalData?.content.length || 0) >= 50;
  const cardHeight = isMobile ? 140 : 160;

  // Custom view mode setter that persists to localStorage
  const handleSetViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    setStoredViewMode(mode);
  };

  // Functions moved to before early return to fix React hooks rules

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
      showSuccessMessage(
        t('userManagement.messages.userDeleted'),
        t('userManagement.messages.userDeletedDescription', { name: selectedUser.fullName })
      );
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      const errorInfo = handleApiError(error, t);

      // Show specific error messages based on error type
      if (errorInfo.status === 409) {
        showWarningMessage(
          t('userManagement.errors.cannotDeleteUser'),
          t('userManagement.errors.userHasDependencies')
        );
      } else if (errorInfo.status === 404) {
        showWarningMessage(
          t('userManagement.errors.userNotFound'),
          t('userManagement.errors.userAlreadyDeleted')
        );
        // Refresh the list to remove the non-existent user
        window.location.reload();
      }

      console.error('Failed to delete user:', error);
    }
  };

  // Enhanced bulk operations handlers with detailed progress tracking and session handling
  const handleBulkOperation = async (operation: string, params: Record<string, unknown>) => {
    // Check session health before starting bulk operation
    if (!sessionContext.isSessionHealthy) {
      showWarningMessage(
        t('userManagement.session.warning.title'),
        t('userManagement.session.bulkOperationBlocked')
      );
      return;
    }

    // Validate bulk selection
    const selectionValidation = ValidationUtils.validateBulkSelection(selectedUserIds);
    if (!selectionValidation.isValid) {
      showWarningMessage(
        t('userManagement.bulkActions.validationError'),
        selectionValidation.error
      );
      return;
    }

    const operationId = `${operation}-${Date.now()}`;
    const startTime = new Date();

    // Initialize progress tracking
    const initialProgress: BulkOperationProgress = {
      operationId,
      operationType: operation as 'status-change' | 'role-assignment' | 'delete',
      totalItems: selectedUserIds.length,
      processedItems: 0,
      successfulItems: 0,
      failedItems: 0,
      percentage: 0,
      status: 'processing',
      startTime,
      errorDetails: [],
      canCancel: true,
    };

    // Save bulk operation state for session recovery
    sessionContext.saveBulkOperationState({
      operationType: operation as 'delete' | 'updateStatus' | 'updateRoles' | 'export',
      selectedIds: selectedUserIds,
      operationData: params,
      progress: {
        total: selectedUserIds.length,
        completed: 0,
        failed: [],
      },
      timestamp: Date.now(),
    });

    setBulkOperationLoading(true);
    setBulkOperationError(null);
    setBulkProgress(initialProgress);
    setOperationCancelled(false);
    setRetryCount(0);

    // Save current page state for session recovery
    sessionContext.saveNavigationState(filters, { page, limit: size });

    const updateProgress = (processedItems: number, successfulItems: number, failedItems: number, currentItem?: string, errorDetails: { itemId: string; itemName: string; error: string; retryable: boolean; retryCount: number }[] = []) => {
      const percentage = (processedItems / selectedUserIds.length) * 100;
      const elapsed = (Date.now() - startTime.getTime()) / 1000;
      const estimatedTimeRemaining = processedItems > 0 ? (elapsed / processedItems) * (selectedUserIds.length - processedItems) : undefined;

      setBulkProgress(prev => prev ? {
        ...prev,
        processedItems,
        successfulItems,
        failedItems,
        percentage,
        currentItem,
        estimatedTimeRemaining,
        errorDetails,
      } : null);
    };

    const performOperation = async (): Promise<void> => {
      switch (operation) {
        case 'status-change': {
          setBulkProgressMessage(t('userManagement.bulkActions.updatingStatus'));
          updateProgress(0, 0, 0, 'Preparing status update...');

          try {
            await bulkUpdateUserStatus({
              userIds: selectedUserIds,
              status: params.status as UserStatus
            }).unwrap();

            updateProgress(selectedUserIds.length, selectedUserIds.length, 0);
            showSuccessMessage(
              t('userManagement.bulkActions.statusUpdateSuccess'),
              t('userManagement.bulkActions.usersUpdated', { count: selectedUserIds.length })
            );
          } catch (error) {
            updateProgress(selectedUserIds.length, 0, selectedUserIds.length);
            throw error;
          }
          break;
        }

        case 'role-assignment': {
          setBulkProgressMessage(t('userManagement.bulkActions.assigningRole'));
          updateProgress(0, 0, 0, 'Preparing role assignment...');

          try {
            await bulkUpdateUserRoles({
              userIds: selectedUserIds,
              roleIds: [params.roleId as string]
            }).unwrap();

            updateProgress(selectedUserIds.length, selectedUserIds.length, 0);
            showSuccessMessage(
              t('userManagement.bulkActions.roleAssignmentSuccess'),
              t('userManagement.bulkActions.usersUpdated', { count: selectedUserIds.length })
            );
          } catch (error) {
            updateProgress(selectedUserIds.length, 0, selectedUserIds.length);
            throw error;
          }
          break;
        }

        case 'delete': {
          setBulkProgressMessage(t('userManagement.bulkActions.deletingUsers'));
          let processedCount = 0;
          let successCount = 0;
          let failedCount = 0;
          const errors: { itemId: string; itemName: string; error: string; retryable: boolean; retryCount: number }[] = [];

          // Perform individual deletes with detailed progress tracking
          for (let i = 0; i < selectedUserIds.length; i++) {
            if (operationCancelled) {
              setBulkProgress(prev => prev ? { ...prev, status: 'cancelled' } : null);
              return;
            }

            const userId = selectedUserIds[i];
            const userName = finalData?.content?.find(u => u.id === userId)?.fullName || `User ${userId}`;

            updateProgress(processedCount, successCount, failedCount, `Deleting ${userName}...`, errors);

            try {
              await deleteUser(userId).unwrap();
              successCount++;
            } catch (error) {
              failedCount++;
              errors.push({
                itemId: userId,
                itemName: userName,
                error: handleApiError(error, t).message,
                retryable: true,
                retryCount: 0,
              });
              console.error(`Failed to delete user ${userId}:`, error);
            }

            processedCount++;

            // Add small delay to show progress for better UX
            if (selectedUserIds.length > 5) {
              await new Promise(resolve => setTimeout(resolve, 100));
            }
          }

          updateProgress(processedCount, successCount, failedCount, undefined, errors);

          if (failedCount > 0) {
            showWarningMessage(
              t('userManagement.bulkActions.partialDeleteSuccess'),
              t('userManagement.bulkActions.partialDeleteMessage', {
                deleted: successCount,
                failed: failedCount
              })
            );
          } else {
            showSuccessMessage(
              t('userManagement.bulkActions.deleteSuccess'),
              t('userManagement.bulkActions.usersDeleted', { count: successCount })
            );
          }
          break;
        }
      }
    };

    try {
      // Create retry wrapper for the operation
      const retryableOperation = NetworkErrorRecovery.createRetryFunction(performOperation, 3, 1000);
      await retryableOperation();

      // Mark as completed
      setBulkProgress(prev => prev ? {
        ...prev,
        status: 'completed',
        endTime: new Date(),
        canCancel: false,
      } : null);

      // Clear selection after successful operation
      setSelectedUserIds([]);

      // Clear bulk operation session state on success
      sessionContext.clearBulkOperationState();
    } catch (error) {
      const errorInfo = handleApiError(error, t);

      // Mark as failed
      setBulkProgress(prev => prev ? {
        ...prev,
        status: 'failed',
        endTime: new Date(),
        canCancel: false,
      } : null);

      // Set specific error messages based on error type
      if (errorInfo.status === 403) {
        setBulkOperationError(t('userManagement.bulkActions.insufficientPermissions'));
      } else if (errorInfo.status === 409) {
        setBulkOperationError(t('userManagement.bulkActions.conflictError'));
      } else if (NetworkErrorRecovery.isRetryableError(error)) {
        setBulkOperationError(t('userManagement.bulkActions.networkError'));
      } else {
        setBulkOperationError(errorInfo.message || t('userManagement.bulkActions.operationFailed'));
      }

      console.error('Bulk operation failed:', error);
    } finally {
      setBulkOperationLoading(false);
      setBulkProgressMessage(null);

      // Keep progress visible for a moment after completion
      setTimeout(() => {
        setBulkProgress(null);
      }, 3000);
    }
  };

  // Handle operation cancellation
  const handleCancelOperation = () => {
    setOperationCancelled(true);
    setBulkOperationLoading(false);
    setBulkProgress(prev => prev ? {
      ...prev,
      status: 'cancelled',
      endTime: new Date(),
      canCancel: false,
    } : null);

    // Clear bulk operation session state on cancellation
    sessionContext.clearBulkOperationState();

    showInfoMessage(
      t('userManagement.bulkActions.operationCancelled'),
      t('userManagement.bulkActions.operationCancelledDescription')
    );
  };

  // Clear bulk selection with user feedback
  const handleClearSelection = () => {
    if (selectedUserIds.length > 0) {
      showInfoMessage(
        t('userManagement.bulkActions.selectionCleared'),
        t('userManagement.bulkActions.selectionClearedDescription', { count: selectedUserIds.length })
      );
    }
    setSelectedUserIds([]);
    setBulkOperationError(null);
    setValidationErrors({});
  };

  // Format user roles for display
  const formatRoles = (roles: (string | { name?: string })[]) => {
    if (!roles || roles.length === 0) {
      return t('common.none');
    }
    // Handle both string and object role formats
    const firstRole = typeof roles[0] === 'string' ? roles[0] : (roles[0]?.name || 'unknown');
    const firstRoleKey = String(firstRole || '').toLowerCase();

    if (roles.length === 1) {
      return t(`userManagement.roles.${firstRoleKey}`);
    }
    return `${t(`userManagement.roles.${firstRoleKey}`)} +${roles.length - 1}`;
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
          {user.roles.slice(0, 2).map((role, index) => {
            // Handle both string and object role formats
            const roleKey = typeof role === 'string' ? role : (role?.id || role?.name || `role-${index}`);
            const roleValue = typeof role === 'string' ? role : (role?.name || 'UNKNOWN');

            return (
              <Badge
                key={roleKey}
                variant="secondary"
                className="text-xs"
              >
                {t(`userManagement.roles.${String(roleValue || '').toLowerCase()}`)}
              </Badge>
            );
          })}
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

  // Enhanced mobile-first card component with improved touch targets
  const UserCard: React.FC<{
    user: UserListResponseDto;
    index?: number;
    style?: React.CSSProperties;
    className?: string;
    isVirtual?: boolean;
  }> = ({ user, index, style, className, isVirtual }) => (
    <div
      className={cn(
        // Base card styling with optimized hover effects
        'group relative border border-card-elevated-border bg-card shadow-md backdrop-blur-sm rounded-lg',
        'hover:shadow-xl hover:shadow-primary/5 hover:bg-card-elevated hover:z-10',
        'transition-all duration-300 ease-out transform-gpu will-change-transform',
        // Mobile-specific improvements without scale conflicts
        'min-h-[140px] sm:min-h-[160px]', // Consistent card heights
        isVirtual && 'w-full', // Full width for virtual rendering
        // Performance isolation without breaking portals
        'isolate',
        className
      )}
      style={{
        ...style,
        height: isVirtual ? `${cardHeight}px` : style?.height,
      }}
      onClick={(e) => {
        // Prevent card click when clicking on interactive elements
        const target = e.target as HTMLElement;
        const isDropdownButton = target.closest('[role="button"][aria-label*="actions"]');
        const isClickableElement = target.closest('button, a, [role="button"]');

        if (isDropdownButton || isClickableElement) {
          return; // Let the element handle its own click
        }

        // Default card click behavior - navigate to user view
        handleView(user.id);
      }}
      role='article'
      aria-labelledby={`user-title-${user.id}`}
      aria-posinset={typeof index === 'number' ? index + 1 : undefined}
      aria-setsize={finalData?.content.length}
    >
      <div className='p-3 sm:p-4 lg:p-5'>
        <div className='space-y-2 sm:space-y-3'>
          {/* Header with status and actions - Mobile optimized */}
          <div className='flex items-start justify-between gap-3 sm:gap-4'>
            <div className='min-w-0 flex-1'>
              <div className='flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3'>
                <div className='flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 border border-primary-300 shadow-sm shrink-0'>
                  <User className='h-4 w-4 sm:h-5 sm:w-5 text-primary-700' />
                </div>
                <span className='text-xs sm:text-sm font-mono font-bold text-primary-700 tabular-nums tracking-wide truncate'>
                  @{user.username}
                </span>
              </div>
              <div className='text-left w-full'>
                <h3
                  id={`user-title-${user.id}`}
                  className='text-lg sm:text-xl font-bold leading-tight text-card-foreground hover:text-primary-600 transition-colors cursor-pointer tracking-wide line-clamp-2'
                >
                  {user.fullName}
                </h3>
              </div>
              <p className='text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2 font-medium truncate'>
                {user.email}
              </p>
            </div>
            <div className='flex items-center gap-1 sm:gap-2 shrink-0'>
              <AccessibleStatusBadge
                status={user.status}
                className='shrink-0 shadow-sm text-xs sm:text-sm'
              />
              <div className='relative'>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-9 w-9 sm:h-8 sm:w-8 p-0 opacity-70 group-hover:opacity-100 transition-opacity duration-200 hover:bg-accent/80 focus:bg-accent focus:ring-2 focus:ring-primary/30 rounded-lg touch-manipulation'
                      aria-label={t('common.actions', { item: user.fullName })}
                    >
                      <MoreHorizontal className='h-4 w-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align='end'
                    className='shadow-lg border-border/20'
                    sideOffset={4}
                  >
                  <DropdownMenuItem
                    onClick={() => handleView(user.id)}
                    className='hover:bg-accent focus:bg-accent'
                  >
                    <Eye className='mr-2 h-4 w-4' />
                    {t('common.view')}
                  </DropdownMenuItem>
                  {accessControl.canShowEditAction && (
                    <DropdownMenuItem
                      onClick={() => handleEdit(user.id)}
                      className='hover:bg-accent focus:bg-accent'
                    >
                      <Edit className='mr-2 h-4 w-4' />
                      {t('common.edit')}
                    </DropdownMenuItem>
                  )}
                  {accessControl.canShowDeleteAction && (
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
          </div>

          {/* Details grid - Mobile optimized */}
          <div className='space-y-1 sm:space-y-2 text-xs sm:text-sm'>
            <div className='flex items-start gap-2 sm:gap-3'>
              <Shield className='h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground shrink-0 mt-0.5 select-none' />
              <div className='min-w-0 flex-1'>
                <span className='font-medium block sm:inline select-none'>
                  {t('userManagement.fields.roles')}:
                </span>
                <span className='ml-0 sm:ml-2 font-semibold block sm:inline break-words select-none'>
                  {formatRoles(user.roles)}
                </span>
              </div>
            </div>

            {user.department && (
              <div className='flex items-start gap-2 sm:gap-3'>
                <Users className='h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground shrink-0 mt-0.5 select-none' />
                <div className='min-w-0 flex-1'>
                  <span className='font-medium block sm:inline select-none'>
                    {t('userManagement.fields.department')}:
                  </span>
                  <span className='ml-0 sm:ml-2 font-semibold block sm:inline break-words select-none'>{user.department}</span>
                </div>
              </div>
            )}

            <div className='flex items-start gap-2 sm:gap-3'>
              <Clock className='h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground shrink-0 mt-0.5 select-none' />
              <div className='min-w-0 flex-1'>
                <span className='font-medium block sm:inline select-none'>
                  {t('userManagement.fields.lastLogin')}:
                </span>
                <span className='ml-0 sm:ml-2 font-semibold block sm:inline break-words select-none'>
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


  // Enhanced pagination component with mobile optimizations
  const PaginationControls: React.FC = () => {
    if (!finalData) {
      return null;
    }

    const totalPages = finalData.totalPages;
    const currentPage = finalData.number;

    return (
      <div className='flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0'>
        <div className='flex-1 text-xs sm:text-sm text-muted-foreground text-center sm:text-left'>
          {t('common.showing')} {finalData.numberOfElements} {t('common.of')}{' '}
          {finalData.totalElements} {t('userManagement.users').toLowerCase()}
        </div>
        <div className='flex flex-col sm:flex-row items-center gap-4 sm:gap-6 lg:gap-8'>
          <div className='flex items-center gap-2 sm:gap-2'>
            <p className='text-xs sm:text-sm font-medium hidden sm:block'>{t('common.rowsPerPage')}</p>
            <p className='text-xs font-medium sm:hidden'>Per page:</p>
            <Select
              value={size.toString()}
              onValueChange={value => {
                setSize(Number(value));
                setPage(0);
              }}
            >
              <SelectTrigger className='h-8 w-[60px] sm:w-[70px] touch-manipulation'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGINATION.PAGE_SIZE_OPTIONS.filter(pageSize =>
                  // Filter page size options for mobile
                  isMobile ? pageSize <= 20 : true
                ).map(pageSize => (
                  <SelectItem key={pageSize} value={pageSize.toString()}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='flex w-[100px] sm:w-[100px] items-center justify-center text-xs sm:text-sm font-medium'>
            <span className='hidden sm:inline'>{t('common.page')} </span>
            {currentPage + 1} {t('common.of')} {totalPages || 1}
          </div>
          <div className='flex items-center gap-1 sm:gap-2'>
            {/* Hide first/last buttons on small screens */}
            <Button
              variant='outline'
              className='hidden sm:flex h-8 w-8 p-0 touch-manipulation'
              onClick={() => setPage(0)}
              disabled={currentPage === 0}
            >
              <span className='sr-only'>{t('common.first')}</span>
              ««
            </Button>
            <Button
              variant='outline'
              className='h-9 w-9 sm:h-8 sm:w-8 p-0 touch-manipulation'
              onClick={() => setPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
            >
              <span className='sr-only'>{t('common.previous')}</span>«
            </Button>
            <Button
              variant='outline'
              className='h-9 w-9 sm:h-8 sm:w-8 p-0 touch-manipulation'
              onClick={() => setPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage >= totalPages - 1}
            >
              <span className='sr-only'>{t('common.next')}</span>»
            </Button>
            <Button
              variant='outline'
              className='hidden sm:flex h-8 w-8 p-0 touch-manipulation'
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

  // Handle loading states with smart detection
  if (showLoading) {
    return (
      <div className='space-y-2 sm:space-y-3'>
        {/* Search and Filter Loading */}
        <SearchFilterSkeleton
          showDateFilters={true}
          showRoleFilters={false}
        />

        {/* Header Loading */}
        <div className='bg-transparent rounded-lg'>
          <div className='pb-3 border-b border-border/10'>
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
              <div className='flex items-center gap-4'>
                <div className='h-11 w-11 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 border border-primary-300 flex items-center justify-center shadow-lg'>
                  <Users className='h-6 w-6 text-primary-700' />
                </div>
                <div className='h-6 w-32 bg-muted/60 animate-pulse rounded' />
              </div>
              <div className='flex items-center gap-2'>
                <div className='h-8 w-8 bg-muted/60 animate-pulse rounded' />
                <div className='h-8 w-8 bg-muted/60 animate-pulse rounded' />
                <div className='h-8 w-24 bg-muted/60 animate-pulse rounded' />
              </div>
            </div>
          </div>

          <div className='pt-4'>
            {/* Content loading based on view mode */}
            {(viewMode === 'card' || isMobile) ? (
              <UserCardSkeleton count={6} staggered />
            ) : (
              <TableSkeleton rows={8} columns={6} />
            )}
          </div>
        </div>
      </div>
    );
  }

  // Enhanced error handling with recovery options
  if (finalError) {
    const errorInfo = handleApiError(finalError, t);

    // Check if error is retryable
    if (NetworkErrorRecovery.isRetryableError(finalError) && retryCount < 3) {
      const retryOperation = async () => {
        setRetryCount(prev => prev + 1);
        // Trigger a refetch by refreshing the page
        window.location.reload();
      };

      // Auto-retry after delay for network errors
      setTimeout(retryOperation, NetworkErrorRecovery.getRetryDelay(retryCount));
    }

    return (
      <ErrorFallback
        error={finalError as Error}
        type={errorInfo.status === 403 ? 'permission' : 'network'}
        onRetry={() => {
          setRetryCount(0);
          window.location.reload();
        }}
        showRetry={NetworkErrorRecovery.isRetryableError(finalError)}
      />
    );
  }

  return (
    <div className='space-y-1 sm:space-y-2'>
      {/* Skip Links for accessibility */}
      <SkipLink href="#main-content">Skip to main content</SkipLink>
      <SkipLink href="#search-filters">Skip to search and filters</SkipLink>
      <SkipLink href="#user-results">Skip to user results</SkipLink>

      <LiveRegion />

      {/* Enhanced Search and Filter Panel with Error Boundary */}
      <Landmark role="search" aria-labelledby="search-title" id="search-filters">
      <h2 id="search-title" className="sr-only">{t('userManagement.searchAndFilters', 'Search and Filter Users')}</h2>
      <ErrorBoundary
        level='component'
        title='Ошибка поиска и фильтрации'
        description='Панель поиска и фильтрации временно недоступна.'
        fallback={
          <ServerErrorFallback
            title='Ошибка поиска'
            description='Панель поиска и фильтрации временно недоступна.'
            showRetry
          />
        }
      >
        <div className="flex flex-col gap-2 sm:gap-3">
          <div className="flex-1">
            <SkeletonToContentTransition
              loading={showLoading}
              skeleton={
                <SearchFilterSkeleton
                  showDateFilters={true}
                  showRoleFilters={false}
                />
              }
            >
              <SearchAndFilterPanel
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={clearFilters}
                isLoading={smartLoading}
                showDateFilters={true}
                showRoleFilters={false}
                showCreateButton={accessControl.canShowCreateButton}
                onCreateClick={handleCreate}
              />
            </SkeletonToContentTransition>
          </div>
        </div>
      </ErrorBoundary>
      </Landmark>

      {/* Bulk Actions Toolbar with Error Boundary */}
      {selectedUserIds.length > 0 && (
        <ErrorBoundary
          level='component'
          title='Ошибка массовых операций'
          description='Панель массовых операций временно недоступна.'
          fallback={
            <ServerErrorFallback
              title='Ошибка массовых операций'
              description='Панель массовых операций временно недоступна. Попробуйте обновить страницу.'
              showRetry
              showBack
            />
          }
        >
          {accessControl.canShowBulkActions && (
            <BulkActionsToolbar
              selectedUserIds={selectedUserIds}
              selectedUsers={finalData?.content.filter(user => selectedUserIds.includes(user.id)) || []}
              onClearSelection={handleClearSelection}
              onBulkOperation={handleBulkOperation}
              onCancelOperation={handleCancelOperation}
              availableRoles={rolesData?.content || []}
              isLoading={bulkOperationLoading}
              progressMessage={bulkProgressMessage || undefined}
              error={bulkOperationError || undefined}
              progress={bulkProgress || undefined}
            />
          )}
        </ErrorBoundary>
      )}

      {/* Results Section */}
      <Landmark role="main" aria-labelledby="main-content-title" id="main-content">
      <div className='bg-transparent rounded-lg pt-2' id="user-results">
        <div className='pb-2 border-b border-border/10'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
            <h2 id="main-content-title" className='flex items-center gap-4 text-xl font-bold tracking-wide'>
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
        {/* Data Display Section with Error Boundary */}
        <ErrorBoundary
          level='section'
          title='Ошибка отображения данных'
          description='Не удается отобразить список пользователей.'
          fallback={
            <ServerErrorFallback
              title='Ошибка отображения данных'
              description='Не удается отобразить список пользователей. Попробуйте обновить страницу.'
              showRetry
              showBack
            />
          }
        >
          <div className='pt-3'>
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
              <div className='space-y-2'>
                {/* Card View with Error Boundary */}
                {(viewMode === 'card' || isMobile) && (
                  <ErrorBoundary
                    level='component'
                    title='Ошибка карточного представления'
                    description='Не удается отобразить пользователей в виде карточек.'
                    fallback={
                      <div className='text-center py-8'>
                        <ErrorFallback
                          type='generic'
                          title='Ошибка отображения карточек'
                          description='Не удается отобразить пользователей в виде карточек.'
                          showRetry
                        />
                      </div>
                    }
                  >
                    <SkeletonToContentTransition
                      loading={!shouldShowContent}
                      skeleton={<UserCardSkeleton count={6} staggered />}
                    >
                      <div className='relative'>
                        <LoadingOverlay
                          show={smartLoading && Boolean(finalData)}
                          message='Updating...'
                        />

                        {shouldUseVirtualScrollingCards ? (
                          /* Virtual scrolling for large card lists */
                          <div className='min-h-[600px]'>
                            <VirtualList
                              items={finalData?.content || []}
                              renderItem={(user, index, _virtualItem) => (
                                <div className={cn(
                                  'px-2 py-1', // Padding around each virtual item
                                  smartLoading && finalData && 'opacity-60'
                                )}>
                                  <UserCard
                                    key={user.id}
                                    user={user}
                                    index={index}
                                    isVirtual
                                    className="w-full"
                                  />
                                </div>
                              )}
                              config={{
                                itemHeight: cardHeight + 8, // Add padding to height calculation
                                threshold: 50,
                                containerHeight: 600,
                                overscan: 3,
                              }}
                              height={600}
                              allowPortals={true}
                              className={cn(
                                'transition-opacity duration-300',
                                smartLoading && finalData && 'opacity-60'
                              )}
                              ariaLabel={`${t('userManagement.users')} - Virtual scrolling list`}
                            />

                            {/* Virtual scrolling indicator */}
                            <div className="mt-2 text-xs text-center text-muted-foreground">
                              {t('userManagement.messages.virtualScrollingActive',
                                'Showing optimized view for {count} users',
                                { count: finalData?.content.length || 0 }
                              )}
                            </div>
                          </div>
                        ) : (
                          /* Standard grid for smaller lists */
                          <div className={cn(
                            'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3 transition-opacity duration-300',
                            // Responsive grid: 1 col on mobile, 2 cols on tablet, 3 cols on desktop
                            smartLoading && finalData && 'opacity-60'
                          )}>
                            {finalData?.content.slice(0, visibleItemCount).map((user, index) => (
                              <UserCard
                                key={user.id}
                                user={user}
                                index={index}
                                style={{
                                  animationDelay: `${index * 80}ms`,
                                }}
                                className="animate-in slide-in-from-left-2 duration-300 fill-mode-both"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </SkeletonToContentTransition>
                  </ErrorBoundary>
                )}

                {/* Enhanced Table View with Error Boundary */}
                {viewMode === 'table' && !isMobile && (
                  <ErrorBoundary
                    level='component'
                    title='Ошибка табличного представления'
                    description='Не удается отобразить таблицу пользователей.'
                    fallback={
                      <div className='text-center py-8'>
                        <ErrorFallback
                          type='generic'
                          title='Ошибка отображения таблицы'
                          description='Не удается отобразить таблицу пользователей.'
                          showRetry
                        />
                      </div>
                    }
                  >
                    <SkeletonToContentTransition
                      loading={!shouldShowContent}
                      skeleton={<TableSkeleton rows={8} columns={6} />}
                    >
                      <DataTable
                        data={finalData?.content || []}
                        columns={columns}
                        loading={smartLoading}
                        enableVirtualScrolling={true}
                        virtualRowHeight={65}
                        virtualScrollThreshold={100}
                        virtualScrollHeight={600}
                        pagination={finalData ? {
                          page: finalData.number,
                          size: finalData.size,
                          totalElements: finalData.totalElements,
                          totalPages: finalData.totalPages,
                          onPageChange: setPage,
                          onPageSizeChange: (newSize) => {
                            setSize(newSize);
                            setPage(0);
                          },
                        } : undefined}
                        sorting={{
                          field: sortField,
                          direction: sortDirection,
                          onSortChange: (field, direction) => {
                            setSortField(field as SortField);
                            setSortDirection(direction);
                            setPage(0);
                          },
                        }}
                        selection={accessControl.canSelectMultiple ? selectionProps : undefined}
                        onRowClick={(user) => handleView(user.id)}
                        onRowAction={(action, user) => {
                          switch (action) {
                            case 'view':
                              handleView(user.id);
                              break;
                            case 'edit':
                              if (accessControl.canEditUserFromList) {
                                handleEdit(user.id);
                              }
                              break;
                            case 'delete':
                              if (accessControl.canDeleteUserFromList) {
                                handleDeleteClick(user);
                              }
                              break;
                          }
                        }}
                      />
                    </SkeletonToContentTransition>
                  </ErrorBoundary>
                )}
              </div>
            )}

            {/* Enhanced Pagination for Card View with mobile optimization */}
            {(viewMode === 'card' || isMobile) && finalData?.content.length > 0 && (
              <>
                <Separator className='opacity-30' />
                <div className='bg-gradient-to-r from-muted/40 to-accent/30 px-3 py-4 sm:px-6 sm:py-6 rounded-b-lg border-t border-border/10 backdrop-blur-sm'>
                  <PaginationControls />
                </div>
              </>
            )}
          </div>
        </ErrorBoundary>
      </div>
      </Landmark>

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
              <ButtonLoadingState
                loading={isDeleting}
                loadingText={t('common.deleting')}
              >
                {t('common.delete')}
              </ButtonLoadingState>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
