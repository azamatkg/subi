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
import { useDeleteRoleMutation } from '@/store/api/roleApi';
import { RoleResponseDto, SystemRoles } from '@/types/role';

interface RoleDeleteDialogProps {
  role: RoleResponseDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RoleDeleteDialog: React.FC<RoleDeleteDialogProps> = ({
  role,
  open,
  onOpenChange,
}) => {
  const { t } = useTranslation();
  const [deleteRole, { isLoading: isDeleting }] = useDeleteRoleMutation();

  const isSystemRole = role && SystemRoles.includes(role.name as typeof SystemRoles[number]);

  const handleDelete = async () => {
    if (!role) return;

    try {
      await deleteRole(role.id).unwrap();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to delete role:', error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            {t('roleManagement.deleteRole')}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              <p>
                {t('roleManagement.confirmDeleteRole', { name: role?.name })}
              </p>
              {isSystemRole && (
                <div className="rounded-md bg-yellow-50 border border-yellow-200 p-3">
                  <div className="flex">
                    <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium">
                        {t('roleManagement.systemRole')}
                      </p>
                      <p>
                        {t('roleManagement.cannotDeleteSystemRole')}
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
            disabled={isDeleting || isSystemRole}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('roleManagement.deleteRole')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};