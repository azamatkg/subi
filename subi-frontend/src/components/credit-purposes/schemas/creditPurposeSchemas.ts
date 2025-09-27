import { z } from 'zod';
import { ReferenceEntityStatus } from '@/types/reference';
import { CreditPurposeCategory } from '@/types/creditPurpose';

export const creditPurposeCreateSchema = z.object({
  nameEn: z
    .string()
    .min(1, 'creditPurpose.validation.nameEnRequired')
    .max(100, 'creditPurpose.validation.nameMaxLength')
    .trim(),
  nameRu: z
    .string()
    .min(1, 'creditPurpose.validation.nameRuRequired')
    .max(100, 'creditPurpose.validation.nameMaxLength')
    .trim(),
  nameKg: z
    .string()
    .min(1, 'creditPurpose.validation.nameKgRequired')
    .max(100, 'creditPurpose.validation.nameMaxLength')
    .trim(),
  description: z
    .string()
    .max(500, 'creditPurpose.validation.descriptionMaxLength')
    .default(''),
  category: z
    .enum([
      CreditPurposeCategory.CONSUMER,
      CreditPurposeCategory.BUSINESS,
      CreditPurposeCategory.AGRICULTURAL,
      CreditPurposeCategory.MORTGAGE,
      CreditPurposeCategory.MICROFINANCE,
      CreditPurposeCategory.CORPORATE,
    ], {
      errorMap: () => ({ message: 'creditPurpose.validation.categoryRequired' })
    }),
  status: z
    .enum([ReferenceEntityStatus.ACTIVE, ReferenceEntityStatus.INACTIVE], {
      errorMap: () => ({ message: 'creditPurpose.validation.statusRequired' })
    })
    .default(ReferenceEntityStatus.ACTIVE),
});

export const creditPurposeUpdateSchema = z.object({
  nameEn: z
    .string()
    .min(1, 'creditPurpose.validation.nameEnRequired')
    .max(100, 'creditPurpose.validation.nameMaxLength')
    .trim()
    .optional(),
  nameRu: z
    .string()
    .min(1, 'creditPurpose.validation.nameRuRequired')
    .max(100, 'creditPurpose.validation.nameMaxLength')
    .trim()
    .optional(),
  nameKg: z
    .string()
    .min(1, 'creditPurpose.validation.nameKgRequired')
    .max(100, 'creditPurpose.validation.nameMaxLength')
    .trim()
    .optional(),
  description: z
    .string()
    .max(500, 'creditPurpose.validation.descriptionMaxLength')
    .optional(),
  category: z
    .enum([
      CreditPurposeCategory.CONSUMER,
      CreditPurposeCategory.BUSINESS,
      CreditPurposeCategory.AGRICULTURAL,
      CreditPurposeCategory.MORTGAGE,
      CreditPurposeCategory.MICROFINANCE,
      CreditPurposeCategory.CORPORATE,
    ])
    .optional(),
  status: z
    .enum([ReferenceEntityStatus.ACTIVE, ReferenceEntityStatus.INACTIVE])
    .optional(),
});

export type CreditPurposeCreateFormData = z.infer<typeof creditPurposeCreateSchema>;
export type CreditPurposeUpdateFormData = z.infer<typeof creditPurposeUpdateSchema>;