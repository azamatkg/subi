import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import {
  type SessionRecoveryData,
  type UseUserManagementSessionReturn,
  useUserManagementSession,
} from '@/hooks/useUserManagementSession';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Activity,
  AlertTriangle,
  Clock,
  FileText,
  RefreshCw,
  Save,
  Shield,
  Users
} from 'lucide-react';

interface UserManagementSessionContextType extends UseUserManagementSessionReturn {
  // Navigation state management
  saveNavigationState: (filters?: Record<string, unknown>, pagination?: { page: number; limit: number }) => void;
  restoreNavigationState: () => { filters?: Record<string, unknown>; pagination?: { page: number; limit: number } } | null;

  // Recovery UI state
  showRecoveryDialog: boolean;
  dismissRecoveryDialog: () => void;
  acceptRecovery: () => void;

  // Session warning state
  showSessionWarning: boolean;
  dismissSessionWarning: () => void;
}

const UserManagementSessionContext = createContext<UserManagementSessionContextType | undefined>(
  undefined
);

interface UserManagementSessionProviderProps {
  children: React.ReactNode;
}

interface SessionRecoveryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  recoveryData: SessionRecoveryData;
}

const SessionRecoveryDialog: React.FC<SessionRecoveryDialogProps> = ({
  isOpen,
  onClose,
  onAccept,
  recoveryData,
}) => {
  const { t } = useTranslation();

  const formatTimestamp = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date(timestamp));
  };

  const getFormName = (formId: string) => {
    if (formId.includes('user-create')) {
      return t('user.form.create');
    }
    if (formId.includes('user-edit')) {
      return t('user.form.edit');
    }
    if (formId.includes('user-search')) {
      return t('user.form.search');
    }
    return formId;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            {t('userManagement.session.recovery.title')}
          </DialogTitle>
          <DialogDescription>
            {t('userManagement.session.recovery.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Session Info */}
          <Alert>
            <Activity className="h-4 w-4" />
            <AlertDescription>
              <strong>{t('userManagement.session.recovery.lastActivity')}:</strong>{' '}
              {formatTimestamp(recoveryData.lastActivity)}
            </AlertDescription>
          </Alert>

          {/* Form Backups */}
          {recoveryData.formBackups && recoveryData.formBackups.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {t('userManagement.session.recovery.formBackups')}
                  <Badge variant="secondary">{recoveryData.formBackups.length}</Badge>
                </CardTitle>
                <CardDescription>
                  {t('userManagement.session.recovery.formBackupsDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recoveryData.formBackups.map((backup) => (
                    <div
                      key={backup.formId}
                      className="flex items-center justify-between p-2 rounded border"
                    >
                      <div>
                        <div className="font-medium text-sm">
                          {getFormName(backup.formId)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {backup.pageUrl} • {formatTimestamp(backup.timestamp)}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {Object.keys(backup.formData).length} fields
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bulk Operation */}
          {recoveryData.bulkOperation && (
            <Card className="border-warning">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {t('userManagement.session.recovery.bulkOperation')}
                  <Badge variant="secondary">{recoveryData.bulkOperation.operationType}</Badge>
                </CardTitle>
                <CardDescription>
                  {t('userManagement.session.recovery.bulkOperationDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{t('userManagement.session.recovery.selectedItems')}:</span>
                    <Badge variant="outline">
                      {recoveryData.bulkOperation.selectedIds.length} items
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t('userManagement.session.recovery.bulkStartedAt')}{' '}
                    {formatTimestamp(recoveryData.bulkOperation.timestamp)}
                  </div>
                  {recoveryData.bulkOperation.progress && (
                    <div className="text-xs text-muted-foreground">
                      {t('userManagement.session.recovery.progress')}: {' '}
                      {recoveryData.bulkOperation.progress.completed} / {recoveryData.bulkOperation.progress.total}
                      {recoveryData.bulkOperation.progress.failed.length > 0 && (
                        <span className="text-destructive">
                          {' '}({recoveryData.bulkOperation.progress.failed.length} failed)
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation State */}
          {recoveryData.navigationState && (
            <Card className="bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                  {t('userManagement.session.recovery.navigationState')}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-xs text-muted-foreground">
                  <div>Page: {recoveryData.navigationState.currentPage}</div>
                  {recoveryData.navigationState.filters && (
                    <div>
                      Filters: {Object.keys(recoveryData.navigationState.filters).length} active
                    </div>
                  )}
                  {recoveryData.navigationState.pagination && (
                    <div>
                      Pagination: Page {recoveryData.navigationState.pagination.page},
                      {recoveryData.navigationState.pagination.limit} per page
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            {t('userManagement.session.recovery.dismiss')}
          </Button>
          <Button
            onClick={onAccept}
            className="w-full sm:w-auto"
          >
            <Save className="h-4 w-4 mr-2" />
            {t('userManagement.session.recovery.restore')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface SessionWarningDialogProps {
  isOpen: boolean;
  timeRemaining: number;
  onExtend: () => void;
  onDismiss: () => void;
}

const SessionWarningDialog: React.FC<SessionWarningDialogProps> = ({
  isOpen,
  timeRemaining,
  onExtend,
  onDismiss,
}) => {
  const { t } = useTranslation();
  const { logout } = useAuth();

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onDismiss}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-warning" />
            {t('userManagement.session.warning.title')}
          </DialogTitle>
          <DialogDescription>
            {t('userManagement.session.warning.description', {
              time: formatTime(timeRemaining)
            })}
          </DialogDescription>
        </DialogHeader>

        <Alert className="border-warning bg-warning/10">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {t('userManagement.session.warning.autoSaveMessage')}
          </AlertDescription>
        </Alert>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={logout}
            className="w-full sm:w-auto"
          >
            {t('userManagement.session.warning.logout')}
          </Button>
          <Button
            onClick={onExtend}
            className="w-full sm:w-auto"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('userManagement.session.warning.extend')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const UserManagementSessionProvider: React.FC<UserManagementSessionProviderProps> = ({
  children,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const sessionManagement = useUserManagementSession({
    autoBackupForms: true,
    backupInterval: 30000, // 30 seconds
    maxBackupAge: 24 * 60 * 60 * 1000, // 24 hours
    enableBulkOperationProtection: true,
  });

  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const [hasCheckedRecovery, setHasCheckedRecovery] = useState(false);

  // Save navigation state with stable reference
  const saveNavigationState = useCallback((
    filters?: Record<string, unknown>,
    pagination?: { page: number; limit: number }
  ) => {
    try {
      const recoveryData = sessionManagement.getSessionRecoveryData() || {
        formBackups: [],
        lastActivity: Date.now(),
      };

      const updatedRecoveryData = {
        ...recoveryData,
        navigationState: {
          currentPage: location.pathname,
          filters,
          pagination,
        },
        lastActivity: Date.now(),
      };

      localStorage.setItem(
        'user_management_session_recovery',
        JSON.stringify(updatedRecoveryData)
      );
    } catch (error) {
      console.warn('Failed to save navigation state:', error);
    }
  }, [location.pathname, sessionManagement]);

  // Restore navigation state
  const restoreNavigationState = () => {
    const recoveryData = sessionManagement.getSessionRecoveryData();
    return recoveryData?.navigationState || null;
  };

  // Recovery dialog handlers
  const dismissRecoveryDialog = () => {
    setShowRecoveryDialog(false);
    sessionManagement.clearSessionRecovery();
  };

  const acceptRecovery = () => {
    const recoveryData = sessionManagement.getSessionRecoveryData();
    if (!recoveryData) {
      return;
    }

    // Navigate to the previous page if different
    if (recoveryData.navigationState?.currentPage &&
        recoveryData.navigationState.currentPage !== location.pathname) {
      navigate(recoveryData.navigationState.currentPage);
    }

    setShowRecoveryDialog(false);
  };

  // Session warning handlers
  const dismissSessionWarning = () => {
    setShowSessionWarning(false);
  };

  const handleSessionWarning = () => {
    setShowSessionWarning(true);
  };

  const handleSessionExtend = () => {
    sessionManagement.extendSession();
    setShowSessionWarning(false);
  };

  // Check for recovery data on mount and route changes
  useEffect(() => {
    if (hasCheckedRecovery) {
      return;
    }

    // Only check for recovery on user management pages
    const isUserManagementPage = location.pathname.includes('/admin/users');
    if (!isUserManagementPage) {
      return;
    }

    const recoveryData = sessionManagement.getSessionRecoveryData();
    if (recoveryData &&
        (recoveryData.formBackups.length > 0 || recoveryData.bulkOperation)) {

      // Only show recovery if it's not too old (24 hours)
      const age = Date.now() - recoveryData.lastActivity;
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      if (age <= maxAge) {
        setShowRecoveryDialog(true);
      } else {
        sessionManagement.clearSessionRecovery();
      }
    }

    setHasCheckedRecovery(true);
  }, [location.pathname, hasCheckedRecovery, sessionManagement]);

  // Set up session warning callback
  useEffect(() => {
    sessionManagement.onSessionWarning(handleSessionWarning);
  }, [sessionManagement]);

  // Auto-save navigation state on location changes
  useEffect(() => {
    const isUserManagementPage = location.pathname.includes('/admin/users');
    if (isUserManagementPage) {
      // Call saveNavigationState without arguments to save current state
      try {
        const recoveryData = sessionManagement.getSessionRecoveryData() || {
          formBackups: [],
          lastActivity: Date.now(),
        };

        const updatedRecoveryData = {
          ...recoveryData,
          navigationState: {
            currentPage: location.pathname,
            filters: undefined,
            pagination: undefined,
          },
          lastActivity: Date.now(),
        };

        localStorage.setItem(
          'user_management_session_recovery',
          JSON.stringify(updatedRecoveryData)
        );
      } catch (error) {
        console.warn('Failed to auto-save navigation state:', error);
      }
    }
  }, [location.pathname, sessionManagement]);

  const contextValue: UserManagementSessionContextType = {
    ...sessionManagement,
    saveNavigationState,
    restoreNavigationState,
    showRecoveryDialog,
    dismissRecoveryDialog,
    acceptRecovery,
    showSessionWarning,
    dismissSessionWarning,
  };

  // Memoize recovery data to prevent re-renders
  const recoveryData = React.useMemo(() => {
    return sessionManagement.getSessionRecoveryData();
  }, [sessionManagement]);

  return (
    <UserManagementSessionContext.Provider value={contextValue}>
      {children}

      {/* Session Recovery Dialog */}
      {recoveryData && (
        <SessionRecoveryDialog
          isOpen={showRecoveryDialog}
          onClose={dismissRecoveryDialog}
          onAccept={acceptRecovery}
          recoveryData={recoveryData}
        />
      )}

      {/* Session Warning Dialog */}
      <SessionWarningDialog
        isOpen={showSessionWarning}
        timeRemaining={sessionManagement.timeUntilExpiry}
        onExtend={handleSessionExtend}
        onDismiss={dismissSessionWarning}
      />
    </UserManagementSessionContext.Provider>
  );
};

export const useUserManagementSessionContext = (): UserManagementSessionContextType => {
  const context = useContext(UserManagementSessionContext);
  if (context === undefined) {
    throw new Error(
      'useUserManagementSessionContext must be used within a UserManagementSessionProvider'
    );
  }
  return context;
};