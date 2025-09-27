import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useCreateCreditPurposeMutation,
  useUpdateCreditPurposeMutation,
  useDeleteCreditPurposeMutation,
  useCheckCreditPurposeReferencesQuery,
} from '@/store/api/creditPurposeApi';
import type {
  CreditPurposeResponseDto,
  CreditPurposeCreateDto,
  CreditPurposeUpdateDto,
} from '@/types/creditPurpose';
import { ROUTES } from '@/constants';
import { useTranslation } from './useTranslation';

export const useCreditPurposeActions = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCreditPurpose, setSelectedCreditPurpose] = useState<CreditPurposeResponseDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  // API mutations
  const [createCreditPurpose, { isLoading: isCreating }] = useCreateCreditPurposeMutation();
  const [updateCreditPurpose, { isLoading: isUpdating }] = useUpdateCreditPurposeMutation();
  const [deleteCreditPurpose, { isLoading: isDeleting }] = useDeleteCreditPurposeMutation();

  // Check references for deletion validation
  const { data: referenceCheck } = useCheckCreditPurposeReferencesQuery(
    selectedCreditPurpose?.id || 0,
    { skip: !selectedCreditPurpose }
  );

  const handleCreate = () => {
    navigate(`${ROUTES.ADMIN}/credit-purposes/new`);
  };

  const handleView = (id: number) => {
    navigate(`${ROUTES.ADMIN}/credit-purposes/${id}`);
  };

  const handleEdit = (id: number) => {
    navigate(`${ROUTES.ADMIN}/credit-purposes/${id}/edit`);
  };

  const handleDeleteClick = (creditPurpose: CreditPurposeResponseDto) => {
    setSelectedCreditPurpose(creditPurpose);
    setDeleteDialogOpen(true);
    setError(null);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCreditPurpose) return;

    // Check if credit purpose is referenced before deletion
    if (referenceCheck?.isReferenced) {
      setError(t('creditPurpose.messages.deleteRestricted'));
      return;
    }

    try {
      await deleteCreditPurpose(selectedCreditPurpose.id).unwrap();
      setDeleteDialogOpen(false);
      setSelectedCreditPurpose(null);
      setError(null);
    } catch (error) {
      console.error('Failed to delete credit purpose:', error);
      setError(t('creditPurpose.messages.deleteRestricted'));
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedCreditPurpose(null);
    setError(null);
  };

  // CRUD operations for use in forms/components
  const createCreditPurposeAction = async (data: CreditPurposeCreateDto): Promise<CreditPurposeResponseDto> => {
    try {
      setError(null);
      const result = await createCreditPurpose(data).unwrap();
      return result;
    } catch (error: unknown) {
      console.error('Failed to create credit purpose:', error);
      const errorMessage = (error as { data?: { message?: string } })?.data?.message || t('common.error');
      setError(errorMessage);
      throw error;
    }
  };

  const updateCreditPurposeAction = async (
    id: number,
    data: CreditPurposeUpdateDto
  ): Promise<CreditPurposeResponseDto> => {
    try {
      setError(null);
      const result = await updateCreditPurpose({ id, data }).unwrap();
      return result;
    } catch (error: unknown) {
      console.error('Failed to update credit purpose:', error);
      const errorMessage = (error as { data?: { message?: string } })?.data?.message || t('common.error');
      setError(errorMessage);
      throw error;
    }
  };

  const deleteCreditPurposeAction = async (id: number): Promise<void> => {
    try {
      setError(null);
      await deleteCreditPurpose(id).unwrap();
    } catch (error: unknown) {
      console.error('Failed to delete credit purpose:', error);
      const errorMessage = (error as { data?: { message?: string } })?.data?.message || t('common.error');
      setError(errorMessage);
      throw error;
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    // Dialog state
    deleteDialogOpen,
    selectedCreditPurpose,
    error,

    // Loading states
    isCreating,
    isUpdating,
    isDeleting,

    // Reference check
    isReferenced: referenceCheck?.isReferenced || false,
    referenceCount: referenceCheck?.count || 0,

    // Navigation actions
    handleCreate,
    handleView,
    handleEdit,

    // Delete dialog actions
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,

    // CRUD actions
    createCreditPurpose: createCreditPurposeAction,
    updateCreditPurpose: updateCreditPurposeAction,
    deleteCreditPurpose: deleteCreditPurposeAction,

    // Error handling
    clearError,
  };
};