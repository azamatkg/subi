import { useState } from 'react';
import { PermissionResponseDto } from '@/types/role';
import { useDeletePermissionMutation } from '@/store/api/permissionApi';

export const usePermissionActions = () => {
  const [deletePermission] = useDeletePermissionMutation();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<PermissionResponseDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCreate = () => {
    setCreateDialogOpen(true);
  };

  const handleView = (permission: PermissionResponseDto) => {
    setSelectedPermission(permission);
    // For now, just show edit dialog as there's no dedicated view page
    setEditDialogOpen(true);
  };

  const handleEdit = (permission: PermissionResponseDto) => {
    setSelectedPermission(permission);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (permission: PermissionResponseDto) => {
    setSelectedPermission(permission);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPermission) return;

    setIsDeleting(true);
    try {
      await deletePermission(selectedPermission.id).unwrap();
      setDeleteDialogOpen(false);
      setSelectedPermission(null);
    } catch (error) {
      console.error('Failed to delete permission:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedPermission(null);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setSelectedPermission(null);
  };

  const handleCreateClose = () => {
    setCreateDialogOpen(false);
  };

  return {
    deleteDialogOpen,
    editDialogOpen,
    createDialogOpen,
    selectedPermission,
    isDeleting,
    handleCreate,
    handleView,
    handleEdit,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
    handleEditClose,
    handleCreateClose,
  };
};