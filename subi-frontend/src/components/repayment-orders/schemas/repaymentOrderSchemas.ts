import { z } from 'zod';
import { ReferenceEntityStatus } from '@/types/reference';
import { RepaymentOrderPriority } from '@/types/repaymentOrder';

export const repaymentOrderCreateSchema = z.object({
  nameEn: z
    .string()
    .min(1, 'repaymentOrder.validation.nameEnRequired')
    .max(100, 'repaymentOrder.validation.nameMaxLength')
    .trim(),
  nameRu: z
    .string()
    .min(1, 'repaymentOrder.validation.nameRuRequired')
    .max(100, 'repaymentOrder.validation.nameMaxLength')
    .trim(),
  nameKg: z
    .string()
    .min(1, 'repaymentOrder.validation.nameKgRequired')
    .max(100, 'repaymentOrder.validation.nameMaxLength')
    .trim(),
  description: z
    .string()
    .max(500, 'repaymentOrder.validation.descriptionMaxLength')
    .default(''),
  priority: z
    .enum([
      RepaymentOrderPriority.PRINCIPAL,
      RepaymentOrderPriority.INTEREST,
      RepaymentOrderPriority.PENALTIES,
      RepaymentOrderPriority.FEES,
      RepaymentOrderPriority.COMMISSION,
      RepaymentOrderPriority.INSURANCE,
      RepaymentOrderPriority.OTHER,
    ], {
      errorMap: () => ({ message: 'repaymentOrder.validation.priorityRequired' })
    }),
  priorityOrder: z
    .number()
    .int('repaymentOrder.validation.priorityOrderInteger')
    .min(1, 'repaymentOrder.validation.priorityOrderMin')
    .max(100, 'repaymentOrder.validation.priorityOrderMax'),
  status: z
    .enum([ReferenceEntityStatus.ACTIVE, ReferenceEntityStatus.INACTIVE], {
      errorMap: () => ({ message: 'repaymentOrder.validation.statusRequired' })
    })
    .default(ReferenceEntityStatus.ACTIVE),
});

export const repaymentOrderUpdateSchema = z.object({
  nameEn: z
    .string()
    .min(1, 'repaymentOrder.validation.nameEnRequired')
    .max(100, 'repaymentOrder.validation.nameMaxLength')
    .trim()
    .optional(),
  nameRu: z
    .string()
    .min(1, 'repaymentOrder.validation.nameRuRequired')
    .max(100, 'repaymentOrder.validation.nameMaxLength')
    .trim()
    .optional(),
  nameKg: z
    .string()
    .min(1, 'repaymentOrder.validation.nameKgRequired')
    .max(100, 'repaymentOrder.validation.nameMaxLength')
    .trim()
    .optional(),
  description: z
    .string()
    .max(500, 'repaymentOrder.validation.descriptionMaxLength')
    .optional(),
  priority: z
    .enum([
      RepaymentOrderPriority.PRINCIPAL,
      RepaymentOrderPriority.INTEREST,
      RepaymentOrderPriority.PENALTIES,
      RepaymentOrderPriority.FEES,
      RepaymentOrderPriority.COMMISSION,
      RepaymentOrderPriority.INSURANCE,
      RepaymentOrderPriority.OTHER,
    ])
    .optional(),
  priorityOrder: z
    .number()
    .int('repaymentOrder.validation.priorityOrderInteger')
    .min(1, 'repaymentOrder.validation.priorityOrderMin')
    .max(100, 'repaymentOrder.validation.priorityOrderMax')
    .optional(),
  status: z
    .enum([ReferenceEntityStatus.ACTIVE, ReferenceEntityStatus.INACTIVE])
    .optional(),
});

export type RepaymentOrderCreateFormData = z.infer<typeof repaymentOrderCreateSchema>;
export type RepaymentOrderUpdateFormData = z.infer<typeof repaymentOrderUpdateSchema>;