import React, { useState } from 'react';
import {
  AlertCircle,
  Check,
  ChevronDown,
  Loader2,
  MoreHorizontal,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
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
import type { UserListResponseDto, UserStatus } from '@/types/user';
import type { RoleResponseDto } from '@/types/role';
import { UserStatus as UserStatusEnum } from '@/types/user';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export interface BulkActionsToolbarProps {
  selectedUserIds: string[];
  selectedUsers: UserListResponseDto[];
  onClearSelection: () => void;
  onBulkOperation: (operation: string, params: Record<string, unknown>) => void;
  availableRoles: RoleResponseDto[];
  isLoading?: boolean;
  progressMessage?: string;
  error?: string;
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
  selectedUsers,
  onClearSelection,
  onBulkOperation,
  availableRoles,
  isLoading = false,
  progressMessage,
  error,
}) => {
  const { t } = useTranslation();
  const { hasAnyRole } = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmationDialogState>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
    variant: 'default',
  });

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Don't render if no users selected
  if (selectedUserIds.length === 0) {
    return null;
  }

  const handleStatusChange = (status: UserStatus) => {
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
  };

  const handleDelete = () => {
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
  };

  const handleRoleAssignment = (roleId: string) => {
    onBulkOperation('role-assignment', { roleId });
  };

  const handleRetry = () => {
    // Placeholder for retry logic - would depend on the specific operation being retried
    // In a real implementation, this would retry the last failed operation
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

        {/* Progress Message */}
        {isLoading && (
          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {progressMessage || t('common.loading')}
          </div>
        )}

        {/* Error Message */}
        {error && !isLoading && (
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