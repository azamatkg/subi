import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Activity,
  ArrowLeft,
  Calendar,
  Clock,
  Edit,
  Eye,
  EyeOff,
  Key,
  Mail,
  MoreHorizontal,
  Phone,
  RotateCcw,
  Shield,
  Trash,
  User,
  UserCheck,
  UserX,
  Users,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PageSkeleton } from '@/components/ui/skeleton';
import { AccessibleStatusBadge } from '@/components/ui/accessible-status-badge';
import { ErrorFallback } from '@/components/ui/error-fallback';

import { useTranslation } from '@/hooks/useTranslation';
import { useSetPageTitle } from '@/hooks/useSetPageTitle';
import { useAuth } from '@/hooks/useAuth';
import {
  handleApiError,
  showSuccessMessage,
  showWarningMessage
} from '@/utils/errorHandling';
import { UserActivityTimeline } from '@/components/admin/UserActivityTimeline';
import {
  useActivateUserMutation,
  useDeleteUserMutation,
  useGetUserActivityLogQuery,
  useGetUserByIdQuery,
  useResetUserPasswordMutation,
  useSuspendUserMutation,
} from '@/store/api/userApi';
import { UserStatus } from '@/types/user';
import { ROUTES } from '@/constants';

export const UserDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Only redirect if ID is completely missing - let API handle invalid formats
  useEffect(() => {
    if (!id) {
      console.error('No user ID provided in URL parameters');
      navigate(`${ROUTES.ADMIN}/users`, { replace: true });
      return;
    }
    // Loading user with provided ID
  }, [id, navigate]);
  const { t } = useTranslation();
  const {
    hasAnyRole,
  } = useAuth();


  // State for modals and actions
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [activateDialogOpen, setActivateDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword] = useState(() => generateRandomPassword());
  const [operationLoading, setOperationLoading] = useState<string | null>(null);

  // API queries and mutations
  const {
    data: userResponse,
    isLoading,
    error,
  } = useGetUserByIdQuery(id!, { skip: !id });

  const {
    data: activitiesResponse,
    isLoading: activitiesLoading,
    error: activitiesError,
  } = useGetUserActivityLogQuery(id!, { skip: !id });

  // Debug logging for API query state
  useEffect(() => {
    // Query state debugging removed - console.log({
    //   id,
    //   isLoading,
    //   hasResponse: !!userResponse,
    //   hasError: !!error,
    //   userData: userResponse?.data ? 'present' : 'missing'
    // });
    if (userResponse) {
      // API response structure debugging removed
    }
  }, [id, userResponse, isLoading, error]);

  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [activateUser, { isLoading: _isActivating }] = useActivateUserMutation();
  const [suspendUser, { isLoading: _isSuspending }] = useSuspendUserMutation();
  const [resetPassword, { isLoading: isResetting }] =
    useResetUserPasswordMutation();

  // Handle the actual API response structure
  // The API returns user data directly, not wrapped in ApiResponse
  const user = userResponse;
  const activities = activitiesResponse?.data || [];

  // Handle error states with redirect - be more specific about when to redirect
  useEffect(() => {
    if (error && 'status' in error && error.status === 404) {
      // User not found (404), redirecting to user list
      navigate(`${ROUTES.ADMIN}/users`, { replace: true });
    }
    // Remove the automatic redirect when user is falsy - let the API response determine this
    if (error) {
      // API error handling
    }
    if (user) {
      // User loaded successfully
    }
  }, [error, user, isLoading, navigate]);


  useSetPageTitle(
    user
      ? `${user.firstName} ${user.lastName}`
      : t('userManagement.userDetails')
  );

  // Generate random password for reset
  function generateRandomPassword(): string {
    const charset =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }

  // Handle user actions
  const handleEdit = () => {
    navigate(`${ROUTES.ADMIN}/users/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!user) {
      return;
    }

    setOperationLoading('delete');
    try {
      await deleteUser(user.id).unwrap();
      showSuccessMessage(
        t('userManagement.messages.userDeleted'),
        t('userManagement.messages.userDeletedDescription', { name: user.fullName })
      );
      navigate(`${ROUTES.ADMIN}/users`);
    } catch (error) {
      const errorInfo = handleApiError(error, t);

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
        navigate(`${ROUTES.ADMIN}/users`);
      }

      console.error('Failed to delete user:', error);
    } finally {
      setOperationLoading(null);
    }
  };

  const handleActivate = () => {
    setActivateDialogOpen(true);
  };

  const handleActivateConfirm = async () => {
    if (!user) {
      return;
    }

    // Close dialog immediately and show optimistic feedback
    setActivateDialogOpen(false);
    showSuccessMessage(
      t('userManagement.messages.userActivated'),
      t('userManagement.messages.userActivatedDescription', { name: user.fullName })
    );

    try {
      await activateUser(user.id).unwrap();
      // Success - optimistic update was correct, no additional action needed
    } catch (error) {
      const errorInfo = handleApiError(error, t);

      // Show error and let the optimistic update rollback handle the UI
      if (errorInfo.status === 409) {
        showWarningMessage(
          t('userManagement.errors.cannotActivateUser'),
          t('userManagement.errors.checkUserStatus')
        );
      } else {
        showWarningMessage(
          t('userManagement.errors.operationFailed'),
          t('userManagement.errors.tryAgainLater')
        );
      }

      console.error('Failed to activate user:', error);
    }
  };

  const handleSuspend = async () => {
    if (!user) {
      return;
    }

    // Close dialog immediately and show optimistic feedback
    setSuspendDialogOpen(false);
    showSuccessMessage(
      t('userManagement.messages.userSuspended'),
      t('userManagement.messages.userSuspendedDescription', { name: user.fullName })
    );

    try {
      await suspendUser({
        id: user.id,
        reason: 'Suspended by administrator',
      }).unwrap();
      // Success - optimistic update was correct, no additional action needed
    } catch (error) {
      const errorInfo = handleApiError(error, t);

      // Show error and let the optimistic update rollback handle the UI
      if (errorInfo.status === 409) {
        showWarningMessage(
          t('userManagement.errors.cannotSuspendUser'),
          t('userManagement.errors.checkUserStatus')
        );
      } else {
        showWarningMessage(
          t('userManagement.errors.operationFailed'),
          t('userManagement.errors.tryAgainLater')
        );
      }

      console.error('Failed to suspend user:', error);
    }
  };

  const handleResetPassword = async () => {
    if (!user) {
      return;
    }

    setOperationLoading('resetPassword');
    try {
      await resetPassword({
        id: user.id,
        data: {
          newPassword,
          requirePasswordChange: true,
        },
      }).unwrap();
      showSuccessMessage(
        t('userManagement.messages.passwordReset'),
        t('userManagement.messages.passwordResetDescription')
      );
      setResetPasswordDialogOpen(false);
    } catch (error) {
      const errorInfo = handleApiError(error, t);

      if (errorInfo.status === 409) {
        showWarningMessage(
          t('userManagement.errors.cannotResetPassword'),
          t('userManagement.errors.checkUserStatus')
        );
      }

      console.error('Failed to reset password:', error);
    } finally {
      setOperationLoading(null);
    }
  };

  const getRoleColor = (role: string): string => {
    const roleColors: Record<string, string> = {
      ADMIN: 'bg-red-100 text-red-800 border-red-200',
      CREDIT_MANAGER: 'bg-blue-100 text-blue-800 border-blue-200',
      CREDIT_ANALYST: 'bg-green-100 text-green-800 border-green-200',
      DECISION_MAKER: 'bg-purple-100 text-purple-800 border-purple-200',
      COMMISSION_MEMBER: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      USER: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return roleColors[role] || roleColors.USER;
  };

  const getStatusColor = (status: UserStatus): string => {
    switch (status) {
      case UserStatus.ACTIVE:
        return 'text-green-600';
      case UserStatus.INACTIVE:
        return 'text-gray-600';
      case UserStatus.SUSPENDED:
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const canModifyUser = hasAnyRole(['ADMIN']);

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (error) {
    // Rendering error state
    // If it's a 404 error, it will redirect via useEffect above
    if ('status' in error && error.status === 404) {
      // Returning null for 404 error (will redirect)
      return null;
    }
    return <ErrorFallback error={error as Error} type='network' />;
  }

  if (!user && !isLoading) {
    // No user data and not loading - showing loading state instead of redirecting
    // Instead of returning null and redirecting, show a proper loading/error state
    return <PageSkeleton />;
  }

  return (
    <div className='space-y-6'>
      {/* Header with navigation and actions */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => navigate(`${ROUTES.ADMIN}/users`)}
            className='gap-2'
          >
            <ArrowLeft className='h-4 w-4' />
            {t('common.back')}
          </Button>
          <Separator orientation='vertical' className='h-6' />
          <div className='flex items-center gap-3'>
            <div className='h-10 w-10 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 border border-primary-300 flex items-center justify-center'>
              <User className='h-5 w-5 text-primary-700' />
            </div>
            <div>
              <h1 className='text-2xl font-bold text-foreground'>
                {user.firstName} {user.lastName}
              </h1>
              <p className='text-muted-foreground'>
                @{user.username} • {user.email}
              </p>
            </div>
          </div>
        </div>

        {canModifyUser && (
          <div className='flex items-center gap-2'>
            <Button
              onClick={handleEdit}
              className='gap-2'
              disabled={operationLoading !== null}
            >
              <Edit className='h-4 w-4' />
              {t('common.edit')}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='outline' size='icon'>
                  <MoreHorizontal className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                {user.status === UserStatus.ACTIVE ? (
                  <DropdownMenuItem
                    onClick={() => setSuspendDialogOpen(true)}
                    className='text-orange-600'
                  >
                    <UserX className='mr-2 h-4 w-4' />
                    {t('userManagement.actions.suspend')}
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={handleActivate}
                    className='text-green-600'
                  >
                    <UserCheck className='mr-2 h-4 w-4' />
                    {t('userManagement.actions.activate')}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => setResetPasswordDialogOpen(true)}
                >
                  <Key className='mr-2 h-4 w-4' />
                  {t('userManagement.actions.resetPassword')}
                </DropdownMenuItem>
                <Separator />
                <DropdownMenuItem
                  onClick={() => setDeleteDialogOpen(true)}
                  className='text-destructive'
                >
                  <Trash className='mr-2 h-4 w-4' />
                  {t('common.delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* User status and basic info cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-lg flex items-center gap-2'>
              <Shield className='h-5 w-5' />
              {t('userManagement.fields.status')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              <div className='flex items-center gap-2'>
                <AccessibleStatusBadge status={user.status} />
                <span className={`font-medium ${getStatusColor(user.status)}`}>
                  {user.status ? t(`userManagement.status.${user.status.toLowerCase()}`) : t('userManagement.status.unknown')}
                </span>
              </div>
              {user.isActive ? (
                <div className='flex items-center gap-2 text-green-600'>
                  <UserCheck className='h-4 w-4' />
                  <span className='text-sm'>{t('userManagement.active')}</span>
                </div>
              ) : (
                <div className='flex items-center gap-2 text-gray-600'>
                  <UserX className='h-4 w-4' />
                  <span className='text-sm'>
                    {t('userManagement.inactive')}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-lg flex items-center gap-2'>
              <Clock className='h-5 w-5' />
              {t('userManagement.fields.lastLogin')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              {user.lastLoginAt ? (
                <>
                  <p className='font-medium'>
                    {new Date(user.lastLoginAt).toLocaleDateString()}
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    {new Date(user.lastLoginAt).toLocaleTimeString()}
                  </p>
                </>
              ) : (
                <p className='text-muted-foreground'>
                  {t('userManagement.never')}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-lg flex items-center gap-2'>
              <Calendar className='h-5 w-5' />
              {t('userManagement.fields.accountCreated')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <p className='font-medium'>
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
              <p className='text-sm text-muted-foreground'>
                {new Date(user.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main content tabs */}
      <Tabs defaultValue='details' className='w-full'>
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='details'>
            {t('userManagement.tabs.details')}
          </TabsTrigger>
          <TabsTrigger value='roles'>
            {t('userManagement.tabs.roles')}
          </TabsTrigger>
          <TabsTrigger value='activity'>
            {t('userManagement.tabs.activity')}
          </TabsTrigger>
          <TabsTrigger value='history'>
            {t('userManagement.tabs.history')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value='details' className='space-y-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <User className='h-5 w-5' />
                  {t('userManagement.personalInformation')}
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>
                    {t('userManagement.fields.firstName')}
                  </Label>
                  <p className='text-base font-medium'>{user.firstName}</p>
                </div>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>
                    {t('userManagement.fields.lastName')}
                  </Label>
                  <p className='text-base font-medium'>{user.lastName}</p>
                </div>
                {user.phone && (
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>
                      {t('userManagement.fields.phone')}
                    </Label>
                    <p className='text-base font-medium flex items-center gap-2'>
                      <Phone className='h-4 w-4' />
                      {user.phone}
                    </p>
                  </div>
                )}
                {user.department && (
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>
                      {t('userManagement.fields.department')}
                    </Label>
                    <p className='text-base font-medium flex items-center gap-2'>
                      <Users className='h-4 w-4' />
                      {user.department}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Mail className='h-5 w-5' />
                  {t('userManagement.systemInformation')}
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>
                    {t('userManagement.fields.username')}
                  </Label>
                  <p className='text-base font-mono'>@{user.username}</p>
                </div>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>
                    {t('userManagement.fields.email')}
                  </Label>
                  <p className='text-base'>{user.email}</p>
                </div>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>
                    {t('userManagement.fields.userId')}
                  </Label>
                  <p className='text-sm font-mono text-muted-foreground'>
                    {user.id}
                  </p>
                </div>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>
                    {t('userManagement.fields.lastUpdated')}
                  </Label>
                  <p className='text-sm'>
                    {new Date(user.updatedAt).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='roles' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Shield className='h-5 w-5' />
                {t('userManagement.currentRoles')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user.roles && user.roles.length > 0 ? (
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {user.roles.map((role, index) => {
                    // Handle both string and object role formats
                    const roleKey = typeof role === 'string' ? role : (role?.id || role?.name || index);
                    const roleValue = typeof role === 'string' ? role : (role?.name || 'UNKNOWN');
                    const roleDisplayValue = typeof role === 'string' ? role : (role?.name || role?.value || 'UNKNOWN');

                    return (
                      <div
                        key={roleKey}
                        className={`p-4 rounded-lg border ${getRoleColor(roleValue)}`}
                      >
                        <div className='flex items-center justify-between'>
                          <div>
                            <h3 className='font-medium'>
                              {roleValue ? t(`userManagement.roles.${roleValue.toLowerCase()}`) : t('userManagement.roles.unknown')}
                            </h3>
                            <p className='text-sm opacity-75 mt-1'>
                              {roleValue ? t(
                                `userManagement.roleDescriptions.${roleValue.toLowerCase()}`
                              ) : t('userManagement.roleDescriptions.unknown')}
                            </p>
                          </div>
                          <Badge variant='secondary' className='ml-2'>
                            {roleDisplayValue}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className='text-center py-8'>
                  <Shield className='h-8 w-8 text-muted-foreground/50 mx-auto mb-2' />
                  <p className='text-muted-foreground'>{t('userManagement.noRolesAssigned')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='activity' className='space-y-6'>
          {activitiesError ? (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Activity className='h-5 w-5' />
                  {t('userManagement.recentActivity')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-center py-12'>
                  <Activity className='h-12 w-12 text-muted-foreground/50 mx-auto mb-4' />
                  <h3 className='text-lg font-medium text-muted-foreground mb-2'>
                    {t('userManagement.activityLoadError')}
                  </h3>
                  <p className='text-sm text-muted-foreground max-w-md mx-auto'>
                    {t('userManagement.activityLoadErrorDescription')}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <UserActivityTimeline
              activities={activities}
              isLoading={activitiesLoading}
              maxItems={20}
              showPerformedBy={true}
            />
          )}
        </TabsContent>

        <TabsContent value='history' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <RotateCcw className='h-5 w-5' />
                {t('userManagement.roleHistory')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-center py-12'>
                <RotateCcw className='h-12 w-12 text-muted-foreground/50 mx-auto mb-4' />
                <h3 className='text-lg font-medium text-muted-foreground mb-2'>
                  {t('userManagement.roleHistoryNotAvailable')}
                </h3>
                <p className='text-sm text-muted-foreground max-w-md mx-auto'>
                  {t('userManagement.roleHistoryNotAvailableDescription')}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('userManagement.confirmDeleteTitle')}</DialogTitle>
            <DialogDescription>
              {t('userManagement.messages.confirmDelete', {
                item: `"${user.firstName} ${user.lastName}"`,
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
              onClick={handleDelete}
              disabled={isDeleting || operationLoading === 'delete'}
            >
              {(isDeleting || operationLoading === 'delete') ? t('common.deleting') : t('common.delete')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Suspend Confirmation Dialog */}
      <Dialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('userManagement.confirmSuspendTitle')}</DialogTitle>
            <DialogDescription>
              {t('userManagement.messages.confirmSuspend', {
                item: `"${user.firstName} ${user.lastName}"`,
              })}
            </DialogDescription>
          </DialogHeader>
          <div className='flex justify-end space-x-2'>
            <Button
              variant='outline'
              onClick={() => setSuspendDialogOpen(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant='destructive'
              onClick={handleSuspend}
            >
              {t('userManagement.actions.suspend')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Activate Confirmation Dialog */}
      <Dialog open={activateDialogOpen} onOpenChange={setActivateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('userManagement.confirmActivateTitle')}</DialogTitle>
            <DialogDescription>
              {t('userManagement.messages.confirmActivate', {
                item: `"${user?.firstName} ${user?.lastName}"`,
              })}
            </DialogDescription>
          </DialogHeader>
          <div className='flex justify-end space-x-2'>
            <Button
              variant='outline'
              onClick={() => setActivateDialogOpen(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleActivateConfirm}
            >
              {t('userManagement.actions.activate')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog
        open={resetPasswordDialogOpen}
        onOpenChange={setResetPasswordDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('userManagement.resetPasswordTitle')}</DialogTitle>
            <DialogDescription>
              {t('userManagement.resetPasswordDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='p-4 bg-muted/50 rounded-lg'>
              <Label className='text-sm font-medium'>
                {t('userManagement.newPassword')}
              </Label>
              <div className='flex items-center gap-2 mt-2'>
                <code className='flex-1 p-2 bg-background border rounded font-mono text-sm'>
                  {showPassword ? newPassword : '••••••••••••'}
                </code>
                <Button
                  variant='outline'
                  size='icon'
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className='h-4 w-4' />
                  ) : (
                    <Eye className='h-4 w-4' />
                  )}
                </Button>
              </div>
              <p className='text-xs text-muted-foreground mt-2'>
                {t('userManagement.passwordChangeRequired')}
              </p>
            </div>
          </div>
          <div className='flex justify-end space-x-2'>
            <Button
              variant='outline'
              onClick={() => setResetPasswordDialogOpen(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button onClick={handleResetPassword} disabled={isResetting}>
              {isResetting
                ? t('userManagement.resetting')
                : t('userManagement.actions.resetPassword')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
