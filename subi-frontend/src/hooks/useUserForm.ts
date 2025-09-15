import { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserRole } from '@/types';
import type { UserCreateDto, UserFormData, UserUpdateDto } from '@/types/user';
import { useUsernameValidation } from './useUsernameValidation';
import { useEmailValidation } from './useEmailValidation';
import { useSecurityValidation } from './useSecurityValidation';
import { SecurityDetector, InputSanitizer } from '@/utils/securityValidation';

// Enhanced Zod validation schema with security checks
const userFormSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must not exceed 50 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')
    .regex(/^[a-zA-Z0-9]/, 'Username must start with a letter or number')
    .refine((val) => !/[-_]$/.test(val), 'Username cannot end with a hyphen or underscore')
    .refine((val) => !/[-_]{2,}/.test(val), 'Username cannot contain consecutive hyphens or underscores')
    .refine((val) => {
      const securityCheck = SecurityDetector.scanInput(val);
      return securityCheck.isValid;
    }, 'Username contains potentially unsafe content')
    .transform((val) => InputSanitizer.sanitizeUsername(val)),

  email: z
    .string()
    .email('Please enter a valid email address')
    .max(254, 'Email address is too long')
    .refine((val) => !val.includes('..'), 'Email cannot contain consecutive dots')
    .refine((val) => {
      const securityCheck = SecurityDetector.scanInput(val);
      return securityCheck.isValid;
    }, 'Email contains potentially unsafe content')
    .transform((val) => InputSanitizer.sanitizeEmail(val)),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters') // Increased from 6 for better security
    .max(128, 'Password must not exceed 128 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
    .refine((val) => {
      // Check for common weak passwords
      const weakPasswords = ['password', '123456', 'qwerty', 'admin', 'welcome'];
      return !weakPasswords.some(weak => val.toLowerCase().includes(weak));
    }, 'Password is too common. Please choose a stronger password')
    .refine((val) => {
      // Check for sequential characters
      const hasSequential = /123|abc|qwe|asd|zxc/i.test(val);
      return !hasSequential;
    }, 'Password should not contain sequential characters')
    .refine((val) => {
      // Check for repeated characters
      const hasRepeated = /(.)\1{2,}/.test(val);
      return !hasRepeated;
    }, 'Password should not contain repeated characters'),

  confirmPassword: z.string().optional(),

  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must not exceed 50 characters')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'First name contains invalid characters')
    .refine((val) => {
      const securityCheck = SecurityDetector.scanInput(val);
      return securityCheck.isValid;
    }, 'First name contains potentially unsafe content')
    .transform((val) => InputSanitizer.sanitizeText(val, 50)),

  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must not exceed 50 characters')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Last name contains invalid characters')
    .refine((val) => {
      const securityCheck = SecurityDetector.scanInput(val);
      return securityCheck.isValid;
    }, 'Last name contains potentially unsafe content')
    .transform((val) => InputSanitizer.sanitizeText(val, 50)),

  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\+?[1-9]\d{1,14}$/.test(val.replace(/[\s-()]/g, '')),
      'Please enter a valid phone number'
    )
    .refine((val) => {
      if (!val) return true;
      const securityCheck = SecurityDetector.scanInput(val);
      return securityCheck.isValid;
    }, 'Phone number contains potentially unsafe content')
    .transform((val) => val ? InputSanitizer.sanitizePhone(val) : val),

  department: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const securityCheck = SecurityDetector.scanInput(val);
      return securityCheck.isValid;
    }, 'Department contains potentially unsafe content')
    .transform((val) => val ? InputSanitizer.sanitizeText(val, 100) : val),

  enabled: z.boolean().default(true),

  roles: z
    .array(z.nativeEnum(UserRole))
    .min(1, 'At least one role must be assigned')
    .refine((roles) => roles.length <= 3, 'Maximum 3 roles can be assigned')
    .refine((roles) => {
      // Security check: Ensure no privilege escalation attempts
      const uniqueRoles = new Set(roles);
      return uniqueRoles.size === roles.length;
    }, 'Duplicate roles detected'),
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

