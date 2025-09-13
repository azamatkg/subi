import { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserRole } from '@/types';
import type { UserCreateDto, UserFormData, UserUpdateDto } from '@/types/user';
import { useUsernameValidation } from './useUsernameValidation';
import { useEmailValidation } from './useEmailValidation';

// Zod validation schema for user form
const userFormSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must not exceed 50 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')
    .regex(/^[a-zA-Z0-9]/, 'Username must start with a letter or number')
    .refine((val) => !/[-_]$/.test(val), 'Username cannot end with a hyphen or underscore')
    .refine((val) => !/[-_]{2,}/.test(val), 'Username cannot contain consecutive hyphens or underscores'),

  email: z
    .string()
    .email('Please enter a valid email address')
    .max(254, 'Email address is too long')
    .refine((val) => !val.includes('..'), 'Email cannot contain consecutive dots'),

  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password must not exceed 128 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),

  confirmPassword: z.string().optional(),

  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must not exceed 50 characters')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'First name contains invalid characters'),

  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must not exceed 50 characters')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Last name contains invalid characters'),

  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\+?[1-9]\d{1,14}$/.test(val.replace(/[\s-()]/g, '')),
      'Please enter a valid phone number'
    ),

  department: z
    .string()
    .optional(),

  enabled: z.boolean().default(true),

  roles: z
    .array(z.nativeEnum(UserRole))
    .min(1, 'At least one role must be assigned')
    .refine((roles) => roles.length <= 3, 'Maximum 3 roles can be assigned'),
}).refine(
  (data) => {
    if (data.password && data.confirmPassword) {
      return data.password === data.confirmPassword;
    }
    return true;
  },
  {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }
);

// Create schema for edit mode (password optional)
const userEditFormSchema = userFormSchema.extend({
  password: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) {return true;}
        return val.length >= 6 &&
               val.length <= 128 &&
               /[A-Z]/.test(val) &&
               /[a-z]/.test(val) &&
               /[0-9]/.test(val) &&
               /[^A-Za-z0-9]/.test(val);
      },
      'Password must be at least 6 characters with uppercase, lowercase, number, and special character'
    ),
}).refine(
  (data) => {
    if (data.password && data.confirmPassword) {
      return data.password === data.confirmPassword;
    }
    if (!data.password && data.confirmPassword) {
      return false;
    }
    return true;
  },
  {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }
);

export interface UseUserFormOptions {
  mode: 'create' | 'edit';
  initialData?: Partial<UserFormData>;
  excludeUsername?: string; // For edit mode validation
  excludeEmail?: string; // For edit mode validation
  onSubmit?: (data: UserCreateDto | UserUpdateDto) => Promise<void>;
  onValidationChange?: (isValid: boolean) => void;
}

export interface UseUserFormReturn {
  // Form state
  form: ReturnType<typeof useForm<UserFormData>>;
  isValid: boolean;
  isDirty: boolean;
  isSubmitting: boolean;

  // Real-time validation
  usernameValidation: ReturnType<typeof useUsernameValidation>;
  emailValidation: ReturnType<typeof useEmailValidation>;

  // Form methods
  handleSubmit: (onSubmit: (data: UserCreateDto | UserUpdateDto) => Promise<void>) => (e?: React.BaseSyntheticEvent) => Promise<void>;
  reset: () => void;
  setFieldValue: (field: keyof UserFormData, value: string | boolean | UserRole[]) => void;
  getFieldError: (field: keyof UserFormData) => string | undefined;

  // Validation helpers
  validateField: (field: keyof UserFormData) => Promise<boolean>;
  validateAllFields: () => Promise<boolean>;

  // Form data helpers
  getFormData: () => UserFormData;
  getSubmitData: () => UserCreateDto | UserUpdateDto;
  hasUnsavedChanges: () => boolean;
}

