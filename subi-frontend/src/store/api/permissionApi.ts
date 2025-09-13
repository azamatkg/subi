import { baseApi } from './baseApi';
import type {
  CreatePermissionDto,
  PermissionListResponse,
  PermissionResponse,
  PermissionResponseDto,
  PermissionSearchParams,
  UpdatePermissionDto,
} from '@/types/role';

export const permissionApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // Create new permission
    createPermission: builder.mutation<PermissionResponse, CreatePermissionDto>(
      {
        query: permissionData => ({
          url: `/permissions`,
          method: 'POST',
          body: permissionData,
        }),
        invalidatesTags: ['Permission'],
      }
    ),

    // Get permission by ID
    getPermissionById: builder.query<PermissionResponse, string>({
      query: id => `/permissions/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Permission', id }],
    }),

    // Get permission by name (documented in API manual)
    getPermissionByName: builder.query<PermissionResponse, string>({
      query: name => `/permissions/name/${name}`,
      providesTags: (_result, _error, name) => [
        { type: 'Permission', id: name },
      ],
    }),

    // Get all permissions with pagination
    getPermissions: builder.query<
      PermissionListResponse,
      {
        page?: number;
        size?: number;
        sort?: string;
      }
    >({
      query: ({ page = 0, size = 20, sort = 'name,asc' }) => ({
        url: `/permissions`,
        params: { page, size, sort },
      }),
      providesTags: ['Permission'],
    }),

    // Search permissions
    searchPermissions: builder.query<
      PermissionListResponse,
      PermissionSearchParams
    >({
      query: params => ({
        url: `/permissions/search`,
        params: params,
      }),
      providesTags: ['Permission'],
    }),

    // Update permission
    updatePermission: builder.mutation<
      PermissionResponse,
      { id: string; data: UpdatePermissionDto }
    >({
      query: ({ id, data }) => ({
        url: `/permissions/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Permission', id },
        'Permission',
      ],
    }),

    // Delete permission
    deletePermission: builder.mutation<void, string>({
      query: id => ({
        url: `/permissions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Permission'],
    }),

    // Check permission name availability
    checkPermissionNameAvailability: builder.query<boolean, string>({
      query: name => `/permissions/exists/name/${name}`,
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  // Query hooks
  useGetPermissionsQuery,
  useSearchPermissionsQuery,
  useGetPermissionByIdQuery,
  useGetPermissionByNameQuery,
  useCheckPermissionNameAvailabilityQuery,

  // Mutation hooks
  useCreatePermissionMutation,
  useUpdatePermissionMutation,
  useDeletePermissionMutation,

  // Lazy query hooks
  useLazyGetPermissionsQuery,
  useLazySearchPermissionsQuery,
  useLazyGetPermissionByIdQuery,
  useLazyGetPermissionByNameQuery,
} = permissionApi;
