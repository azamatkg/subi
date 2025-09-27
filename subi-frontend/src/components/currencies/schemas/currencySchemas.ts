import { z } from 'zod';
import { ReferenceEntityStatus } from '@/types/reference';

export const currencyCreateSchema = z.object({
  code: z
    .string()
    .min(1, 'currency.validation.codeRequired')
    .length(3, 'currency.validation.codeLength')
    .regex(/^[A-Z]{3}$/, 'currency.validation.codeFormat')
    .trim()
    .toUpperCase(),
  nameEn: z
    .string()
    .min(1, 'currency.validation.nameEnRequired')
    .max(100, 'currency.validation.nameMaxLength')
    .trim(),
  nameRu: z
    .string()
    .min(1, 'currency.validation.nameRuRequired')
    .max(100, 'currency.validation.nameMaxLength')
    .trim(),
  nameKg: z
    .string()
    .min(1, 'currency.validation.nameKgRequired')
    .max(100, 'currency.validation.nameMaxLength')
    .trim(),
  description: z
    .string()
    .max(500, 'currency.validation.descriptionMaxLength')
    .default(''),
  status: z
    .enum([ReferenceEntityStatus.ACTIVE, ReferenceEntityStatus.INACTIVE], {
      errorMap: () => ({ message: 'currency.validation.statusRequired' })
    })
    .default(ReferenceEntityStatus.ACTIVE),
});

export const currencyUpdateSchema = z.object({
  code: z
    .string()
    .length(3, 'currency.validation.codeLength')
    .regex(/^[A-Z]{3}$/, 'currency.validation.codeFormat')
    .trim()
    .toUpperCase()
    .optional(),
  nameEn: z
    .string()
    .min(1, 'currency.validation.nameEnRequired')
    .max(100, 'currency.validation.nameMaxLength')
    .trim()
    .optional(),
  nameRu: z
    .string()
    .min(1, 'currency.validation.nameRuRequired')
    .max(100, 'currency.validation.nameMaxLength')
    .trim()
    .optional(),
  nameKg: z
    .string()
    .min(1, 'currency.validation.nameKgRequired')
    .max(100, 'currency.validation.nameMaxLength')
    .trim()
    .optional(),
  description: z
    .string()
    .max(500, 'currency.validation.descriptionMaxLength')
    .optional(),
  status: z
    .enum([ReferenceEntityStatus.ACTIVE, ReferenceEntityStatus.INACTIVE])
    .optional(),
});

export type CurrencyCreateFormData = z.infer<typeof currencyCreateSchema>;
export type CurrencyUpdateFormData = z.infer<typeof currencyUpdateSchema>;