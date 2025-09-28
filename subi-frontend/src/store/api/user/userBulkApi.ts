import { baseApi } from '../baseApi';
import type {
  BulkUserStatusUpdateDto,
  BulkUserRoleUpdateDto,
  UserListResponse,
  UserSearchAndFilterParams,
} from '@/types/user';

export const userBulkApi = baseApi.injectEndpoints({
  endpoints: builder => ({
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
  }),
});

export const {
  useBulkUpdateUserStatusMutation,
  useBulkUpdateUserRolesMutation,
  useExportUsersQuery,
  useGetUsersByRoleQuery,
  useGetUsersByDepartmentQuery,
  useLazyExportUsersQuery,
} = userBulkApi;