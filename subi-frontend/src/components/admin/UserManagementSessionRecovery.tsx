import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  RefreshCw,
  Users,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { useUserManagementSessionContext } from '@/contexts/UserManagementSessionContext';

interface UserManagementSessionRecoveryProps {
  onRecoveryComplete?: () => void;
  onRecoveryDismiss?: () => void;
}

export const UserManagementSessionRecovery: React.FC<UserManagementSessionRecoveryProps> = ({
  onRecoveryComplete,
  onRecoveryDismiss,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const sessionContext = useUserManagementSessionContext();
  const [selectedFormIds, setSelectedFormIds] = useState<string[]>([]);
  const [isRestoring, setIsRestoring] = useState(false);

  const recoveryData = sessionContext.getSessionRecoveryData();

  if (!recoveryData) {
    return null;
  }

  const formatTimestamp = (timestamp: number) => {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(timestamp));
  };

  const getFormDisplayName = (formId: string) => {
    if (formId.includes('user-create')) {
      return t('userManagement.forms.createUser');
    }
    if (formId.includes('user-edit')) {
      const userId = formId.replace('user-edit-', '');
      return t('userManagement.forms.editUser', { id: userId });
    }
    if (formId.includes('user-search')) {
      return t('userManagement.forms.searchFilters');
    }
    return formId;
  };

  const handleFormSelection = (formId: string, checked: boolean) => {
    if (checked) {
      setSelectedFormIds(prev => [...prev, formId]);
    } else {
      setSelectedFormIds(prev => prev.filter(id => id !== formId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedFormIds(recoveryData.formBackups.map(backup => backup.formId));
    } else {
      setSelectedFormIds([]);
    }
  };

  const handleRecovery = async () => {
    setIsRestoring(true);

    try {
      // Restore selected forms
      for (const formId of selectedFormIds) {
        const backup = recoveryData.formBackups.find(b => b.formId === formId);
        if (backup) {
          // The form restoration will be handled by individual page components
          // We just need to navigate to the appropriate page
          if (formId.includes('user-create')) {
            navigate('/admin/users/create');
          } else if (formId.includes('user-edit-')) {
            const userId = formId.replace('user-edit-', '');
            navigate(`/admin/users/${userId}/edit`);
          }
        }
      }

      // Restore navigation state if available
      if (recoveryData.navigationState?.currentPage) {
        navigate(recoveryData.navigationState.currentPage);
      }

      // Mark recovery as complete
      onRecoveryComplete?.();
    } catch (error) {
      console.error('Recovery failed:', error);
    } finally {
      setIsRestoring(false);
    }
  };

  const handleDismiss = () => {
    sessionContext.clearSessionRecovery();
    onRecoveryDismiss?.();
  };

  const handleContinueBulkOperation = () => {
    if (recoveryData.bulkOperation) {
      // Navigate to the user list page where bulk operations happen
      navigate('/admin/users');
      onRecoveryComplete?.();
    }
  };

  const canRestore = selectedFormIds.length > 0 || recoveryData.bulkOperation;

  return (
    <Card className="w-full max-w-4xl mx-auto border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-primary" />
          {t('userManagement.session.recovery.title')}
        </CardTitle>
        <CardDescription>
          {t('userManagement.session.recovery.subtitle', {
            time: formatTimestamp(recoveryData.lastActivity)
          })}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Session Info Alert */}
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            {t('userManagement.session.recovery.sessionInfo', {
              duration: Math.floor((Date.now() - recoveryData.lastActivity) / (1000 * 60))
            })}
          </AlertDescription>
        </Alert>

        {/* Form Backups Section */}
        {recoveryData.formBackups && recoveryData.formBackups.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {t('userManagement.session.recovery.formBackups')}
                <Badge variant="secondary">{recoveryData.formBackups.length}</Badge>
              </h3>
              <Checkbox
                checked={selectedFormIds.length === recoveryData.formBackups.length}
                onCheckedChange={handleSelectAll}
                aria-label={t('common.selectAll')}
              />
            </div>

            <ScrollArea className="max-h-60 border rounded-lg p-4">
              <div className="space-y-3">
                {recoveryData.formBackups.map((backup, _index) => (
                  <div
                    key={backup.formId}
                    className="flex items-center justify-between p-3 rounded border bg-card/50"
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedFormIds.includes(backup.formId)}
                        onCheckedChange={(checked) =>
                          handleFormSelection(backup.formId, checked as boolean)
                        }
                        aria-label={t('userManagement.session.recovery.selectForm')}
                      />
                      <div>
                        <div className="font-medium">
                          {getFormDisplayName(backup.formId)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {backup.pageUrl} • {formatTimestamp(backup.timestamp)}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {Object.keys(backup.formData).length} {t('userManagement.session.recovery.fields')}
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Bulk Operation Section */}
        {recoveryData.bulkOperation && (
          <>
            <Separator />
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Users className="h-5 w-5" />
                {t('userManagement.session.recovery.bulkOperation')}
              </h3>

              <Card className="border-warning/20 bg-warning/5">
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {t('userManagement.bulkActions.' + recoveryData.bulkOperation.operationType)}
                      </span>
                      <Badge variant="secondary">
                        {recoveryData.bulkOperation.selectedIds.length} {t('common.items')}
                      </Badge>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      {t('userManagement.session.recovery.startedAt', {
                        time: formatTimestamp(recoveryData.bulkOperation.timestamp)
                      })}
                    </div>

                    {recoveryData.bulkOperation.progress && (
                      <div className="text-sm">
                        <div className="flex items-center justify-between">
                          <span>{t('userManagement.session.recovery.progress')}:</span>
                          <span>
                            {recoveryData.bulkOperation.progress.completed} / {recoveryData.bulkOperation.progress.total}
                          </span>
                        </div>
                        {recoveryData.bulkOperation.progress.failed.length > 0 && (
                          <div className="text-destructive text-xs mt-1">
                            {t('userManagement.session.recovery.failedItems', {
                              count: recoveryData.bulkOperation.progress.failed.length
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleContinueBulkOperation}
                      className="w-full mt-3"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      {t('userManagement.session.recovery.continueBulkOperation')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Recovery Actions */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleDismiss}
            className="flex-1"
          >
            <X className="h-4 w-4 mr-2" />
            {t('userManagement.session.recovery.dismiss')}
          </Button>

          <Button
            onClick={handleRecovery}
            disabled={!canRestore || isRestoring}
            className="flex-1"
          >
            {isRestoring ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4 mr-2" />
            )}
            {isRestoring
              ? t('userManagement.session.recovery.restoring')
              : t('userManagement.session.recovery.restore')
            }
          </Button>
        </div>

        {/* Recovery Tips */}
        <Alert className="bg-muted/30">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{t('common.tip')}:</strong> {' '}
            {t('userManagement.session.recovery.tip')}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};