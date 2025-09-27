import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, DollarSign, Edit } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useTranslation } from '@/hooks/useTranslation';
import {
  useUpdateCurrencyMutation,
  useCheckCurrencyExistsByCodeQuery,
  useGetCurrencyByIdQuery
} from '@/store/api/currencyApi';
import { ReferenceEntityStatus } from '@/types/reference';
import { currencyUpdateSchema, type CurrencyUpdateFormData } from './schemas/currencySchemas';

interface CurrencyEditFormProps {
  currencyId: number;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export const CurrencyEditForm: React.FC<CurrencyEditFormProps> = ({
  currencyId,
  trigger,
  onSuccess
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const { data: currency, isLoading: isLoadingCurrency } = useGetCurrencyByIdQuery(currencyId, {
    skip: !open,
  });
  const [updateCurrency, { isLoading: isUpdating }] = useUpdateCurrencyMutation();

  const form = useForm<CurrencyUpdateFormData>({
    resolver: zodResolver(currencyUpdateSchema),
    defaultValues: {
      code: '',
      nameEn: '',
      nameRu: '',
      nameKg: '',
      description: '',
      status: ReferenceEntityStatus.ACTIVE,
    },
  });

  // Watch code field for existence checking (only if changed)
  const codeValue = form.watch('code');
  const originalCode = currency?.code;
  const codeChanged = codeValue && codeValue !== originalCode;

  const { data: codeExists } = useCheckCurrencyExistsByCodeQuery(codeValue || '', {
    skip: !codeValue || !codeChanged || codeValue.length !== 3,
  });

  // Set code error if it exists and is different from original
  useEffect(() => {
    if (codeExists && codeChanged && codeValue?.length === 3) {
      form.setError('code', {
        type: 'manual',
        message: t('currency.validation.codeExists'),
      });
    }
  }, [codeExists, codeChanged, codeValue, form, t]);

  // Populate form when currency data is loaded
  useEffect(() => {
    if (currency && open) {
      form.reset({
        code: currency.code,
        nameEn: currency.nameEn,
        nameRu: currency.nameRu,
        nameKg: currency.nameKg,
        description: currency.description || '',
        status: currency.status,
      });
    }
  }, [currency, open, form]);

  const onSubmit = async (data: CurrencyUpdateFormData) => {
    // Double-check code doesn't exist if changed
    if (codeExists && codeChanged) {
      form.setError('code', {
        type: 'manual',
        message: t('currency.validation.codeExists'),
      });
      return;
    }

    try {
      // Only include fields that have actually changed
      const updateData: CurrencyUpdateFormData = {};

      if (data.code !== originalCode) updateData.code = data.code;
      if (data.nameEn !== currency?.nameEn) updateData.nameEn = data.nameEn;
      if (data.nameRu !== currency?.nameRu) updateData.nameRu = data.nameRu;
      if (data.nameKg !== currency?.nameKg) updateData.nameKg = data.nameKg;
      if (data.description !== currency?.description) updateData.description = data.description;
      if (data.status !== currency?.status) updateData.status = data.status;

      // Only make API call if there are changes
      if (Object.keys(updateData).length === 0) {
        setOpen(false);
        return;
      }

      await updateCurrency({ id: currencyId, data: updateData }).unwrap();

      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to update currency:', error);
      // Error handling is done by RTK Query middleware and toasts
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      form.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            {t('common.edit')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {t('references.actions.edit')} {t('currency.title')}
          </DialogTitle>
          <DialogDescription>
            {currency && `${currency.code} - ${currency.nameEn}`}
          </DialogDescription>
        </DialogHeader>

        {isLoadingCurrency ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Currency Code */}
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('currency.fields.code')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="USD, EUR, KGS..."
                        className="font-mono uppercase"
                        maxLength={3}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormDescription>
                      {t('currency.validation.codeLength')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* English Name */}
              <FormField
                control={form.control}
                name="nameEn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('currency.fields.nameEn')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="US Dollar" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Russian Name */}
              <FormField
                control={form.control}
                name="nameRu"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('currency.fields.nameRu')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Доллар США" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Kyrgyz Name */}
              <FormField
                control={form.control}
                name="nameKg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('currency.fields.nameKg')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="АКШ доллары" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('currency.fields.status')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('common.selectStatus')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={ReferenceEntityStatus.ACTIVE}>
                          {t('references.status.active')}
                        </SelectItem>
                        <SelectItem value={ReferenceEntityStatus.INACTIVE}>
                          {t('references.status.inactive')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('currency.fields.description')} {t('common.optional')}</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder={t('currency.fields.description')}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={isUpdating}
                >
                  {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={isUpdating || (codeExists && codeChanged)}>
                  {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('common.update')}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};