import { z } from 'zod';
import { FloatingRateCalculationType } from '@/types/floatingRateType';
import { ReferenceEntityStatus } from '@/types/reference';

// Create schema for floating rate types
export const floatingRateTypeCreateSchema = z.object({
  nameEn: z
    .string()
    .min(1, 'English name is required')
    .max(100, 'English name must be 100 characters or less')
    .trim(),
  nameRu: z
    .string()
    .min(1, 'Russian name is required')
    .max(100, 'Russian name must be 100 characters or less')
    .trim(),
  nameKg: z
    .string()
    .min(1, 'Kyrgyz name is required')
    .max(100, 'Kyrgyz name must be 100 characters or less')
    .trim(),
  description: z
    .string()
    .max(500, 'Description must be 500 characters or less')
    .trim()
    .optional()
    .or(z.literal('')),
  rateCalculationType: z.nativeEnum(FloatingRateCalculationType, {
    required_error: 'Rate calculation type is required',
  }),
  baseRateDescription: z
    .string()
    .max(200, 'Base rate description must be 200 characters or less')
    .trim()
    .optional()
    .or(z.literal('')),
  spreadMin: z
    .number()
    .min(0, 'Minimum spread must be 0 or greater')
    .max(100, 'Minimum spread must be 100% or less')
    .optional()
    .nullable(),
  spreadMax: z
    .number()
    .min(0, 'Maximum spread must be 0 or greater')
    .max(100, 'Maximum spread must be 100% or less')
    .optional()
    .nullable(),
  status: z.nativeEnum(ReferenceEntityStatus, {
    required_error: 'Status is required',
  }),
}).refine(
  (data) => {
    // If both min and max spreads are provided, min should be <= max
    if (data.spreadMin !== undefined && data.spreadMin !== null &&
        data.spreadMax !== undefined && data.spreadMax !== null) {
      return data.spreadMin <= data.spreadMax;
    }
    return true;
  },
  {
    message: 'Minimum spread must be less than or equal to maximum spread',
    path: ['spreadMin'],
  }
);

// Edit schema (same as create but with optional fields for partial updates)
export const floatingRateTypeEditSchema = z.object({
  id: z.number().int().positive('ID must be a positive integer'),
  nameEn: z
    .string()
    .min(1, 'English name is required')
    .max(100, 'English name must be 100 characters or less')
    .trim(),
  nameRu: z
    .string()
    .min(1, 'Russian name is required')
    .max(100, 'Russian name must be 100 characters or less')
    .trim(),
  nameKg: z
    .string()
    .min(1, 'Kyrgyz name is required')
    .max(100, 'Kyrgyz name must be 100 characters or less')
    .trim(),
  description: z
    .string()
    .max(500, 'Description must be 500 characters or less')
    .trim()
    .optional()
    .or(z.literal('')),
  rateCalculationType: z.nativeEnum(FloatingRateCalculationType, {
    required_error: 'Rate calculation type is required',
  }),
  baseRateDescription: z
    .string()
    .max(200, 'Base rate description must be 200 characters or less')
    .trim()
    .optional()
    .or(z.literal('')),
  spreadMin: z
    .number()
    .min(0, 'Minimum spread must be 0 or greater')
    .max(100, 'Minimum spread must be 100% or less')
    .optional()
    .nullable(),
  spreadMax: z
    .number()
    .min(0, 'Maximum spread must be 0 or greater')
    .max(100, 'Maximum spread must be 100% or less')
    .optional()
    .nullable(),
  status: z.nativeEnum(ReferenceEntityStatus, {
    required_error: 'Status is required',
  }),
}).refine(
  (data) => {
    // If both min and max spreads are provided, min should be <= max
    if (data.spreadMin !== undefined && data.spreadMin !== null &&
        data.spreadMax !== undefined && data.spreadMax !== null) {
      return data.spreadMin <= data.spreadMax;
    }
    return true;
  },
  {
    message: 'Minimum spread must be less than or equal to maximum spread',
    path: ['spreadMin'],
  }
);

// Search/filter schema
export const floatingRateTypeSearchSchema = z.object({
  searchTerm: z.string().optional(),
  rateCalculationType: z.nativeEnum(FloatingRateCalculationType).optional(),
  status: z.nativeEnum(ReferenceEntityStatus).optional(),
  page: z.number().int().min(0).optional(),
  size: z.number().int().min(1).max(100).optional(),
  sort: z.string().optional(),
});

// Form data types
export type FloatingRateTypeCreateFormData = z.infer<typeof floatingRateTypeCreateSchema>;
export type FloatingRateTypeEditFormData = z.infer<typeof floatingRateTypeEditSchema>;
export type FloatingRateTypeSearchFormData = z.infer<typeof floatingRateTypeSearchSchema>;

// Validation error type
export type FloatingRateTypeValidationError = z.ZodError<FloatingRateTypeCreateFormData | FloatingRateTypeEditFormData>;

// Helper function to transform form data for API
export const transformFloatingRateTypeFormData = (data: FloatingRateTypeCreateFormData | FloatingRateTypeEditFormData) => {
  return {
    ...data,
    description: data.description || undefined,
    baseRateDescription: data.baseRateDescription || undefined,
    spreadMin: data.spreadMin || undefined,
    spreadMax: data.spreadMax || undefined,
  };
};

// Helper function to transform API data for form
export const transformFloatingRateTypeApiData = (data: unknown): FloatingRateTypeEditFormData => {
  const typedData = data as Record<string, unknown>;
  return {
    id: typedData.id as number,
    nameEn: (typedData.nameEn as string) || '',
    nameRu: (typedData.nameRu as string) || '',
    nameKg: (typedData.nameKg as string) || '',
    description: (typedData.description as string) || '',
    rateCalculationType: typedData.rateCalculationType as any,
    baseRateDescription: (typedData.baseRateDescription as string) || '',
    spreadMin: (typedData.spreadMin as number) || null,
    spreadMax: (typedData.spreadMax as number) || null,
    status: typedData.status as any,
  };
};