import { baseApi } from './baseApi';
import type {
  UserCreateDto,
  UserUpdateDto,
  UserStatusUpdateDto,
  UserSearchAndFilterParams,
  BulkUserStatusUpdateDto,
  BulkUserRoleUpdateDto,
  PasswordResetDto,
  UserRoleHistory,
  UserListResponse,
  UserResponse,
  UserStatisticsResponse,
  UserActivityLogResponse,
  PaginatedResponse,
  ApiResponse,
} from '@/types/user';

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get paginated list of users with basic info for list/table view
    getUsers: builder.query<
      UserListResponse,
      {
        page?: number;
        size?: number;
        sort?: string;
      }
    >({
      query: ({ page = 0, size = 20, sort = 'lastName,asc' }) => ({
        url: `/users`,
        params: { page, size, sort },
      }),
      providesTags: ['User'],
    }),

    // Advanced search and filtering for users
    searchAndFilterUsers: builder.query<
      UserListResponse,
      UserSearchAndFilterParams
    >({
      query: (params) => ({
        url: `/users/search`,
        params: params,
      }),
      providesTags: ['User'],
    }),

    // Get single user by ID with full details
    getUserById: builder.query<UserResponse, string>({
      query: (id) => `/users/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'User', id }],
    }),

    // Create new user
    createUser: builder.mutation<UserResponse, UserCreateDto>({
      query: (userData) => ({
        url: `/users`,
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),

    // Update user information
    updateUser: builder.mutation<
      UserResponse,
      { id: string; data: UserUpdateDto }
    >({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'User', id },
        'User',
      ],
    }),

    // Delete user
    deleteUser: builder.mutation<void, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),

    // Update user status (activate/suspend/deactivate)
    updateUserStatus: builder.mutation<
      UserResponse,
      { id: string; data: UserStatusUpdateDto }
    >({
      query: ({ id, data }) => ({
        url: `/users/${id}/status`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'User', id },
        'User',
      ],
    }),

    // Quick activate user
    activateUser: builder.mutation<UserResponse, string>({
      query: (id) => ({
        url: `/users/${id}/activate`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'User', id }, 'User'],
    }),

    // Quick suspend user
    suspendUser: builder.mutation<
      UserResponse,
      { id: string; reason?: string }
    >({
      query: ({ id, reason }) => ({
        url: `/users/${id}/suspend`,
        method: 'PATCH',
        body: reason ? { reason } : {},
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'User', id },
        'User',
      ],
    }),

    // Bulk update user status
    bulkUpdateUserStatus: builder.mutation<void, BulkUserStatusUpdateDto>({
      query: (data) => ({
        url: `/users/bulk/status`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    // Bulk update user roles
    bulkUpdateUserRoles: builder.mutation<void, BulkUserRoleUpdateDto>({
      query: (data) => ({
        url: `/users/bulk/roles`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    // Reset user password
    resetUserPassword: builder.mutation<
      void,
      { id: string; data: PasswordResetDto }
    >({
      query: ({ id, data }) => ({
        url: `/users/${id}/reset-password`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'User', id }],
    }),

    // Get user statistics for admin dashboard
    getUserStatistics: builder.query<UserStatisticsResponse, void>({
      query: () => `/users/statistics`,
      providesTags: ['User'],
    }),

    // Get user activity log
    getUserActivityLog: builder.query<
      UserActivityLogResponse,
      { userId: string; page?: number; size?: number }
    >({
      query: ({ userId, page = 0, size = 20 }) => ({
        url: `/users/${userId}/activity-log`,
        params: { page, size },
      }),
      providesTags: (_result, _error, { userId }) => [
        { type: 'User', id: `${userId}-activity` },
      ],
    }),

    // Get user role change history
    getUserRoleHistory: builder.query<
      PaginatedResponse<UserRoleHistory>,
      { userId: string; page?: number; size?: number }
    >({
      query: ({ userId, page = 0, size = 20 }) => ({
        url: `/users/${userId}/role-history`,
        params: { page, size },
      }),
      providesTags: (_result, _error, { userId }) => [
        { type: 'User', id: `${userId}-roles` },
      ],
    }),

    // Get users by role (for dropdowns and role-specific lists)
    getUsersByRole: builder.query<
      UserListResponse,
      { role: string; activeOnly?: boolean }
    >({
      query: ({ role, activeOnly = true }) => ({
        url: `/users/by-role/${role}`,
        params: { activeOnly },
      }),
      providesTags: ['User'],
    }),

    // Get users by department
    getUsersByDepartment: builder.query<
      UserListResponse,
      { department: string; activeOnly?: boolean }
    >({
      query: ({ department, activeOnly = true }) => ({
        url: `/users/by-department/${department}`,
        params: { activeOnly },
      }),
      providesTags: ['User'],
    }),

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

    // Export users data (for reports)
    exportUsers: builder.query<
      Blob,
      { format: 'csv' | 'xlsx'; filters?: UserSearchAndFilterParams }
    >({
      query: ({ format, filters = {} }) => ({
        url: `/users/export`,
        params: { format, ...filters },
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  // Query hooks
  useGetUsersQuery,
  useSearchAndFilterUsersQuery,
  useGetUserByIdQuery,
  useGetUserStatisticsQuery,
  useGetUserActivityLogQuery,
  useGetUserRoleHistoryQuery,
  useGetUsersByRoleQuery,
  useGetUsersByDepartmentQuery,
  useCheckUsernameAvailabilityQuery,
  useCheckEmailAvailabilityQuery,
  useGetUserDepartmentsQuery,
  useExportUsersQuery,

  // Mutation hooks
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useUpdateUserStatusMutation,
  useActivateUserMutation,
  useSuspendUserMutation,
  useBulkUpdateUserStatusMutation,
  useBulkUpdateUserRolesMutation,
  useResetUserPasswordMutation,

  // Lazy query hooks
  useLazyGetUsersQuery,
  useLazySearchAndFilterUsersQuery,
  useLazyGetUserByIdQuery,
  useLazyGetUserStatisticsQuery,
  useLazyExportUsersQuery,
} = userApi;