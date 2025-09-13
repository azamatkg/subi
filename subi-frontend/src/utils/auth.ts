import { AuthUser, TokenPayload } from '@/types/auth';
import { UserRole } from '@/types';
import { STORAGE_KEYS } from '@/constants';

// JWT Token utilities
export const decodeToken = (token: string): TokenPayload | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded) {
    return true;
  }

  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
};

export const getTokenExpirationDate = (token: string): Date | null => {
  const decoded = decodeToken(token);
  if (!decoded) {
    return null;
  }

  return new Date(decoded.exp * 1000);
};

// Storage utilities
export const getStoredToken = (): string | null => {
  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  if (!token || token === 'undefined' || token === 'null') {
    return null;
  }
  return token;
};

export const getStoredRefreshToken = (): string | null => {
  const token = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  if (!token || token === 'undefined' || token === 'null') {
    return null;
  }
  return token;
};

export const getStoredUser = (): AuthUser | null => {
  const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
  if (!userData || userData === 'undefined' || userData === 'null') {
    return null;
  }

  try {
    return JSON.parse(userData);
  } catch (error) {
    console.error('Failed to parse stored user data:', error);
    // Clear corrupted data
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    return null;
  }
};

export const setStoredTokens = (
  accessToken: string,
  refreshToken: string
): void => {
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
};

export const setStoredUser = (user: AuthUser): void => {
  localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
};

export const clearStoredAuth = (): void => {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER_DATA);
};

// View mode persistence utilities
export const getStoredViewMode = (): 'table' | 'card' | null => {
  try {
    const viewMode = localStorage.getItem(STORAGE_KEYS.DECISIONS_VIEW_MODE);
    if (viewMode && (viewMode === 'table' || viewMode === 'card')) {
      return viewMode as 'table' | 'card';
    }
  } catch (error) {
    console.warn('Failed to retrieve stored view mode:', error);
  }
  return null;
};

export const setStoredViewMode = (viewMode: 'table' | 'card'): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.DECISIONS_VIEW_MODE, viewMode);
  } catch (error) {
    console.warn('Failed to store view mode:', error);
  }
};

// Permission utilities
export const hasRole = (user: AuthUser | null, role: string): boolean => {
  if (!user) {
    return false;
  }
  return user.roles.includes(role as UserRole);
};

export const hasAnyRole = (user: AuthUser | null, roles: string[]): boolean => {
  if (!user) {
    return false;
  }
  return roles.some(role => hasRole(user, role));
};

export const isAdmin = (user: AuthUser | null): boolean => {
  return hasRole(user, 'ADMIN');
};

export const isCreditManager = (user: AuthUser | null): boolean => {
  return hasRole(user, 'CREDIT_MANAGER');
};

export const isCreditAnalyst = (user: AuthUser | null): boolean => {
  return hasRole(user, 'CREDIT_ANALYST');
};

export const isDecisionMaker = (user: AuthUser | null): boolean => {
  return hasRole(user, 'DECISION_MAKER');
};

export const isCommissionMember = (user: AuthUser | null): boolean => {
  return hasRole(user, 'COMMISSION_MEMBER');
};

// Format user display name
export const getUserDisplayName = (user: AuthUser | null): string => {
  if (!user) {
    return '';
  }

  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }

  if (user.firstName) {
    return user.firstName;
  }

  return user.username;
};
