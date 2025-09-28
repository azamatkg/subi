import * as z from 'zod';
import { UserRole } from '@/types/user';

// Create User Validation Schema
export const createUserSchema = z
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
    isActive: z.boolean(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// Update User Validation Schema
export const updateUserSchema = z.object({
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
  isActive: z.boolean(),
});

// Personal Information Schema (for reusable form section)
export const personalInfoSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(100, 'First name must be less than 100 characters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(100, 'Last name must be less than 100 characters'),
  email: z
    .string()
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters'),
  phone: z
    .string()
    .optional()
    .refine(
      value => !value || /^[+]?[1-9][\d]{0,15}$/.test(value),
      'Invalid phone number format'
    ),
  department: z.string().optional(),
});

// System Access Schema (for create mode)
export const systemAccessSchema = z
  .object({
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(50, 'Username must be less than 50 characters')
      .regex(
        /^[a-zA-Z0-9_]+$/,
        'Username can only contain letters, numbers, and underscores'
      ),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      ),
    confirmPassword: z.string(),
    isActive: z.boolean(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// Role Assignment Schema
export const roleAssignmentSchema = z.object({
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
});

// Type exports
export type CreateFormData = z.infer<typeof createUserSchema>;
export type UpdateFormData = z.infer<typeof updateUserSchema>;
export type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;
export type SystemAccessFormData = z.infer<typeof systemAccessSchema>;
export type RoleAssignmentFormData = z.infer<typeof roleAssignmentSchema>;

// Combined form data type for flexibility
export type UserFormData = CreateFormData | UpdateFormData;