import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Shield } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { useTranslation } from '@/hooks/useTranslation';
import { UserRole } from '@/types/user';
import type { UserFormData } from '@/schemas/userSchemas';

interface UserRoleAssignmentFormProps {
  form: UseFormReturn<UserFormData>;
}

export const UserRoleAssignmentForm: React.FC<UserRoleAssignmentFormProps> = ({
  form,
}) => {
  const { t } = useTranslation();

  const roleOptions = [
    {
      value: UserRole.ADMIN,
      label: t('userManagement.roles.admin'),
      description: t('userManagement.roleDescriptions.admin'),
    },
    {
      value: UserRole.CREDIT_MANAGER,
      label: t('userManagement.roles.credit_manager'),
      description: t('userManagement.roleDescriptions.credit_manager'),
    },
    {
      value: UserRole.CREDIT_ANALYST,
      label: t('userManagement.roles.credit_analyst'),
      description: t('userManagement.roleDescriptions.credit_analyst'),
    },
    {
      value: UserRole.DECISION_MAKER,
      label: t('userManagement.roles.decision_maker'),
      description: t('userManagement.roleDescriptions.decision_maker'),
    },
    {
      value: UserRole.COMMISSION_MEMBER,
      label: t('userManagement.roles.commission_member'),
      description: t('userManagement.roleDescriptions.commission_member'),
    },
    {
      value: UserRole.USER,
      label: t('userManagement.roles.user'),
      description: t('userManagement.roleDescriptions.user'),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Shield className='h-5 w-5' />
          {t('userManagement.roleAssignment')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <FormField
          control={form.control}
          name='roles'
          render={() => (
            <FormItem>
              <FormLabel>{t('userManagement.selectRoles')}</FormLabel>
              <FormDescription>
                {t('userManagement.selectRolesDescription')}
              </FormDescription>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-4'>
                {roleOptions.map(role => (
                  <FormField
                    key={role.value}
                    control={form.control}
                    name='roles'
                    render={({ field }) => (
                      <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 hover:bg-muted/50 transition-colors'>
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(role.value)}
                            onCheckedChange={checked => {
                              const updatedRoles = checked
                                ? [...(field.value || []), role.value]
                                : field.value?.filter(
                                    (r: UserRole) => r !== role.value
                                  ) || [];
                              field.onChange(updatedRoles);
                            }}
                          />
                        </FormControl>
                        <div className='space-y-1 leading-none'>
                          <FormLabel className='font-medium'>
                            {role.label}
                          </FormLabel>
                          <FormDescription className='text-sm'>
                            {role.description}
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};