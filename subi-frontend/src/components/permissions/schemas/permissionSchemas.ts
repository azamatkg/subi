import { z } from 'zod';

export const createPermissionSchema = z.object({
  name: z
    .string()
    .min(1, 'permissionManagement.permissionNameRequired')
    .min(3, 'permissionManagement.permissionNameTooShort')
    .max(50, 'permissionManagement.permissionNameTooLong')
    .trim(),
  description: z
    .string()
    .max(255, 'roleManagement.descriptionTooLong')
    .optional()
    .default(''),
});

export const updatePermissionSchema = z.object({
  name: z
    .string()
    .min(3, 'permissionManagement.permissionNameTooShort')
    .max(50, 'permissionManagement.permissionNameTooLong')
    .trim()
    .optional(),
  description: z
    .string()
    .max(255, 'roleManagement.descriptionTooLong')
    .optional(),
});

export type CreatePermissionFormData = z.infer<typeof createPermissionSchema>;
export type UpdatePermissionFormData = z.infer<typeof updatePermissionSchema>;