import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Phone,
  Save,
  Shield,
  User,
  Users,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { UserFormSkeleton } from '@/components/ui/skeleton';
import { ErrorFallback, ServerErrorFallback } from '@/components/ui/error-fallback';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import {
  ButtonLoadingState,
  FormFieldLoadingState
} from '@/components/ui/loading-transitions';

import { useTranslation } from '@/hooks/useTranslation';
import { useSetPageTitle } from '@/hooks/useSetPageTitle';
import { useAuth } from '@/hooks/useAuth';
import { useDebounce } from '@/hooks/useDebounce';
import { useProgressiveLoading } from '@/hooks/useSmartLoading';
import {
  useCheckEmailAvailabilityQuery,
  useCheckUsernameAvailabilityQuery,
  useCreateUserMutation,
  useGetUserByIdQuery,
  useUpdateUserMutation,
} from '@/store/api/userApi';
import type { UserCreateDto, UserUpdateDto } from '@/types/user';
import { UserRole } from '@/types/user';
import { ROUTES } from '@/constants';
import {
  InputSanitizer,
  handleApiError,
  showSuccessMessage,
  showWarningMessage
} from '@/utils/errorHandling';

// Form validation schema
const createUserSchema = z
  .object({
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(50, 'Username must be less than 50 characters')
      .regex(
        /^[a-zA-Z0-9_]+$/,
        'Username can only contain letters, numbers, and underscores'
      ),
    email: z
      .string()
      .email('Invalid email address')
      .max(255, 'Email must be less than 255 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters'), // API manual requires min 6 chars
    confirmPassword: z.string(),
    firstName: z
      .string()
      .min(2, 'First name must be at least 2 characters') // API manual requires 2-50 chars
      .max(50, 'First name must be less than 50 characters'),
    lastName: z
      .string()
      .min(2, 'Last name must be at least 2 characters') // API manual requires 2-50 chars
      .max(50, 'Last name must be less than 50 characters'),
    phone: z
      .string()
      .optional()
      .refine(
        value => !value || /^[+]?[1-9][\d]{0,15}$/.test(value),
        'Invalid phone number format'
      ),
    department: z.string().optional(),
    roles: z
      .array(
        z.enum([
          UserRole.ADMIN,
          UserRole.CREDIT_MANAGER,
          UserRole.CREDIT_ANALYST,
          UserRole.DECISION_MAKER,
          UserRole.COMMISSION_MEMBER,
          UserRole.USER,
        ])
      )
      .min(1, 'At least one role must be selected'),
    enabled: z.boolean().default(true), // From API manual
  })
  .refine(data => data.password === data.confirmPassword, {
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
    .min(2, 'First name must be at least 2 characters') // API manual requires 2-50 chars
    .max(50, 'First name must be less than 50 characters'),
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters') // API manual requires 2-50 chars
    .max(50, 'Last name must be less than 50 characters'),
  phone: z
    .string()
    .optional()
    .refine(
      value => !value || /^[+]?[1-9][\d]{0,15}$/.test(value),
      'Invalid phone number format'
    ),
  department: z.string().optional(),
  roles: z
    .array(
      z.enum([
        UserRole.ADMIN,
        UserRole.CREDIT_MANAGER,
        UserRole.CREDIT_ANALYST,
        UserRole.DECISION_MAKER,
        UserRole.COMMISSION_MEMBER,
        UserRole.USER,
      ])
    )
    .min(1, 'At least one role must be selected'),
  enabled: z.boolean().default(true), // From API manual
});

type CreateFormData = z.infer<typeof createUserSchema>;
type UpdateFormData = z.infer<typeof updateUserSchema>;
type FormData = CreateFormData & UpdateFormData;

// Password strength calculation
interface PasswordStrength {
  score: number; // 0-100
  level: 'weak' | 'fair' | 'good' | 'strong';
  requirements: {
    length: boolean;
    lowercase: boolean;
    uppercase: boolean;
    number: boolean;
    special: boolean;
  };
  suggestions: string[];
}

