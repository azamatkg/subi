import { baseApi } from './baseApi';
import type {
  PermissionResponseDto,
  CreatePermissionDto,
  UpdatePermissionDto,
  PermissionSearchParams,
  PaginatedPermissionsResponse,
} from '@/types/role';

export const permissionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create Permission
    createPermission: builder.mutation<PermissionResponseDto, CreatePermissionDto>({
      query: (createDto) => ({
        url: '/permissions',
        method: 'POST',
        body: createDto,
      }),
      invalidatesTags: ['Permission', 'Role'], // Invalidate roles too as they include permissions
    }),

    // Get Permission by ID
    getPermissionById: builder.query<PermissionResponseDto, string>({
      query: (id) => `/permissions/${id}`,
      providesTags: (result, error, id) => [{ type: 'Permission', id }],
    }),

    // Get Permission by Name
    getPermissionByName: builder.query<PermissionResponseDto, string>({
      query: (name) => `/permissions/name/${encodeURIComponent(name)}`,
      providesTags: (result, error, name) => [{ type: 'Permission', id: name }],
    }),

    // Get All Permissions with Pagination
    getPermissions: builder.query<PaginatedPermissionsResponse, PermissionSearchParams>({
      query: ({ page = 0, size = 20, sort, searchTerm } = {}) => {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('size', size.toString());
        if (sort) params.append('sort', sort);

        const url = searchTerm
          ? `/permissions/search?searchTerm=${encodeURIComponent(searchTerm)}&${params}`
          : `/permissions?${params}`;

        return url;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.content.map(({ id }) => ({ type: 'Permission' as const, id })),
              { type: 'Permission', id: 'LIST' },
            ]
          : [{ type: 'Permission', id: 'LIST' }],
    }),

    // Search Permissions
    searchPermissions: builder.query<PaginatedPermissionsResponse, PermissionSearchParams>({
      query: ({ searchTerm, page = 0, size = 20, sort } = {}) => {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('size', size.toString());
        if (sort) params.append('sort', sort);
        if (searchTerm) params.append('searchTerm', searchTerm);

        return `/permissions/search?${params}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.content.map(({ id }) => ({ type: 'Permission' as const, id })),
              { type: 'Permission', id: 'SEARCH' },
            ]
          : [{ type: 'Permission', id: 'SEARCH' }],
    }),

    // Update Permission
    updatePermission: builder.mutation<PermissionResponseDto, { id: string; updateDto: UpdatePermissionDto }>({
      query: ({ id, updateDto }) => ({
        url: `/permissions/${id}`,
        method: 'PUT',
        body: updateDto,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Permission', id },
        { type: 'Permission', id: 'LIST' },
        { type: 'Role', id: 'LIST' }, // Also invalidate roles as they include permissions
      ],
    }),

    // Delete Permission
    deletePermission: builder.mutation<void, string>({
      query: (id) => ({
        url: `/permissions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Permission', id },
        { type: 'Permission', id: 'LIST' },
        { type: 'Role', id: 'LIST' }, // Also invalidate roles as they include permissions
      ],
    }),

    // Check if Permission Name Exists
    checkPermissionNameExists: builder.query<boolean, string>({
      query: (name) => `/permissions/exists/name/${encodeURIComponent(name)}`,
      // Don't cache this query as it's used for validation
      keepUnusedDataFor: 0,
    }),

    // Get All Permissions (without pagination) - useful for dropdowns and selection lists
    getAllPermissions: builder.query<PermissionResponseDto[], void>({
      query: () => ({
        url: '/permissions',
        params: { size: 1000 }, // Get a large page to ensure we get all permissions
      }),
      transformResponse: (response: PaginatedPermissionsResponse) => response.content,
      providesTags: [{ type: 'Permission', id: 'ALL' }],
    }),
  }),
  overrideExisting: false,
});

// Export hooks for use in functional components
export const {
  useCreatePermissionMutation,
  useGetPermissionByIdQuery,
  useGetPermissionByNameQuery,
  useGetPermissionsQuery,
  useSearchPermissionsQuery,
  useUpdatePermissionMutation,
  useDeletePermissionMutation,
  useCheckPermissionNameExistsQuery,
  useLazyCheckPermissionNameExistsQuery,
  useGetAllPermissionsQuery,
} = permissionApi;