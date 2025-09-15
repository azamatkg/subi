import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Clock, RefreshCw, Shield } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserManagementSessionContext } from '@/contexts/UserManagementSessionContext';

interface BulkOperationSessionGuardProps {
  children: React.ReactNode;
  onSessionExtended?: () => void;
  onOperationCancel?: () => void;
}

export const BulkOperationSessionGuard: React.FC<BulkOperationSessionGuardProps> = ({
  children,
  onSessionExtended,
  onOperationCancel,
}) => {
  const { t } = useTranslation();
  const sessionContext = useUserManagementSessionContext();

  // Show warning if session is about to expire and bulk operation is in progress
  const shouldShowWarning =
    sessionContext.shouldShowWarning &&
    sessionContext.hasPendingBulkOperation;

  const formatTimeRemaining = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleExtendSession = () => {
    sessionContext.extendSession();
    onSessionExtended?.();
  };

  const handleCancelOperation = () => {
    sessionContext.clearBulkOperationState();
    onOperationCancel?.();
  };

  if (shouldShowWarning) {
    return (
      <div className="space-y-4">
        <Alert className="border-warning bg-warning/10">
          <Clock className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <strong>{t('userManagement.session.bulkOperationWarning')}:</strong>{' '}
              {t('userManagement.session.sessionExpiresIn', {
                time: formatTimeRemaining(sessionContext.timeUntilExpiry)
              })}
            </div>
            <div className="flex gap-2 ml-4">
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancelOperation}
                className="text-xs"
              >
                {t('userManagement.bulkActions.cancel')}
              </Button>
              <Button
                size="sm"
                onClick={handleExtendSession}
                className="text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                {t('userManagement.session.extend')}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
        {children}
      </div>
    );
  }

  // Show blocking message if session has expired and bulk operation is in progress
  if (!sessionContext.isSessionHealthy && sessionContext.hasPendingBulkOperation) {
    return (
      <Card className="border-destructive">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Shield className="h-5 w-5" />
            {t('userManagement.session.operationBlocked')}
          </CardTitle>
          <CardDescription>
            {t('userManagement.session.operationBlockedDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="border-warning bg-warning/10 mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {t('userManagement.session.bulkOperationInterrupted')}
            </AlertDescription>
          </Alert>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCancelOperation}
            >
              {t('userManagement.bulkActions.cancel')}
            </Button>
            <Button
              onClick={() => window.location.reload()}
            >
              {t('userManagement.session.refreshPage')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
};

interface SessionAwareFormWrapperProps {
  children: React.ReactNode;
  formId: string;
  onFormRestore?: (data: Record<string, unknown>) => void;
}

export const SessionAwareFormWrapper: React.FC<SessionAwareFormWrapperProps> = ({
  children,
  formId,
  onFormRestore,
}) => {
  const { t } = useTranslation();
  const sessionContext = useUserManagementSessionContext();

  const hasBackup = sessionContext.hasFormBackup(formId);

  const handleRestoreForm = () => {
    const backupData = sessionContext.restoreFormData(formId);
    if (backupData) {
      onFormRestore?.(backupData);
    }
  };

  const handleDiscardBackup = () => {
    sessionContext.clearFormBackup(formId);
  };

  if (hasBackup) {
    return (
      <div className="space-y-4">
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              {t('userManagement.session.formBackupAvailable')}
            </span>
            <div className="flex gap-2 ml-4">
              <Button
                size="sm"
                variant="outline"
                onClick={handleDiscardBackup}
                className="text-xs"
              >
                {t('common.discard')}
              </Button>
              <Button
                size="sm"
                onClick={handleRestoreForm}
                className="text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                {t('common.restore')}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
        {children}
      </div>
    );
  }

  return <>{children}</>;
};

interface SessionHealthIndicatorProps {
  className?: string;
}

export const SessionHealthIndicator: React.FC<SessionHealthIndicatorProps> = ({
  className = '',
}) => {
  const { t } = useTranslation();
  const sessionContext = useUserManagementSessionContext();

  const getHealthColor = () => {
    if (!sessionContext.isSessionHealthy) {
      return 'text-destructive';
    }
    if (sessionContext.shouldShowWarning) {
      return 'text-warning';
    }
    return 'text-success';
  };

  const getHealthText = () => {
    if (!sessionContext.isSessionHealthy) {
      return t('userManagement.session.expired');
    }
    if (sessionContext.shouldShowWarning) {
      const minutes = Math.floor(sessionContext.timeUntilExpiry / 60000);
      return t('userManagement.session.expiresInMinutes', { minutes });
    }
    return t('userManagement.session.active');
  };

  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      <div className={`w-2 h-2 rounded-full ${
        !sessionContext.isSessionHealthy
          ? 'bg-destructive'
          : sessionContext.shouldShowWarning
            ? 'bg-warning animate-pulse'
            : 'bg-success'
      }`} />
      <span className={getHealthColor()}>
        {getHealthText()}
      </span>
    </div>
  );
};