import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { ReferenceListResponseDto } from '@/types/reference';
import { useTranslation } from '@/hooks/useTranslation';

export const useReferenceActions = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // State for dialog management
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedReference, setSelectedReference] = useState<ReferenceListResponseDto | null>(null);
  const [bulkActionDialogOpen, setBulkActionDialogOpen] = useState(false);
  const [selectedReferences, setSelectedReferences] = useState<ReferenceListResponseDto[]>([]);
  const [bulkActionType, setBulkActionType] = useState<'activate' | 'deactivate' | 'delete' | null>(null);

  // Local loading states (simulating API calls)
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Mock deletion check data
  const deletionCheckData = {
    canDelete: true,
    referenceCount: 0,
    referencedBy: [] as string[],
  };

  // Navigation handlers
  const handleCreate = useCallback(() => {
    // This would show a modal to select which reference type to create
    toast.info(t('references.messages.selectTypeToCreate'));
  }, [t]);

  const handleView = useCallback((reference: ReferenceListResponseDto) => {
    if (reference.isAvailable && reference.route) {
      navigate(reference.route);
    } else {
      toast.info(t('references.messages.comingSoon'));
    }
  }, [navigate, t]);

  const handleEdit = useCallback((reference: ReferenceListResponseDto) => {
    // For reference types, edit could mean configure the type or go to its management page
    if (reference.isAvailable && reference.route) {
      navigate(reference.route);
    } else {
      toast.info(t('references.messages.comingSoon'));
    }
  }, [navigate, t]);

  // Delete handlers
  const handleDeleteClick = useCallback((reference: ReferenceListResponseDto) => {
    setSelectedReference(reference);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedReference) return;

    setIsDeleting(true);

    // Simulate API call delay
    setTimeout(() => {
      toast.success(t('references.messages.deleteSuccess'));
      setDeleteDialogOpen(false);
      setSelectedReference(null);
      setIsDeleting(false);

      // In a real implementation, this would trigger a refetch or update local state
      // For now, we just show success message
    }, 1000);
  }, [selectedReference, t]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialogOpen(false);
    setSelectedReference(null);
  }, []);

  // Bulk action handlers
  const handleBulkAction = useCallback((
    references: ReferenceListResponseDto[],
    action: 'activate' | 'deactivate' | 'delete'
  ) => {
    setSelectedReferences(references);
    setBulkActionType(action);
    setBulkActionDialogOpen(true);
  }, []);

  const handleBulkActionConfirm = useCallback(async () => {
    if (!bulkActionType || selectedReferences.length === 0) return;

    setIsUpdatingStatus(true);

    // Simulate API call delay
    setTimeout(() => {
      if (bulkActionType === 'delete') {
        toast.success(t('references.messages.bulkDeleteSuccess', { count: selectedReferences.length }));
      } else {
        toast.success(
          t(`references.messages.bulkStatusUpdate${bulkActionType === 'activate' ? 'Activate' : 'Deactivate'}Success`, {
            count: selectedReferences.length,
          })
        );
      }

      setBulkActionDialogOpen(false);
      setSelectedReferences([]);
      setBulkActionType(null);
      setIsUpdatingStatus(false);

      // In a real implementation, this would trigger a refetch or update local state
    }, 1000);
  }, [bulkActionType, selectedReferences, t]);

  const handleBulkActionCancel = useCallback(() => {
    setBulkActionDialogOpen(false);
    setSelectedReferences([]);
    setBulkActionType(null);
  }, []);

  // Status toggle handler
  const handleStatusToggle = useCallback(async () => {
    setIsUpdatingStatus(true);

    // Simulate API call delay
    setTimeout(() => {
      toast.success(t('references.messages.statusUpdateSuccess'));
      setIsUpdatingStatus(false);

      // In a real implementation, this would update the local state
    }, 500);
  }, [t]);

  // Export handler
  const handleExport = useCallback(() => {
    // This would be implemented when export functionality is needed
    toast.info(t('references.messages.exportNotImplemented'));
  }, [t]);

  return {
    // Dialog state
    deleteDialogOpen,
    selectedReference,
    bulkActionDialogOpen,
    selectedReferences,
    bulkActionType,

    // Loading states
    isDeleting,
    isUpdatingStatus,

    // Deletion check data
    isReferenced: deletionCheckData?.referenceCount ? deletionCheckData.referenceCount > 0 : false,
    referenceCount: deletionCheckData?.referenceCount || 0,
    referencedBy: deletionCheckData?.referencedBy || [],
    canDelete: deletionCheckData?.canDelete ?? true,

    // Action handlers
    handleCreate,
    handleView,
    handleEdit,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
    handleBulkAction,
    handleBulkActionConfirm,
    handleBulkActionCancel,
    handleStatusToggle,
    handleExport,
  };
};