import { baseApi } from './baseApi';
import type {
  DocumentTypeResponseDto,
  DocumentTypeCreateDto,
  DocumentTypeUpdateDto,
  DocumentTypeListResponse,
  DocumentTypeSearchParams,
  DocumentCategory,
  ApplicantType,
  DocumentPriority,
  VerificationLevel,
} from '@/types/documentType';
import type { PaginationParams } from '@/types/reference';

export const documentTypeApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // Get all document types with pagination
    getDocumentTypes: builder.query<DocumentTypeListResponse, PaginationParams>({
      query: ({ page = 0, size = 20, sort } = {}) => {
        const params = new URLSearchParams({
          page: page.toString(),
          size: size.toString(),
        });

        if (sort) {
          params.append('sort', sort);
        }

        return `document-types?${params.toString()}`;
      },
      providesTags: result =>
        result
          ? [
              ...result.content.map(({ id }) => ({
                type: 'DocumentType' as const,
                id,
              })),
              { type: 'DocumentType', id: 'LIST' },
            ]
          : [{ type: 'DocumentType', id: 'LIST' }],
    }),

    // Get active document types only
    getActiveDocumentTypes: builder.query<DocumentTypeListResponse, PaginationParams>({
      query: ({ page = 0, size = 50, sort } = {}) => {
        const params = new URLSearchParams({
          page: page.toString(),
          size: size.toString(),
        });

        if (sort) {
          params.append('sort', sort);
        }

        return `document-types/active?${params.toString()}`;
      },
      providesTags: result =>
        result
          ? [
              ...result.content.map(({ id }) => ({
                type: 'DocumentType' as const,
                id,
              })),
              { type: 'DocumentType', id: 'ACTIVE_LIST' },
            ]
          : [{ type: 'DocumentType', id: 'ACTIVE_LIST' }],
    }),

    // Get document type by ID
    getDocumentTypeById: builder.query<DocumentTypeResponseDto, number>({
      query: id => `document-types/${id}`,
      providesTags: (result, error, id) => [{ type: 'DocumentType', id }],
    }),

    // Search document types with advanced filtering
    searchDocumentTypes: builder.query<DocumentTypeListResponse, DocumentTypeSearchParams>({
      query: ({
        searchTerm,
        category,
        applicantType,
        priority,
        verificationLevel,
        status,
        hasTemplate,
        requiresOriginal,
        page = 0,
        size = 20,
        sort
      } = {}) => {
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

        if (applicantType) {
          params.append('applicantType', applicantType);
        }

        if (priority) {
          params.append('priority', priority);
        }

        if (verificationLevel) {
          params.append('verificationLevel', verificationLevel);
        }

        if (status) {
          params.append('status', status);
        }

        if (hasTemplate !== undefined) {
          params.append('hasTemplate', hasTemplate.toString());
        }

        if (requiresOriginal !== undefined) {
          params.append('requiresOriginal', requiresOriginal.toString());
        }

        if (sort) {
          params.append('sort', sort);
        }

        return `document-types/search?${params.toString()}`;
      },
      providesTags: result =>
        result
          ? [
              ...result.content.map(({ id }) => ({
                type: 'DocumentType' as const,
                id,
              })),
              { type: 'DocumentType', id: 'LIST' },
            ]
          : [{ type: 'DocumentType', id: 'LIST' }],
    }),

    // Create document type
    createDocumentType: builder.mutation<DocumentTypeResponseDto, DocumentTypeCreateDto>({
      query: documentType => ({
        url: 'document-types',
        method: 'POST',
        body: documentType,
      }),
      invalidatesTags: [
        { type: 'DocumentType', id: 'LIST' },
        { type: 'DocumentType', id: 'ACTIVE_LIST' },
      ],
    }),

    // Update document type
    updateDocumentType: builder.mutation<
      DocumentTypeResponseDto,
      { id: number; data: DocumentTypeUpdateDto }
    >({
      query: ({ id, data }) => ({
        url: `document-types/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'DocumentType', id },
        { type: 'DocumentType', id: 'LIST' },
        { type: 'DocumentType', id: 'ACTIVE_LIST' },
      ],
    }),

    // Delete document type
    deleteDocumentType: builder.mutation<void, number>({
      query: id => ({
        url: `document-types/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'DocumentType', id },
        { type: 'DocumentType', id: 'LIST' },
        { type: 'DocumentType', id: 'ACTIVE_LIST' },
      ],
    }),

    // Check if document type exists by name
    checkDocumentTypeExistsByName: builder.query<boolean, string>({
      query: name =>
        `document-types/exists/name/${encodeURIComponent(name)}`,
    }),

    // Check if document type exists by English name
    checkDocumentTypeExistsByNameEn: builder.query<boolean, string>({
      query: nameEn =>
        `document-types/exists/name-en/${encodeURIComponent(nameEn)}`,
    }),

    // Check if document type exists by Russian name
    checkDocumentTypeExistsByNameRu: builder.query<boolean, string>({
      query: nameRu =>
        `document-types/exists/name-ru/${encodeURIComponent(nameRu)}`,
    }),

    // Check if document type exists by Kyrgyz name
    checkDocumentTypeExistsByNameKg: builder.query<boolean, string>({
      query: nameKg =>
        `document-types/exists/name-kg/${encodeURIComponent(nameKg)}`,
    }),

    // Check if document type is referenced by other entities (for deletion validation)
    checkDocumentTypeReferences: builder.query<{ isReferenced: boolean; count: number; details: string[] }, number>({
      query: id => `document-types/${id}/references`,
    }),

    // Get document types by category
    getDocumentTypesByCategory: builder.query<DocumentTypeListResponse, {
      category: DocumentCategory;
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

        return `document-types/category/${encodeURIComponent(category)}?${params.toString()}`;
      },
      providesTags: result =>
        result
          ? [
              ...result.content.map(({ id }) => ({
                type: 'DocumentType' as const,
                id,
              })),
              { type: 'DocumentType', id: 'CATEGORY_LIST' },
            ]
          : [{ type: 'DocumentType', id: 'CATEGORY_LIST' }],
    }),

    // Get document types by applicant type
    getDocumentTypesByApplicantType: builder.query<DocumentTypeListResponse, {
      applicantType: ApplicantType;
      pagination?: PaginationParams;
    }>({
      query: ({ applicantType, pagination = {} }) => {
        const { page = 0, size = 20, sort } = pagination;
        const params = new URLSearchParams({
          page: page.toString(),
          size: size.toString(),
        });

        if (sort) {
          params.append('sort', sort);
        }

        return `document-types/applicant-type/${encodeURIComponent(applicantType)}?${params.toString()}`;
      },
      providesTags: result =>
        result
          ? [
              ...result.content.map(({ id }) => ({
                type: 'DocumentType' as const,
                id,
              })),
              { type: 'DocumentType', id: 'APPLICANT_TYPE_LIST' },
            ]
          : [{ type: 'DocumentType', id: 'APPLICANT_TYPE_LIST' }],
    }),

    // Get mandatory document types
    getMandatoryDocumentTypes: builder.query<DocumentTypeListResponse, {
      applicantType?: ApplicantType;
      pagination?: PaginationParams;
    }>({
      query: ({ applicantType, pagination = {} }) => {
        const { page = 0, size = 50, sort } = pagination;
        const params = new URLSearchParams({
          page: page.toString(),
          size: size.toString(),
          priority: 'MANDATORY',
        });

        if (applicantType) {
          params.append('applicantType', applicantType);
        }

        if (sort) {
          params.append('sort', sort);
        }

        return `document-types/search?${params.toString()}`;
      },
      providesTags: result =>
        result
          ? [
              ...result.content.map(({ id }) => ({
                type: 'DocumentType' as const,
                id,
              })),
              { type: 'DocumentType', id: 'MANDATORY_LIST' },
            ]
          : [{ type: 'DocumentType', id: 'MANDATORY_LIST' }],
    }),

    // Get document types with templates
    getDocumentTypesWithTemplates: builder.query<DocumentTypeListResponse, PaginationParams>({
      query: ({ page = 0, size = 50, sort } = {}) => {
        const params = new URLSearchParams({
          page: page.toString(),
          size: size.toString(),
          hasTemplate: 'true',
        });

        if (sort) {
          params.append('sort', sort);
        }

        return `document-types/search?${params.toString()}`;
      },
      providesTags: result =>
        result
          ? [
              ...result.content.map(({ id }) => ({
                type: 'DocumentType' as const,
                id,
              })),
              { type: 'DocumentType', id: 'TEMPLATE_LIST' },
            ]
          : [{ type: 'DocumentType', id: 'TEMPLATE_LIST' }],
    }),

    // Validate document type metadata
    validateDocumentTypeMetadata: builder.mutation<
      { isValid: boolean; errors: string[]; warnings: string[] },
      { metadata: any; category: DocumentCategory; applicantType: ApplicantType }
    >({
      query: ({ metadata, category, applicantType }) => ({
        url: 'document-types/validate-metadata',
        method: 'POST',
        body: { metadata, category, applicantType },
      }),
    }),

    // Get document type template
    getDocumentTypeTemplate: builder.query<{ templateUrl: string; instructions?: string }, number>({
      query: id => `document-types/${id}/template`,
      providesTags: (result, error, id) => [{ type: 'DocumentType', id: `${id}_TEMPLATE` }],
    }),

    // Update document type sort order
    updateDocumentTypeSortOrder: builder.mutation<
      void,
      Array<{ id: number; sortOrder: number }>
    >({
      query: sortUpdates => ({
        url: 'document-types/sort-order',
        method: 'PUT',
        body: sortUpdates,
      }),
      invalidatesTags: [
        { type: 'DocumentType', id: 'LIST' },
        { type: 'DocumentType', id: 'ACTIVE_LIST' },
      ],
    }),
  }),
});

