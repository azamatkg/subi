import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useCreateFloatingRateTypeMutation,
  useUpdateFloatingRateTypeMutation,
  useDeleteFloatingRateTypeMutation,
  useCheckFloatingRateTypeReferencesQuery,
} from '@/store/api/floatingRateTypeApi';
import type {
  FloatingRateTypeResponseDto,
  FloatingRateTypeCreateDto,
  FloatingRateTypeUpdateDto,
} from '@/types/floatingRateType';
import { ROUTES } from '@/constants';
import { useTranslation } from './useTranslation';

export const useFloatingRateTypeActions = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedFloatingRateType, setSelectedFloatingRateType] = useState<FloatingRateTypeResponseDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  // API mutations
  const [createFloatingRateType, { isLoading: isCreating }] = useCreateFloatingRateTypeMutation();
  const [updateFloatingRateType, { isLoading: isUpdating }] = useUpdateFloatingRateTypeMutation();
  const [deleteFloatingRateType, { isLoading: isDeleting }] = useDeleteFloatingRateTypeMutation();

  // Check references for deletion validation
  const { data: referenceCheck } = useCheckFloatingRateTypeReferencesQuery(
    selectedFloatingRateType?.id || 0,
    { skip: !selectedFloatingRateType }
  );

  const handleCreate = () => {
    navigate(`${ROUTES.ADMIN}/floating-rate-types/new`);
  };

  const handleView = (id: number) => {
    navigate(`${ROUTES.ADMIN}/floating-rate-types/${id}`);
  };

  const handleEdit = (id: number) => {
    navigate(`${ROUTES.ADMIN}/floating-rate-types/${id}/edit`);
  };

  const handleDeleteClick = (floatingRateType: FloatingRateTypeResponseDto) => {
    setSelectedFloatingRateType(floatingRateType);
    setDeleteDialogOpen(true);
    setError(null);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedFloatingRateType) return;

    // Check if floating rate type is referenced before deletion
    if (referenceCheck?.isReferenced) {
      setError(t('floatingRateType.messages.deleteRestricted'));
      return;
    }

    try {
      await deleteFloatingRateType(selectedFloatingRateType.id).unwrap();
      setDeleteDialogOpen(false);
      setSelectedFloatingRateType(null);
      setError(null);
    } catch (error) {
      console.error('Failed to delete floating rate type:', error);
      setError(t('floatingRateType.messages.deleteRestricted'));
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedFloatingRateType(null);
    setError(null);
  };

  // CRUD operations for use in forms/components
  const createFloatingRateTypeAction = async (data: FloatingRateTypeCreateDto): Promise<FloatingRateTypeResponseDto> => {
    try {
      setError(null);
      const result = await createFloatingRateType(data).unwrap();
      return result;
    } catch (error: unknown) {
      console.error('Failed to create floating rate type:', error);
      const errorMessage = (error as { data?: { message?: string } })?.data?.message || t('common.error');
      setError(errorMessage);
      throw error;
    }
  };

  const updateFloatingRateTypeAction = async (
    id: number,
    data: FloatingRateTypeUpdateDto
  ): Promise<FloatingRateTypeResponseDto> => {
    try {
      setError(null);
      const result = await updateFloatingRateType({ id, data }).unwrap();
      return result;
    } catch (error: unknown) {
      console.error('Failed to update floating rate type:', error);
      const errorMessage = (error as { data?: { message?: string } })?.data?.message || t('common.error');
      setError(errorMessage);
      throw error;
    }
  };

  const deleteFloatingRateTypeAction = async (id: number): Promise<void> => {
    try {
      setError(null);
      await deleteFloatingRateType(id).unwrap();
    } catch (error: unknown) {
      console.error('Failed to delete floating rate type:', error);
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
    selectedFloatingRateType,
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
    createFloatingRateType: createFloatingRateTypeAction,
    updateFloatingRateType: updateFloatingRateTypeAction,
    deleteFloatingRateType: deleteFloatingRateTypeAction,

    // Error handling
    clearError,
  };
};