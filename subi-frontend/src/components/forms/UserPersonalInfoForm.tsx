import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Mail, Phone, User, Users } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

import { useTranslation } from '@/hooks/useTranslation';
import type { UserFormData } from '@/schemas/userSchemas';

interface UserPersonalInfoFormProps {
  form: UseFormReturn<UserFormData>;
  emailChecking?: boolean;
  hasEmailError?: boolean;
  emailErrorMessage?: string;
}

export const UserPersonalInfoForm: React.FC<UserPersonalInfoFormProps> = ({
  form,
  emailChecking = false,
  hasEmailError = false,
  emailErrorMessage,
}) => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <User className='h-5 w-5' />
          {t('userManagement.personalInformation')}
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='grid grid-cols-2 gap-4'>
          <FormField
            control={form.control}
            name='firstName'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('userManagement.fields.firstName')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('userManagement.enterFirstName')}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='lastName'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('userManagement.fields.lastName')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('userManagement.enterLastName')}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('userManagement.fields.email')}</FormLabel>
              <FormControl>
                <div className='relative'>
                  <Mail className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                  <Input
                    className='pl-10'
                    placeholder={t('userManagement.enterEmail')}
                    {...field}
                  />
                </div>
              </FormControl>
              {emailChecking && (
                <p className='text-sm text-muted-foreground'>
                  {t('userManagement.checkingEmailAvailability')}
                </p>
              )}
              {hasEmailError && emailErrorMessage && (
                <Alert>
                  <AlertCircle className='h-4 w-4' />
                  <AlertDescription>{emailErrorMessage}</AlertDescription>
                </Alert>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='phone'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('userManagement.fields.phone')} {t('common.optional')}
              </FormLabel>
              <FormControl>
                <div className='relative'>
                  <Phone className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                  <Input
                    className='pl-10'
                    placeholder={t('userManagement.enterPhone')}
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='department'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('userManagement.fields.department')} {t('common.optional')}
              </FormLabel>
              <FormControl>
                <div className='relative'>
                  <Users className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                  <Input
                    className='pl-10'
                    placeholder={t('userManagement.enterDepartment')}
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};