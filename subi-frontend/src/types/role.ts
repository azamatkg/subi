import type { ApiResponse, PaginatedResponse } from '@/types';

// Role Response DTO (matches API manual)
export interface RoleResponseDto {
  id: string; // UUID
  name: string;
  description: string;
  permissions: PermissionResponseDto[];
  createdAt: string; // ISO 8601 DateTime
  updatedAt: string; // ISO 8601 DateTime
}

// Create Role DTO (matches API manual)
export interface CreateRoleDto {
  name: string; // Required, 2-50 chars, unique
  description?: string; // Optional, max 255 chars
  permissionIds?: string[]; // Optional UUID array
}

// Update Role DTO (matches API manual)
export interface UpdateRoleDto {
  name?: string; // Optional, 2-50 chars, unique
  description?: string; // Optional, max 255 chars
  permissionIds?: string[]; // Optional UUID array
}

// Permission Response DTO (matches API manual)
export interface PermissionResponseDto {
  id: string; // UUID
  name: string;
  description: string;
  createdAt: string; // ISO 8601 DateTime
  updatedAt: string; // ISO 8601 DateTime
}

// Create Permission DTO (matches API manual)
export interface CreatePermissionDto {
  name: string; // Required, 3-50 chars, unique
  description?: string; // Optional, max 255 chars
}

// Update Permission DTO (matches API manual)
export interface UpdatePermissionDto {
  name?: string; // Optional, 3-50 chars, unique
  description?: string; // Optional, max 255 chars
}

// Response Types
export type RoleListResponse = PaginatedResponse<RoleResponseDto>;
export type RoleResponse = ApiResponse<RoleResponseDto>;
export type PermissionListResponse = PaginatedResponse<PermissionResponseDto>;
export type PermissionResponse = ApiResponse<PermissionResponseDto>;

// Search and Filter Parameters
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
