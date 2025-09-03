import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { API_BASE_URL } from '@/constants';
import { getStoredToken, isTokenExpired, getStoredRefreshToken } from '@/utils/auth';
import { authService } from '@/services/auth.service';

// Custom base query with automatic token refresh
const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = getStoredToken();
    
    if (token && !isTokenExpired(token)) {
      headers.set('authorization', `Bearer ${token}`);
    }
    
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Try to get a new token
    const refreshToken = getStoredRefreshToken();
    
    if (refreshToken) {
      try {
        const refreshResult = await authService.refreshToken(refreshToken);
        
        // Store new tokens
        localStorage.setItem('access_token', refreshResult.accessToken);
        localStorage.setItem('refresh_token', refreshResult.refreshToken);
        
        // Dispatch event to update Redux store
        window.dispatchEvent(new CustomEvent('token-refreshed', {
          detail: refreshResult
        }));
        
        // Retry the original query with new token
        result = await baseQuery(args, api, extraOptions);
      } catch (refreshError) {
        // Refresh failed, clear auth data and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
        
        window.dispatchEvent(new CustomEvent('auth-error'));
        
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    } else {
      // No refresh token, clear auth and redirect
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_data');
      
      window.dispatchEvent(new CustomEvent('auth-error'));
      
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Application',
    'CreditProgram', 
    'Commission',
    'Decision',
    'Document',
    'DocumentTemplate',
    'Currency',
    'CreditPurpose',
    'DocumentType',
    'User',
  ],
  endpoints: () => ({}),
});

// Export hooks for usage in functional components
export const {} = baseApi;