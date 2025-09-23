import { baseApi } from './baseApi';
import type {
  RoleResponseDto,
  CreateRoleDto,
  UpdateRoleDto,
  RoleSearchParams,
  PaginatedRolesResponse,
} from '@/types/role';

export const roleApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create Role
    createRole: builder.mutation<RoleResponseDto, CreateRoleDto>({
      query: (createDto) => ({
        url: '/roles',
        method: 'POST',
        body: createDto,
      }),
      invalidatesTags: ['Role'],
    }),

    // Get Role by ID
    getRoleById: builder.query<RoleResponseDto, string>({
      query: (id) => `/roles/${id}`,
      providesTags: (result, error, id) => [{ type: 'Role', id }],
    }),

    // Get Role by Name
    getRoleByName: builder.query<RoleResponseDto, string>({
      query: (name) => `/roles/name/${encodeURIComponent(name)}`,
      providesTags: (result, error, name) => [{ type: 'Role', id: name }],
    }),

    // Get All Roles with Pagination
    getRoles: builder.query<PaginatedRolesResponse, RoleSearchParams>({
      query: ({ page = 0, size = 20, sort, searchTerm } = {}) => {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('size', size.toString());
        if (sort) params.append('sort', sort);

        const url = searchTerm
          ? `/roles/search?searchTerm=${encodeURIComponent(searchTerm)}&${params}`
          : `/roles?${params}`;

        return url;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.content.map(({ id }) => ({ type: 'Role' as const, id })),
              { type: 'Role', id: 'LIST' },
            ]
          : [{ type: 'Role', id: 'LIST' }],
    }),

    // Search Roles
    searchRoles: builder.query<PaginatedRolesResponse, RoleSearchParams>({
      query: ({ searchTerm, page = 0, size = 20, sort } = {}) => {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('size', size.toString());
        if (sort) params.append('sort', sort);
        if (searchTerm) params.append('searchTerm', searchTerm);

        return `/roles/search?${params}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.content.map(({ id }) => ({ type: 'Role' as const, id })),
              { type: 'Role', id: 'SEARCH' },
            ]
          : [{ type: 'Role', id: 'SEARCH' }],
    }),

    // Update Role
    updateRole: builder.mutation<RoleResponseDto, { id: string; updateDto: UpdateRoleDto }>({
      query: ({ id, updateDto }) => ({
        url: `/roles/${id}`,
        method: 'PUT',
        body: updateDto,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Role', id },
        { type: 'Role', id: 'LIST' },
      ],
    }),

    // Delete Role
    deleteRole: builder.mutation<void, string>({
      query: (id) => ({
        url: `/roles/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Role', id },
        { type: 'Role', id: 'LIST' },
      ],
    }),

    // Check if Role Name Exists
    checkRoleNameExists: builder.query<boolean, string>({
      query: (name) => `/roles/exists/name/${encodeURIComponent(name)}`,
      // Don't cache this query as it's used for validation
      keepUnusedDataFor: 0,
    }),
  }),
  overrideExisting: false,
});

// Export hooks for use in functional components
export const {
  useCreateRoleMutation,
  useGetRoleByIdQuery,
  useGetRoleByNameQuery,
  useGetRolesQuery,
  useSearchRolesQuery,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useCheckRoleNameExistsQuery,
  useLazyCheckRoleNameExistsQuery,
} = roleApi;