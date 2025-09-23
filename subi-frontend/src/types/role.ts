import { PaginatedResponse } from '@/types';

export interface CreateRoleDto {
  name: string; // Required, 2-50 chars, unique
  description?: string; // Optional, max 255 chars
  permissionIds?: string[]; // Optional, UUIDs of permissions to assign
}

export interface UpdateRoleDto {
  name?: string; // Optional, 2-50 chars, unique
  description?: string; // Optional, max 255 chars
  permissionIds?: string[]; // Optional, UUIDs of permissions to assign
}

export interface RoleResponseDto {
  id: string;
  name: string;
  description: string;
  permissions: PermissionResponseDto[];
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
}

export interface CreatePermissionDto {
  name: string; // Required, 3-50 chars, unique
  description?: string; // Optional, max 255 chars
}

export interface UpdatePermissionDto {
  name?: string; // Optional, 3-50 chars, unique
  description?: string; // Optional, max 255 chars
}

export interface PermissionResponseDto {
  id: string;
  name: string;
  description: string;
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
}

// Pagination and search parameters
export interface RoleSearchParams {
  page?: number;
  size?: number;
  sort?: string;
  searchTerm?: string;
}

export interface PermissionSearchParams {
  page?: number;
  size?: number;
  sort?: string;
  searchTerm?: string;
}

// Paginated responses
export type PaginatedRolesResponse = PaginatedResponse<RoleResponseDto>;
export type PaginatedPermissionsResponse = PaginatedResponse<PermissionResponseDto>;

// Form validation types
export interface RoleFormData {
  name: string;
  description: string;
  permissionIds: string[];
}

export interface PermissionFormData {
  name: string;
  description: string;
}

// Role hierarchy constants (matching the API manual)
export const RoleHierarchy = {
  ADMIN: 'Full system access, can manage roles and permissions',
  CREDIT_MANAGER: 'Advanced credit management, cannot manage roles/permissions',
  CREDIT_ANALYST: 'Credit program analysis, cannot manage roles/permissions',
  MODERATOR: 'Limited administrative access, cannot manage roles/permissions',
  DECISION_MAKER: 'Decision approval authority, cannot manage roles/permissions',
  USER: 'Basic user access, cannot manage roles/permissions',
} as const;

// Default system roles (cannot be deleted)
export const SystemRoles = ['ADMIN', 'USER'] as const;

// Permission naming convention pattern: {ACTION}_{RESOURCE}
export const PermissionCategories = {
  USER_MANAGEMENT: 'User Management',
  ROLE_MANAGEMENT: 'Role Management',
  PERMISSION_MANAGEMENT: 'Permission Management',
  SYSTEM: 'System',
  CREDIT_PROGRAM: 'Credit Program',
  DECISION: 'Decision',
  REFERENCE_DATA: 'Reference Data',
} as const;