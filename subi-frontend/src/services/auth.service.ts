import axios, { AxiosResponse } from 'axios';
import {
  AuthResponse,
  LoginCredentials,
  RefreshTokenResponse,
} from '@/types/auth';
import { UserRole } from '@/types';
import { API_BASE_URL } from '@/constants';

// Backend response structure (different from frontend expectations)
interface BackendAuthResponse {
  token: string;
  type: string;
  username: string;
  email: string;
  fullName: string;
  roles: string[];
  expiresIn: number;
}

class AuthService {
  private baseURL = `${API_BASE_URL}/auth`;

  // Note: Auth service uses raw axios to avoid circular dependency with apiClient
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response: AxiosResponse<BackendAuthResponse> = await axios.post(
      `${this.baseURL}/login`,
      credentials
    );

    // Transform backend response to match frontend expectations
    const backendData = response.data;
    const [firstName, ...lastNameParts] = backendData.fullName.split(' ');
    const lastName = lastNameParts.join(' ');

    return {
      accessToken: backendData.token,
      refreshToken: backendData.token, // Backend doesn't provide separate refresh token
      user: {
        id: credentials.username, // Use username as ID since backend doesn't provide user ID
        username: backendData.username,
        email: backendData.email,
        firstName: firstName || '',
        lastName: lastName || '',
        roles: backendData.roles.filter((role): role is UserRole =>
          Object.values(UserRole).includes(role as UserRole)
        ),
        isActive: true, // Assume active since login was successful
      },
    };
  }

  async logout(refreshToken: string): Promise<void> {
    await axios.post(`${this.baseURL}/logout`, { refreshToken });
  }

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    // Since backend doesn't provide separate refresh tokens,
    // we'll use the same token for both access and refresh
    try {
      const response: AxiosResponse<RefreshTokenResponse> = await axios.post(
        `${this.baseURL}/refresh`,
        { refreshToken }
      );
      return response.data;
    } catch {
      // If refresh endpoint doesn't exist, return the same token
      return {
        accessToken: refreshToken,
        refreshToken: refreshToken,
      };
    }
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      await axios.post(`${this.baseURL}/validate`, { token });
      return true;
    } catch {
      return false;
    }
  }

  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    await axios.post(`${this.baseURL}/change-password`, data);
  }

  async forgotPassword(email: string): Promise<void> {
    await axios.post(`${this.baseURL}/forgot-password`, { email });
  }

  async resetPassword(data: {
    token: string;
    newPassword: string;
  }): Promise<void> {
    await axios.post(`${this.baseURL}/reset-password`, data);
  }
}

export const authService = new AuthService();
