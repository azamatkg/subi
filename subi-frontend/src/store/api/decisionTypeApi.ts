import { baseApi } from './baseApi';
import type {
  CreateDecisionTypeDto,
  DecisionTypeResponseDto,
  PageableResponse,
  PaginationParams,
  SearchParams,
  UpdateDecisionTypeDto,
} from '@/types/decision';

export const decisionTypeApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // Get all decision types with pagination
    getDecisionTypes: builder.query<
      PageableResponse<DecisionTypeResponseDto>,
      PaginationParams
    >({
      query: ({ page = 0, size = 20, sort } = {}) => {
        const params = new URLSearchParams({
          page: page.toString(),
          size: size.toString(),
        });

        if (sort) {
          params.append('sort', sort);
        }

        return `decision-types?${params.toString()}`;
      },
      providesTags: result =>
        result
          ? [
              ...result.content.map(({ id }) => ({
                type: 'DecisionType' as const,
                id,
              })),
              { type: 'DecisionType', id: 'LIST' },
            ]
          : [{ type: 'DecisionType', id: 'LIST' }],
    }),

    // Get active decision types only
    getActiveDecisionTypes: builder.query<
      PageableResponse<DecisionTypeResponseDto>,
      PaginationParams
    >({
      query: ({ page = 0, size = 50, sort } = {}) => {
        const params = new URLSearchParams({
          page: page.toString(),
          size: size.toString(),
        });

        if (sort) {
          params.append('sort', sort);
        }

        return `decision-types/active?${params.toString()}`;
      },
      providesTags: result =>
        result
          ? [
              ...result.content.map(({ id }) => ({
                type: 'DecisionType' as const,
                id,
              })),
              { type: 'DecisionType', id: 'ACTIVE_LIST' },
            ]
          : [{ type: 'DecisionType', id: 'ACTIVE_LIST' }],
    }),

    // Get decision type by ID
    getDecisionTypeById: builder.query<DecisionTypeResponseDto, number>({
      query: id => `decision-types/${id}`,
      providesTags: (result, error, id) => [{ type: 'DecisionType', id }],
    }),

    // Search decision types
    searchDecisionTypes: builder.query<
      PageableResponse<DecisionTypeResponseDto>,
      SearchParams
    >({
      query: ({ searchTerm, page = 0, size = 20, sort } = {}) => {
        const params = new URLSearchParams({
          page: page.toString(),
          size: size.toString(),
        });

        if (searchTerm) {
          params.append('searchTerm', searchTerm);
        }

        if (sort) {
          params.append('sort', sort);
        }

        return `decision-types/search?${params.toString()}`;
      },
      providesTags: result =>
        result
          ? [
              ...result.content.map(({ id }) => ({
                type: 'DecisionType' as const,
                id,
              })),
              { type: 'DecisionType', id: 'LIST' },
            ]
          : [{ type: 'DecisionType', id: 'LIST' }],
    }),

    // Create decision type
    createDecisionType: builder.mutation<
      DecisionTypeResponseDto,
      CreateDecisionTypeDto
    >({
      query: decisionType => ({
        url: 'decision-types',
        method: 'POST',
        body: decisionType,
      }),
      invalidatesTags: [
        { type: 'DecisionType', id: 'LIST' },
        { type: 'DecisionType', id: 'ACTIVE_LIST' },
      ],
    }),

    // Update decision type
    updateDecisionType: builder.mutation<
      DecisionTypeResponseDto,
      { id: number; data: UpdateDecisionTypeDto }
    >({
      query: ({ id, data }) => ({
        url: `decision-types/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'DecisionType', id },
        { type: 'DecisionType', id: 'LIST' },
        { type: 'DecisionType', id: 'ACTIVE_LIST' },
      ],
    }),

    // Delete decision type
    deleteDecisionType: builder.mutation<void, number>({
      query: id => ({
        url: `decision-types/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'DecisionType', id },
        { type: 'DecisionType', id: 'LIST' },
        { type: 'DecisionType', id: 'ACTIVE_LIST' },
      ],
    }),

    // Check if decision type exists by Russian name
    checkDecisionTypeExistsByNameRu: builder.query<boolean, string>({
      query: nameRu =>
        `decision-types/exists/name-ru/${encodeURIComponent(nameRu)}`,
    }),
  }),
});

export const {
  useGetDecisionTypesQuery,
  useGetActiveDecisionTypesQuery,
  useGetDecisionTypeByIdQuery,
  useSearchDecisionTypesQuery,
  useCreateDecisionTypeMutation,
  useUpdateDecisionTypeMutation,
  useDeleteDecisionTypeMutation,
  useCheckDecisionTypeExistsByNameRuQuery,
  useLazyGetDecisionTypesQuery,
  useLazyGetActiveDecisionTypesQuery,
  useLazySearchDecisionTypesQuery,
} = decisionTypeApi;
