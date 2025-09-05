import { UserRole } from '@/types';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: UserRole[];
  isActive: boolean;
}

export interface TokenPayload {
  sub: string;
  username: string;
  roles: UserRole[];
  iat: number;
  exp: number;
}

export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}
