import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { API_BASE_URL } from '@/constants';
import {
  clearStoredAuth,
  getStoredRefreshToken,
  getStoredToken,
  isTokenExpired,
  setStoredTokens,
} from '@/utils/auth';
import { authService } from './auth.service';

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private refreshPromise: Promise<string> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = getStoredToken();
        if (token && !isTokenExpired(token)) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async error => {
        const originalRequest = error.config;

        // Handle 401 unauthorized errors
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          const refreshToken = getStoredRefreshToken();
          if (!refreshToken) {
            this.handleAuthError();
            return Promise.reject(error);
          }

          try {
            const newToken = await this.refreshAccessToken();
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            this.handleAuthError();
            return Promise.reject(refreshError);
          }
        }

        // Handle other errors
        return Promise.reject(this.handleError(error));
      }
    );
  }

  private async refreshAccessToken(): Promise<string> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.performTokenRefresh();

    try {
      const newToken = await this.refreshPromise;
      return newToken;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<string> {
    const refreshToken = getStoredRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await authService.refreshToken(refreshToken);
      setStoredTokens(response.accessToken, response.refreshToken);

      // Dispatch event to update Redux store
      window.dispatchEvent(
        new CustomEvent('token-refreshed', {
          detail: response,
        })
      );

      return response.accessToken;
    } catch {
      throw new Error('Token refresh failed');
    }
  }

  private handleAuthError() {
    clearStoredAuth();

    // Dispatch event to update Redux store
    window.dispatchEvent(new CustomEvent('auth-error'));

    // Instead of forcing a full page reload, let the React Router handle navigation
    // The ProtectedRoute component will handle redirecting to login
  }

  private handleError(error: unknown) {
    // Type guard to safely access axios error properties
    const axiosError = error as {
      config?: { url?: string; method?: string };
      response?: {
        status?: number;
        data?: { message?: string; code?: string; details?: unknown };
      };
      message?: string;
    };

    // Log error for debugging
    console.error('API Error:', {
      url: axiosError.config?.url,
      method: axiosError.config?.method,
      status: axiosError.response?.status,
      message: axiosError.response?.data?.message || axiosError.message,
      data: axiosError.response?.data,
    });

    // Create standardized error object
    const apiError = {
      message:
        axiosError.response?.data?.message || 'An unexpected error occurred',
      status: axiosError.response?.status,
      code: axiosError.response?.data?.code,
      details: axiosError.response?.data?.details,
      originalError: error,
    };

    return apiError;
  }

  // Public methods
  public get<T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.get(url, config);
  }

  public post<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.post(url, data, config);
  }

  public put<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.put(url, data, config);
  }

  public patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.patch(url, data, config);
  }

  public delete<T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.delete(url, config);
  }

  // Upload files
  public uploadFile<T = unknown>(
    url: string,
    file: File,
    onUploadProgress?: (progressEvent: unknown) => void
  ): Promise<AxiosResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.client.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
  }

  // Upload multiple files
  public uploadFiles<T = unknown>(
    url: string,
    files: File[],
    onUploadProgress?: (progressEvent: unknown) => void
  ): Promise<AxiosResponse<T>> {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file);
    });

    return this.client.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
  }

  // Download file
  public downloadFile(url: string, filename?: string): Promise<void> {
    return this.client.get(url, { responseType: 'blob' }).then(response => {
      const blob = new Blob([response.data]);
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename || 'download';
      link.click();
      window.URL.revokeObjectURL(link.href);
    });
  }

  // Set default headers
  public setDefaultHeader(key: string, value: string): void {
    this.client.defaults.headers.common[key] = value;
  }

  // Remove default headers
  public removeDefaultHeader(key: string): void {
    delete this.client.defaults.headers.common[key];
  }

  // Get axios instance for advanced usage
  public getAxiosInstance(): AxiosInstance {
    return this.client;
  }
}

// Create and export singleton instance
export const apiClient = new ApiClient();
