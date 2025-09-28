import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Shield,
  Activity,
  RotateCcw,
  FileText,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageSkeleton } from '@/components/ui/skeleton';
import { ErrorFallback } from '@/components/ui/error-fallback';

import { DeleteUserDialog } from '@/components/dialogs/DeleteUserDialog';
import { SuspendUserDialog } from '@/components/dialogs/SuspendUserDialog';
import { ResetPasswordDialog } from '@/components/dialogs/ResetPasswordDialog';
import { UserActionDropdown } from '@/components/user/UserActionDropdown';
import { UserDetailsTab } from '@/components/user/UserDetailsTab';
import { UserRolesTab } from '@/components/user/UserRolesTab';
import { UserActivityTab } from '@/components/user/UserActivityTab';
import { UserHistoryTab } from '@/components/user/UserHistoryTab';

import { useTranslation } from '@/hooks/useTranslation';
import { useSetPageTitle } from '@/hooks/useSetPageTitle';
import { useAuth } from '@/hooks/useAuth';
import {
  useGetUserByIdQuery,
  useDeleteUserMutation,
  useActivateUserMutation,
  useSuspendUserMutation,
  useResetUserPasswordMutation,
} from '@/store/api/userApi';
import { UserResponseDto } from '@/types/user';
import { ROUTES } from '@/constants';

interface ApiError {
  status?: number;
  data?: unknown;
  message?: string;
}


