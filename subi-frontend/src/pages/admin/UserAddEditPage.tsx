import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Form } from '@/components/ui/form';
import { PageSkeleton } from '@/components/ui/skeleton';
import { ErrorFallback } from '@/components/ui/error-fallback';

import { UserPersonalInfoForm } from '@/components/forms/UserPersonalInfoForm';
import { UserSystemAccessForm } from '@/components/forms/UserSystemAccessForm';
import { UserRoleAssignmentForm } from '@/components/forms/UserRoleAssignmentForm';

import { useTranslation } from '@/hooks/useTranslation';
import { useSetPageTitle } from '@/hooks/useSetPageTitle';
import { useAuth } from '@/hooks/useAuth';
import { useUserFormValidation } from '@/hooks/useUserFormValidation';
import { useAvailabilityChecks } from '@/hooks/useAvailabilityChecks';
import {
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
} from '@/store/api/userApi';
import type { UserCreateDto, UserUpdateDto } from '@/types/user';
import type { CreateFormData, UpdateFormData } from '@/schemas/userSchemas';
import { ROUTES } from '@/constants';
import { toast } from 'sonner';

type FormData = CreateFormData | UpdateFormData;

export const UserAddEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, isLoading: translationLoading } = useTranslation();
  const { hasAnyRole } = useAuth();

  const isEditMode = Boolean(id);

  useSetPageTitle(
    isEditMode ? t('userManagement.editUser') : t('userManagement.createUser')
  );

  // API queries
  const {
    data: userResponse,
    isLoading: userLoading,
    error: userError,
  } = useGetUserByIdQuery(id!, { skip: !isEditMode });

  // API mutations
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  const user = userResponse;

  const defaultValues = useMemo(
    () => ({
      username: '',
      password: '',
      confirmPassword: '',
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      department: '',
      roles: [],
      isActive: false,
      ...(user || {}),
    }),
    [user]
  );

  // Form validation hook
  const { form } = useUserFormValidation({
    isEditMode,
    defaultValues,
  });

  // Availability checks hook
  const {
    usernameChecking,
    emailChecking,
    hasUsernameError,
    hasEmailError,
  } = useAvailabilityChecks({
    watch: form.watch,
    isEditMode,
    userId: id,
    originalEmail: user?.email,
  });

  // Check permissions
  if (!hasAnyRole(['ADMIN'])) {
    return (
      <ErrorFallback error={new Error('Unauthorized')} type='permission' />
    );
  }

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    try {
      if (isEditMode && id) {
        const updateData: UserUpdateDto = {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone || undefined,
          department: data.department || undefined,
          roles: data.roles,
          isActive: data.isActive,
        };

        await updateUser({ id, data: updateData }).unwrap();
        toast.success(t('userManagement.messages.userUpdated'));
        navigate(`${ROUTES.ADMIN}/users/${id}`);
      } else {
        const newUserData: UserCreateDto = {
          username: (data as CreateFormData).username,
          email: data.email,
          password: (data as CreateFormData).password,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone || undefined,
          department: data.department || undefined,
          roles: data.roles,
          isActive: data.isActive,
        };

        const result = await createUser(newUserData).unwrap();
        toast.success(t('userManagement.messages.userCreated'));
        navigate(`${ROUTES.ADMIN}/users/${result.data.id}`);
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as { data?: { message?: string }; message?: string })?.data
          ?.message ||
        (error as { message?: string })?.message ||
        t('common.error');
      toast.error(errorMessage);
    }
  };

  const handleCancel = () => {
    if (isEditMode) {
      navigate(`${ROUTES.ADMIN}/users/${id}`);
    } else {
      navigate(`${ROUTES.ADMIN}/users`);
    }
  };

  // Handle loading states
  if (translationLoading || userLoading || (isEditMode && !user)) {
    return <PageSkeleton />;
  }

  if (isEditMode && userError) {
    return <ErrorFallback error={userError as Error} type='network' />;
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Button
            variant='ghost'
            size='sm'
            onClick={handleCancel}
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
                {isEditMode
                  ? t('userManagement.editUser')
                  : t('userManagement.createUser')}
              </h1>
              <p className='text-muted-foreground'>
                {isEditMode
                  ? t('userManagement.editUserDescription')
                  : t('userManagement.createUserDescription')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Personal Information */}
            <UserPersonalInfoForm
              form={form}
              emailChecking={emailChecking}
              hasEmailError={hasEmailError}
              emailErrorMessage={
                hasEmailError ? t('userManagement.emailNotAvailable') : undefined
              }
            />

            {/* System Access */}
            <UserSystemAccessForm
              form={form}
              isEditMode={isEditMode}
              usernameChecking={usernameChecking}
              hasUsernameError={hasUsernameError}
              usernameErrorMessage={
                hasUsernameError
                  ? t('userManagement.usernameNotAvailable')
                  : undefined
              }
            />
          </div>

          {/* Role Assignment */}
          <UserRoleAssignmentForm form={form} />

          {/* Form Actions */}
          <div className='flex justify-end space-x-3'>
            <Button
              type='button'
              variant='outline'
              onClick={handleCancel}
              disabled={isCreating || isUpdating}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type='submit'
              disabled={isCreating || isUpdating}
              className='gap-2'
            >
              <Save className='h-4 w-4' />
              {isCreating || isUpdating
                ? isEditMode
                  ? t('common.updating')
                  : t('common.creating')
                : isEditMode
                  ? t('common.update')
                  : t('common.create')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
