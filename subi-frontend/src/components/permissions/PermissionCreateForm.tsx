import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Key, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { useCreatePermissionMutation } from '@/store/api/permissionApi';
import { createPermissionSchema, type CreatePermissionFormData } from './schemas/permissionSchemas';

interface PermissionCreateFormProps {
  trigger?: React.ReactNode;
}

export const PermissionCreateForm: React.FC<PermissionCreateFormProps> = ({ trigger }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const [createPermission, { isLoading: isCreating }] = useCreatePermissionMutation();

  const form = useForm<CreatePermissionFormData>({
    resolver: zodResolver(createPermissionSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const onSubmit = async (data: CreatePermissionFormData) => {
    try {
      await createPermission({
        name: data.name,
        description: data.description || undefined,
      }).unwrap();

      form.reset();
      setOpen(false);
    } catch (error) {
      console.error('Failed to create permission:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t('permissionManagement.createPermission')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            {t('permissionManagement.createPermission')}
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
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('permissionManagement.createPermission')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};