export const UserDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Validate ID parameter and redirect if invalid
  useEffect(() => {
    console.log('UserDetailPage mounted with ID:', id);
    if (!id || id.trim() === '') {
      console.error('No user ID provided in URL parameters');
      navigate(`${ROUTES.ADMIN}/users`, { replace: true });
      return;
    }
  }, [id, navigate]);
  const { t } = useTranslation();
  const {
    hasAnyRole,
    isAuthenticated,
    accessToken,
    user: currentUser,
  } = useAuth();

  // Debug authentication
  useEffect(() => {
    console.log('Auth state:', {
      isAuthenticated,
      hasToken: !!accessToken,
      currentUser,
    });
  }, [isAuthenticated, accessToken, currentUser]);

  // State for modals and actions
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [newPassword] = useState(() => generateRandomPassword());

  // API queries and mutations
  const {
    data: userResponse,
    isLoading,
    error,
  } = useGetUserByIdQuery(id!, { skip: !id });

  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [activateUser, { isLoading: isActivating }] = useActivateUserMutation();
  const [suspendUser, { isLoading: isSuspending }] = useSuspendUserMutation();
  const [resetPassword, { isLoading: isResetting }] =
    useResetUserPasswordMutation();

  // Handle the actual API response structure
  // The API returns the user object directly, not wrapped in { data: user }
  const user = useMemo(() => {
    if (!userResponse) return undefined;

    // Ensure we have the expected user data structure
    const rawUser = userResponse;
    if (!rawUser.id || !rawUser.username || !rawUser.email) {
      console.error('Invalid user data structure:', rawUser);
      return undefined;
    }

    return {
      ...rawUser,
      // Handle isActive/enabled property mapping
      isActive: rawUser.isActive ?? (rawUser as UserResponseDto & { enabled?: boolean }).enabled ?? false,
      // Ensure roles is always an array
      roles: Array.isArray(rawUser.roles) ? rawUser.roles : [],
      // Ensure fullName is computed if not provided
      fullName: rawUser.fullName || `${rawUser.firstName} ${rawUser.lastName}`.trim(),
    };
  }, [userResponse]);

  // Debug logging
  useEffect(() => {
    console.log('UserDetailPage Debug:', {
      id,
      userResponse,
      user,
      isLoading,
      error,
      errorDetails: error
        ? {
            status: (error as ApiError)?.status,
            data: (error as ApiError)?.data,
            message: (error as ApiError)?.message,
          }
        : null,
    });

    if (error) {
      console.error('API Error details:', error);
    }

    if (id) {
      console.log(`Making API call to: GET /api/users/${id}`);
    }

    // Additional validation logging
    if (userResponse && !user) {
      console.error('User data validation failed:', {
        userResponse,
        hasId: !!userResponse.id,
        hasUsername: !!userResponse.username,
        hasEmail: !!userResponse.email,
      });
    }
  }, [id, userResponse, user, isLoading, error]);

  useSetPageTitle(
    user
      ? `${user?.firstName} ${user?.lastName}`
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
    if (!user) return;
    try {
      await deleteUser(user?.id).unwrap();
      navigate(`${ROUTES.ADMIN}/users`);
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const handleActivate = async () => {
    if (!user) return;
    try {
      await activateUser(user?.id).unwrap();
    } catch (error) {
      console.error('Failed to activate user:', error);
    }
  };

  const handleSuspend = async () => {
    if (!user) return;
    try {
      await suspendUser({
        id: user?.id,
        reason: 'Suspended by administrator',
      }).unwrap();
      setSuspendDialogOpen(false);
    } catch (error) {
      console.error('Failed to suspend user:', error);
    }
  };

  const handleResetPassword = async () => {
    if (!user) return;
    try {
      await resetPassword({
        id: user?.id,
        data: {
          newPassword,
          requirePasswordChange: true,
        },
      }).unwrap();
      setResetPasswordDialogOpen(false);
    } catch (error) {
      console.error('Failed to reset password:', error);
    }
  };



  const canModifyUser = hasAnyRole(['ADMIN']);

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (error) {
    console.error('UserDetailPage error:', error);
    return <ErrorFallback error={error as Error} type='network' />;
  }

  if (!user && !isLoading && !error) {
    console.error('No user data found for id:', id, {
      userResponse,
      hasUserResponse: !!userResponse,
    });
    return (
      <ErrorFallback
        error={new Error(`User not found with ID: ${id}`)}
        type='network'
      />
    );
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
        </div>

        {canModifyUser && user && (
          <div className='flex items-center gap-2'>
            <Button onClick={handleEdit} className='gap-2'>
              <Edit className='h-4 w-4' />
              {t('common.edit')}
            </Button>

            <UserActionDropdown
              user={user}
              onSuspend={() => setSuspendDialogOpen(true)}
              onActivate={handleActivate}
              onResetPassword={() => setResetPasswordDialogOpen(true)}
              onDelete={() => setDeleteDialogOpen(true)}
              isActivating={isActivating}
            />
          </div>
        )}
      </div>

      {/* Main content tabs */}
      <Tabs defaultValue='details' className='w-full'>
        <TabsList className='flex w-full gap-1 justify-start'>
          <TabsTrigger value='details' className='flex-shrink-0 w-10'>
            <FileText className='h-4 w-4' />
          </TabsTrigger>
          <TabsTrigger value='roles' className='flex-shrink-0 max-w-32'>
            <Shield className='h-4 w-4 mr-2' />
            {t('userManagement.tabs.roles')}
          </TabsTrigger>
          <TabsTrigger value='activity' className='flex-shrink-0 max-w-32'>
            <Activity className='h-4 w-4 mr-2' />
            {t('userManagement.tabs.activity')}
          </TabsTrigger>
          <TabsTrigger value='history' className='flex-shrink-0 max-w-32'>
            <RotateCcw className='h-4 w-4 mr-2' />
            {t('userManagement.tabs.history')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value='details' className='space-y-6'>
          {user && <UserDetailsTab user={user} />}
        </TabsContent>

        <TabsContent value='roles' className='space-y-6'>
          {user && <UserRolesTab user={user} />}
        </TabsContent>

        <TabsContent value='activity' className='space-y-6'>
          <UserActivityTab />
        </TabsContent>

        <TabsContent value='history' className='space-y-6'>
          <UserHistoryTab />
        </TabsContent>
      </Tabs>

      {/* Dialog Components */}
      <DeleteUserDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        user={user}
        isLoading={isDeleting}
      />

      <SuspendUserDialog
        isOpen={suspendDialogOpen}
        onClose={() => setSuspendDialogOpen(false)}
        onConfirm={handleSuspend}
        user={user}
        isLoading={isSuspending}
      />

      <ResetPasswordDialog
        isOpen={resetPasswordDialogOpen}
        onClose={() => setResetPasswordDialogOpen(false)}
        onConfirm={handleResetPassword}
        newPassword={newPassword}
        isLoading={isResetting}
      />
    </div>
  );
};
