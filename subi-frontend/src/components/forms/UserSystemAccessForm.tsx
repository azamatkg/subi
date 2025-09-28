import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { useTranslation } from '@/hooks/useTranslation';
import type { UserFormData } from '@/schemas/userSchemas';

interface UserSystemAccessFormProps {
  form: UseFormReturn<UserFormData>;
  isEditMode: boolean;
  usernameChecking?: boolean;
  hasUsernameError?: boolean;
  usernameErrorMessage?: string;
}

export const UserSystemAccessForm: React.FC<UserSystemAccessFormProps> = ({
  form,
  isEditMode,
  usernameChecking = false,
  hasUsernameError = false,
  usernameErrorMessage,
}) => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Shield className='h-5 w-5' />
          {t('userManagement.systemAccess')}
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {!isEditMode && (
          <>
            <FormField
              control={form.control}
              name='username'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('userManagement.fields.username')}</FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <span className='absolute left-3 top-3 text-sm text-muted-foreground'>
                        @
                      </span>
                      <Input
                        className='pl-8'
                        placeholder={t('userManagement.enterUsername')}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  {usernameChecking && (
                    <FormDescription>
                      {t('userManagement.checkingUsernameAvailability')}
                    </FormDescription>
                  )}
                  {hasUsernameError && usernameErrorMessage && (
                    <Alert>
                      <AlertCircle className='h-4 w-4' />
                      <AlertDescription>{usernameErrorMessage}</AlertDescription>
                    </Alert>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('userManagement.fields.password')}</FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder={t('userManagement.enterPassword')}
                          {...field}
                        />
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          className='absolute right-0 top-0 h-full px-3 hover:bg-transparent'
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className='h-4 w-4' />
                          ) : (
                            <Eye className='h-4 w-4' />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormDescription>
                      {t('userManagement.passwordRequirements')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='confirmPassword'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('userManagement.fields.confirmPassword')}
                    </FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder={t('userManagement.confirmPassword')}
                          {...field}
                        />
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          className='absolute right-0 top-0 h-full px-3 hover:bg-transparent'
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff className='h-4 w-4' />
                          ) : (
                            <Eye className='h-4 w-4' />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </>
        )}

        <FormField
          control={form.control}
          name='isActive'
          render={({ field }) => (
            <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className='space-y-1 leading-none'>
                <FormLabel>{t('userManagement.fields.activeUser')}</FormLabel>
                <FormDescription>
                  {t('userManagement.activeUserDescription')}
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};