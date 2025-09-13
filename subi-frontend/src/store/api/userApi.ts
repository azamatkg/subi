import { baseApi } from './baseApi';
import type {
  ApiResponse,
  BulkUserRoleUpdateDto,
  BulkUserStatusUpdateDto,
  PaginatedResponse,
  PasswordResetDto,
  UserActivityLogResponse,
  UserCreateDto,
  UserListResponse,
  UserResponse,
  UserRoleHistory,
  UserSearchAndFilterParams,
  UserStatisticsResponse,
  UserStatusUpdateDto,
  UserUpdateDto,
} from '@/types/user';

export const userApi = baseApi.injectEndpoints({
  endpoints: builder => ({
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
      query: params => ({
        url: `/users/search`,
        params: params,
      }),
      providesTags: ['User'],
    }),

    // Get single user by ID with full details
    getUserById: builder.query<UserResponseDto, string>({
      query: id => `/users/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'User', id }],
    }),

    // Get user by username (documented in API manual)
    getUserByUsername: builder.query<UserResponseDto, string>({
      query: username => `/users/username/${username}`,
      providesTags: (_result, _error, username) => [
        { type: 'User', id: username },
      ],
    }),

    // Create new user
    createUser: builder.mutation<UserResponseDto, UserCreateDto>({
      query: userData => ({
        url: `/users`,
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),

    // Update user information
    updateUser: builder.mutation<
      UserResponseDto,
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
      query: id => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),

    // Update user status (activate/suspend/deactivate)
    updateUserStatus: builder.mutation<
      UserResponseDto,
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
    activateUser: builder.mutation<UserResponseDto, string>({
      query: id => ({
        url: `/users/${id}/activate`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'User', id }, 'User'],
    }),

    // Quick suspend user
    suspendUser: builder.mutation<
      UserResponseDto,
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
      query: data => ({
        url: `/users/bulk/status`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    // Bulk update user roles
    bulkUpdateUserRoles: builder.mutation<void, BulkUserRoleUpdateDto>({
      query: data => ({
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
    checkUsernameAvailability: builder.query<boolean, string>({
      query: username => ({
        url: `/users/exists/username/${username}`,
      }),
    }),

    // Check email availability
    checkEmailAvailability: builder.query<boolean, string>({
      query: email => ({
        url: `/users/exists/email/${email}`,
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
        responseHandler: response => response.blob(),
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
  useGetUserByUsernameQuery,
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
  useLazyGetUserByUsernameQuery,
  useLazyGetUserStatisticsQuery,
  useLazyExportUsersQuery,
} = userApi;
