import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './redux';
import {
  loginAsync,
  logoutAsync,
  clearError,
  validateAuthAsync,
} from '@/store/slices/authSlice';
import { LoginCredentials } from '@/types/auth';
import {
  hasRole,
  hasAnyRole,
  isAdmin,
  isCreditManager,
  isCreditAnalyst,
  isDecisionMaker,
  isCommissionMember,
  getUserDisplayName,
} from '@/utils/auth';
import { ROUTES } from '@/constants';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { user, accessToken, refreshToken, isAuthenticated, isLoading, error } =
    useAppSelector(state => state.auth);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        await dispatch(loginAsync(credentials)).unwrap();
        navigate(ROUTES.DASHBOARD);
        return { success: true };
      } catch (error: unknown) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Login failed',
        };
      }
    },
    [dispatch, navigate]
  );

  const logout = useCallback(async () => {
    try {
      await dispatch(logoutAsync()).unwrap();
      navigate(ROUTES.LOGIN);
      return { success: true };
    } catch {
      // Force logout even if server request fails
      navigate(ROUTES.LOGIN);
      return { success: true };
    }
  }, [dispatch, navigate]);

  const validateAuth = useCallback(async () => {
    try {
      await dispatch(validateAuthAsync()).unwrap();
      return { success: true };
    } catch (error: unknown) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Authentication validation failed',
      };
    }
  }, [dispatch]);

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Role-based permissions
  const checkRole = useCallback((role: string) => hasRole(user, role), [user]);
  const checkAnyRole = useCallback(
    (roles: string[]) => hasAnyRole(user, roles),
    [user]
  );
  const checkIsAdmin = useCallback(() => isAdmin(user), [user]);
  const checkIsCreditManager = useCallback(() => isCreditManager(user), [user]);
  const checkIsCreditAnalyst = useCallback(() => isCreditAnalyst(user), [user]);
  const checkIsDecisionMaker = useCallback(() => isDecisionMaker(user), [user]);
  const checkIsCommissionMember = useCallback(
    () => isCommissionMember(user),
    [user]
  );

  // User display utilities
  const userDisplayName = getUserDisplayName(user);

  return {
    // State
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    isLoading,
    error,
    userDisplayName,

    // Actions
    login,
    logout,
    validateAuth,
    clearAuthError,

    // Permissions
    hasRole: checkRole,
    hasAnyRole: checkAnyRole,
    isAdmin: checkIsAdmin,
    isCreditManager: checkIsCreditManager,
    isCreditAnalyst: checkIsCreditAnalyst,
    isDecisionMaker: checkIsDecisionMaker,
    isCommissionMember: checkIsCommissionMember,
  };
};
