import { baseApi } from './baseApi';
import type {
  CurrencyResponseDto,
  CurrencyCreateDto,
  CurrencyUpdateDto,
  CurrencyListResponse,
  CurrencySearchParams,
} from '@/types/currency';
import type { PaginationParams } from '@/types/reference';

export const currencyApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // Get all currencies with pagination
    getCurrencies: builder.query<CurrencyListResponse, PaginationParams>({
      query: ({ page = 0, size = 20, sort } = {}) => {
        const params = new URLSearchParams({
          page: page.toString(),
          size: size.toString(),
        });

        if (sort) {
          params.append('sort', sort);
        }

        return `currencies?${params.toString()}`;
      },
      providesTags: result =>
        result
          ? [
              ...result.content.map(({ id }) => ({
                type: 'Currency' as const,
                id,
              })),
              { type: 'Currency', id: 'LIST' },
            ]
          : [{ type: 'Currency', id: 'LIST' }],
    }),

    // Get active currencies only
    getActiveCurrencies: builder.query<CurrencyListResponse, PaginationParams>({
      query: ({ page = 0, size = 50, sort } = {}) => {
        const params = new URLSearchParams({
          page: page.toString(),
          size: size.toString(),
        });

        if (sort) {
          params.append('sort', sort);
        }

        return `currencies/active?${params.toString()}`;
      },
      providesTags: result =>
        result
          ? [
              ...result.content.map(({ id }) => ({
                type: 'Currency' as const,
                id,
              })),
              { type: 'Currency', id: 'ACTIVE_LIST' },
            ]
          : [{ type: 'Currency', id: 'ACTIVE_LIST' }],
    }),

    // Get currency by ID
    getCurrencyById: builder.query<CurrencyResponseDto, number>({
      query: id => `currencies/${id}`,
      providesTags: (result, error, id) => [{ type: 'Currency', id }],
    }),

    // Get currency by code
    getCurrencyByCode: builder.query<CurrencyResponseDto, string>({
      query: code => `currencies/code/${encodeURIComponent(code)}`,
      providesTags: (result, error, code) => [{ type: 'Currency', id: code }],
    }),

    // Search currencies
    searchCurrencies: builder.query<CurrencyListResponse, CurrencySearchParams>({
      query: ({ searchTerm, code, status, page = 0, size = 20, sort } = {}) => {
        const params = new URLSearchParams({
          page: page.toString(),
          size: size.toString(),
        });

        if (searchTerm) {
          params.append('searchTerm', searchTerm);
        }

        if (code) {
          params.append('code', code);
        }

        if (status) {
          params.append('status', status);
        }

        if (sort) {
          params.append('sort', sort);
        }

        return `currencies/search?${params.toString()}`;
      },
      providesTags: result =>
        result
          ? [
              ...result.content.map(({ id }) => ({
                type: 'Currency' as const,
                id,
              })),
              { type: 'Currency', id: 'LIST' },
            ]
          : [{ type: 'Currency', id: 'LIST' }],
    }),

    // Create currency
    createCurrency: builder.mutation<CurrencyResponseDto, CurrencyCreateDto>({
      query: currency => ({
        url: 'currencies',
        method: 'POST',
        body: currency,
      }),
      invalidatesTags: [
        { type: 'Currency', id: 'LIST' },
        { type: 'Currency', id: 'ACTIVE_LIST' },
      ],
    }),

    // Update currency
    updateCurrency: builder.mutation<
      CurrencyResponseDto,
      { id: number; data: CurrencyUpdateDto }
    >({
      query: ({ id, data }) => ({
        url: `currencies/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Currency', id },
        { type: 'Currency', id: 'LIST' },
        { type: 'Currency', id: 'ACTIVE_LIST' },
      ],
    }),

    // Delete currency
    deleteCurrency: builder.mutation<void, number>({
      query: id => ({
        url: `currencies/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Currency', id },
        { type: 'Currency', id: 'LIST' },
        { type: 'Currency', id: 'ACTIVE_LIST' },
      ],
    }),

    // Check if currency exists by code
    checkCurrencyExistsByCode: builder.query<boolean, string>({
      query: code => `currencies/exists/code/${encodeURIComponent(code)}`,
    }),

    // Check if currency exists by English name
    checkCurrencyExistsByNameEn: builder.query<boolean, string>({
      query: nameEn =>
        `currencies/exists/name-en/${encodeURIComponent(nameEn)}`,
    }),

    // Check if currency exists by Russian name
    checkCurrencyExistsByNameRu: builder.query<boolean, string>({
      query: nameRu =>
        `currencies/exists/name-ru/${encodeURIComponent(nameRu)}`,
    }),

    // Check if currency exists by Kyrgyz name
    checkCurrencyExistsByNameKg: builder.query<boolean, string>({
      query: nameKg =>
        `currencies/exists/name-kg/${encodeURIComponent(nameKg)}`,
    }),

    // Check if currency is referenced by other entities (for deletion validation)
    checkCurrencyReferences: builder.query<{ isReferenced: boolean; count: number }, number>({
      query: id => `currencies/${id}/references`,
    }),
  }),
});

export const {
  useGetCurrenciesQuery,
  useGetActiveCurrenciesQuery,
  useGetCurrencyByIdQuery,
  useGetCurrencyByCodeQuery,
  useSearchCurrenciesQuery,
  useCreateCurrencyMutation,
  useUpdateCurrencyMutation,
  useDeleteCurrencyMutation,
  useCheckCurrencyExistsByCodeQuery,
  useCheckCurrencyExistsByNameEnQuery,
  useCheckCurrencyExistsByNameRuQuery,
  useCheckCurrencyExistsByNameKgQuery,
  useCheckCurrencyReferencesQuery,
  useLazyGetCurrenciesQuery,
  useLazyGetActiveCurrenciesQuery,
  useLazySearchCurrenciesQuery,
  useLazyGetCurrencyByCodeQuery,
  useLazyCheckCurrencyExistsByCodeQuery,
  useLazyCheckCurrencyReferencesQuery,
} = currencyApi;