const calculatePasswordStrength = (password: string): PasswordStrength => {
  const requirements = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const metRequirements = Object.values(requirements).filter(Boolean).length;
  const score = Math.min(100, (metRequirements / 5) * 100 + (password.length - 6) * 2);

  let level: 'weak' | 'fair' | 'good' | 'strong' = 'weak';
  if (score >= 80) {
    level = 'strong';
  } else if (score >= 60) {
    level = 'good';
  } else if (score >= 40) {
    level = 'fair';
  }

  const suggestions: string[] = [];
  if (!requirements.length) {
    suggestions.push('Use at least 8 characters');
  }
  if (!requirements.lowercase) {
    suggestions.push('Add lowercase letters');
  }
  if (!requirements.uppercase) {
    suggestions.push('Add uppercase letters');
  }
  if (!requirements.number) {
    suggestions.push('Add numbers');
  }
  if (!requirements.special) {
    suggestions.push('Add special characters');
  }

  return { score, level, requirements, suggestions };
};


export const UserAddEditPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, isLoading: translationLoading } = useTranslation();
  const { hasAnyRole } = useAuth();

  const isEditMode = Boolean(id);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    level: 'weak',
    requirements: {
      length: false,
      lowercase: false,
      uppercase: false,
      number: false,
      special: false,
    },
    suggestions: [],
  });
  const [_validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [_fieldWarnings, setFieldWarnings] = useState<Record<string, string>>({});

  useSetPageTitle(
    isEditMode ? t('userManagement.editUser') : t('userManagement.createUser')
  );

  // API queries
  const {
    data: userResponse,
    isLoading: userLoading,
    error: userError,
  } = useGetUserByIdQuery(id!, { skip: !isEditMode });

  // Progressive loading for smooth transitions
  const {
    showLoading: showUserLoading,
  } = useProgressiveLoading(userResponse, userLoading, {
    minDelay: 150,
    minDuration: 400,
  });

  // const { data: departmentsResponse } = useGetUserDepartmentsQuery();

  // API mutations
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  // The API returns user data directly, not wrapped in ApiResponse
  const user = userResponse;

  // Form setup
  const form = useForm<FormData>({
    resolver: zodResolver(isEditMode ? updateUserSchema : createUserSchema),
    mode: 'onChange',
    defaultValues: isEditMode
      ? {
          email: '',
          firstName: '',
          lastName: '',
          phone: '',
          department: '',
          roles: [UserRole.USER],
          enabled: true,
        }
      : {
          username: '',
          password: '',
          confirmPassword: '',
          email: '',
          firstName: '',
          lastName: '',
          phone: '',
          department: '',
          roles: [UserRole.USER],
          enabled: true,
        },
  });

  const watchedUsername = isEditMode
    ? undefined
    : (form.watch('username' as keyof FormData) as string | undefined);
  const watchedEmail = form.watch('email') as string;
  const watchedPassword = isEditMode
    ? undefined
    : (form.watch('password' as keyof FormData) as string | undefined);
  const watchedConfirmPassword = isEditMode
    ? undefined
    : (form.watch('confirmPassword' as keyof FormData) as string | undefined);

  // Debounced values for API calls
  const debouncedUsername = useDebounce(watchedUsername || '', 500);
  const debouncedEmail = useDebounce(watchedEmail || '', 500);

  // Username availability check
  const { data: usernameExists, isLoading: usernameChecking } =
    useCheckUsernameAvailabilityQuery(debouncedUsername, {
      skip: !debouncedUsername || debouncedUsername.length < 3 || isEditMode,
    });

  // Email availability check - skip if editing and email hasn't changed
  const skipEmailCheck = useMemo(() => {
    if (!debouncedEmail || !z.string().email().safeParse(debouncedEmail).success) {
      return true;
    }
    if (isEditMode && user && user.email === debouncedEmail) {
      return true;
    }
    return false;
  }, [debouncedEmail, isEditMode, user]);

  const { data: emailExists, isLoading: emailChecking } =
    useCheckEmailAvailabilityQuery(debouncedEmail, {
      skip: skipEmailCheck,
    });

  // Password strength calculation
  useEffect(() => {
    if (watchedPassword && !isEditMode) {
      setPasswordStrength(calculatePasswordStrength(watchedPassword));
    }
  }, [watchedPassword, isEditMode]);

  // Real-time password confirmation validation
  const passwordsMatch = useMemo(() => {
    if (isEditMode || !watchedPassword || !watchedConfirmPassword) {
      return null;
    }
    return watchedPassword === watchedConfirmPassword;
  }, [watchedPassword, watchedConfirmPassword, isEditMode]);

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
        enabled: user.enabled,
      });
    }
  }, [user, isEditMode, form]);

  // Check permissions
  if (!hasAnyRole(['ADMIN'])) {
    return (
      <ErrorFallback error={new Error('Unauthorized')} type='permission' />
    );
  }

  // Enhanced form submission with validation and sanitization
  const onSubmit = async (data: FormData) => {
    // Clear previous validation errors
    setValidationErrors({});
    setFieldWarnings({});

    try {
      // Pre-submission validation and sanitization
      const sanitizedData = {
        ...data,
        firstName: InputSanitizer.sanitizeText(data.firstName),
        lastName: InputSanitizer.sanitizeText(data.lastName),
        email: InputSanitizer.sanitizeEmail(data.email),
        phone: data.phone ? InputSanitizer.sanitizePhone(data.phone) : undefined,
        department: data.department ? InputSanitizer.sanitizeText(data.department) : undefined,
      };

      // Add username sanitization for create mode
      if (!isEditMode && 'username' in data) {
        (sanitizedData as CreateFormData).username = InputSanitizer.sanitizeUsername(data.username as string);
      }

      // Warn user if data was sanitized
      const warnings: Record<string, string> = {};
      if (sanitizedData.firstName !== data.firstName) {
        warnings.firstName = t('userManagement.validation.fieldSanitized');
      }
      if (sanitizedData.lastName !== data.lastName) {
        warnings.lastName = t('userManagement.validation.fieldSanitized');
      }
      if (sanitizedData.email !== data.email) {
        warnings.email = t('userManagement.validation.fieldSanitized');
      }

      if (Object.keys(warnings).length > 0) {
        setFieldWarnings(warnings);
        showWarningMessage(
          t('userManagement.validation.dataSanitized'),
          t('userManagement.validation.reviewChanges')
        );
      }

      // Additional role validation
      if (!sanitizedData.roles || sanitizedData.roles.length === 0) {
        setValidationErrors({ roles: t('userManagement.validation.rolesRequired') });
        showWarningMessage(t('userManagement.validation.rolesRequired'));
        return;
      }

      // Check for username/email availability conflicts before submission
      if (!isEditMode && usernameExists) {
        setValidationErrors({ username: t('userManagement.usernameNotAvailable') });
        showWarningMessage(t('userManagement.usernameNotAvailable'));
        return;
      }

      if (emailExists && (!isEditMode || (user && user.email !== sanitizedData.email))) {
        setValidationErrors({ email: t('userManagement.emailNotAvailable') });
        showWarningMessage(t('userManagement.emailNotAvailable'));
        return;
      }

      if (isEditMode && id) {
        const updateData: UserUpdateDto = {
          email: sanitizedData.email,
          firstName: sanitizedData.firstName,
          lastName: sanitizedData.lastName,
          phone: sanitizedData.phone,
          department: sanitizedData.department,
          roles: sanitizedData.roles,
          enabled: sanitizedData.enabled,
        };

        await updateUser({ id, data: updateData }).unwrap();
        showSuccessMessage(
          t('userManagement.messages.userUpdated'),
          t('userManagement.messages.userUpdatedDescription', {
            name: `${sanitizedData.firstName} ${sanitizedData.lastName}`
          })
        );
        navigate(`${ROUTES.ADMIN}/users/${id}`);
      } else {
        const newUserData: UserCreateDto = {
          username: (sanitizedData as CreateFormData).username,
          email: sanitizedData.email,
          password: data.password as string,
          firstName: sanitizedData.firstName,
          lastName: sanitizedData.lastName,
          phone: sanitizedData.phone,
          department: sanitizedData.department,
          enabled: sanitizedData.enabled,
        };

        const result = await createUser(newUserData).unwrap();
        showSuccessMessage(
          t('userManagement.messages.userCreated'),
          t('userManagement.messages.userCreatedDescription', {
            name: `${sanitizedData.firstName} ${sanitizedData.lastName}`
          })
        );
        navigate(`${ROUTES.ADMIN}/users/${result.id}`);
      }
    } catch (error: unknown) {
      const errorInfo = handleApiError(error, t);

      // Handle specific validation errors from API
      if (errorInfo.validationErrors) {
        setValidationErrors(errorInfo.validationErrors);
      }

      // Provide specific guidance based on error type
      if (errorInfo.status === 409) {
        showWarningMessage(
          t('userManagement.errors.conflictError'),
          t('userManagement.errors.checkUniqueFields')
        );
      } else if (errorInfo.status === 422) {
        showWarningMessage(
          t('userManagement.errors.validationError'),
          t('userManagement.errors.reviewFormData')
        );
      }
    }
  };

  const handleCancel = () => {
    if (isEditMode) {
      navigate(`${ROUTES.ADMIN}/users/${id}`);
    } else {
      navigate(`${ROUTES.ADMIN}/users`);
    }
  };

  // Handle loading states with appropriate skeleton - show for new users or when user data is loading
  if (translationLoading || (!isEditMode && false) || (isEditMode && showUserLoading)) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center gap-2'>
          <div className='h-8 w-8 bg-muted/60 animate-pulse rounded' />
          <div className='h-6 w-32 bg-muted/60 animate-pulse rounded' />
        </div>
        <UserFormSkeleton
          sections={isEditMode ? ['personal', 'system', 'roles', 'security'] : ['personal', 'system', 'roles']}
        />
      </div>
    );
  }

  if (isEditMode && userError) {
    return <ErrorFallback error={userError as Error} type='network' />;
  }

  // Password strength component
  const PasswordStrengthMeter: React.FC<{ strength: PasswordStrength }> = ({ strength }) => {
    const getStrengthColor = (level: string) => {
      switch (level) {
        case 'weak': return 'bg-red-500';
        case 'fair': return 'bg-yellow-500';
        case 'good': return 'bg-blue-500';
        case 'strong': return 'bg-green-500';
        default: return 'bg-gray-200';
      }
    };

    const getStrengthText = (level: string) => {
      switch (level) {
        case 'weak': return t('userManagement.passwordStrength.weak');
        case 'fair': return t('userManagement.passwordStrength.fair');
        case 'good': return t('userManagement.passwordStrength.good');
        case 'strong': return t('userManagement.passwordStrength.strong');
        default: return '';
      }
    };

    return (
      <div className='space-y-2'>
        <div className='flex items-center justify-between'>
          <span className='text-sm font-medium'>Password Strength</span>
          <Badge variant={strength.level === 'strong' ? 'default' : 'secondary'}>
            {getStrengthText(strength.level)}
          </Badge>
        </div>
        <div className='w-full bg-gray-200 rounded-full h-2 overflow-hidden'>
          <div
            className={`h-full transition-all duration-300 ${getStrengthColor(strength.level)}`}
            style={{ width: `${strength.score}%` }}
          />
        </div>
        <div className='grid grid-cols-2 gap-1 text-xs'>
          {Object.entries(strength.requirements).map(([key, met]) => (
            <div key={key} className='flex items-center gap-1'>
              {met ? (
                <CheckCircle2 className='h-3 w-3 text-green-500' />
              ) : (
                <AlertCircle className='h-3 w-3 text-gray-400' />
              )}
              <span className={met ? 'text-green-600' : 'text-gray-500'}>
                {key === 'length' && '8+ chars'}
                {key === 'lowercase' && 'lowercase'}
                {key === 'uppercase' && 'uppercase'}
                {key === 'number' && 'number'}
                {key === 'special' && 'special'}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

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

      {/* Form with Error Boundary */}
      <ErrorBoundary
        level='section'
        title='Ошибка формы пользователя'
        description='Не удается отобразить форму создания/редактирования пользователя.'
        fallback={
          <ServerErrorFallback
            title='Ошибка формы'
            description='Форма пользователя временно недоступна. Попробуйте обновить страницу.'
            showRetry
            showBack
          />
        }
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <User className='h-5 w-5' />
                  {t('userManagement.personalInformation')}
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='firstName'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('userManagement.fields.firstName')}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('userManagement.enterFirstName')}
                            {...field}
                            maxLength={50}
                            onChange={e => {
                              const sanitized = InputSanitizer.sanitizeText(e.target.value);
                              field.onChange(sanitized);

                              if (sanitized !== e.target.value) {
                                setFieldWarnings(prev => ({
                                  ...prev,
                                  firstName: t('userManagement.validation.invalidCharactersRemoved')
                                }));
                              } else {
                                setFieldWarnings(prev => {
                                  const { firstName, ...rest } = prev;
                                  return rest;
                                });
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='lastName'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('userManagement.fields.lastName')}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('userManagement.enterLastName')}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('userManagement.fields.email')}</FormLabel>
                      <FormControl>
                        <div className='relative'>
                          <Mail className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                          <Input
                            className='pl-10 pr-10'
                            placeholder={t('userManagement.enterEmail')}
                            {...field}
                            aria-describedby={`email-status-${field.name}`}
                          />
                        </div>
                      </FormControl>
                      <FormFieldLoadingState
                        loading={emailChecking}
                        error={emailExists ? t('userManagement.emailNotAvailable') : undefined}
                        success={debouncedEmail && !emailExists && !skipEmailCheck && z.string().email().safeParse(debouncedEmail).success}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='phone'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('userManagement.fields.phone')}{' '}
                        {t('common.optional')}
                      </FormLabel>
                      <FormControl>
                        <div className='relative'>
                          <Phone className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                          <Input
                            className='pl-10'
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
                  name='department'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('userManagement.fields.department')}{' '}
                        {t('common.optional')}
                      </FormLabel>
                      <FormControl>
                        <div className='relative'>
                          <Users className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                          <Input
                            className='pl-10'
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
                <CardTitle className='flex items-center gap-2'>
                  <Shield className='h-5 w-5' />
                  {t('userManagement.systemAccess')}
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {!isEditMode && (
                  <>
                    <FormField
                      control={form.control}
                      name='username'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t('userManagement.fields.username')}
                          </FormLabel>
                          <FormControl>
                            <div className='relative'>
                              <span className='absolute left-3 top-3 text-sm text-muted-foreground'>
                                @
                              </span>
                              <Input
                                className='pl-8 pr-10'
                                placeholder={t('userManagement.enterUsername')}
                                {...field}
                                aria-describedby={`username-status-${field.name}`}
                              />
                              <div className='absolute right-3 top-3'>
                                {usernameChecking && (
                                  <Loader2 className='h-4 w-4 animate-spin text-muted-foreground' />
                                )}
                                {!usernameChecking && debouncedUsername && debouncedUsername.length >= 3 && (
                                  usernameExists ? (
                                    <AlertCircle className='h-4 w-4 text-red-500' />
                                  ) : (
                                    <CheckCircle2 className='h-4 w-4 text-green-500' />
                                  )
                                )}
                              </div>
                            </div>
                          </FormControl>
                          <FormFieldLoadingState
                            loading={usernameChecking}
                            error={usernameExists ? t('userManagement.usernameNotAvailable') : undefined}
                            success={debouncedUsername && !usernameExists && debouncedUsername.length >= 3}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className='grid grid-cols-2 gap-4'>
                      <FormField
                        control={form.control}
                        name='password'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t('userManagement.fields.password')}
                            </FormLabel>
                            <FormControl>
                              <div className='relative'>
                                <Input
                                  type={showPassword ? 'text' : 'password'}
                                  placeholder={t(
                                    'userManagement.enterPassword'
                                  )}
                                  {...field}
                                />
                                <Button
                                  type='button'
                                  variant='ghost'
                                  size='sm'
                                  className='absolute right-0 top-0 h-full px-3 hover:bg-transparent'
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? (
                                    <EyeOff className='h-4 w-4' />
                                  ) : (
                                    <Eye className='h-4 w-4' />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            <FormDescription>
                              {t('userManagement.passwordRequirements')}
                            </FormDescription>
                            {watchedPassword && watchedPassword.length > 0 && (
                              <PasswordStrengthMeter strength={passwordStrength} />
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='confirmPassword'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t('userManagement.fields.confirmPassword')}
                            </FormLabel>
                            <FormControl>
                              <div className='relative'>
                                <Input
                                  type={
                                    showConfirmPassword ? 'text' : 'password'
                                  }
                                  placeholder={t(
                                    'userManagement.confirmPassword'
                                  )}
                                  {...field}
                                />
                                <Button
                                  type='button'
                                  variant='ghost'
                                  size='sm'
                                  className='absolute right-0 top-0 h-full px-3 hover:bg-transparent'
                                  onClick={() =>
                                    setShowConfirmPassword(!showConfirmPassword)
                                  }
                                >
                                  {showConfirmPassword ? (
                                    <EyeOff className='h-4 w-4' />
                                  ) : (
                                    <Eye className='h-4 w-4' />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            {watchedConfirmPassword && watchedConfirmPassword.length > 0 && (
                              <div className='flex items-center gap-2 text-sm'>
                                {passwordsMatch === true && (
                                  <div className='flex items-center gap-1 text-green-600'>
                                    <CheckCircle2 className='h-3 w-3' />
                                    <span>Passwords match</span>
                                  </div>
                                )}
                                {passwordsMatch === false && (
                                  <div className='flex items-center gap-1 text-red-600'>
                                    <AlertCircle className='h-3 w-3' />
                                    <span>Passwords do not match</span>
                                  </div>
                                )}
                              </div>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </>
                )}

                <FormField
                  control={form.control}
                  name='enabled'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className='space-y-1 leading-none'>
                        <FormLabel>
                          {t('userManagement.fields.enabled')}
                        </FormLabel>
                        <FormDescription>
                          {t('userManagement.enabledUserDescription')}
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
              <CardTitle className='flex items-center gap-2'>
                <Shield className='h-5 w-5' />
                {t('userManagement.roleAssignment')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name='roles'
                render={() => (
                  <FormItem>
                    <FormLabel>{t('userManagement.selectRoles')}</FormLabel>
                    <FormDescription>
                      {t('userManagement.selectRolesDescription')}
                    </FormDescription>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-4'>
                      {roleOptions.map(role => (
                        <FormField
                          key={role.value}
                          control={form.control}
                          name='roles'
                          render={({ field }) => (
                            <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 hover:bg-muted/50 transition-colors'>
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(role.value)}
                                  onCheckedChange={checked => {
                                    const updatedRoles = checked
                                      ? [...(field.value || []), role.value]
                                      : field.value?.filter(
                                          (r: UserRole) => r !== role.value
                                        ) || [];
                                    field.onChange(updatedRoles);
                                  }}
                                />
                              </FormControl>
                              <div className='space-y-1 leading-none'>
                                <FormLabel className='font-medium'>
                                  {role.label}
                                </FormLabel>
                                <FormDescription className='text-sm'>
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
            >
              <ButtonLoadingState
                loading={isCreating || isUpdating}
                loadingText={isEditMode ? t('common.updating') : t('common.creating')}
              >
                <div className="flex items-center gap-2">
                  <Save className='h-4 w-4' />
                  {isEditMode ? t('common.update') : t('common.create')}
                </div>
              </ButtonLoadingState>
            </Button>
          </div>
          </form>
        </Form>
      </ErrorBoundary>
    </div>
  );
};
