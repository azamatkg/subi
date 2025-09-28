import type { UserListResponseDto } from '@/types/user';

/**
 * Runtime validation utility for user data to prevent empty cards
 */

export interface UserValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  hasRequiredFields: boolean;
}

/**
 * Validates user data for rendering in cards or tables
 */
export function validateUserData(user: unknown): UserValidationResult {
  const result: UserValidationResult = {
    isValid: false,
    errors: [],
    warnings: [],
    hasRequiredFields: false,
  };

  // Basic existence check
  if (!user) {
    result.errors.push('User data is null or undefined');
    return result;
  }

  if (typeof user !== 'object') {
    result.errors.push('User data is not an object');
    return result;
  }

  const userData = user as Partial<UserListResponseDto>;

  // Check critical required fields
  if (!userData.id) {
    result.errors.push('Missing required field: id');
  }

  // Check important fields for display
  if (!userData.email) {
    result.warnings.push('Missing email field');
  }

  if (!userData.username) {
    result.warnings.push('Missing username field');
  }

  if (!userData.firstName && !userData.lastName && !userData.fullName) {
    result.warnings.push('Missing name fields (firstName, lastName, or fullName)');
  }

  // Check data consistency
  if (userData.isActive === undefined && userData.enabled === undefined) {
    result.warnings.push('Missing active/enabled status field');
  }

  if (!Array.isArray(userData.roles)) {
    if (userData.roles === undefined) {
      result.warnings.push('Missing roles field');
    } else {
      result.errors.push('Roles field is not an array');
    }
  }

  // Determine if user has minimum required fields for display
  result.hasRequiredFields = !!(
    userData.id &&
    (userData.email || userData.username) &&
    (userData.firstName || userData.lastName || userData.fullName)
  );

  // User is valid if it has no errors and minimum required fields
  result.isValid = result.errors.length === 0 && result.hasRequiredFields;

  return result;
}

/**
 * Safely normalizes user data with fallbacks
 */
export function normalizeUserData(user: Partial<UserListResponseDto>): UserListResponseDto {
  const id = user.id || 'unknown';
  const username = user.username || `user_${id.slice(-8)}`;
  const email = user.email || `${username}@example.com`;

  // Generate full name with fallback strategies
  let fullName = user.fullName;
  if (!fullName) {
    if (user.firstName && user.lastName) {
      fullName = `${user.firstName} ${user.lastName}`;
    } else if (user.firstName) {
      fullName = user.firstName;
    } else if (user.lastName) {
      fullName = user.lastName;
    } else {
      fullName = email.split('@')[0] || `User ${id.slice(-8)}`;
    }
  }

  return {
    id,
    username,
    email,
    firstName: user.firstName || fullName.split(' ')[0] || 'Unknown',
    lastName: user.lastName || fullName.split(' ').slice(1).join(' ') || 'User',
    fullName,
    roles: Array.isArray(user.roles) ? user.roles : [],
    enabled: user.enabled ?? user.isActive ?? true,
    isActive: user.isActive ?? user.enabled ?? true,
    status: user.status || (user.isActive || user.enabled ? 'ACTIVE' : 'INACTIVE'),
    department: user.department || undefined,
    lastLoginAt: user.lastLoginAt || undefined,
    createdAt: user.createdAt || new Date().toISOString(),
    updatedAt: user.updatedAt || new Date().toISOString(),
  };
}

/**
 * Checks if user data is safe to render
 */
export function isUserDataSafe(user: unknown): user is UserListResponseDto {
  const validation = validateUserData(user);
  return validation.isValid;
}

/**
 * Logs validation issues for debugging
 */
export function logUserValidationIssues(user: unknown, context: string = 'Unknown'): void {
  const validation = validateUserData(user);

  if (validation.errors.length > 0) {
    console.error(`${context}: User validation errors:`, validation.errors, user);
  }

  if (validation.warnings.length > 0) {
    console.warn(`${context}: User validation warnings:`, validation.warnings, user);
  }
}