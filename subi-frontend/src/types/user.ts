import { UserRole } from '@/types';
import type { ApiResponse } from '@/types';
import type { RoleResponseDto } from '@/types/role';

// Utility type for role handling - supports both string and object formats for backward compatibility
export type UserRoleValue = UserRole | RoleResponseDto;

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
  roles: RoleResponseDto[]; // Changed to use RoleResponseDto objects instead of string array
  status: UserStatus;
  enabled: boolean; // From API manual
  isActive: boolean; // Internal status
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
  roles: RoleResponseDto[]; // Changed to use RoleResponseDto objects instead of string array
  status: UserStatus;
  enabled: boolean; // From API manual
  isActive: boolean; // Internal status
  department?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

// User Creation DTO (matches API manual CreateUserDto)
export interface UserCreateDto {
  username: string; // Required, 3-50 chars, unique
  email: string; // Required, valid email, unique
  password: string; // Required, min 6 chars
  firstName: string; // Required, 2-50 chars
  lastName: string; // Required, 2-50 chars
  enabled?: boolean; // Optional, default: true (from API manual)
  phone?: string;
  department?: string;
  roles?: UserRole[]; // Optional for creation, can be assigned later
}

// User Update DTO (matches API manual UpdateUserDto - all fields optional)
export interface UserUpdateDto {
  username?: string; // Optional, 3-50 chars, unique (but usually immutable)
  email?: string; // Optional, valid email, unique
  password?: string; // Optional, min 6 chars
  firstName?: string; // Optional, 2-50 chars
  lastName?: string; // Optional, 2-50 chars
  enabled?: boolean; // Optional (from API manual)
  phone?: string;
  department?: string;
  roles?: UserRole[];
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

// Spring Boot Pagination Response (matches actual API)
export interface SpringBootPaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// User List Sorting Options
export interface UserSortOption {
  field:
    | 'username'
    | 'email'
    | 'firstName'
    | 'lastName'
    | 'createdAt'
    | 'lastLoginAt'
    | 'status';
  direction: 'asc' | 'desc';
}

// User Form State for React Hook Form
export interface UserFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword?: string;
  firstName: string;
  lastName: string;
  phone: string;
  department: string;
  enabled: boolean;
  roles: UserRole[];
}

// User Form Validation Errors
export interface UserFormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  department?: string;
  roles?: string;
}

// Real-time Validation Results
export interface UsernameValidationResult {
  available: boolean;
  message: string;
  isChecking: boolean;
}

export interface EmailValidationResult {
  available: boolean;
  message: string;
  isChecking: boolean;
}

// User Management Table State
export interface UserTableState {
  selectedUsers: string[];
  sortBy: UserSortOption;
  filters: UserFilterState;
  pagination: {
    page: number;
    size: number;
  };
}

// User Management Actions
export interface UserManagementAction {
  type:
    | 'VIEW'
    | 'EDIT'
    | 'DELETE'
    | 'CHANGE_STATUS'
    | 'RESET_PASSWORD'
    | 'ASSIGN_ROLES';
  userId: string;
  payload?: unknown;
}

// Department Options (can be extended)
export const UserDepartment = {
  IT: 'IT',
  FINANCE: 'FINANCE',
  OPERATIONS: 'OPERATIONS',
  RISK: 'RISK',
  LEGAL: 'LEGAL',
  HR: 'HR',
  ADMINISTRATION: 'ADMINISTRATION',
} as const;

export type UserDepartment =
  (typeof UserDepartment)[keyof typeof UserDepartment];

// Export Response Types
export type UserListResponse = SpringBootPaginatedResponse<UserListResponseDto>;
export type UserResponse = ApiResponse<UserResponseDto>;
export type UserStatisticsResponse = ApiResponse<UserStatistics>;
export type UserActivityLogResponse =
  SpringBootPaginatedResponse<UserActivityLog>;

// Advanced User Management Types for Components

// DataTable Column Configuration
export interface UserTableColumn {
  key: keyof UserListResponseDto | 'actions';
  label: string;
  sortable: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (user: UserListResponseDto) => React.ReactNode;
}

// Search and Filter UI State
export interface UserSearchFilters {
  searchTerm: string;
  selectedRoles: UserRole[];
  selectedStatus: UserStatus | 'ALL';
  selectedDepartment: UserDepartment | 'ALL';
  isActiveFilter: boolean | 'ALL';
  dateRangeFilter: {
    from: Date | null;
    to: Date | null;
  };
}