export const {
  useGetDocumentTypesQuery,
  useGetActiveDocumentTypesQuery,
  useGetDocumentTypeByIdQuery,
  useSearchDocumentTypesQuery,
  useCreateDocumentTypeMutation,
  useUpdateDocumentTypeMutation,
  useDeleteDocumentTypeMutation,
  useCheckDocumentTypeExistsByNameQuery,
  useCheckDocumentTypeExistsByNameEnQuery,
  useCheckDocumentTypeExistsByNameRuQuery,
  useCheckDocumentTypeExistsByNameKgQuery,
  useCheckDocumentTypeReferencesQuery,
  useGetDocumentTypesByCategoryQuery,
  useGetDocumentTypesByApplicantTypeQuery,
  useGetMandatoryDocumentTypesQuery,
  useGetDocumentTypesWithTemplatesQuery,
  useValidateDocumentTypeMetadataMutation,
  useGetDocumentTypeTemplateQuery,
  useUpdateDocumentTypeSortOrderMutation,
  useLazyGetDocumentTypesQuery,
  useLazyGetActiveDocumentTypesQuery,
  useLazySearchDocumentTypesQuery,
  useLazyCheckDocumentTypeReferencesQuery,
  useLazyGetDocumentTypesByCategoryQuery,
  useLazyGetDocumentTypesByApplicantTypeQuery,
} = documentTypeApi;