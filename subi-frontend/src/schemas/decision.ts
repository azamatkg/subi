import { z } from 'zod';
import { DecisionStatus, ReferenceEntityStatus } from '@/types/decision';

// Common validation patterns
const multilingualNameSchema = {
  nameEn: z
    .string()
    .min(1, 'English name is required')
    .max(100, 'English name cannot exceed 100 characters')
    .trim(),
  nameRu: z
    .string()
    .min(1, 'Russian name is required')
    .max(100, 'Russian name cannot exceed 100 characters')
    .trim(),
  nameKg: z
    .string()
    .min(1, 'Kyrgyz name is required')
    .max(100, 'Kyrgyz name cannot exceed 100 characters')
    .trim(),
};

// Decision validation schemas
export const createDecisionSchema = z.object({
  ...multilingualNameSchema,
  date: z
    .string()
    .min(1, 'Decision date is required')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  number: z
    .string()
    .min(1, 'Decision number is required')
    .max(50, 'Decision number cannot exceed 50 characters')
    .trim(),
  decisionMakingBodyId: z.number().min(1, 'Decision making body is required'),
  decisionTypeId: z.number().min(1, 'Decision type is required'),
  note: z
    .string()
    .max(1000, 'Note cannot exceed 1000 characters')
    .optional()
    .or(z.literal('')),
  status: z.nativeEnum(DecisionStatus, {
    message: 'Please select a valid status',
  }),
  documentPackageId: z
    .string()
    .transform(val => (val === '' ? undefined : val))
    .optional()
    .refine(
      val => val === undefined || z.string().uuid().safeParse(val).success,
      {
        message: 'Document package ID must be a valid UUID',
      }
    ),
});

export const updateDecisionSchema = z.object({
  nameEn: z
    .string()
    .max(100, 'English name cannot exceed 100 characters')
    .trim()
    .optional(),
  nameRu: z
    .string()
    .max(100, 'Russian name cannot exceed 100 characters')
    .trim()
    .optional(),
  nameKg: z
    .string()
    .max(100, 'Kyrgyz name cannot exceed 100 characters')
    .trim()
    .optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional(),
  number: z
    .string()
    .max(50, 'Decision number cannot exceed 50 characters')
    .trim()
    .optional(),
  decisionMakingBodyId: z
    .number()
    .min(1, 'Decision making body is required')
    .optional(),
  decisionTypeId: z.number().min(1, 'Decision type is required').optional(),
  note: z.string().max(1000, 'Note cannot exceed 1000 characters').optional(),
  documentPackageId: z
    .string()
    .transform(val => (val === '' ? undefined : val))
    .optional()
    .refine(
      val => val === undefined || z.string().uuid().safeParse(val).success,
      {
        message: 'Document package ID must be a valid UUID',
      }
    ),
});

// Decision Type validation schemas
export const createDecisionTypeSchema = z.object({
  ...multilingualNameSchema,
  description: z
    .string()
    .max(500, 'Description cannot exceed 500 characters')
    .optional()
    .or(z.literal('')),
  status: z.nativeEnum(ReferenceEntityStatus, {
    message: 'Please select a valid status',
  }),
});

export const updateDecisionTypeSchema = z
  .object({
    nameEn: z
      .string()
      .max(100, 'English name cannot exceed 100 characters')
      .trim()
      .optional(),
    nameRu: z
      .string()
      .max(100, 'Russian name cannot exceed 100 characters')
      .trim()
      .optional(),
    nameKg: z
      .string()
      .max(100, 'Kyrgyz name cannot exceed 100 characters')
      .trim()
      .optional(),
    description: z
      .string()
      .max(500, 'Description cannot exceed 500 characters')
      .optional(),
    status: z
      .nativeEnum(ReferenceEntityStatus, {
        message: 'Please select a valid status',
      })
      .optional(),
  })
  .partial();

// Decision Making Body validation schemas
export const createDecisionMakingBodySchema = z.object({
  ...multilingualNameSchema,
  description: z
    .string()
    .max(500, 'Description cannot exceed 500 characters')
    .optional()
    .or(z.literal('')),
  status: z.nativeEnum(ReferenceEntityStatus, {
    message: 'Please select a valid status',
  }),
});

export const updateDecisionMakingBodySchema = z
  .object({
    nameEn: z
      .string()
      .max(100, 'English name cannot exceed 100 characters')
      .trim()
      .optional(),
    nameRu: z
      .string()
      .max(100, 'Russian name cannot exceed 100 characters')
      .trim()
      .optional(),
    nameKg: z
      .string()
      .max(100, 'Kyrgyz name cannot exceed 100 characters')
      .trim()
      .optional(),
    description: z
      .string()
      .max(500, 'Description cannot exceed 500 characters')
      .optional(),
    status: z
      .nativeEnum(ReferenceEntityStatus, {
        message: 'Please select a valid status',
      })
      .optional(),
  })
  .partial();

// Search and filter validation schemas
export const searchDecisionsSchema = z.object({
  searchTerm: z
    .string()
    .max(100, 'Search term cannot exceed 100 characters')
    .optional(),
  decisionMakingBodyId: z.number().min(1).optional(),
  decisionTypeId: z.number().min(1).optional(),
  status: z.nativeEnum(DecisionStatus).optional(),
  page: z.number().min(0).default(0),
  size: z.number().min(1).max(100).default(20),
  sort: z.string().optional(),
});

// Type exports for use in components
export type CreateDecisionFormData = z.infer<typeof createDecisionSchema>;
export type UpdateDecisionFormData = z.infer<typeof updateDecisionSchema>;
export type CreateDecisionTypeFormData = z.infer<
  typeof createDecisionTypeSchema
>;
export type UpdateDecisionTypeFormData = z.infer<
  typeof updateDecisionTypeSchema
>;
export type CreateDecisionMakingBodyFormData = z.infer<
  typeof createDecisionMakingBodySchema
>;
export type UpdateDecisionMakingBodyFormData = z.infer<
  typeof updateDecisionMakingBodySchema
>;
export type SearchDecisionsFormData = z.infer<typeof searchDecisionsSchema>;
