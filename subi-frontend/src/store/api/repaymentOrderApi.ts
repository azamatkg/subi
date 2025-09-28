import { baseApi } from './baseApi';
import type {
  RepaymentOrderResponseDto,
  RepaymentOrderCreateDto,
  RepaymentOrderUpdateDto,
  RepaymentOrderListResponse,
  RepaymentOrderSearchParams,
} from '@/types/repaymentOrder';
import type { PaginationParams } from '@/types/reference';

export const repaymentOrderApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // Get all repayment orders with pagination
    getRepaymentOrders: builder.query<RepaymentOrderListResponse, PaginationParams>({
      query: ({ page = 0, size = 20, sort } = {}) => {
        const params = new URLSearchParams({
          page: page.toString(),
          size: size.toString(),
        });

        if (sort) {
          params.append('sort', sort);
        }

        return `repayment-orders?${params.toString()}`;
      },
      providesTags: result =>
        result
          ? [
              ...result.content.map(({ id }) => ({
                type: 'RepaymentOrder' as const,
                id,
              })),
              { type: 'RepaymentOrder', id: 'LIST' },
            ]
          : [{ type: 'RepaymentOrder', id: 'LIST' }],
    }),

    // Get active repayment orders only
    getActiveRepaymentOrders: builder.query<RepaymentOrderListResponse, PaginationParams>({
      query: ({ page = 0, size = 50, sort } = {}) => {
        const params = new URLSearchParams({
          page: page.toString(),
          size: size.toString(),
        });

        if (sort) {
          params.append('sort', sort);
        }

        return `repayment-orders/active?${params.toString()}`;
      },
      providesTags: result =>
        result
          ? [
              ...result.content.map(({ id }) => ({
                type: 'RepaymentOrder' as const,
                id,
              })),
              { type: 'RepaymentOrder', id: 'ACTIVE_LIST' },
            ]
          : [{ type: 'RepaymentOrder', id: 'ACTIVE_LIST' }],
    }),

    // Get repayment order by ID
    getRepaymentOrderById: builder.query<RepaymentOrderResponseDto, number>({
      query: id => `repayment-orders/${id}`,
      providesTags: (result, error, id) => [{ type: 'RepaymentOrder', id }],
    }),

    // Search repayment orders
    searchRepaymentOrders: builder.query<RepaymentOrderListResponse, RepaymentOrderSearchParams>({
      query: ({ searchTerm, status, page = 0, size = 20, sort } = {}) => {
        const params = new URLSearchParams({
          page: page.toString(),
          size: size.toString(),
        });

        if (searchTerm) {
          params.append('searchTerm', searchTerm);
        }

        if (status) {
          params.append('status', status);
        }

        if (sort) {
          params.append('sort', sort);
        }

        return `repayment-orders/search?${params.toString()}`;
      },
      providesTags: result =>
        result
          ? [
              ...result.content.map(({ id }) => ({
                type: 'RepaymentOrder' as const,
                id,
              })),
              { type: 'RepaymentOrder', id: 'LIST' },
            ]
          : [{ type: 'RepaymentOrder', id: 'LIST' }],
    }),

    // Create repayment order
    createRepaymentOrder: builder.mutation<RepaymentOrderResponseDto, RepaymentOrderCreateDto>({
      query: repaymentOrder => ({
        url: 'repayment-orders',
        method: 'POST',
        body: repaymentOrder,
      }),
      invalidatesTags: [
        { type: 'RepaymentOrder', id: 'LIST' },
        { type: 'RepaymentOrder', id: 'ACTIVE_LIST' },
      ],
    }),

    // Update repayment order
    updateRepaymentOrder: builder.mutation<
      RepaymentOrderResponseDto,
      { id: number; data: RepaymentOrderUpdateDto }
    >({
      query: ({ id, data }) => ({
        url: `repayment-orders/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'RepaymentOrder', id },
        { type: 'RepaymentOrder', id: 'LIST' },
        { type: 'RepaymentOrder', id: 'ACTIVE_LIST' },
      ],
    }),

    // Delete repayment order
    deleteRepaymentOrder: builder.mutation<void, number>({
      query: id => ({
        url: `repayment-orders/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'RepaymentOrder', id },
        { type: 'RepaymentOrder', id: 'LIST' },
        { type: 'RepaymentOrder', id: 'ACTIVE_LIST' },
      ],
    }),

    // Check if repayment order exists by English name
    checkRepaymentOrderExistsByNameEn: builder.query<boolean, string>({
      query: nameEn =>
        `repayment-orders/exists/name-en/${encodeURIComponent(nameEn)}`,
    }),

    // Check if repayment order exists by Russian name
    checkRepaymentOrderExistsByNameRu: builder.query<boolean, string>({
      query: nameRu =>
        `repayment-orders/exists/name-ru/${encodeURIComponent(nameRu)}`,
    }),

    // Check if repayment order exists by Kyrgyz name
    checkRepaymentOrderExistsByNameKg: builder.query<boolean, string>({
      query: nameKg =>
        `repayment-orders/exists/name-kg/${encodeURIComponent(nameKg)}`,
    }),

    // Check if repayment order is referenced by other entities (for deletion validation)
    checkRepaymentOrderReferences: builder.query<{ isReferenced: boolean; count: number }, number>({
      query: id => `repayment-orders/${id}/references`,
    }),

    // Get repayment orders by priority
    getRepaymentOrdersByPriority: builder.query<RepaymentOrderListResponse, {
      priority: string;
      pagination?: PaginationParams;
    }>({
      query: ({ priority, pagination = {} }) => {
        const { page = 0, size = 20, sort } = pagination;
        const params = new URLSearchParams({
          page: page.toString(),
          size: size.toString(),
        });

        if (sort) {
          params.append('sort', sort);
        }

        return `repayment-orders/priority/${encodeURIComponent(priority)}?${params.toString()}`;
      },
      providesTags: result =>
        result
          ? [
              ...result.content.map(({ id }) => ({
                type: 'RepaymentOrder' as const,
                id,
              })),
              { type: 'RepaymentOrder', id: 'PRIORITY_LIST' },
            ]
          : [{ type: 'RepaymentOrder', id: 'PRIORITY_LIST' }],
    }),

    // Get repayment orders ordered by priority
    getRepaymentOrdersByPriorityOrder: builder.query<RepaymentOrderListResponse, PaginationParams>({
      query: ({ page = 0, size = 50, sort = 'priorityOrder,asc' } = {}) => {
        const params = new URLSearchParams({
          page: page.toString(),
          size: size.toString(),
          sort,
        });

        return `repayment-orders/ordered?${params.toString()}`;
      },
      providesTags: result =>
        result
          ? [
              ...result.content.map(({ id }) => ({
                type: 'RepaymentOrder' as const,
                id,
              })),
              { type: 'RepaymentOrder', id: 'ORDERED_LIST' },
            ]
          : [{ type: 'RepaymentOrder', id: 'ORDERED_LIST' }],
    }),

    // Check if priority order exists (for validation)
    checkPriorityOrderExists: builder.query<boolean, { priorityOrder: number; excludeId?: number }>({
      query: ({ priorityOrder, excludeId }) => {
        const params = new URLSearchParams({
          priorityOrder: priorityOrder.toString(),
        });

        if (excludeId) {
          params.append('excludeId', excludeId.toString());
        }

        return `repayment-orders/exists/priority-order?${params.toString()}`;
      },
    }),
  }),
});

export const {
  useGetRepaymentOrdersQuery,
  useGetActiveRepaymentOrdersQuery,
  useGetRepaymentOrderByIdQuery,
  useSearchRepaymentOrdersQuery,
  useCreateRepaymentOrderMutation,
  useUpdateRepaymentOrderMutation,
  useDeleteRepaymentOrderMutation,
  useCheckRepaymentOrderExistsByNameEnQuery,
  useCheckRepaymentOrderExistsByNameRuQuery,
  useCheckRepaymentOrderExistsByNameKgQuery,
  useCheckRepaymentOrderReferencesQuery,
  useGetRepaymentOrdersByPriorityQuery,
  useGetRepaymentOrdersByPriorityOrderQuery,
  useCheckPriorityOrderExistsQuery,
  useLazyGetRepaymentOrdersQuery,
  useLazyGetActiveRepaymentOrdersQuery,
  useLazySearchRepaymentOrdersQuery,
  useLazyCheckRepaymentOrderReferencesQuery,
} = repaymentOrderApi;