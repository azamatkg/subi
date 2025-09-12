import { UserRole } from '@/types';
import type { PaginatedResponse, ApiResponse } from '@/types';

// User Status Enum
export const UserStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
} as const;

export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

// Core User Interface (extended from existing User type)
export interface UserResponseDto {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  department?: string;
  roles: UserRole[];
  status: UserStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  fullName?: string; // Computed field
}

// User List Response (for table/card views)
export interface UserListResponseDto {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  roles: UserRole[];
  status: UserStatus;
  isActive: boolean;
  department?: string;
  lastLoginAt?: string;
  createdAt: string;
}

// User Creation DTO
export interface UserCreateDto {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  department?: string;
  roles: UserRole[];
  isActive?: boolean;
}

// User Update DTO
export interface UserUpdateDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  department?: string;
  roles?: UserRole[];
  isActive?: boolean;
}

// User Status Update DTO
export interface UserStatusUpdateDto {
  status: UserStatus;
  reason?: string;
}

// User Search and Filter Parameters
export interface UserSearchAndFilterParams {
  page?: number;
  size?: number;
  sort?: string;
  searchTerm?: string;
  roles?: UserRole[];
  status?: UserStatus;
  isActive?: boolean;
  department?: string;
  createdDateFrom?: string;
  createdDateTo?: string;
  lastLoginFrom?: string;
  lastLoginTo?: string;
}

// User Filter State (for UI state management)
export interface UserFilterState {
  searchTerm: string;
  roles: UserRole[];
  status: UserStatus | null;
  isActive: boolean | null;
  department: string;
  createdDateFrom: string;
  createdDateTo: string;
  lastLoginFrom: string;
  lastLoginTo: string;
}

// Bulk Operations
export interface BulkUserStatusUpdateDto {
  userIds: string[];
  status: UserStatus;
  reason?: string;
}

export interface BulkUserRoleUpdateDto {
  userIds: string[];
  roles: UserRole[];
  operation: 'ADD' | 'REMOVE' | 'REPLACE';
}

// User Statistics
export interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  suspendedUsers: number;
  usersByRole: Record<UserRole, number>;
  usersByDepartment: Record<string, number>;
  recentlyCreatedUsers: number;
  usersWithRecentLogin: number;
}

// Password Reset
export interface PasswordResetDto {
  newPassword: string;
  requirePasswordChange?: boolean;
}

// User Activity Log
export interface UserActivityLog {
  id: string;
  userId: string;
  action: string;
  description: string;
  performedBy: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

// User Role Assignment History
export interface UserRoleHistory {
  id: string;
  userId: string;
  previousRoles: UserRole[];
  newRoles: UserRole[];
  changedBy: string;
  changeReason?: string;
  timestamp: string;
}

// Export Response Types
export type UserListResponse = PaginatedResponse<UserListResponseDto>;
export type UserResponse = ApiResponse<UserResponseDto>;
export type UserStatisticsResponse = ApiResponse<UserStatistics>;
export type UserActivityLogResponse = PaginatedResponse<UserActivityLog>;

// Export commonly used types
export type {
  PaginatedResponse,
  ApiResponse,
} from '@/types';

// Export UserRole as both value and type
export { UserRole } from '@/types';