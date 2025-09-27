import { baseApi } from './baseApi';
import type {
  FloatingRateTypeResponseDto,
  FloatingRateTypeCreateDto,
  FloatingRateTypeUpdateDto,
  FloatingRateTypeListResponse,
  FloatingRateTypeSearchParams,
} from '@/types/floatingRateType';
import type { PaginationParams } from '@/types/reference';

export const floatingRateTypeApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // Get all floating rate types with pagination
    getFloatingRateTypes: builder.query<FloatingRateTypeListResponse, PaginationParams>({
      query: ({ page = 0, size = 20, sort } = {}) => {
        const params = new URLSearchParams({
          page: page.toString(),
          size: size.toString(),
        });

        if (sort) {
          params.append('sort', sort);
        }

        return `floating-rate-types?${params.toString()}`;
      },
      providesTags: result =>
        result
          ? [
              ...result.content.map(({ id }) => ({
                type: 'FloatingRateType' as const,
                id,
              })),
              { type: 'FloatingRateType', id: 'LIST' },
            ]
          : [{ type: 'FloatingRateType', id: 'LIST' }],
    }),

    // Get active floating rate types only
    getActiveFloatingRateTypes: builder.query<FloatingRateTypeListResponse, PaginationParams>({
      query: ({ page = 0, size = 50, sort } = {}) => {
        const params = new URLSearchParams({
          page: page.toString(),
          size: size.toString(),
        });

        if (sort) {
          params.append('sort', sort);
        }

        return `floating-rate-types/active?${params.toString()}`;
      },
      providesTags: result =>
        result
          ? [
              ...result.content.map(({ id }) => ({
                type: 'FloatingRateType' as const,
                id,
              })),
              { type: 'FloatingRateType', id: 'ACTIVE_LIST' },
            ]
          : [{ type: 'FloatingRateType', id: 'ACTIVE_LIST' }],
    }),

    // Get floating rate type by ID
    getFloatingRateTypeById: builder.query<FloatingRateTypeResponseDto, number>({
      query: id => `floating-rate-types/${id}`,
      providesTags: (result, error, id) => [{ type: 'FloatingRateType', id }],
    }),

    // Search floating rate types
    searchFloatingRateTypes: builder.query<FloatingRateTypeListResponse, FloatingRateTypeSearchParams>({
      query: ({ searchTerm, rateCalculationType, status, page = 0, size = 20, sort } = {}) => {
        const params = new URLSearchParams({
          page: page.toString(),
          size: size.toString(),
        });

        if (searchTerm) {
          params.append('searchTerm', searchTerm);
        }

        if (rateCalculationType) {
          params.append('rateCalculationType', rateCalculationType);
        }

        if (status) {
          params.append('status', status);
        }

        if (sort) {
          params.append('sort', sort);
        }

        return `floating-rate-types/search?${params.toString()}`;
      },
      providesTags: result =>
        result
          ? [
              ...result.content.map(({ id }) => ({
                type: 'FloatingRateType' as const,
                id,
              })),
              { type: 'FloatingRateType', id: 'LIST' },
            ]
          : [{ type: 'FloatingRateType', id: 'LIST' }],
    }),

    // Create floating rate type
    createFloatingRateType: builder.mutation<FloatingRateTypeResponseDto, FloatingRateTypeCreateDto>({
      query: floatingRateType => ({
        url: 'floating-rate-types',
        method: 'POST',
        body: floatingRateType,
      }),
      invalidatesTags: [
        { type: 'FloatingRateType', id: 'LIST' },
        { type: 'FloatingRateType', id: 'ACTIVE_LIST' },
      ],
    }),

    // Update floating rate type
    updateFloatingRateType: builder.mutation<
      FloatingRateTypeResponseDto,
      { id: number; data: FloatingRateTypeUpdateDto }
    >({
      query: ({ id, data }) => ({
        url: `floating-rate-types/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'FloatingRateType', id },
        { type: 'FloatingRateType', id: 'LIST' },
        { type: 'FloatingRateType', id: 'ACTIVE_LIST' },
      ],
    }),

    // Delete floating rate type
    deleteFloatingRateType: builder.mutation<void, number>({
      query: id => ({
        url: `floating-rate-types/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'FloatingRateType', id },
        { type: 'FloatingRateType', id: 'LIST' },
        { type: 'FloatingRateType', id: 'ACTIVE_LIST' },
      ],
    }),

    // Check if floating rate type exists by English name
    checkFloatingRateTypeExistsByNameEn: builder.query<boolean, string>({
      query: nameEn =>
        `floating-rate-types/exists/name-en/${encodeURIComponent(nameEn)}`,
    }),

    // Check if floating rate type exists by Russian name
    checkFloatingRateTypeExistsByNameRu: builder.query<boolean, string>({
      query: nameRu =>
        `floating-rate-types/exists/name-ru/${encodeURIComponent(nameRu)}`,
    }),

    // Check if floating rate type exists by Kyrgyz name
    checkFloatingRateTypeExistsByNameKg: builder.query<boolean, string>({
      query: nameKg =>
        `floating-rate-types/exists/name-kg/${encodeURIComponent(nameKg)}`,
    }),

    // Check if floating rate type is referenced by other entities (for deletion validation)
    checkFloatingRateTypeReferences: builder.query<{ isReferenced: boolean; count: number }, number>({
      query: id => `floating-rate-types/${id}/references`,
    }),

    // Get floating rate types by rate calculation type
    getFloatingRateTypesByCalculationType: builder.query<FloatingRateTypeListResponse, {
      rateCalculationType: string;
      pagination?: PaginationParams;
    }>({
      query: ({ rateCalculationType, pagination = {} }) => {
        const { page = 0, size = 20, sort } = pagination;
        const params = new URLSearchParams({
          page: page.toString(),
          size: size.toString(),
        });

        if (sort) {
          params.append('sort', sort);
        }

        return `floating-rate-types/calculation-type/${encodeURIComponent(rateCalculationType)}?${params.toString()}`;
      },
      providesTags: result =>
        result
          ? [
              ...result.content.map(({ id }) => ({
                type: 'FloatingRateType' as const,
                id,
              })),
              { type: 'FloatingRateType', id: 'CALCULATION_TYPE_LIST' },
            ]
          : [{ type: 'FloatingRateType', id: 'CALCULATION_TYPE_LIST' }],
    }),
  }),
});

export const {
  useGetFloatingRateTypesQuery,
  useGetActiveFloatingRateTypesQuery,
  useGetFloatingRateTypeByIdQuery,
  useSearchFloatingRateTypesQuery,
  useCreateFloatingRateTypeMutation,
  useUpdateFloatingRateTypeMutation,
  useDeleteFloatingRateTypeMutation,
  useCheckFloatingRateTypeExistsByNameEnQuery,
  useCheckFloatingRateTypeExistsByNameRuQuery,
  useCheckFloatingRateTypeExistsByNameKgQuery,
  useCheckFloatingRateTypeReferencesQuery,
  useGetFloatingRateTypesByCalculationTypeQuery,
  useLazyGetFloatingRateTypesQuery,
  useLazyGetActiveFloatingRateTypesQuery,
  useLazySearchFloatingRateTypesQuery,
  useLazyCheckFloatingRateTypeReferencesQuery,
} = floatingRateTypeApi;