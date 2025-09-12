import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  Shield,
  Users,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { PageSkeleton } from '@/components/ui/skeleton';
import { ErrorFallback } from '@/components/ui/error-fallback';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { useTranslation } from '@/hooks/useTranslation';
import { useSetPageTitle } from '@/hooks/useSetPageTitle';
import { useAuth } from '@/hooks/useAuth';
import {
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useCheckUsernameAvailabilityQuery,
  useCheckEmailAvailabilityQuery,
} from '@/store/api/userApi';
import type { UserCreateDto, UserUpdateDto } from '@/types/user';
import { UserRole } from '@/types/user';
import { ROUTES } from '@/constants';
import { toast } from 'sonner';

// Form validation schema
const createUserSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z
    .string()
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  confirmPassword: z.string(),
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(100, 'First name must be less than 100 characters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(100, 'Last name must be less than 100 characters'),
  phone: z
    .string()
    .optional()
    .refine(
      (value) => !value || /^[+]?[1-9][\d]{0,15}$/.test(value),
      'Invalid phone number format'
    ),
  department: z.string().optional(),
  roles: z
    .array(z.enum([
      UserRole.ADMIN,
      UserRole.CREDIT_MANAGER,
      UserRole.CREDIT_ANALYST,
      UserRole.DECISION_MAKER,
      UserRole.COMMISSION_MEMBER,
      UserRole.USER,
    ]))
    .min(1, 'At least one role must be selected'),
  isActive: z.boolean().default(true),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const updateUserSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters'),
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(100, 'First name must be less than 100 characters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(100, 'Last name must be less than 100 characters'),
  phone: z
    .string()
    .optional()
    .refine(
      (value) => !value || /^[+]?[1-9][\d]{0,15}$/.test(value),
      'Invalid phone number format'
    ),
  department: z.string().optional(),
  roles: z
    .array(z.enum([
      UserRole.ADMIN,
      UserRole.CREDIT_MANAGER,
      UserRole.CREDIT_ANALYST,
      UserRole.DECISION_MAKER,
      UserRole.COMMISSION_MEMBER,
      UserRole.USER,
    ]))
    .min(1, 'At least one role must be selected'),
  isActive: z.boolean().default(true),
});

type CreateFormData = z.infer<typeof createUserSchema>;
type UpdateFormData = z.infer<typeof updateUserSchema>;
type FormData = CreateFormData & UpdateFormData;

