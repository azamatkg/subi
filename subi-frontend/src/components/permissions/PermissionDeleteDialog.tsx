import React from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useTranslation } from '@/hooks/useTranslation';
import { useDeletePermissionMutation } from '@/store/api/permissionApi';
import { PermissionResponseDto } from '@/types/role';

interface PermissionDeleteDialogProps {
  permission: PermissionResponseDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PermissionDeleteDialog: React.FC<PermissionDeleteDialogProps> = ({
  permission,
  open,
  onOpenChange,
}) => {
  const { t } = useTranslation();
  const [deletePermission, { isLoading: isDeleting }] = useDeletePermissionMutation();

  // System permissions that cannot be deleted
  const isSystemPermission = (permissionName: string) => {
    const systemPermissions = [
      'READ_USER', 'WRITE_USER', 'DELETE_USER',
      'READ_ROLE', 'WRITE_ROLE', 'DELETE_ROLE',
      'READ_PERMISSION', 'WRITE_PERMISSION', 'DELETE_PERMISSION',
      'MANAGE_SYSTEM'
    ];
    return systemPermissions.includes(permissionName);
  };

  const cannotDelete = permission && isSystemPermission(permission.name);

  const handleDelete = async () => {
    if (!permission) return;

    try {
      await deletePermission(permission.id).unwrap();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to delete permission:', error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            {t('permissionManagement.deletePermission')}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              <p>
                {t('permissionManagement.confirmDeletePermission', { name: permission?.name })}
              </p>
              {cannotDelete && (
                <div className="rounded-md bg-yellow-50 border border-yellow-200 p-3">
                  <div className="flex">
                    <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium">
                        {t('permissionManagement.systemPermission')}
                      </p>
                      <p>
                        {t('permissionManagement.cannotDeleteSystemPermission')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting || cannotDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('permissionManagement.deletePermission')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};