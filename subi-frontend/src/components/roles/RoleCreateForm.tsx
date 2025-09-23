import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Shield, Plus } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from '@/hooks/useTranslation';
import { useCreateRoleMutation } from '@/store/api/roleApi';
import { useGetAllPermissionsQuery } from '@/store/api/permissionApi';
import { createRoleSchema, type CreateRoleFormData } from './schemas/roleSchemas';
// import { PermissionCategories } from '@/types/role';

interface RoleCreateFormProps {
  trigger?: React.ReactNode;
}

export const RoleCreateForm: React.FC<RoleCreateFormProps> = ({ trigger }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const [createRole, { isLoading: isCreating }] = useCreateRoleMutation();
  const { data: permissions = [], isLoading: isLoadingPermissions } = useGetAllPermissionsQuery();

  const form = useForm<CreateRoleFormData>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: {
      name: '',
      description: '',
      permissionIds: [],
    },
  });

  const onSubmit = async (data: CreateRoleFormData) => {
    try {
      await createRole({
        name: data.name,
        description: data.description || undefined,
        permissionIds: data.permissionIds.length > 0 ? data.permissionIds : undefined,
      }).unwrap();

      form.reset();
      setOpen(false);
    } catch (error) {
      // Error handling is done by RTK Query middleware
      console.error('Failed to create role:', error);
    }
  };

  // Group permissions by category for better UX
  const groupedPermissions = permissions.reduce((acc, permission) => {
    let category = 'other';

    if (permission.name.includes('USER')) {
      category = 'userManagement';
    } else if (permission.name.includes('ROLE')) {
      category = 'roleManagement';
    } else if (permission.name.includes('PERMISSION')) {
      category = 'permissionManagement';
    } else if (permission.name.includes('SYSTEM')) {
      category = 'system';
    } else if (permission.name.includes('CREDIT')) {
      category = 'creditProgram';
    } else if (permission.name.includes('DECISION')) {
      category = 'decision';
    } else if (permission.name.includes('REFERENCE')) {
      category = 'referenceData';
    }

    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(permission);

    return acc;
  }, {} as Record<string, typeof permissions>);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t('roleManagement.createRole')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {t('roleManagement.createRole')}
          </DialogTitle>
          <DialogDescription>
            {t('roleManagement.roleDetails')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('roleManagement.roleName')} *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., DOCUMENT_SPECIALIST"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('roleManagement.roleDescription')}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t('roleManagement.roleDescription')}
                          className="resize-none"
                          rows={4}
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
              </div>

              {/* Permissions Selection */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="permissionIds"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">
                          {t('roleManagement.selectPermissions')}
                        </FormLabel>
                        <FormDescription>
                          {t('roleManagement.assignedPermissions')}
                        </FormDescription>
                      </div>

                      <ScrollArea className="h-96 w-full rounded-md border p-4">
                        {isLoadingPermissions ? (
                          <div className="flex items-center justify-center h-32">
                            <Loader2 className="h-6 w-6 animate-spin" />
                          </div>
                        ) : (
                          <div className="space-y-6">
                            {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                              <div key={category} className="space-y-3">
                                <h4 className="font-medium text-sm text-muted-foreground">
                                  {t(`permissionManagement.categories.${category}` as keyof typeof t) || category}
                                </h4>
                                <div className="space-y-2">
                                  {categoryPermissions.map((permission) => (
                                    <FormField
                                      key={permission.id}
                                      control={form.control}
                                      name="permissionIds"
                                      render={({ field }) => {
                                        return (
                                          <FormItem
                                            key={permission.id}
                                            className="flex flex-row items-start space-x-3 space-y-0"
                                          >
                                            <FormControl>
                                              <Checkbox
                                                checked={field.value?.includes(permission.id)}
                                                onCheckedChange={(checked) => {
                                                  return checked
                                                    ? field.onChange([...field.value, permission.id])
                                                    : field.onChange(
                                                        field.value?.filter(
                                                          (value) => value !== permission.id
                                                        )
                                                      )
                                                }}
                                              />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                              <FormLabel className="text-sm font-medium">
                                                {permission.name}
                                              </FormLabel>
                                              {permission.description && (
                                                <FormDescription className="text-xs">
                                                  {permission.description}
                                                </FormDescription>
                                              )}
                                            </div>
                                          </FormItem>
                                        )
                                      }}
                                    />
                                  ))}
                                </div>
                                {category !== Object.keys(groupedPermissions)[Object.keys(groupedPermissions).length - 1] && (
                                  <Separator />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </ScrollArea>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('roleManagement.createRole')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};