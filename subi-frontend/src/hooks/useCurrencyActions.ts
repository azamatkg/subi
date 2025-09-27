import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useCreateCurrencyMutation,
  useUpdateCurrencyMutation,
  useDeleteCurrencyMutation,
  useCheckCurrencyReferencesQuery,
} from '@/store/api/currencyApi';
import type {
  CurrencyResponseDto,
  CurrencyCreateDto,
  CurrencyUpdateDto,
} from '@/types/currency';
import { ROUTES } from '@/constants';
import { useTranslation } from './useTranslation';

export const useCurrencyActions = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyResponseDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  // API mutations
  const [createCurrency, { isLoading: isCreating }] = useCreateCurrencyMutation();
  const [updateCurrency, { isLoading: isUpdating }] = useUpdateCurrencyMutation();
  const [deleteCurrency, { isLoading: isDeleting }] = useDeleteCurrencyMutation();

  // Check references for deletion validation
  const { data: referenceCheck } = useCheckCurrencyReferencesQuery(
    selectedCurrency?.id || 0,
    { skip: !selectedCurrency }
  );

  const handleCreate = () => {
    navigate(`${ROUTES.ADMIN}/currencies/new`);
  };

  const handleView = (id: number) => {
    navigate(`${ROUTES.ADMIN}/currencies/${id}`);
  };

  const handleEdit = (id: number) => {
    navigate(`${ROUTES.ADMIN}/currencies/${id}/edit`);
  };

  const handleDeleteClick = (currency: CurrencyResponseDto) => {
    setSelectedCurrency(currency);
    setDeleteDialogOpen(true);
    setError(null);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCurrency) return;

    // Check if currency is referenced before deletion
    if (referenceCheck?.isReferenced) {
      setError(t('currency.messages.deleteRestricted'));
      return;
    }

    try {
      await deleteCurrency(selectedCurrency.id).unwrap();
      setDeleteDialogOpen(false);
      setSelectedCurrency(null);
      setError(null);
    } catch (error) {
      console.error('Failed to delete currency:', error);
      setError(t('currency.messages.deleteRestricted'));
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedCurrency(null);
    setError(null);
  };

  // CRUD operations for use in forms/components
  const createCurrencyAction = async (data: CurrencyCreateDto): Promise<CurrencyResponseDto> => {
    try {
      setError(null);
      const result = await createCurrency(data).unwrap();
      return result;
    } catch (error: unknown) {
      console.error('Failed to create currency:', error);
      const errorMessage = (error as any)?.data?.message || t('common.error');
      setError(errorMessage);
      throw error;
    }
  };

  const updateCurrencyAction = async (
    id: number,
    data: CurrencyUpdateDto
  ): Promise<CurrencyResponseDto> => {
    try {
      setError(null);
      const result = await updateCurrency({ id, data }).unwrap();
      return result;
    } catch (error: unknown) {
      console.error('Failed to update currency:', error);
      const errorMessage = (error as any)?.data?.message || t('common.error');
      setError(errorMessage);
      throw error;
    }
  };

  const deleteCurrencyAction = async (id: number): Promise<void> => {
    try {
      setError(null);
      await deleteCurrency(id).unwrap();
    } catch (error: unknown) {
      console.error('Failed to delete currency:', error);
      const errorMessage = (error as any)?.data?.message || t('common.error');
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
    selectedCurrency,
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
    createCurrency: createCurrencyAction,
    updateCurrency: updateCurrencyAction,
    deleteCurrency: deleteCurrencyAction,

    // Error handling
    clearError,
  };
};