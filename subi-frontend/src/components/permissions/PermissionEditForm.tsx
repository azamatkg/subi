import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Key } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from '@/hooks/useTranslation';
import { useUpdatePermissionMutation } from '@/store/api/permissionApi';
import { updatePermissionSchema, type UpdatePermissionFormData } from './schemas/permissionSchemas';
import { PermissionResponseDto } from '@/types/role';

interface PermissionEditFormProps {
  permission: PermissionResponseDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PermissionEditForm: React.FC<PermissionEditFormProps> = ({
  permission,
  open,
  onOpenChange,
}) => {
  const { t } = useTranslation();

  const [updatePermission, { isLoading: isUpdating }] = useUpdatePermissionMutation();

  const form = useForm<UpdatePermissionFormData>({
    resolver: zodResolver(updatePermissionSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  // Reset form when permission changes
  useEffect(() => {
    if (permission) {
      form.reset({
        name: permission.name,
        description: permission.description || '',
      });
    }
  }, [permission, form]);

  const onSubmit = async (data: UpdatePermissionFormData) => {
    if (!permission) return;

    try {
      await updatePermission({
        id: permission.id,
        updateDto: {
          name: data.name !== permission.name ? data.name : undefined,
          description: data.description !== permission.description ? data.description : undefined,
        },
      }).unwrap();

      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update permission:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            {t('permissionManagement.editPermission')}: {permission?.name}
          </DialogTitle>
          <DialogDescription>
            {t('permissionManagement.permissionDetails')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('permissionManagement.permissionName')} *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., READ_DOCUMENTS"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Follow pattern: ACTION_RESOURCE (e.g., READ_USER, WRITE_ROLE)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('permissionManagement.permissionDescription')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('permissionManagement.permissionDescription')}
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {t('roleManagement.descriptionTooLong')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('permissionManagement.editPermission')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};