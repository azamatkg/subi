import { baseApi } from '../baseApi';
import type {
  UserCreateDto,
  UserUpdateDto,
  UserListResponse,
  UserResponse,
  UserResponseDto,
  UserSearchAndFilterParams,
} from '@/types/user';

export const userCrudApi = baseApi.injectEndpoints({
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

    // Create new user
    createUser: builder.mutation<UserResponse, UserCreateDto>({
      query: userData => ({
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
      query: id => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useSearchAndFilterUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useLazyGetUsersQuery,
  useLazySearchAndFilterUsersQuery,
  useLazyGetUserByIdQuery,
} = userCrudApi;