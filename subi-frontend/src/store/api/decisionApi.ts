import { baseApi } from './baseApi';
import type {
  CreateDecisionDto,
  DecisionResponseDto,
  DecisionSearchAndFilterParams,
  PageableResponse,
  PaginationParams,
  SearchParams,
  UpdateDecisionDto,
} from '@/types/decision';

export const decisionApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // Get all decisions with pagination
    getDecisions: builder.query<
      PageableResponse<DecisionResponseDto>,
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

        return `decisions?${params.toString()}`;
      },
      providesTags: result =>
        result
          ? [
              ...result.content.map(({ id }) => ({
                type: 'Decision' as const,
                id,
              })),
              { type: 'Decision', id: 'LIST' },
            ]
          : [{ type: 'Decision', id: 'LIST' }],
    }),

    // Get decision by ID
    getDecisionById: builder.query<DecisionResponseDto, string>({
      query: id => `decisions/${id}`,
      providesTags: (result, error, id) => [{ type: 'Decision', id }],
    }),

    // Search decisions
    searchDecisions: builder.query<
      PageableResponse<DecisionResponseDto>,
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

        return `decisions/search?${params.toString()}`;
      },
      providesTags: result =>
        result
          ? [
              ...result.content.map(({ id }) => ({
                type: 'Decision' as const,
                id,
              })),
              { type: 'Decision', id: 'LIST' },
            ]
          : [{ type: 'Decision', id: 'LIST' }],
    }),

    // Advanced search and filter
    searchAndFilterDecisions: builder.query<
      PageableResponse<DecisionResponseDto>,
      DecisionSearchAndFilterParams
    >({
      query: ({
        searchTerm,
        decisionMakingBodyId,
        decisionTypeId,
        status,
        page = 0,
        size = 20,
        sort,
      } = {}) => {
        const params = new URLSearchParams({
          page: page.toString(),
          size: size.toString(),
        });

        if (searchTerm) {
          params.append('searchTerm', searchTerm);
        }
        if (decisionMakingBodyId) {
          params.append(
            'decisionMakingBodyId',
            decisionMakingBodyId.toString()
          );
        }
        if (decisionTypeId) {
          params.append('decisionTypeId', decisionTypeId.toString());
        }
        if (status) {
          params.append('status', status);
        }
        if (sort) {
          params.append('sort', sort);
        }

        return `decisions/search-and-filter?${params.toString()}`;
      },
      providesTags: result =>
        result
          ? [
              ...result.content.map(({ id }) => ({
                type: 'Decision' as const,
                id,
              })),
              { type: 'Decision', id: 'LIST' },
            ]
          : [{ type: 'Decision', id: 'LIST' }],
    }),

    // Create decision
    createDecision: builder.mutation<DecisionResponseDto, CreateDecisionDto>({
      query: decision => ({
        url: 'decisions',
        method: 'POST',
        body: decision,
      }),
      invalidatesTags: [{ type: 'Decision', id: 'LIST' }],
    }),

    // Update decision
    updateDecision: builder.mutation<
      DecisionResponseDto,
      { id: string; data: UpdateDecisionDto }
    >({
      query: ({ id, data }) => ({
        url: `decisions/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Decision', id },
        { type: 'Decision', id: 'LIST' },
      ],
    }),

    // Delete decision
    deleteDecision: builder.mutation<void, string>({
      query: id => ({
        url: `decisions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Decision', id },
        { type: 'Decision', id: 'LIST' },
      ],
    }),

    // Check if decision exists by number
    checkDecisionExistsByNumber: builder.query<boolean, string>({
      query: number => `decisions/exists/number/${encodeURIComponent(number)}`,
    }),
  }),
});

export const {
  useGetDecisionsQuery,
  useGetDecisionByIdQuery,
  useSearchDecisionsQuery,
  useSearchAndFilterDecisionsQuery,
  useCreateDecisionMutation,
  useUpdateDecisionMutation,
  useDeleteDecisionMutation,
  useCheckDecisionExistsByNumberQuery,
  useLazyGetDecisionsQuery,
  useLazySearchDecisionsQuery,
  useLazySearchAndFilterDecisionsQuery,
} = decisionApi;
