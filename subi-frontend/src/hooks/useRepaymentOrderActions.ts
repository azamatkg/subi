import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useCreateRepaymentOrderMutation,
  useUpdateRepaymentOrderMutation,
  useDeleteRepaymentOrderMutation,
  useCheckRepaymentOrderReferencesQuery,
} from '@/store/api/repaymentOrderApi';
import type {
  RepaymentOrderResponseDto,
  RepaymentOrderCreateDto,
  RepaymentOrderUpdateDto,
} from '@/types/repaymentOrder';
import { ROUTES } from '@/constants';
import { useTranslation } from './useTranslation';

export const useRepaymentOrderActions = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRepaymentOrder, setSelectedRepaymentOrder] = useState<RepaymentOrderResponseDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  // API mutations
  const [createRepaymentOrder, { isLoading: isCreating }] = useCreateRepaymentOrderMutation();
  const [updateRepaymentOrder, { isLoading: isUpdating }] = useUpdateRepaymentOrderMutation();
  const [deleteRepaymentOrder, { isLoading: isDeleting }] = useDeleteRepaymentOrderMutation();

  // Check references for deletion validation
  const { data: referenceCheck } = useCheckRepaymentOrderReferencesQuery(
    selectedRepaymentOrder?.id || 0,
    { skip: !selectedRepaymentOrder }
  );

  const handleCreate = () => {
    navigate(`${ROUTES.ADMIN}/repayment-orders/new`);
  };

  const handleView = (id: number) => {
    navigate(`${ROUTES.ADMIN}/repayment-orders/${id}`);
  };

  const handleEdit = (id: number) => {
    navigate(`${ROUTES.ADMIN}/repayment-orders/${id}/edit`);
  };

  const handleDeleteClick = (repaymentOrder: RepaymentOrderResponseDto) => {
    setSelectedRepaymentOrder(repaymentOrder);
    setDeleteDialogOpen(true);
    setError(null);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRepaymentOrder) return;

    // Check if repayment order is referenced before deletion
    if (referenceCheck?.isReferenced) {
      setError(t('repaymentOrder.messages.deleteRestricted'));
      return;
    }

    try {
      await deleteRepaymentOrder(selectedRepaymentOrder.id).unwrap();
      setDeleteDialogOpen(false);
      setSelectedRepaymentOrder(null);
      setError(null);
    } catch (error) {
      console.error('Failed to delete repayment order:', error);
      setError(t('repaymentOrder.messages.deleteRestricted'));
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedRepaymentOrder(null);
    setError(null);
  };

  // CRUD operations for use in forms/components
  const createRepaymentOrderAction = async (data: RepaymentOrderCreateDto): Promise<RepaymentOrderResponseDto> => {
    try {
      setError(null);
      const result = await createRepaymentOrder(data).unwrap();
      return result;
    } catch (error: unknown) {
      console.error('Failed to create repayment order:', error);
      const errorMessage = (error as { data?: { message?: string } })?.data?.message || t('common.error');
      setError(errorMessage);
      throw error;
    }
  };

  const updateRepaymentOrderAction = async (
    id: number,
    data: RepaymentOrderUpdateDto
  ): Promise<RepaymentOrderResponseDto> => {
    try {
      setError(null);
      const result = await updateRepaymentOrder({ id, data }).unwrap();
      return result;
    } catch (error: unknown) {
      console.error('Failed to update repayment order:', error);
      const errorMessage = (error as { data?: { message?: string } })?.data?.message || t('common.error');
      setError(errorMessage);
      throw error;
    }
  };

  const deleteRepaymentOrderAction = async (id: number): Promise<void> => {
    try {
      setError(null);
      await deleteRepaymentOrder(id).unwrap();
    } catch (error: unknown) {
      console.error('Failed to delete repayment order:', error);
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
    selectedRepaymentOrder,
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
    createRepaymentOrder: createRepaymentOrderAction,
    updateRepaymentOrder: updateRepaymentOrderAction,
    deleteRepaymentOrder: deleteRepaymentOrderAction,

    // Error handling
    clearError,
  };
};