// Create schema for edit mode (password optional with enhanced security)
const userEditFormSchema = userFormSchema.extend({
  password: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) {return true;}
        return val.length >= 8 && // Updated to match the stricter requirement
               val.length <= 128 &&
               /[A-Z]/.test(val) &&
               /[a-z]/.test(val) &&
               /[0-9]/.test(val) &&
               /[^A-Za-z0-9]/.test(val);
      },
      'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
    )
    .refine((val) => {
      if (!val) return true;
      // Apply same security checks as create mode
      const weakPasswords = ['password', '123456', 'qwerty', 'admin', 'welcome'];
      return !weakPasswords.some(weak => val.toLowerCase().includes(weak));
    }, 'Password is too common. Please choose a stronger password')
    .refine((val) => {
      if (!val) return true;
      const hasSequential = /123|abc|qwe|asd|zxc/i.test(val);
      return !hasSequential;
    }, 'Password should not contain sequential characters')
    .refine((val) => {
      if (!val) return true;
      const hasRepeated = /(.)\1{2,}/.test(val);
      return !hasRepeated;
    }, 'Password should not contain repeated characters'),
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

  // Security validation
  securityValidation: ReturnType<typeof useSecurityValidation>;

  // Form methods
  handleSubmit: (onSubmit: (data: UserCreateDto | UserUpdateDto) => Promise<void>) => (e?: React.BaseSyntheticEvent) => Promise<void>;
  reset: () => void;
  setFieldValue: (field: keyof UserFormData, value: string | boolean | UserRole[]) => void;
  getFieldError: (field: keyof UserFormData) => string | undefined;

  // Validation helpers
  validateField: (field: keyof UserFormData) => Promise<boolean>;
  validateAllFields: () => Promise<boolean>;
  validateSecurityThreats: () => { hasThreats: boolean; threats: string[] };

  // Form data helpers
  getFormData: () => UserFormData;
  getSubmitData: () => UserCreateDto | UserUpdateDto;
  hasUnsavedChanges: () => boolean;

  // Security helpers
  sanitizeFormData: () => UserFormData;
  checkRateLimit: () => boolean;
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

  // Security validation hook
  const securityValidation = useSecurityValidation({
    enableRealTimeValidation: true,
    enableSessionMonitoring: true,
    enableIdleDetection: true,
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

  // Security validation helpers
  const validateSecurityThreats = useCallback((): { hasThreats: boolean; threats: string[] } => {
    const formData = form.getValues();
    const allThreats: string[] = [];

    // Check each field for security threats
    Object.entries(formData).forEach(([key, value]) => {
      if (typeof value === 'string' && value.length > 0) {
        const result = securityValidation.validateInput(value);
        if (!result.isValid) {
          allThreats.push(`${key}: ${result.threats.join(', ')}`);
        }
      }
    });

    return {
      hasThreats: allThreats.length > 0,
      threats: allThreats,
    };
  }, [form, securityValidation]);

  const sanitizeFormData = useCallback((): UserFormData => {
    const formData = form.getValues();
    const sanitized: UserFormData = { ...formData };

    // Sanitize string fields
    if (sanitized.username) {
      sanitized.username = InputSanitizer.sanitizeUsername(sanitized.username);
    }
    if (sanitized.email) {
      sanitized.email = InputSanitizer.sanitizeEmail(sanitized.email);
    }
    if (sanitized.firstName) {
      sanitized.firstName = InputSanitizer.sanitizeText(sanitized.firstName, 50);
    }
    if (sanitized.lastName) {
      sanitized.lastName = InputSanitizer.sanitizeText(sanitized.lastName, 50);
    }
    if (sanitized.phone) {
      sanitized.phone = InputSanitizer.sanitizePhone(sanitized.phone);
    }
    if (sanitized.department) {
      sanitized.department = InputSanitizer.sanitizeText(sanitized.department, 100);
    }

    return sanitized;
  }, [form]);

  const checkRateLimit = useCallback((): boolean => {
    const identifier = `user-form-${mode}`;
    return securityValidation.checkRateLimit(identifier);
  }, [mode, securityValidation]);

  const handleSubmit = useCallback((onSubmit: (data: UserCreateDto | UserUpdateDto) => Promise<void>) => {
    return rhfHandleSubmit(async (_formData) => {
      // Check rate limiting
      if (checkRateLimit()) {
        throw new Error('Too many form submissions. Please wait before trying again.');
      }

      // Ensure real-time validation is complete and valid
      if (!isFormValid) {
        throw new Error('Form validation failed');
      }

      // Check for security threats
      const securityCheck = validateSecurityThreats();
      if (securityCheck.hasThreats) {
        securityValidation.logSecurityEvent(
          'suspicious_activity',
          `Form submission contains security threats: ${securityCheck.threats.join('; ')}`
        );
        throw new Error('Form contains potentially unsafe content');
      }

      const submitData = getSubmitData();
      await onSubmit(submitData);
    });
  }, [rhfHandleSubmit, isFormValid, getSubmitData, validateSecurityThreats, checkRateLimit, securityValidation]);

  return {
    // Form state
    form,
    isValid: isFormValid,
    isDirty,
    isSubmitting,

    // Real-time validation
    usernameValidation,
    emailValidation,

    // Security validation
    securityValidation,

    // Form methods
    handleSubmit,
    reset,
    setFieldValue,
    getFieldError,

    // Validation helpers
    validateField,
    validateAllFields,
    validateSecurityThreats,

    // Form data helpers
    getFormData,
    getSubmitData,
    hasUnsavedChanges,

    // Security helpers
    sanitizeFormData,
    checkRateLimit,
  };
};