export const UserAddEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, isLoading: translationLoading } = useTranslation();
  const { hasAnyRole } = useAuth();
  
  const isEditMode = Boolean(id);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  useSetPageTitle(
    isEditMode ? t('userManagement.editUser') : t('userManagement.createUser')
  );

  // API queries
  const {
    data: userResponse,
    isLoading: userLoading,
    error: userError,
  } = useGetUserByIdQuery(id!, { skip: !isEditMode });

  // const { data: departmentsResponse } = useGetUserDepartmentsQuery();

  // API mutations
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  const user = userResponse?.data;

  // Form setup
  const form = useForm<FormData>({
    resolver: zodResolver(isEditMode ? updateUserSchema : createUserSchema),
    mode: 'onChange',
    defaultValues: isEditMode ? {
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      department: '',
      roles: [UserRole.USER],
      isActive: true,
    } : {
      username: '',
      password: '',
      confirmPassword: '',
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      department: '',
      roles: [UserRole.USER],
      isActive: true,
    },
  });

  const watchedUsername = isEditMode ? undefined : form.watch('username' as keyof FormData) as string | undefined;
  const watchedEmail = form.watch('email') as string;

  // Username availability check
  const {
    data: usernameCheckResponse,
    isLoading: usernameChecking,
  } = useCheckUsernameAvailabilityQuery(
    {
      username: watchedUsername || '',
      excludeUserId: isEditMode ? id : undefined,
    },
    {
      skip: !watchedUsername || watchedUsername.length < 3,
    }
  );

  // Email availability check
  const {
    data: emailCheckResponse,
    isLoading: emailChecking,
  } = useCheckEmailAvailabilityQuery(
    {
      email: watchedEmail || '',
      excludeUserId: isEditMode ? id : undefined,
    },
    {
      skip: !watchedEmail || !z.string().email().safeParse(watchedEmail).success,
    }
  );

  // Load user data for edit mode
  useEffect(() => {
    if (isEditMode && user) {
      form.reset({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || '',
        department: user.department || '',
        roles: user.roles,
        isActive: user.isActive,
      });
    }
  }, [user, isEditMode, form]);

  // Check permissions
  if (!hasAnyRole(['ADMIN'])) {
    return <ErrorFallback error={new Error('Unauthorized')} type="permission" />;
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
          username: data.username as string,
          email: data.email,
          password: data.password as string,
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
      const errorMessage = (error as { data?: { message?: string }; message?: string })?.data?.message || (error as { message?: string })?.message || t('common.error');
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
    return <ErrorFallback error={userError as Error} type="network" />;
  }

  const roleOptions = [
    {
      value: UserRole.ADMIN,
      label: t('userManagement.roles.admin'),
      description: t('userManagement.roleDescriptions.admin'),
    },
    {
      value: UserRole.CREDIT_MANAGER,
      label: t('userManagement.roles.credit_manager'),
      description: t('userManagement.roleDescriptions.credit_manager'),
    },
    {
      value: UserRole.CREDIT_ANALYST,
      label: t('userManagement.roles.credit_analyst'),
      description: t('userManagement.roleDescriptions.credit_analyst'),
    },
    {
      value: UserRole.DECISION_MAKER,
      label: t('userManagement.roles.decision_maker'),
      description: t('userManagement.roleDescriptions.decision_maker'),
    },
    {
      value: UserRole.COMMISSION_MEMBER,
      label: t('userManagement.roles.commission_member'),
      description: t('userManagement.roleDescriptions.commission_member'),
    },
    {
      value: UserRole.USER,
      label: t('userManagement.roles.user'),
      description: t('userManagement.roleDescriptions.user'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('common.back')}
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 border border-primary-300 flex items-center justify-center">
              <User className="h-5 w-5 text-primary-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {isEditMode
                  ? t('userManagement.editUser')
                  : t('userManagement.createUser')
                }
              </h1>
              <p className="text-muted-foreground">
                {isEditMode
                  ? t('userManagement.editUserDescription')
                  : t('userManagement.createUserDescription')
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {t('userManagement.personalInformation')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('userManagement.fields.firstName')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('userManagement.enterFirstName')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('userManagement.fields.lastName')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('userManagement.enterLastName')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('userManagement.fields.email')}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            className="pl-10"
                            placeholder={t('userManagement.enterEmail')}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      {emailChecking && (
                        <FormDescription>
                          {t('userManagement.checkingEmailAvailability')}
                        </FormDescription>
                      )}
                      {emailCheckResponse && !emailCheckResponse.data.available && (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            {t('userManagement.emailNotAvailable')}
                          </AlertDescription>
                        </Alert>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('userManagement.fields.phone')} {t('common.optional')}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            className="pl-10"
                            placeholder={t('userManagement.enterPhone')}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('userManagement.fields.department')} {t('common.optional')}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            className="pl-10"
                            placeholder={t('userManagement.enterDepartment')}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* System Access */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  {t('userManagement.systemAccess')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isEditMode && (
                  <>
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('userManagement.fields.username')}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-3 text-sm text-muted-foreground">@</span>
                              <Input
                                className="pl-8"
                                placeholder={t('userManagement.enterUsername')}
                                {...field}
                              />
                            </div>
                          </FormControl>
                          {usernameChecking && (
                            <FormDescription>
                              {t('userManagement.checkingUsernameAvailability')}
                            </FormDescription>
                          )}
                          {usernameCheckResponse && !usernameCheckResponse.data.available && (
                            <Alert>
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>
                                {t('userManagement.usernameNotAvailable')}
                              </AlertDescription>
                            </Alert>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('userManagement.fields.password')}</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showPassword ? 'text' : 'password'}
                                  placeholder={t('userManagement.enterPassword')}
                                  {...field}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            <FormDescription>
                              {t('userManagement.passwordRequirements')}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('userManagement.fields.confirmPassword')}</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showConfirmPassword ? 'text' : 'password'}
                                  placeholder={t('userManagement.confirmPassword')}
                                  {...field}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                  {showConfirmPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </>
                )}

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          {t('userManagement.fields.activeUser')}
                        </FormLabel>
                        <FormDescription>
                          {t('userManagement.activeUserDescription')}
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Role Assignment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {t('userManagement.roleAssignment')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="roles"
                render={() => (
                  <FormItem>
                    <FormLabel>{t('userManagement.selectRoles')}</FormLabel>
                    <FormDescription>
                      {t('userManagement.selectRolesDescription')}
                    </FormDescription>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {roleOptions.map((role) => (
                        <FormField
                          key={role.value}
                          control={form.control}
                          name="roles"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 hover:bg-muted/50 transition-colors">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(role.value)}
                                  onCheckedChange={(checked) => {
                                    const updatedRoles = checked
                                      ? [...(field.value || []), role.value]
                                      : field.value?.filter((r: UserRole) => r !== role.value) || [];
                                    field.onChange(updatedRoles);
                                  }}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="font-medium">
                                  {role.label}
                                </FormLabel>
                                <FormDescription className="text-sm">
                                  {role.description}
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isCreating || isUpdating}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isCreating || isUpdating}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {isCreating || isUpdating
                ? isEditMode
                  ? t('common.updating')
                  : t('common.creating')
                : isEditMode
                ? t('common.update')
                : t('common.create')
              }
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};