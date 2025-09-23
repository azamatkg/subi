import { z } from 'zod';

export const createRoleSchema = z.object({
  name: z
    .string()
    .min(1, 'roleManagement.roleNameRequired')
    .min(2, 'roleManagement.roleNameTooShort')
    .max(50, 'roleManagement.roleNameTooLong')
    .trim(),
  description: z
    .string()
    .max(255, 'roleManagement.descriptionTooLong')
    .optional()
    .default(''),
  permissionIds: z
    .array(z.string().uuid())
    .optional()
    .default([]),
});

export const updateRoleSchema = z.object({
  name: z
    .string()
    .min(2, 'roleManagement.roleNameTooShort')
    .max(50, 'roleManagement.roleNameTooLong')
    .trim()
    .optional(),
  description: z
    .string()
    .max(255, 'roleManagement.descriptionTooLong')
    .optional(),
  permissionIds: z
    .array(z.string().uuid())
    .optional(),
});

export type CreateRoleFormData = z.infer<typeof createRoleSchema>;
export type UpdateRoleFormData = z.infer<typeof updateRoleSchema>;