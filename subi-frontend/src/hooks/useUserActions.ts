import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeleteUserMutation } from '@/store/api/userApi';
import type { UserListResponseDto } from '@/types/user';
import { ROUTES } from '@/constants';

export const useUserActions = () => {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserListResponseDto | null>(
    null
  );
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const handleCreate = () => {
    navigate(`${ROUTES.ADMIN}/users/new`);
  };

  const handleView = (id: string) => {
    navigate(`${ROUTES.ADMIN}/users/${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`${ROUTES.ADMIN}/users/${id}/edit`);
  };

  const handleDeleteClick = (user: UserListResponseDto) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;

    try {
      await deleteUser(selectedUser.id).unwrap();
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedUser(null);
  };

  return {
    deleteDialogOpen,
    selectedUser,
    isDeleting,
    handleCreate,
    handleView,
    handleEdit,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
  };
};
