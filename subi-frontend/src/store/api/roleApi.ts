import { baseApi } from './baseApi';
import type {
  CreateRoleDto,
  RoleListResponse,
  RoleResponse,
  RoleResponseDto,
  RoleSearchParams,
  UpdateRoleDto,
} from '@/types/role';

export const roleApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // Create new role
    createRole: builder.mutation<RoleResponse, CreateRoleDto>({
      query: roleData => ({
        url: `/roles`,
        method: 'POST',
        body: roleData,
      }),
      invalidatesTags: ['Role'],
    }),

    // Get role by ID
    getRoleById: builder.query<RoleResponse, string>({
      query: id => `/roles/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Role', id }],
    }),

    // Get role by name (documented in API manual)
    getRoleByName: builder.query<RoleResponse, string>({
      query: name => `/roles/name/${name}`,
      providesTags: (_result, _error, name) => [{ type: 'Role', id: name }],
    }),

    // Get all roles with pagination
    getRoles: builder.query<
      RoleListResponse,
      {
        page?: number;
        size?: number;
        sort?: string;
      } | undefined
    >({
      query: (params = {}) => {
        const { page = 0, size = 20, sort = 'name,asc' } = params;
        return {
          url: `/roles`,
          params: { page, size, sort },
        };
      },
      providesTags: ['Role'],
    }),

    // Search roles
    searchRoles: builder.query<RoleListResponse, RoleSearchParams>({
      query: params => ({
        url: `/roles/search`,
        params: params,
      }),
      providesTags: ['Role'],
    }),

    // Update role
    updateRole: builder.mutation<
      RoleResponse,
      { id: string; data: UpdateRoleDto }
    >({
      query: ({ id, data }) => ({
        url: `/roles/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Role', id },
        'Role',
      ],
    }),

    // Delete role
    deleteRole: builder.mutation<void, string>({
      query: id => ({
        url: `/roles/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Role'],
    }),

    // Check role name availability
    checkRoleNameAvailability: builder.query<boolean, string>({
      query: name => `/roles/exists/name/${name}`,
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  // Query hooks
  useGetRolesQuery,
  useSearchRolesQuery,
  useGetRoleByIdQuery,
  useGetRoleByNameQuery,
  useCheckRoleNameAvailabilityQuery,

  // Mutation hooks
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,

  // Lazy query hooks
  useLazyGetRolesQuery,
  useLazySearchRolesQuery,
  useLazyGetRoleByIdQuery,
  useLazyGetRoleByNameQuery,
} = roleApi;
