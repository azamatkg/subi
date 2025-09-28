import { baseApi } from '../baseApi';
import type { ApiResponse } from '@/types/user';

export const userValidationApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // Check username availability
    checkUsernameAvailability: builder.query<
      ApiResponse<{ available: boolean }>,
      { username: string; excludeUserId?: string }
    >({
      query: ({ username, excludeUserId }) => ({
        url: `/users/check-username`,
        params: { username, excludeUserId },
      }),
    }),

    // Check email availability
    checkEmailAvailability: builder.query<
      ApiResponse<{ available: boolean }>,
      { email: string; excludeUserId?: string }
    >({
      query: ({ email, excludeUserId }) => ({
        url: `/users/check-email`,
        params: { email, excludeUserId },
      }),
    }),

    // Get list of departments (for filtering and forms)
    getUserDepartments: builder.query<ApiResponse<string[]>, void>({
      query: () => `/users/departments`,
      providesTags: ['User'],
    }),
  }),
});

export const {
  useCheckUsernameAvailabilityQuery,
  useCheckEmailAvailabilityQuery,
  useGetUserDepartmentsQuery,
} = userValidationApi;