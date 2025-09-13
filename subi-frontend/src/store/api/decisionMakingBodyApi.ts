import { baseApi } from './baseApi';
import type {
  CreateDecisionMakingBodyDto,
  DecisionMakingBodyResponseDto,
  PageableResponse,
  PaginationParams,
  SearchParams,
  UpdateDecisionMakingBodyDto,
} from '@/types/decision';

export const decisionMakingBodyApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // Get all decision making bodies with pagination
    getDecisionMakingBodies: builder.query<
      PageableResponse<DecisionMakingBodyResponseDto>,
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

        return `decision-making-bodies?${params.toString()}`;
      },
      providesTags: result =>
        result
          ? [
              ...result.content.map(({ id }) => ({
                type: 'DecisionMakingBody' as const,
                id,
              })),
              { type: 'DecisionMakingBody', id: 'LIST' },
            ]
          : [{ type: 'DecisionMakingBody', id: 'LIST' }],
    }),

    // Get active decision making bodies only
    getActiveDecisionMakingBodies: builder.query<
      PageableResponse<DecisionMakingBodyResponseDto>,
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

        return `decision-making-bodies/active?${params.toString()}`;
      },
      providesTags: result =>
        result
          ? [
              ...result.content.map(({ id }) => ({
                type: 'DecisionMakingBody' as const,
                id,
              })),
              { type: 'DecisionMakingBody', id: 'ACTIVE_LIST' },
            ]
          : [{ type: 'DecisionMakingBody', id: 'ACTIVE_LIST' }],
    }),

    // Get decision making body by ID
    getDecisionMakingBodyById: builder.query<
      DecisionMakingBodyResponseDto,
      number
    >({
      query: id => `decision-making-bodies/${id}`,
      providesTags: (result, error, id) => [{ type: 'DecisionMakingBody', id }],
    }),

    // Search decision making bodies
    searchDecisionMakingBodies: builder.query<
      PageableResponse<DecisionMakingBodyResponseDto>,
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

        return `decision-making-bodies/search?${params.toString()}`;
      },
      providesTags: result =>
        result
          ? [
              ...result.content.map(({ id }) => ({
                type: 'DecisionMakingBody' as const,
                id,
              })),
              { type: 'DecisionMakingBody', id: 'LIST' },
            ]
          : [{ type: 'DecisionMakingBody', id: 'LIST' }],
    }),

    // Create decision making body
    createDecisionMakingBody: builder.mutation<
      DecisionMakingBodyResponseDto,
      CreateDecisionMakingBodyDto
    >({
      query: decisionMakingBody => ({
        url: 'decision-making-bodies',
        method: 'POST',
        body: decisionMakingBody,
      }),
      invalidatesTags: [
        { type: 'DecisionMakingBody', id: 'LIST' },
        { type: 'DecisionMakingBody', id: 'ACTIVE_LIST' },
      ],
    }),

    // Update decision making body
    updateDecisionMakingBody: builder.mutation<
      DecisionMakingBodyResponseDto,
      { id: number; data: UpdateDecisionMakingBodyDto }
    >({
      query: ({ id, data }) => ({
        url: `decision-making-bodies/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'DecisionMakingBody', id },
        { type: 'DecisionMakingBody', id: 'LIST' },
        { type: 'DecisionMakingBody', id: 'ACTIVE_LIST' },
      ],
    }),

    // Delete decision making body
    deleteDecisionMakingBody: builder.mutation<void, number>({
      query: id => ({
        url: `decision-making-bodies/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'DecisionMakingBody', id },
        { type: 'DecisionMakingBody', id: 'LIST' },
        { type: 'DecisionMakingBody', id: 'ACTIVE_LIST' },
      ],
    }),

    // Check if decision making body exists by Russian name
    checkDecisionMakingBodyExistsByNameRu: builder.query<boolean, string>({
      query: nameRu =>
        `decision-making-bodies/exists/name-ru/${encodeURIComponent(nameRu)}`,
    }),
  }),
});

export const {
  useGetDecisionMakingBodiesQuery,
  useGetActiveDecisionMakingBodiesQuery,
  useGetDecisionMakingBodyByIdQuery,
  useSearchDecisionMakingBodiesQuery,
  useCreateDecisionMakingBodyMutation,
  useUpdateDecisionMakingBodyMutation,
  useDeleteDecisionMakingBodyMutation,
  useCheckDecisionMakingBodyExistsByNameRuQuery,
  useLazyGetDecisionMakingBodiesQuery,
  useLazyGetActiveDecisionMakingBodiesQuery,
  useLazySearchDecisionMakingBodiesQuery,
} = decisionMakingBodyApi;
