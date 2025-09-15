import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  UserManagementPermission,
  UserManagementPermissions,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  UserManagementAccess,
  ActionAccess,
} from '@/utils/accessControl';
import { UserRole } from '@/types';

// Main access control hook
export const useAccessControl = () => {
  const { user } = useAuth();

  // Permission checking functions
  const checkPermission = (permission: UserManagementPermission): boolean =>
    hasPermission(user, permission);

  const checkAnyPermission = (permissions: UserManagementPermission[]): boolean =>
    hasAnyPermission(user, permissions);

  const checkAllPermissions = (permissions: UserManagementPermission[]): boolean =>
    hasAllPermissions(user, permissions);

  // User management specific permissions
  const userManagement = useMemo(
    () => ({
      canViewUsers: UserManagementAccess.canViewUsers(user),
      canCreateUser: UserManagementAccess.canCreateUser(user),
      canEditUser: UserManagementAccess.canEditUser(user),
      canDeleteUser: UserManagementAccess.canDeleteUser(user),
      canPerformBulkOperations: UserManagementAccess.canPerformBulkOperations(user),
      canManageRoles: UserManagementAccess.canManageRoles(user),
      canViewUserDetails: UserManagementAccess.canViewUserDetails(user),
      canChangeUserStatus: UserManagementAccess.canChangeUserStatus(user),
      canExportUsers: UserManagementAccess.canExportUsers(user),
      hasAnyAccess: UserManagementAccess.hasAnyAccess(user),
      hasFullAccess: UserManagementAccess.hasFullAccess(user),
    }),
    [user]
  );

  // Action-specific permissions
  const actions = useMemo(
    () => ({
      // User list actions
      canAccessUserList: ActionAccess.canAccessUserList(user),
      canCreateNewUser: ActionAccess.canCreateNewUser(user),
      canEditUserFromList: ActionAccess.canEditUserFromList(user),
      canDeleteUserFromList: ActionAccess.canDeleteUserFromList(user),
      canExportUserList: ActionAccess.canExportUserList(user),

      // Bulk actions
      canSelectMultipleUsers: ActionAccess.canSelectMultipleUsers(user),
      canBulkDeleteUsers: ActionAccess.canBulkDeleteUsers(user),
      canBulkUpdateUserStatus: ActionAccess.canBulkUpdateUserStatus(user),
      canBulkUpdateUserRoles: ActionAccess.canBulkUpdateUserRoles(user),

      // Individual user actions
      canViewUserProfile: ActionAccess.canViewUserProfile(user),
      canEditUserProfile: ActionAccess.canEditUserProfile(user),
      canDeleteUserProfile: ActionAccess.canDeleteUserProfile(user),
      canChangeUserStatusProfile: ActionAccess.canChangeUserStatusProfile(user),
      canAssignRoles: ActionAccess.canAssignRoles(user),
    }),
    [user]
  );

  return {
    user,
    checkPermission,
    checkAnyPermission,
    checkAllPermissions,
    userManagement,
    actions,
  };
};

// Hook for user list page specific permissions
export const useUserListAccess = () => {
  const { userManagement, actions } = useAccessControl();

  return useMemo(
    () => ({
      // Basic access
      canAccessPage: userManagement.canViewUsers,
      canViewList: userManagement.canViewUsers,

      // Creation
      canShowCreateButton: actions.canCreateNewUser,
      canCreateUser: actions.canCreateNewUser,

      // List actions
      canShowEditAction: actions.canEditUserFromList,
      canShowDeleteAction: actions.canDeleteUserFromList,
      canShowViewAction: actions.canViewUserProfile,

      // Export functionality
      canExportData: actions.canExportUserList,
      canShowExportButton: actions.canExportUserList,

      // Bulk operations
      canShowBulkActions: actions.canSelectMultipleUsers,
      canSelectMultiple: actions.canSelectMultipleUsers,
      canBulkDelete: actions.canBulkDeleteUsers,
      canBulkUpdateStatus: actions.canBulkUpdateUserStatus,
      canBulkUpdateRoles: actions.canBulkUpdateUserRoles,

      // Table columns visibility
      canShowActionsColumn: actions.canEditUserFromList || actions.canDeleteUserFromList || actions.canViewUserProfile,
      canShowStatusColumn: true, // Always visible for display
      canShowRolesColumn: true, // Always visible for display
    }),
    [userManagement, actions]
  );
};

