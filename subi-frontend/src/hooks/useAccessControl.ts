import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  ActionAccess,
  UserManagementAccess,
  UserManagementPermission,
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
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

// Hook for user list page specific permissions - optimized to prevent infinite re-renders
export const useUserListAccess = () => {
  const { user } = useAuth();

  return useMemo(() => {
    // Direct permission checks to avoid nested useMemo dependencies
    const canViewUsers = UserManagementAccess.canViewUsers(user);
    const canCreateNewUser = ActionAccess.canCreateNewUser(user);
    const canEditUserFromList = ActionAccess.canEditUserFromList(user);
    const canDeleteUserFromList = ActionAccess.canDeleteUserFromList(user);
    const canViewUserProfile = ActionAccess.canViewUserProfile(user);
    const canExportUserList = ActionAccess.canExportUserList(user);
    const canSelectMultipleUsers = ActionAccess.canSelectMultipleUsers(user);
    const canBulkDeleteUsers = ActionAccess.canBulkDeleteUsers(user);
    const canBulkUpdateUserStatus = ActionAccess.canBulkUpdateUserStatus(user);
    const canBulkUpdateUserRoles = ActionAccess.canBulkUpdateUserRoles(user);

    return {
      // Basic access
      canAccessPage: canViewUsers,
      canViewList: canViewUsers,

      // Creation
      canShowCreateButton: canCreateNewUser,
      canCreateUser: canCreateNewUser,

      // List actions
      canShowEditAction: canEditUserFromList,
      canShowDeleteAction: canDeleteUserFromList,
      canShowViewAction: canViewUserProfile,

      // Export functionality
      canExportData: canExportUserList,
      canShowExportButton: canExportUserList,

      // Bulk operations
      canShowBulkActions: canSelectMultipleUsers,
      canSelectMultiple: canSelectMultipleUsers,
      canBulkDelete: canBulkDeleteUsers,
      canBulkUpdateStatus: canBulkUpdateUserStatus,
      canBulkUpdateRoles: canBulkUpdateUserRoles,

      // Table columns visibility
      canShowActionsColumn: canEditUserFromList || canDeleteUserFromList || canViewUserProfile,
      canShowStatusColumn: true, // Always visible for display
      canShowRolesColumn: true, // Always visible for display
    };
  }, [user]); // Depend on user object since we use multiple properties
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

// Hook for bulk actions toolbar specific permissions - optimized to prevent infinite re-renders
export const useBulkActionsAccess = () => {
  const { user } = useAuth();

  return useMemo(() => {
    // Direct permission checks to avoid nested useMemo dependencies
    const canSelectMultipleUsers = ActionAccess.canSelectMultipleUsers(user);
    const canBulkDeleteUsers = ActionAccess.canBulkDeleteUsers(user);
    const canBulkUpdateUserStatus = ActionAccess.canBulkUpdateUserStatus(user);
    const canBulkUpdateUserRoles = ActionAccess.canBulkUpdateUserRoles(user);

    return {
      // Toolbar visibility
      canShowToolbar: canSelectMultipleUsers,
      canSelectMultiple: canSelectMultipleUsers,

      // Individual actions
      canBulkDelete: canBulkDeleteUsers,
      canBulkActivate: canBulkUpdateUserStatus,
      canBulkDeactivate: canBulkUpdateUserStatus,
      canBulkSuspend: canBulkUpdateUserStatus,
      canBulkUpdateRoles: canBulkUpdateUserRoles,

      // Action buttons visibility
      canShowDeleteButton: canBulkDeleteUsers,
      canShowStatusButtons: canBulkUpdateUserStatus,
      canShowRoleButtons: canBulkUpdateUserRoles,
    };
  }, [user]); // Only depend on user object
};

// Hook for checking if user has any admin privileges
export const useAdminAccess = () => {
  const { userManagement } = useAccessControl();

  return useMemo(
    () => ({
      isAdmin: userManagement.hasFullAccess,
      hasAnyAdminAccess: userManagement.hasAnyAccess,
      canAccessAdminPanel: userManagement.hasAnyAccess,
      canManageUsers: userManagement.canViewUsers,
    }),
    [userManagement]
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