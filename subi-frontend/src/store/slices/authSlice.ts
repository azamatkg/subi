import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { AuthState, AuthUser, LoginCredentials } from '@/types/auth';
import { authService } from '@/services/auth.service';
import {
  clearStoredAuth,
  getStoredRefreshToken,
  getStoredToken,
  getStoredUser,
  isTokenExpired,
  setStoredTokens,
  setStoredUser,
} from '@/utils/auth';

const initialState: AuthState = {
  user: getStoredUser(),
  accessToken: getStoredToken(),
  refreshToken: getStoredRefreshToken(),
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Check if user is authenticated on app load
initialState.isAuthenticated = !!(
  initialState.accessToken &&
  initialState.user &&
  !isTokenExpired(initialState.accessToken)
);

// Async thunks
export const loginAsync = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      return response;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || 'Login failed';
      return rejectWithValue(errorMessage);
    }
  }
);

export const logoutAsync = createAsyncThunk(
  'auth/logout',
  async (_, { getState }) => {
    try {
      const state = getState() as { auth: AuthState };
      if (state.auth.refreshToken) {
        await authService.logout(state.auth.refreshToken);
      }
    } catch (error: unknown) {
      // Continue with logout even if server request fails
      console.warn(
        'Logout request failed:',
        error instanceof Error ? error.message : String(error)
      );
    }
    return;
  }
);

export const refreshTokenAsync = createAsyncThunk(
  'auth/refreshToken',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      if (!state.auth.refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await authService.refreshToken(state.auth.refreshToken);
      return response;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || 'Token refresh failed';
      return rejectWithValue(errorMessage);
    }
  }
);

export const validateAuthAsync = createAsyncThunk(
  'auth/validate',
  async (_, { getState, dispatch, rejectWithValue }) => {
    const state = getState() as { auth: AuthState };

    if (!state.auth.accessToken) {
      return rejectWithValue('No access token');
    }

    if (isTokenExpired(state.auth.accessToken)) {
      if (state.auth.refreshToken) {
        try {
          await dispatch(refreshTokenAsync()).unwrap();
          return { valid: true };
        } catch {
          return rejectWithValue('Token refresh failed');
        }
      } else {
        return rejectWithValue('Token expired and no refresh token');
      }
    }

    try {
      const isValid = await authService.validateToken(state.auth.accessToken);
      if (!isValid) {
        return rejectWithValue('Token validation failed');
      }
      return { valid: true };
    } catch {
      return rejectWithValue('Token validation failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<Partial<AuthUser>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        setStoredUser(state.user);
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      // Login
      .addCase(loginAsync.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.error = null;

        // Store tokens and user data
        setStoredTokens(
          action.payload.accessToken,
          action.payload.refreshToken
        );
        setStoredUser(action.payload.user);
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })

      // Logout
      .addCase(logoutAsync.pending, state => {
        state.isLoading = true;
      })
      .addCase(logoutAsync.fulfilled, state => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = null;

        // Clear stored data
        clearStoredAuth();
      })
      .addCase(logoutAsync.rejected, state => {
        // Force logout even if server request fails
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.isLoading = false;

        clearStoredAuth();
      })

      // Refresh token
      .addCase(refreshTokenAsync.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.error = null;

        // Update stored tokens
        setStoredTokens(
          action.payload.accessToken,
          action.payload.refreshToken
        );
      })
      .addCase(refreshTokenAsync.rejected, state => {
        // Force logout if refresh fails
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;

        clearStoredAuth();
      })

      // Validate auth
      .addCase(validateAuthAsync.rejected, state => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;

        clearStoredAuth();
      });
  },
});

export const { clearError, updateUser, setLoading } = authSlice.actions;
export default authSlice.reducer;