export const useUserForm = (options: UseUserFormOptions): UseUserFormReturn => {
  const {
    mode,
    initialData = {},
    excludeUsername,
    excludeEmail,
    onValidationChange,
  } = options;

  // Select schema based on mode
  const schema = mode === 'edit' ? userEditFormSchema : userFormSchema;

  // Initialize form with default values
  const defaultValues: UserFormData = useMemo(() => ({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    department: '',
    enabled: true,
    roles: [],
    ...initialData,
  }), [initialData]);

  const form = useForm<UserFormData>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onChange',
  });

  const { watch, formState, setValue, trigger, reset: formReset, handleSubmit: rhfHandleSubmit } = form;
  const { isValid, isDirty, isSubmitting, errors } = formState;

  // Watch username and email for real-time validation
  const watchedUsername = watch('username');
  const watchedEmail = watch('email');

  // Real-time validation hooks
  const usernameValidation = useUsernameValidation(watchedUsername, {
    excludeUsername,
    debounceMs: 300,
  });

  const emailValidation = useEmailValidation(watchedEmail, {
    excludeEmail,
    debounceMs: 300,
  });

  // Combined form validation state
  const isFormValid = useMemo(() => {
    return (
      isValid &&
      !usernameValidation.isChecking &&
      usernameValidation.isValid &&
      !emailValidation.isChecking &&
      emailValidation.isValid
    );
  }, [isValid, usernameValidation, emailValidation]);

  // Notify parent of validation changes
  useEffect(() => {
    onValidationChange?.(isFormValid);
  }, [isFormValid, onValidationChange]);

  // Form methods
  const setFieldValue = useCallback((field: keyof UserFormData, value: string | boolean | UserRole[]) => {
    setValue(field, value, {
      shouldDirty: true,
      shouldValidate: true,
      shouldTouch: true
    });
  }, [setValue]);

  const getFieldError = useCallback((field: keyof UserFormData): string | undefined => {
    // Check form validation errors first
    if (errors[field]?.message) {
      return errors[field]?.message;
    }

    // Check real-time validation errors
    if (field === 'username' && usernameValidation.error) {
      return usernameValidation.error;
    }

    if (field === 'email' && emailValidation.error) {
      return emailValidation.error;
    }

    return undefined;
  }, [errors, usernameValidation.error, emailValidation.error]);

  const validateField = useCallback(async (field: keyof UserFormData): Promise<boolean> => {
    const result = await trigger(field);

    // For username and email, also check real-time validation
    if (field === 'username') {
      return result && usernameValidation.isValid && !usernameValidation.isChecking;
    }

    if (field === 'email') {
      return result && emailValidation.isValid && !emailValidation.isChecking;
    }

    return result;
  }, [trigger, usernameValidation, emailValidation]);

  const validateAllFields = useCallback(async (): Promise<boolean> => {
    const formValid = await trigger();
    return formValid && isFormValid;
  }, [trigger, isFormValid]);

  const getFormData = useCallback((): UserFormData => {
    return form.getValues();
  }, [form]);

  const getSubmitData = useCallback((): UserCreateDto | UserUpdateDto => {
    const formData = form.getValues();

    if (mode === 'create') {
      const createData: UserCreateDto = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        enabled: formData.enabled,
        phone: formData.phone || undefined,
        department: formData.department || undefined,
        roles: formData.roles,
      };
      return createData;
    } else {
      const updateData: UserUpdateDto = {};

      // Only include changed fields for update
      if (formData.username !== initialData.username) {
        updateData.username = formData.username;
      }
      if (formData.email !== initialData.email) {
        updateData.email = formData.email;
      }
      if (formData.password) {
        updateData.password = formData.password;
      }
      if (formData.firstName !== initialData.firstName) {
        updateData.firstName = formData.firstName;
      }
      if (formData.lastName !== initialData.lastName) {
        updateData.lastName = formData.lastName;
      }
      if (formData.enabled !== initialData.enabled) {
        updateData.enabled = formData.enabled;
      }
      if (formData.phone !== initialData.phone) {
        updateData.phone = formData.phone || undefined;
      }
      if (formData.department !== initialData.department) {
        updateData.department = formData.department || undefined;
      }
      if (JSON.stringify(formData.roles) !== JSON.stringify(initialData.roles)) {
        updateData.roles = formData.roles;
      }

      return updateData;
    }
  }, [form, mode, initialData]);

  const hasUnsavedChanges = useCallback((): boolean => {
    return isDirty;
  }, [isDirty]);

  const reset = useCallback(() => {
    formReset(defaultValues);
  }, [formReset, defaultValues]);

  const handleSubmit = useCallback((onSubmit: (data: UserCreateDto | UserUpdateDto) => Promise<void>) => {
    return rhfHandleSubmit(async (_formData) => {
      // Ensure real-time validation is complete and valid
      if (!isFormValid) {
        throw new Error('Form validation failed');
      }

      const submitData = getSubmitData();
      await onSubmit(submitData);
    });
  }, [rhfHandleSubmit, isFormValid, getSubmitData]);

  return {
    // Form state
    form,
    isValid: isFormValid,
    isDirty,
    isSubmitting,

    // Real-time validation
    usernameValidation,
    emailValidation,

    // Form methods
    handleSubmit,
    reset,
    setFieldValue,
    getFieldError,

    // Validation helpers
    validateField,
    validateAllFields,

    // Form data helpers
    getFormData,
    getSubmitData,
    hasUnsavedChanges,
  };
};