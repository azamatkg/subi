import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useCreateDocumentTypeMutation,
  useUpdateDocumentTypeMutation,
  useDeleteDocumentTypeMutation,
  useCheckDocumentTypeReferencesQuery,
  useValidateDocumentTypeMetadataMutation,
} from '@/store/api/documentTypeApi';
import type {
  DocumentTypeResponseDto,
  DocumentTypeCreateDto,
  DocumentTypeUpdateDto,
  DocumentTypeMetadata,
  DocumentCategory,
  ApplicantType,
} from '@/types/documentType';
import { ROUTES } from '@/constants';
import { useTranslation } from './useTranslation';

export const useDocumentTypeActions = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState<DocumentTypeResponseDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  // API mutations
  const [createDocumentType, { isLoading: isCreating }] = useCreateDocumentTypeMutation();
  const [updateDocumentType, { isLoading: isUpdating }] = useUpdateDocumentTypeMutation();
  const [deleteDocumentType, { isLoading: isDeleting }] = useDeleteDocumentTypeMutation();
  const [validateMetadata, { isLoading: isValidatingMetadata }] = useValidateDocumentTypeMetadataMutation();

  // Check references for deletion validation
  const { data: referenceCheck } = useCheckDocumentTypeReferencesQuery(
    selectedDocumentType?.id || 0,
    { skip: !selectedDocumentType }
  );

  const handleCreate = () => {
    navigate(`${ROUTES.ADMIN}/document-types/new`);
  };

  const handleView = (id: number) => {
    navigate(`${ROUTES.ADMIN}/document-types/${id}`);
  };

  const handleEdit = (id: number) => {
    navigate(`${ROUTES.ADMIN}/document-types/${id}/edit`);
  };

  const handleDeleteClick = (documentType: DocumentTypeResponseDto) => {
    setSelectedDocumentType(documentType);
    setDeleteDialogOpen(true);
    setError(null);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedDocumentType) return;

    // Check if document type is referenced before deletion
    if (referenceCheck?.isReferenced) {
      setError(t('documentType.messages.deleteRestricted'));
      return;
    }

    try {
      await deleteDocumentType(selectedDocumentType.id).unwrap();
      setDeleteDialogOpen(false);
      setSelectedDocumentType(null);
      setError(null);
    } catch (error) {
      console.error('Failed to delete document type:', error);
      setError(t('documentType.messages.deleteRestricted'));
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedDocumentType(null);
    setError(null);
  };

  // CRUD operations for use in forms/components
  const createDocumentTypeAction = async (data: DocumentTypeCreateDto): Promise<DocumentTypeResponseDto> => {
    try {
      setError(null);
      const result = await createDocumentType(data).unwrap();
      return result;
    } catch (error: unknown) {
      console.error('Failed to create document type:', error);
      const errorMessage = (error as { data?: { message?: string } })?.data?.message || t('common.error');
      setError(errorMessage);
      throw error;
    }
  };

  const updateDocumentTypeAction = async (
    id: number,
    data: DocumentTypeUpdateDto
  ): Promise<DocumentTypeResponseDto> => {
    try {
      setError(null);
      const result = await updateDocumentType({ id, data }).unwrap();
      return result;
    } catch (error: unknown) {
      console.error('Failed to update document type:', error);
      const errorMessage = (error as { data?: { message?: string } })?.data?.message || t('common.error');
      setError(errorMessage);
      throw error;
    }
  };

  const deleteDocumentTypeAction = async (id: number): Promise<void> => {
    try {
      setError(null);
      await deleteDocumentType(id).unwrap();
    } catch (error: unknown) {
      console.error('Failed to delete document type:', error);
      const errorMessage = (error as { data?: { message?: string } })?.data?.message || t('common.error');
      setError(errorMessage);
      throw error;
    }
  };

  // Metadata validation helper
  const validateDocumentTypeMetadata = async (
    metadata: DocumentTypeMetadata,
    category: DocumentCategory,
    applicantType: ApplicantType
  ) => {
    try {
      setError(null);
      const result = await validateMetadata({ metadata, category, applicantType }).unwrap();
      return result;
    } catch (error: unknown) {
      console.error('Failed to validate metadata:', error);
      const errorMessage = (error as { data?: { message?: string } })?.data?.message || t('common.error');
      setError(errorMessage);
      throw error;
    }
  };

  const clearError = () => {
    setError(null);
  };

  // Helper for checking if a document type can be deleted
  const canDelete = (documentType: DocumentTypeResponseDto): boolean => {
    // Document types with active references cannot be deleted
    return !referenceCheck?.isReferenced;
  };

  // Helper for getting reference details
  const getReferenceDetails = (): string[] => {
    return referenceCheck?.details || [];
  };

  // Helper for duplicating a document type (useful for creating similar types)
  const duplicateDocumentType = (documentType: DocumentTypeResponseDto) => {
    navigate(`${ROUTES.ADMIN}/document-types/new`, {
      state: {
        duplicateFrom: {
          ...documentType,
          name: `${documentType.name} (Copy)`,
          nameEn: `${documentType.nameEn} (Copy)`,
          nameRu: `${documentType.nameRu} (Копия)`,
          nameKg: `${documentType.nameKg} (Көчүрмө)`,
        }
      }
    });
  };

  // Helper for creating a template-based document type
  const createFromTemplate = (templateType: 'identity' | 'financial' | 'legal' | 'business') => {
    navigate(`${ROUTES.ADMIN}/document-types/new`, {
      state: { template: templateType }
    });
  };

  return {
    // Dialog state
    deleteDialogOpen,
    selectedDocumentType,
    error,

    // Loading states
    isCreating,
    isUpdating,
    isDeleting,
    isValidatingMetadata,

    // Reference check
    isReferenced: referenceCheck?.isReferenced || false,
    referenceCount: referenceCheck?.count || 0,
    referenceDetails: referenceCheck?.details || [],

    // Navigation actions
    handleCreate,
    handleView,
    handleEdit,

    // Delete dialog actions
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,

    // CRUD actions
    createDocumentType: createDocumentTypeAction,
    updateDocumentType: updateDocumentTypeAction,
    deleteDocumentType: deleteDocumentTypeAction,

    // Metadata validation
    validateDocumentTypeMetadata,

    // Utility actions
    duplicateDocumentType,
    createFromTemplate,
    canDelete,
    getReferenceDetails,

    // Error handling
    clearError,
  };
};