// Hook for user creation/edit page specific permissions
export const useUserFormAccess = () => {
  const { userManagement, actions } = useAccessControl();

  return useMemo(
    () => ({
      // Basic access
      canAccessCreatePage: actions.canCreateNewUser,
      canAccessEditPage: actions.canEditUserProfile,

      // Form fields
      canEditUsername: actions.canEditUserProfile,
      canEditEmail: actions.canEditUserProfile,
      canEditPassword: actions.canEditUserProfile,
      canEditPersonalInfo: actions.canEditUserProfile,
      canEditContactInfo: actions.canEditUserProfile,

      // Role management
      canAssignRoles: actions.canAssignRoles,
      canEditRoles: actions.canAssignRoles,
      canViewRoles: userManagement.canManageRoles || userManagement.canViewUserDetails,

      // Status management
      canChangeStatus: actions.canChangeUserStatusProfile,
      canEditStatus: actions.canChangeUserStatusProfile,
      canViewStatus: userManagement.canViewUserDetails,

      // Form actions
      canSaveUser: actions.canEditUserProfile || actions.canCreateNewUser,
      canCreateUser: actions.canCreateNewUser,
      canUpdateUser: actions.canEditUserProfile,
    }),
    [userManagement, actions]
  );
};

// Hook for user detail page specific permissions
export const useUserDetailAccess = () => {
  const { userManagement, actions } = useAccessControl();

  return useMemo(
    () => ({
      // Basic access
      canAccessPage: actions.canViewUserProfile,
      canViewDetails: actions.canViewUserProfile,

      // Actions
      canShowEditButton: actions.canEditUserProfile,
      canShowDeleteButton: actions.canDeleteUserProfile,
      canNavigateToEdit: actions.canEditUserProfile,

      // Status management
      canChangeStatus: actions.canChangeUserStatusProfile,
      canShowStatusActions: actions.canChangeUserStatusProfile,

      // Role management
      canViewRoles: userManagement.canViewUserDetails,
      canEditRoles: actions.canAssignRoles,
      canShowRoleActions: actions.canAssignRoles,

      // Data visibility
      canViewPersonalInfo: actions.canViewUserProfile,
      canViewContactInfo: actions.canViewUserProfile,
      canViewActivityHistory: actions.canViewUserProfile,
      canViewLoginHistory: actions.canViewUserProfile,
    }),
    [userManagement, actions]
  );
};

// Hook for bulk actions toolbar specific permissions
export const useBulkActionsAccess = () => {
  const { actions } = useAccessControl();

  return useMemo(
    () => ({
      // Toolbar visibility
      canShowToolbar: actions.canSelectMultipleUsers,
      canSelectMultiple: actions.canSelectMultipleUsers,

      // Individual actions
      canBulkDelete: actions.canBulkDeleteUsers,
      canBulkActivate: actions.canBulkUpdateUserStatus,
      canBulkDeactivate: actions.canBulkUpdateUserStatus,
      canBulkSuspend: actions.canBulkUpdateUserStatus,
      canBulkUpdateRoles: actions.canBulkUpdateUserRoles,

      // Action buttons visibility
      canShowDeleteButton: actions.canBulkDeleteUsers,
      canShowStatusButtons: actions.canBulkUpdateUserStatus,
      canShowRoleButtons: actions.canBulkUpdateUserRoles,
    }),
    [actions]
  );
};

// Hook for checking if user has any admin privileges
export const useAdminAccess = () => {
  const { user, userManagement } = useAccessControl();

  return useMemo(
    () => ({
      isAdmin: userManagement.hasFullAccess,
      hasAnyAdminAccess: userManagement.hasAnyAccess,
      canAccessAdminPanel: userManagement.hasAnyAccess,
      canManageUsers: userManagement.canViewUsers,
    }),
    [user, userManagement]
  );
};

// Hook for role-based conditional rendering
export const useConditionalRender = () => {
  const { user } = useAuth();

  const renderForRoles = (
    requiredRoles: UserRole[],
    component: React.ReactNode,
    fallback: React.ReactNode = null
  ): React.ReactNode => {
    if (!user) {
      return fallback;
    }

    const hasRequiredRole = requiredRoles.some(role => user.roles.includes(role));
    return hasRequiredRole ? component : fallback;
  };

  const renderForPermissions = (
    requiredPermissions: UserManagementPermission[],
    component: React.ReactNode,
    fallback: React.ReactNode = null,
    requireAll: boolean = false
  ): React.ReactNode => {
    const hasAccess = requireAll
      ? hasAllPermissions(user, requiredPermissions)
      : hasAnyPermission(user, requiredPermissions);

    return hasAccess ? component : fallback;
  };

  const renderForAdmin = (
    component: React.ReactNode,
    fallback: React.ReactNode = null
  ): React.ReactNode => {
    return renderForRoles([UserRole.ADMIN], component, fallback);
  };

  return {
    renderForRoles,
    renderForPermissions,
    renderForAdmin,
  };
};