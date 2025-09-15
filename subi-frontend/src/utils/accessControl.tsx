import React from 'react';
import { AuthUser } from '@/types/auth';
import { UserRole } from '@/types';
import { hasAnyRole, isAdmin } from '@/utils/auth';

// Permission levels for user management actions
export const UserManagementPermissions = {
  VIEW_USERS: 'VIEW_USERS',
  CREATE_USER: 'CREATE_USER',
  EDIT_USER: 'EDIT_USER',
  DELETE_USER: 'DELETE_USER',
  BULK_OPERATIONS: 'BULK_OPERATIONS',
  MANAGE_ROLES: 'MANAGE_ROLES',
  VIEW_USER_DETAILS: 'VIEW_USER_DETAILS',
  CHANGE_USER_STATUS: 'CHANGE_USER_STATUS',
  EXPORT_USERS: 'EXPORT_USERS',
} as const;

export type UserManagementPermission =
  (typeof UserManagementPermissions)[keyof typeof UserManagementPermissions];

// Role-based permission mapping
export const RolePermissions: Record<UserRole, UserManagementPermission[]> = {
  [UserRole.ADMIN]: [
    UserManagementPermissions.VIEW_USERS,
    UserManagementPermissions.CREATE_USER,
    UserManagementPermissions.EDIT_USER,
    UserManagementPermissions.DELETE_USER,
    UserManagementPermissions.BULK_OPERATIONS,
    UserManagementPermissions.MANAGE_ROLES,
    UserManagementPermissions.VIEW_USER_DETAILS,
    UserManagementPermissions.CHANGE_USER_STATUS,
    UserManagementPermissions.EXPORT_USERS,
  ],
  [UserRole.CREDIT_MANAGER]: [],
  [UserRole.CREDIT_ANALYST]: [],
  [UserRole.DECISION_MAKER]: [],
  [UserRole.COMMISSION_MEMBER]: [],
  [UserRole.USER]: [],
};

// Check if user has specific permission
export const hasPermission = (
  user: AuthUser | null,
  permission: UserManagementPermission
): boolean => {
  if (!user) {
    return false;
  }

  // Admin has all permissions
  if (isAdmin(user)) {
    return true;
  }

  // Check if any of user's roles have the permission
  return user.roles.some(role =>
    RolePermissions[role]?.includes(permission) ?? false
  );
};

// Check if user has any of the specified permissions
export const hasAnyPermission = (
  user: AuthUser | null,
  permissions: UserManagementPermission[]
): boolean => {
  if (!user) {
    return false;
  }

  return permissions.some(permission => hasPermission(user, permission));
};

// Check if user has all specified permissions
export const hasAllPermissions = (
  user: AuthUser | null,
  permissions: UserManagementPermission[]
): boolean => {
  if (!user) {
    return false;
  }

  return permissions.every(permission => hasPermission(user, permission));
};

// Component access control types
interface AccessControlProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface RoleBasedAccessProps extends AccessControlProps {
  requiredRoles?: UserRole[];
  user: AuthUser | null;
}

interface PermissionBasedAccessProps extends AccessControlProps {
  requiredPermissions?: UserManagementPermission[];
  requireAll?: boolean; // If true, user must have ALL permissions; if false, ANY permission
  user: AuthUser | null;
}

