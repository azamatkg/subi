import { baseApi } from '../baseApi';
import type {
  UserStatisticsResponse,
  UserActivityLogResponse,
  UserRoleHistory,
  PaginatedResponse,
} from '@/types/user';

export const userStatisticsApi = baseApi.injectEndpoints({
  endpoints: builder => ({
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
  }),
});

export const {
  useGetUserStatisticsQuery,
  useGetUserActivityLogQuery,
  useGetUserRoleHistoryQuery,
  useLazyGetUserStatisticsQuery,
} = userStatisticsApi;