// Bulk Operations Progress
export interface BulkOperationProgress {
  operationId: string;
  type: 'STATUS_UPDATE' | 'ROLE_UPDATE' | 'DELETE' | 'PASSWORD_RESET';
  total: number;
  completed: number;
  failed: number;
  inProgress: boolean;
  errors: Array<{
    userId: string;
    username: string;
    error: string;
  }>;
}

// Activity Action Types (matches data model specification)
export const ActivityAction = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  PASSWORD_CHANGE: 'PASSWORD_CHANGE',
  PROFILE_UPDATE: 'PROFILE_UPDATE',
  ROLE_CHANGE: 'ROLE_CHANGE',
  STATUS_CHANGE: 'STATUS_CHANGE',
  ACCOUNT_CREATED: 'ACCOUNT_CREATED',
  ACCOUNT_DELETED: 'ACCOUNT_DELETED',
} as const;

export type ActivityAction =
  (typeof ActivityAction)[keyof typeof ActivityAction];

// User Activity Timeline Entry
export interface UserActivityTimelineEntry {
  id: string;
  type: ActivityAction;
  title: string;
  description: string;
  timestamp: string;
  performedBy: {
    id: string;
    username: string;
    fullName: string;
  };
  metadata?: {
    oldValue?: unknown;
    newValue?: unknown;
    reason?: string;
    ipAddress?: string;
  };
}

// User Metrics and Statistics
export interface UserMetrics {
  loginCount: number;
  lastLoginDays: number;
  accountAge: number;
  rolesCount: number;
  statusChanges: number;
  activityScore: number; // 0-100 based on recent activity
}

// Real-time Validation Hook Types
export interface ValidationState {
  isValidating: boolean;
  isValid: boolean;
  error: string | null;
  lastChecked: Date | null;
}

// User Management Context Types
export interface UserManagementContextType {
  users: UserListResponseDto[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    size: number;
    totalPages: number;
    totalElements: number;
  };
  filters: UserSearchFilters;
  selectedUsers: string[];
  bulkOperationProgress: BulkOperationProgress | null;

  // Actions
  setFilters: (filters: Partial<UserSearchFilters>) => void;
  setSelectedUsers: (userIds: string[]) => void;
  clearSelection: () => void;
  refreshUsers: () => void;
  exportUsers: (format: 'CSV' | 'XLSX' | 'PDF') => Promise<void>;
}

// Form Validation Configuration
export interface UserFormValidationConfig {
  username: {
    minLength: number;
    maxLength: number;
    pattern: RegExp;
    reservedNames: string[];
  };
  password: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
  };
  email: {
    pattern: RegExp;
    blockedDomains: string[];
  };
}

// User Import/Export Types
export interface UserImportData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  department?: string;
  roles: UserRole[];
  enabled: boolean;
}

export interface UserImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: Array<{
    row: number;
    username: string;
    error: string;
  }>;
}

export interface UserExportOptions {
  format: 'CSV' | 'XLSX' | 'PDF';
  columns: (keyof UserListResponseDto)[];
  filters: UserSearchFilters;
  includeMetadata: boolean;
}

// Export commonly used types (re-export from base types)
export type { ApiResponse, PaginatedResponse } from '@/types';

// Export UserRole as both value and type
export { UserRole } from '@/types';

// Re-export base User interface for consistency
export type { User } from '@/types';

// Enhanced Bulk Operations Progress Types
export interface BulkOperationProgress {
  operationId: string;
  operationType: 'status-change' | 'role-assignment' | 'delete';
  totalItems: number;
  processedItems: number;
  successfulItems: number;
  failedItems: number;
  percentage: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'failed';
  startTime: Date;
  endTime?: Date;
  estimatedTimeRemaining?: number;
  currentItem?: string; // ID or name of current item being processed
  errorDetails: BulkOperationError[];
  canCancel: boolean;
}

export interface BulkOperationError {
  itemId: string;
  itemName: string;
  error: string;
  errorCode?: string;
  retryable: boolean;
  retryCount: number;
}

export interface BulkOperationItem {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'skipped';
  error?: string;
  retryable?: boolean;
}

export interface BulkOperationResult {
  operationId: string;
  success: boolean;
  totalProcessed: number;
  successCount: number;
  failedCount: number;
  skippedCount: number;
  items: BulkOperationItem[];
  summary: string;
  details?: string;
}

export interface BulkOperationOptions {
  continueOnError: boolean;
  maxRetries: number;
  batchSize: number;
  showDetailedProgress: boolean;
  allowCancel: boolean;
}