// Role-based component wrapper
export const RoleBasedAccess: React.FC<RoleBasedAccessProps> = ({
  children,
  requiredRoles = [],
  user,
  fallback = null,
}) => {
  if (requiredRoles.length === 0) {
    return <>{children}</>;
  }

  const hasAccess = hasAnyRole(user, requiredRoles);
  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

// Permission-based component wrapper
export const PermissionBasedAccess: React.FC<PermissionBasedAccessProps> = ({
  children,
  requiredPermissions = [],
  requireAll = false,
  user,
  fallback = null,
}) => {
  if (requiredPermissions.length === 0) {
    return <>{children}</>;
  }

  const hasAccess = requireAll
    ? hasAllPermissions(user, requiredPermissions)
    : hasAnyPermission(user, requiredPermissions);

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

// Admin-only access wrapper
export const AdminOnlyAccess: React.FC<AccessControlProps & { user: AuthUser | null }> = ({
  children,
  user,
  fallback = null,
}) => {
  const hasAccess = isAdmin(user);
  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

// Higher-order component for role-based rendering
export function withRoleAccess<P extends object>(
  Component: React.ComponentType<P>,
  requiredRoles: UserRole[]
) {
  const WrappedComponent = (props: P & { user: AuthUser | null }) => {
    const { user, ...componentProps } = props;

    if (!hasAnyRole(user, requiredRoles)) {
      return null;
    }

    return <Component {...(componentProps as P)} />;
  };

  WrappedComponent.displayName = `withRoleAccess(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

// Higher-order component for permission-based rendering
export function withPermissionAccess<P extends object>(
  Component: React.ComponentType<P>,
  requiredPermissions: UserManagementPermission[],
  requireAll = false
) {
  const WrappedComponent = (props: P & { user: AuthUser | null }) => {
    const { user, ...componentProps } = props;

    const hasAccess = requireAll
      ? hasAllPermissions(user, requiredPermissions)
      : hasAnyPermission(user, requiredPermissions);

    if (!hasAccess) {
      return null;
    }

    return <Component {...(componentProps as P)} />;
  };

  WrappedComponent.displayName = `withPermissionAccess(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

// Utility for checking user management access levels
export const UserManagementAccess = {
  // Check if user can view user management pages
  canViewUsers: (user: AuthUser | null): boolean =>
    hasPermission(user, UserManagementPermissions.VIEW_USERS),

  // Check if user can create new users
  canCreateUser: (user: AuthUser | null): boolean =>
    hasPermission(user, UserManagementPermissions.CREATE_USER),

  // Check if user can edit existing users
  canEditUser: (user: AuthUser | null): boolean =>
    hasPermission(user, UserManagementPermissions.EDIT_USER),

  // Check if user can delete users
  canDeleteUser: (user: AuthUser | null): boolean =>
    hasPermission(user, UserManagementPermissions.DELETE_USER),

  // Check if user can perform bulk operations
  canPerformBulkOperations: (user: AuthUser | null): boolean =>
    hasPermission(user, UserManagementPermissions.BULK_OPERATIONS),

  // Check if user can manage roles
  canManageRoles: (user: AuthUser | null): boolean =>
    hasPermission(user, UserManagementPermissions.MANAGE_ROLES),

  // Check if user can view user details
  canViewUserDetails: (user: AuthUser | null): boolean =>
    hasPermission(user, UserManagementPermissions.VIEW_USER_DETAILS),

  // Check if user can change user status
  canChangeUserStatus: (user: AuthUser | null): boolean =>
    hasPermission(user, UserManagementPermissions.CHANGE_USER_STATUS),

  // Check if user can export user data
  canExportUsers: (user: AuthUser | null): boolean =>
    hasPermission(user, UserManagementPermissions.EXPORT_USERS),

  // Check if user has any user management access
  hasAnyAccess: (user: AuthUser | null): boolean =>
    hasAnyPermission(user, [
      UserManagementPermissions.VIEW_USERS,
      UserManagementPermissions.CREATE_USER,
      UserManagementPermissions.EDIT_USER,
      UserManagementPermissions.DELETE_USER,
    ]),

  // Check if user has full admin access
  hasFullAccess: (user: AuthUser | null): boolean =>
    isAdmin(user),
};

// Action-specific access control utilities
export const ActionAccess = {
  // User list actions
  canAccessUserList: (user: AuthUser | null): boolean =>
    UserManagementAccess.canViewUsers(user),

  canCreateNewUser: (user: AuthUser | null): boolean =>
    UserManagementAccess.canCreateUser(user),

  canEditUserFromList: (user: AuthUser | null): boolean =>
    UserManagementAccess.canEditUser(user),

  canDeleteUserFromList: (user: AuthUser | null): boolean =>
    UserManagementAccess.canDeleteUser(user),

  canExportUserList: (user: AuthUser | null): boolean =>
    UserManagementAccess.canExportUsers(user),

  // Bulk actions
  canSelectMultipleUsers: (user: AuthUser | null): boolean =>
    UserManagementAccess.canPerformBulkOperations(user),

  canBulkDeleteUsers: (user: AuthUser | null): boolean =>
    UserManagementAccess.canPerformBulkOperations(user) &&
    UserManagementAccess.canDeleteUser(user),

  canBulkUpdateUserStatus: (user: AuthUser | null): boolean =>
    UserManagementAccess.canPerformBulkOperations(user) &&
    UserManagementAccess.canChangeUserStatus(user),

  canBulkUpdateUserRoles: (user: AuthUser | null): boolean =>
    UserManagementAccess.canPerformBulkOperations(user) &&
    UserManagementAccess.canManageRoles(user),

  // Individual user actions
  canViewUserProfile: (user: AuthUser | null): boolean =>
    UserManagementAccess.canViewUserDetails(user),

  canEditUserProfile: (user: AuthUser | null): boolean =>
    UserManagementAccess.canEditUser(user),

  canDeleteUserProfile: (user: AuthUser | null): boolean =>
    UserManagementAccess.canDeleteUser(user),

  canChangeUserStatusProfile: (user: AuthUser | null): boolean =>
    UserManagementAccess.canChangeUserStatus(user),

  canAssignRoles: (user: AuthUser | null): boolean =>
    UserManagementAccess.canManageRoles(user),
};