import { baseApi } from './baseApi';
import type {
  CreateCreditProgramDto,
  CreditProgramResponseDto,
  CreditProgramSearchAndFilterParams,
  CreditProgramStatisticsDto,
  CreditProgramStatusUpdateDto,
  PaginatedCreditProgramResponse,
  PaginatedCreditProgramSummaryResponse,
  ProgramStatus,
  UpdateCreditProgramDto,
} from '@/types/creditProgram';

export const creditProgramApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // Get credit program by ID
    getCreditProgramById: builder.query<CreditProgramResponseDto, string>({
      query: id => ({
        url: `/credit-programs/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [
        { type: 'CreditProgram', id },
        { type: 'CreditProgram', id: 'LIST' },
      ],
    }),

    // Get all credit programs (paginated)
    getAllCreditPrograms: builder.query<
      PaginatedCreditProgramResponse,
      { page?: number; size?: number; sort?: string }
    >({
      query: ({ page = 0, size = 20, sort }) => ({
        url: '/credit-programs',
        method: 'GET',
        params: { page, size, sort },
      }),
      providesTags: result =>
        result
          ? [
              ...result.content.map(({ id }) => ({
                type: 'CreditProgram' as const,
                id,
              })),
              { type: 'CreditProgram', id: 'LIST' },
            ]
          : [{ type: 'CreditProgram', id: 'LIST' }],
    }),

    // Get credit programs by decision ID
    getCreditProgramsByDecision: builder.query<
      PaginatedCreditProgramResponse,
      { decisionId: string; page?: number; size?: number; sort?: string }
    >({
      query: ({ decisionId, page = 0, size = 20, sort }) => ({
        url: `/credit-programs/by-decision/${decisionId}`,
        method: 'GET',
        params: { page, size, sort },
      }),
      providesTags: (result, error, { decisionId }) =>
        result
          ? [
              ...result.content.map(({ id }) => ({
                type: 'CreditProgram' as const,
                id,
              })),
              { type: 'CreditProgram', id: 'LIST' },
              { type: 'CreditProgram', id: `DECISION_${decisionId}` },
            ]
          : [
              { type: 'CreditProgram', id: 'LIST' },
              { type: 'CreditProgram', id: `DECISION_${decisionId}` },
            ],
    }),

    // Search and filter credit programs
    searchAndFilterCreditPrograms: builder.query<
      PaginatedCreditProgramResponse,
      CreditProgramSearchAndFilterParams
    >({
      query: ({ page = 0, size = 20, sort, ...searchDto }) => ({
        url: '/credit-programs/search',
        method: 'POST',
        params: { page, size, sort },
        body: searchDto,
      }),
      providesTags: result =>
        result
          ? [
              ...result.content.map(({ id }) => ({
                type: 'CreditProgram' as const,
                id,
              })),
              { type: 'CreditProgram', id: 'LIST' },
            ]
          : [{ type: 'CreditProgram', id: 'LIST' }],
    }),

    // Get available credit programs
    getAvailableCreditPrograms: builder.query<
      PaginatedCreditProgramResponse,
      { page?: number; size?: number; sort?: string }
    >({
      query: ({ page = 0, size = 20, sort }) => ({
        url: '/credit-programs/available',
        method: 'GET',
        params: { page, size, sort },
      }),
      providesTags: result =>
        result
          ? [
              ...result.content.map(({ id }) => ({
                type: 'CreditProgram' as const,
                id,
              })),
              { type: 'CreditProgram', id: 'AVAILABLE' },
            ]
          : [{ type: 'CreditProgram', id: 'AVAILABLE' }],
    }),

    // Get credit program summaries
    getCreditProgramSummaries: builder.query<
      PaginatedCreditProgramSummaryResponse,
      { page?: number; size?: number; sort?: string }
    >({
      query: ({ page = 0, size = 50, sort }) => ({
        url: '/credit-programs/summaries',
        method: 'GET',
        params: { page, size, sort },
      }),
      providesTags: [{ type: 'CreditProgram', id: 'SUMMARIES' }],
    }),

    // Get credit programs by status
    getCreditProgramsByStatus: builder.query<
      PaginatedCreditProgramResponse,
      { status: ProgramStatus; page?: number; size?: number; sort?: string }
    >({
      query: ({ status, page = 0, size = 20, sort }) => ({
        url: `/credit-programs/by-status/${status}`,
        method: 'GET',
        params: { page, size, sort },
      }),
      providesTags: (result, error, { status }) =>
        result
          ? [
              ...result.content.map(({ id }) => ({
                type: 'CreditProgram' as const,
                id,
              })),
              { type: 'CreditProgram', id: `STATUS_${status}` },
            ]
          : [{ type: 'CreditProgram', id: `STATUS_${status}` }],
    }),

    // Get expiring programs
    getExpiringCreditPrograms: builder.query<
      PaginatedCreditProgramResponse,
      { days: number; page?: number; size?: number; sort?: string }
    >({
      query: ({ days, page = 0, size = 20, sort }) => ({
        url: `/credit-programs/expiring/${days}`,
        method: 'GET',
        params: { page, size, sort },
      }),
      providesTags: (result, error, { days }) =>
        result
          ? [
              ...result.content.map(({ id }) => ({
                type: 'CreditProgram' as const,
                id,
              })),
              { type: 'CreditProgram', id: `EXPIRING_${days}` },
            ]
          : [{ type: 'CreditProgram', id: `EXPIRING_${days}` }],
    }),

    // Create credit program
    createCreditProgram: builder.mutation<
      CreditProgramResponseDto,
      CreateCreditProgramDto
    >({
      query: body => ({
        url: '/credit-programs',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'CreditProgram', id: 'LIST' },
        { type: 'CreditProgram', id: 'AVAILABLE' },
        { type: 'CreditProgram', id: 'SUMMARIES' },
      ],
    }),

    // Update credit program
    updateCreditProgram: builder.mutation<
      CreditProgramResponseDto,
      { id: string; body: UpdateCreditProgramDto }
    >({
      query: ({ id, body }) => ({
        url: `/credit-programs/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'CreditProgram', id },
        { type: 'CreditProgram', id: 'LIST' },
        { type: 'CreditProgram', id: 'AVAILABLE' },
        { type: 'CreditProgram', id: 'SUMMARIES' },
      ],
    }),

    // Update credit program status
    updateCreditProgramStatus: builder.mutation<
      CreditProgramResponseDto,
      { id: string; body: CreditProgramStatusUpdateDto }
    >({
      query: ({ id, body }) => ({
        url: `/credit-programs/${id}/status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'CreditProgram', id },
        { type: 'CreditProgram', id: 'LIST' },
        { type: 'CreditProgram', id: 'AVAILABLE' },
        { type: 'CreditProgram', id: 'SUMMARIES' },
      ],
    }),

    // Activate credit program
    activateCreditProgram: builder.mutation<CreditProgramResponseDto, string>({
      query: id => ({
        url: `/credit-programs/${id}/activate`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'CreditProgram', id },
        { type: 'CreditProgram', id: 'LIST' },
        { type: 'CreditProgram', id: 'AVAILABLE' },
        { type: 'CreditProgram', id: 'SUMMARIES' },
      ],
    }),

    // Suspend credit program
    suspendCreditProgram: builder.mutation<
      CreditProgramResponseDto,
      { id: string; reason?: string }
    >({
      query: ({ id, reason }) => ({
        url: `/credit-programs/${id}/suspend`,
        method: 'PATCH',
        params: reason ? { reason } : undefined,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'CreditProgram', id },
        { type: 'CreditProgram', id: 'LIST' },
        { type: 'CreditProgram', id: 'AVAILABLE' },
        { type: 'CreditProgram', id: 'SUMMARIES' },
      ],
    }),

    // Close credit program
    closeCreditProgram: builder.mutation<
      CreditProgramResponseDto,
      { id: string; reason?: string }
    >({
      query: ({ id, reason }) => ({
        url: `/credit-programs/${id}/close`,
        method: 'PATCH',
        params: reason ? { reason } : undefined,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'CreditProgram', id },
        { type: 'CreditProgram', id: 'LIST' },
        { type: 'CreditProgram', id: 'AVAILABLE' },
        { type: 'CreditProgram', id: 'SUMMARIES' },
      ],
    }),

    // Bulk update status
    bulkUpdateCreditProgramStatus: builder.mutation<
      CreditProgramResponseDto[],
      { programIds: string[]; status: ProgramStatus; reason?: string }
    >({
      query: ({ programIds, status, reason }) => ({
        url: '/credit-programs/bulk/status',
        method: 'PATCH',
        params: { programIds: programIds.join(','), status, reason },
      }),
      invalidatesTags: [
        { type: 'CreditProgram', id: 'LIST' },
        { type: 'CreditProgram', id: 'AVAILABLE' },
        { type: 'CreditProgram', id: 'SUMMARIES' },
      ],
    }),

    // Delete credit program
    deleteCreditProgram: builder.mutation<void, string>({
      query: id => ({
        url: `/credit-programs/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'CreditProgram', id },
        { type: 'CreditProgram', id: 'LIST' },
        { type: 'CreditProgram', id: 'AVAILABLE' },
        { type: 'CreditProgram', id: 'SUMMARIES' },
      ],
    }),

    // Check if can be deleted
    checkCreditProgramCanBeDeleted: builder.query<boolean, string>({
      query: id => ({
        url: `/credit-programs/${id}/can-delete`,
        method: 'GET',
      }),
    }),

    // Check if available for applications
    checkCreditProgramAvailable: builder.query<boolean, string>({
      query: id => ({
        url: `/credit-programs/${id}/available`,
        method: 'GET',
      }),
    }),

    // Check validity period
    checkCreditProgramValidity: builder.query<boolean, string>({
      query: id => ({
        url: `/credit-programs/${id}/validity`,
        method: 'GET',
      }),
    }),

    // Get credit program statistics
    getCreditProgramStatistics: builder.query<CreditProgramStatisticsDto, void>(
      {
        query: () => ({
          url: '/credit-programs/statistics',
          method: 'GET',
        }),
        providesTags: [{ type: 'CreditProgram', id: 'STATISTICS' }],
      }
    ),
  }),
  overrideExisting: false,
});

// Export hooks for usage in functional components
export const {
  useGetCreditProgramByIdQuery,
  useGetAllCreditProgramsQuery,
  useGetCreditProgramsByDecisionQuery,
  useSearchAndFilterCreditProgramsQuery,
  useLazySearchAndFilterCreditProgramsQuery,
  useGetAvailableCreditProgramsQuery,
  useGetCreditProgramSummariesQuery,
  useGetCreditProgramsByStatusQuery,
  useGetExpiringCreditProgramsQuery,
  useCreateCreditProgramMutation,
  useUpdateCreditProgramMutation,
  useUpdateCreditProgramStatusMutation,
  useActivateCreditProgramMutation,
  useSuspendCreditProgramMutation,
  useCloseCreditProgramMutation,
  useBulkUpdateCreditProgramStatusMutation,
  useDeleteCreditProgramMutation,
  useCheckCreditProgramCanBeDeletedQuery,
  useLazyCheckCreditProgramCanBeDeletedQuery,
  useCheckCreditProgramAvailableQuery,
  useCheckCreditProgramValidityQuery,
  useGetCreditProgramStatisticsQuery,
} = creditProgramApi;
