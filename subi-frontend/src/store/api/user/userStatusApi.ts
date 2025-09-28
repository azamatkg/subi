import { baseApi } from '../baseApi';
import type {
  UserStatusUpdateDto,
  UserResponse,
  PasswordResetDto,
} from '@/types/user';

export const userStatusApi = baseApi.injectEndpoints({
  endpoints: builder => ({
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
      query: id => ({
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
  }),
});

export const {
  useUpdateUserStatusMutation,
  useActivateUserMutation,
  useSuspendUserMutation,
  useResetUserPasswordMutation,
} = userStatusApi;