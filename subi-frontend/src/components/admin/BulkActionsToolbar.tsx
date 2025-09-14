import React, { useCallback, useState } from 'react';
import {
  AlertCircle,
  Check,
  ChevronDown,
  Clock,
  Eye,
  EyeOff,
  Loader2,
  MoreHorizontal,
  RefreshCw,
  Shield,
  ShieldAlert,
  StopCircle,
  Trash2,
  UserMinus,
  UserPlus,
  Users,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { BulkOperationProgress, UserListResponseDto, UserStatus } from '@/types/user';
import type { RoleResponseDto } from '@/types/role';
import { UserStatus as UserStatusEnum } from '@/types/user';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { announceToScreenReader } from '@/lib/accessibility';

export interface BulkActionsToolbarProps {
  selectedUserIds: string[];
  selectedUsers: UserListResponseDto[];
  onClearSelection: () => void;
  onBulkOperation: (operation: string, params: Record<string, unknown>) => void;
  onCancelOperation?: () => void;
  availableRoles: RoleResponseDto[];
  isLoading?: boolean;
  progressMessage?: string;
  error?: string;
  progress?: BulkOperationProgress;
}

interface ConfirmationDialogState {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  variant: 'default' | 'destructive';
}

export const BulkActionsToolbar: React.FC<BulkActionsToolbarProps> = ({
  selectedUserIds,
  selectedUsers: _selectedUsers,
  onClearSelection,
  onBulkOperation,
  onCancelOperation,
  availableRoles,
  isLoading = false,
  progressMessage,
  error,
  progress,
}) => {
  const { t } = useTranslation();
  const { hasAnyRole } = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showProgressDetails, setShowProgressDetails] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmationDialogState>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
    variant: 'default',
  });

  // Keyboard shortcuts
  const handleKeyboardShortcuts = useCallback((e: KeyboardEvent) => {
    // Only handle shortcuts when bulk actions are visible
    if (selectedUserIds.length === 0) {return;}

    // Handle escape to clear selection
    if (e.key === 'Escape') {
      e.preventDefault();
      onClearSelection();
      announceToScreenReader('Selection cleared', 'polite');
      return;
    }

    // Handle shortcuts with modifier keys
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'd':
        case 'D':
          e.preventDefault();
          if (hasAnyRole(['ADMIN'])) {
            handleDelete();
          }
          break;
        case 'a':
        case 'A':
          e.preventDefault();
          if (hasAnyRole(['ADMIN'])) {
            handleStatusChange(UserStatusEnum.ACTIVE);
          }
          break;
        case 'i':
        case 'I':
          e.preventDefault();
          if (hasAnyRole(['ADMIN'])) {
            handleStatusChange(UserStatusEnum.INACTIVE);
          }
          break;
      }
    }
  }, [selectedUserIds.length, onClearSelection, hasAnyRole, handleDelete, handleStatusChange]);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeyboardShortcuts);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyboardShortcuts);
    };
  }, [handleKeyboardShortcuts]);

  // Define handlers with useCallback
  const handleStatusChange = useCallback((status: UserStatus) => {
    const statusLabel = t(`userManagement.status.${status.toLowerCase()}`);
    setConfirmDialog({
      open: true,
      title: t('userManagement.bulkActions.confirmStatusChange', { count: selectedUserIds.length }),
      message: t('userManagement.bulkActions.confirmStatusChangeMessage', {
        count: selectedUserIds.length,
        status: statusLabel,
      }),
      onConfirm: () => {
        onBulkOperation('status-change', { status });
        setConfirmDialog(prev => ({ ...prev, open: false }));
      },
      variant: 'default',
    });
  }, [t, selectedUserIds.length, onBulkOperation]);

  const handleDelete = useCallback(() => {
    setConfirmDialog({
      open: true,
      title: t('userManagement.bulkActions.confirmDelete', { count: selectedUserIds.length }),
      message: t('userManagement.bulkActions.confirmDeleteMessage', { count: selectedUserIds.length }),
      onConfirm: () => {
        onBulkOperation('delete', {});
        setConfirmDialog(prev => ({ ...prev, open: false }));
      },
      variant: 'destructive',
    });
  }, [t, selectedUserIds.length, onBulkOperation]);

  // Don't render if no users selected
  if (selectedUserIds.length === 0) {
    return null;
  }

  const handleRoleAssignment = (roleId: string) => {
    onBulkOperation('role-assignment', { roleId });
  };

  const handleRetry = () => {
    // Placeholder for retry logic - would depend on the specific operation being retried
    // In a real implementation, this would retry the last failed operation
  };

  const handleCancelOperation = () => {
    if (onCancelOperation) {
      onCancelOperation();
    }
  };

  // Format time remaining
  const formatTimeRemaining = (seconds: number): string => {
    if (seconds < 60) {
      return t('common.timeRemaining.seconds', { count: Math.round(seconds) });
    }
    if (seconds < 3600) {
      const minutes = Math.round(seconds / 60);
      return t('common.timeRemaining.minutes', { count: minutes });
    }
    const hours = Math.floor(seconds / 3600);
    const remainingMinutes = Math.round((seconds % 3600) / 60);
    return t('common.timeRemaining.hoursMinutes', { hours, minutes: remainingMinutes });
  };

  // Get progress status color
  const getProgressStatusColor = (status: string): string => {
    switch (status) {
      case 'processing':
        return 'text-blue-600';
      case 'completed':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      case 'cancelled':
        return 'text-orange-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const renderStatusButtons = () => (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleStatusChange(UserStatusEnum.ACTIVE)}
        disabled={isLoading}
        aria-label={t('userManagement.bulkActions.activate')}
      >
        <UserPlus className="h-4 w-4 mr-2" />
        {t('userManagement.bulkActions.activate')}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleStatusChange(UserStatusEnum.INACTIVE)}
        disabled={isLoading}
        aria-label={t('userManagement.bulkActions.deactivate')}
      >
        <UserMinus className="h-4 w-4 mr-2" />
        {t('userManagement.bulkActions.deactivate')}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleStatusChange(UserStatusEnum.SUSPENDED)}
        disabled={isLoading}
        aria-label={t('userManagement.bulkActions.suspend')}
      >
        <ShieldAlert className="h-4 w-4 mr-2" />
        {t('userManagement.bulkActions.suspend')}
      </Button>
    </>
  );

  const renderDeleteButton = () => (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleDelete}
      disabled={isLoading}
      aria-label={t('userManagement.bulkActions.delete')}
      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
    >
      <Trash2 className="h-4 w-4 mr-2" />
      {t('userManagement.bulkActions.delete')}
    </Button>
  );

  const renderRoleAssignmentButton = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isLoading}
          aria-label={t('userManagement.bulkActions.assignRole')}
        >
          <Shield className="h-4 w-4 mr-2" />
          {t('userManagement.bulkActions.assignRole')}
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{t('common.selectRole')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {availableRoles.map((role) => (
          <DropdownMenuItem
            key={role.id}
            onClick={() => handleRoleAssignment(role.id)}
            className="cursor-pointer"
          >
            <Shield className="h-4 w-4 mr-2" />
            {t(`userManagement.roles.${role.name.toLowerCase()}`) || role.description}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const renderMobileActions = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isLoading}
          aria-label={t('common.more')}
        >
          <MoreHorizontal className="h-4 w-4" />
          {t('common.more')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{t('common.actions')}</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => handleStatusChange(UserStatusEnum.ACTIVE)}>
          <UserPlus className="h-4 w-4 mr-2" />
          {t('userManagement.bulkActions.activate')}
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleStatusChange(UserStatusEnum.INACTIVE)}>
          <UserMinus className="h-4 w-4 mr-2" />
          {t('userManagement.bulkActions.deactivate')}
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleStatusChange(UserStatusEnum.SUSPENDED)}>
          <ShieldAlert className="h-4 w-4 mr-2" />
          {t('userManagement.bulkActions.suspend')}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
          <Trash2 className="h-4 w-4 mr-2" />
          {t('userManagement.bulkActions.delete')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <>
      <div
        role="toolbar"
        aria-label={t('userManagement.bulkActions.title')}
        className={cn(
          'sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
          'border-b border-border px-4 py-3 shadow-sm'
        )}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">
                {t('userManagement.bulkActions.title')}
              </span>
            </div>

            <div
              className="text-sm text-muted-foreground"
              aria-live="polite"
              aria-atomic="true"
            >
              {t('userManagement.bulkActions.selected', { count: selectedUserIds.length })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isMobile ? (
              <>
                {hasAnyRole(['ADMIN']) && (
                  <>
                    {renderStatusButtons()}
                    {renderRoleAssignmentButton()}
                    {renderDeleteButton()}
                  </>
                )}
              </>
            ) : (
              <>
                {hasAnyRole(['ADMIN']) && renderMobileActions()}
              </>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              disabled={isLoading}
              aria-label={t('userManagement.bulkActions.clearSelection')}
            >
              <X className="h-4 w-4 mr-2" />
              {t('userManagement.bulkActions.clearSelection')}
            </Button>
          </div>
        </div>

        {/* Enhanced Progress Display */}
        {(isLoading || progress) && (
          <div className="mt-3 space-y-3">
            {/* Main Progress Bar and Status */}
            <div className="flex items-center gap-3">
              <div className="flex-1 space-y-2">
                {/* Progress Bar */}
                <div className="flex items-center gap-3">
                  <Progress
                    value={progress?.percentage || 0}
                    className="flex-1 h-2"
                  />
                  <span className="text-sm font-medium min-w-[48px] text-right">
                    {Math.round(progress?.percentage || 0)}%
                  </span>
                </div>

                {/* Status and Progress Message */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    <span className={getProgressStatusColor(progress?.status || 'processing')}>
                      {progressMessage ||
                       (progress?.currentItem
                         ? t('bulkOperations.processsingItem', { item: progress.currentItem })
                         : t('common.loading')
                       )}
                    </span>
                  </div>

                  {/* Time Remaining */}
                  {progress?.estimatedTimeRemaining && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatTimeRemaining(progress.estimatedTimeRemaining)}</span>
                    </div>
                  )}
                </div>

                {/* Progress Summary */}
                {progress && (
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{t('bulkOperations.processed', {
                      processed: progress.processedItems,
                      total: progress.totalItems
                    })}</span>
                    {progress.successfulItems > 0 && (
                      <span className="text-green-600">
                        ✓ {t('bulkOperations.successful', { count: progress.successfulItems })}
                      </span>
                    )}
                    {progress.failedItems > 0 && (
                      <span className="text-red-600">
                        ✗ {t('bulkOperations.failed', { count: progress.failedItems })}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Cancel Button */}
              {progress?.canCancel && isLoading && onCancelOperation && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelOperation}
                  className="flex-shrink-0"
                >
                  <StopCircle className="h-4 w-4 mr-2" />
                  {t('common.cancel')}
                </Button>
              )}
            </div>

            {/* Progress Details Toggle */}
            {progress?.errorDetails && progress.errorDetails.length > 0 && (
              <Collapsible open={showProgressDetails} onOpenChange={setShowProgressDetails}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-0 h-auto font-normal">
                    <div className="flex items-center gap-2 text-sm">
                      {showProgressDetails ? (
                        <EyeOff className="h-3 w-3" />
                      ) : (
                        <Eye className="h-3 w-3" />
                      )}
                      <span>
                        {t('bulkOperations.showDetails')} ({progress.errorDetails.length} {t('bulkOperations.errors')})
                      </span>
                    </div>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1">
                  {progress.errorDetails.slice(0, 5).map((errorDetail, index) => (
                    <div
                      key={`${errorDetail.itemId}-${index}`}
                      className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded text-xs"
                    >
                      <AlertCircle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-red-700">{errorDetail.itemName}</div>
                        <div className="text-red-600">{errorDetail.error}</div>
                      </div>
                      {errorDetail.retryable && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => {/* TODO: Implement retry for specific item */}}
                        >
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                  {progress.errorDetails.length > 5 && (
                    <div className="text-xs text-muted-foreground text-center py-1">
                      {t('bulkOperations.andMore', { count: progress.errorDetails.length - 5 })}
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        )}

        {/* Simple Error Message (when not in progress) */}
        {error && !isLoading && !progress && (
          <div className="mt-3">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{error}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                  className="ml-4"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t('common.retry')}
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className={cn(
              confirmDialog.variant === 'destructive' && 'text-destructive'
            )}>
              {confirmDialog.title}
            </DialogTitle>
            <DialogDescription>
              {confirmDialog.message}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant={confirmDialog.variant === 'destructive' ? 'destructive' : 'default'}
              onClick={confirmDialog.onConfirm}
            >
              {confirmDialog.variant === 'destructive' ? (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('common.confirm')}
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  {t('common.confirm')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};