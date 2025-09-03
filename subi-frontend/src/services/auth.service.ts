import axios, { AxiosResponse } from 'axios';
import { 
  LoginCredentials, 
  AuthResponse, 
  RefreshTokenResponse 
} from '@/types/auth';
import { API_BASE_URL } from '@/constants';

class AuthService {
  private baseURL = `${API_BASE_URL}/auth`;

  // Note: Auth service uses raw axios to avoid circular dependency with apiClient
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await axios.post(
      `${this.baseURL}/login`,
      credentials
    );
    return response.data;
  }

  async logout(refreshToken: string): Promise<void> {
    await axios.post(`${this.baseURL}/logout`, { refreshToken });
  }

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response: AxiosResponse<RefreshTokenResponse> = await axios.post(
      `${this.baseURL}/refresh`,
      { refreshToken }
    );
    return response.data;
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      await axios.post(`${this.baseURL}/validate`, { token });
      return true;
    } catch (error) {
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