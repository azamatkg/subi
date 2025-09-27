import { baseApi } from './baseApi';
import type {
  CreditPurposeResponseDto,
  CreditPurposeCreateDto,
  CreditPurposeUpdateDto,
  CreditPurposeListResponse,
  CreditPurposeSearchParams,
} from '@/types/creditPurpose';
import type { PaginationParams } from '@/types/reference';

export const creditPurposeApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // Get all credit purposes with pagination
    getCreditPurposes: builder.query<CreditPurposeListResponse, PaginationParams>({
      query: ({ page = 0, size = 20, sort } = {}) => {
        const params = new URLSearchParams({
          page: page.toString(),
          size: size.toString(),
        });

        if (sort) {
          params.append('sort', sort);
        }

        return `credit-purposes?${params.toString()}`;
      },
      providesTags: result =>
        result
          ? [
              ...result.content.map(({ id }) => ({
                type: 'CreditPurpose' as const,
                id,
              })),
              { type: 'CreditPurpose', id: 'LIST' },
            ]
          : [{ type: 'CreditPurpose', id: 'LIST' }],
    }),

    // Get active credit purposes only
    getActiveCreditPurposes: builder.query<CreditPurposeListResponse, PaginationParams>({
      query: ({ page = 0, size = 50, sort } = {}) => {
        const params = new URLSearchParams({
          page: page.toString(),
          size: size.toString(),
        });

        if (sort) {
          params.append('sort', sort);
        }

        return `credit-purposes/active?${params.toString()}`;
      },
      providesTags: result =>
        result
          ? [
              ...result.content.map(({ id }) => ({
                type: 'CreditPurpose' as const,
                id,
              })),
              { type: 'CreditPurpose', id: 'ACTIVE_LIST' },
            ]
          : [{ type: 'CreditPurpose', id: 'ACTIVE_LIST' }],
    }),

    // Get credit purpose by ID
    getCreditPurposeById: builder.query<CreditPurposeResponseDto, number>({
      query: id => `credit-purposes/${id}`,
      providesTags: (result, error, id) => [{ type: 'CreditPurpose', id }],
    }),

    // Search credit purposes
    searchCreditPurposes: builder.query<CreditPurposeListResponse, CreditPurposeSearchParams>({
      query: ({ searchTerm, category, status, page = 0, size = 20, sort } = {}) => {
        const params = new URLSearchParams({
          page: page.toString(),
          size: size.toString(),
        });

        if (searchTerm) {
          params.append('searchTerm', searchTerm);
        }

        if (category) {
          params.append('category', category);
        }

        if (status) {
          params.append('status', status);
        }

        if (sort) {
          params.append('sort', sort);
        }

        return `credit-purposes/search?${params.toString()}`;
      },
      providesTags: result =>
        result
          ? [
              ...result.content.map(({ id }) => ({
                type: 'CreditPurpose' as const,
                id,
              })),
              { type: 'CreditPurpose', id: 'LIST' },
            ]
          : [{ type: 'CreditPurpose', id: 'LIST' }],
    }),

    // Create credit purpose
    createCreditPurpose: builder.mutation<CreditPurposeResponseDto, CreditPurposeCreateDto>({
      query: creditPurpose => ({
        url: 'credit-purposes',
        method: 'POST',
        body: creditPurpose,
      }),
      invalidatesTags: [
        { type: 'CreditPurpose', id: 'LIST' },
        { type: 'CreditPurpose', id: 'ACTIVE_LIST' },
      ],
    }),

    // Update credit purpose
    updateCreditPurpose: builder.mutation<
      CreditPurposeResponseDto,
      { id: number; data: CreditPurposeUpdateDto }
    >({
      query: ({ id, data }) => ({
        url: `credit-purposes/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'CreditPurpose', id },
        { type: 'CreditPurpose', id: 'LIST' },
        { type: 'CreditPurpose', id: 'ACTIVE_LIST' },
      ],
    }),

    // Delete credit purpose
    deleteCreditPurpose: builder.mutation<void, number>({
      query: id => ({
        url: `credit-purposes/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'CreditPurpose', id },
        { type: 'CreditPurpose', id: 'LIST' },
        { type: 'CreditPurpose', id: 'ACTIVE_LIST' },
      ],
    }),

    // Check if credit purpose exists by English name
    checkCreditPurposeExistsByNameEn: builder.query<boolean, string>({
      query: nameEn =>
        `credit-purposes/exists/name-en/${encodeURIComponent(nameEn)}`,
    }),

    // Check if credit purpose exists by Russian name
    checkCreditPurposeExistsByNameRu: builder.query<boolean, string>({
      query: nameRu =>
        `credit-purposes/exists/name-ru/${encodeURIComponent(nameRu)}`,
    }),

    // Check if credit purpose exists by Kyrgyz name
    checkCreditPurposeExistsByNameKg: builder.query<boolean, string>({
      query: nameKg =>
        `credit-purposes/exists/name-kg/${encodeURIComponent(nameKg)}`,
    }),

    // Check if credit purpose is referenced by other entities (for deletion validation)
    checkCreditPurposeReferences: builder.query<{ isReferenced: boolean; count: number }, number>({
      query: id => `credit-purposes/${id}/references`,
    }),

    // Get credit purposes by category
    getCreditPurposesByCategory: builder.query<CreditPurposeListResponse, {
      category: string;
      pagination?: PaginationParams;
    }>({
      query: ({ category, pagination = {} }) => {
        const { page = 0, size = 20, sort } = pagination;
        const params = new URLSearchParams({
          page: page.toString(),
          size: size.toString(),
        });

        if (sort) {
          params.append('sort', sort);
        }

        return `credit-purposes/category/${encodeURIComponent(category)}?${params.toString()}`;
      },
      providesTags: result =>
        result
          ? [
              ...result.content.map(({ id }) => ({
                type: 'CreditPurpose' as const,
                id,
              })),
              { type: 'CreditPurpose', id: 'CATEGORY_LIST' },
            ]
          : [{ type: 'CreditPurpose', id: 'CATEGORY_LIST' }],
    }),
  }),
});

export const {
  useGetCreditPurposesQuery,
  useGetActiveCreditPurposesQuery,
  useGetCreditPurposeByIdQuery,
  useSearchCreditPurposesQuery,
  useCreateCreditPurposeMutation,
  useUpdateCreditPurposeMutation,
  useDeleteCreditPurposeMutation,
  useCheckCreditPurposeExistsByNameEnQuery,
  useCheckCreditPurposeExistsByNameRuQuery,
  useCheckCreditPurposeExistsByNameKgQuery,
  useCheckCreditPurposeReferencesQuery,
  useGetCreditPurposesByCategoryQuery,
  useLazyGetCreditPurposesQuery,
  useLazyGetActiveCreditPurposesQuery,
  useLazySearchCreditPurposesQuery,
  useLazyCheckCreditPurposeReferencesQuery,
} = creditPurposeApi;