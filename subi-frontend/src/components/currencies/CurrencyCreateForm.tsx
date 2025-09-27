import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, DollarSign, Plus } from 'lucide-react';
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
import { useCreateCurrencyMutation, useCheckCurrencyExistsByCodeQuery } from '@/store/api/currencyApi';
import { ReferenceEntityStatus } from '@/types/reference';
import { currencyCreateSchema, type CurrencyCreateFormData } from './schemas/currencySchemas';

interface CurrencyCreateFormProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export const CurrencyCreateForm: React.FC<CurrencyCreateFormProps> = ({
  trigger,
  onSuccess
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const [createCurrency, { isLoading: isCreating }] = useCreateCurrencyMutation();

  const form = useForm<CurrencyCreateFormData>({
    resolver: zodResolver(currencyCreateSchema),
    defaultValues: {
      code: '',
      nameEn: '',
      nameRu: '',
      nameKg: '',
      description: '',
      status: ReferenceEntityStatus.ACTIVE,
    },
  });

  // Watch code field for existence checking
  const codeValue = form.watch('code');
  const { data: codeExists } = useCheckCurrencyExistsByCodeQuery(codeValue, {
    skip: !codeValue || codeValue.length !== 3,
  });

  // Set code error if it exists
  React.useEffect(() => {
    if (codeExists && codeValue?.length === 3) {
      form.setError('code', {
        type: 'manual',
        message: t('currency.validation.codeExists'),
      });
    }
  }, [codeExists, codeValue, form, t]);

  const onSubmit = async (data: CurrencyCreateFormData) => {
    // Double-check code doesn't exist
    if (codeExists) {
      form.setError('code', {
        type: 'manual',
        message: t('currency.validation.codeExists'),
      });
      return;
    }

    try {
      await createCurrency({
        code: data.code,
        nameEn: data.nameEn,
        nameRu: data.nameRu,
        nameKg: data.nameKg,
        description: data.description || undefined,
        status: data.status,
      }).unwrap();

      form.reset();
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create currency:', error);
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
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t('currency.newCurrency')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {t('currency.newCurrency')}
          </DialogTitle>
          <DialogDescription>
            {t('references.actions.create')} {t('currency.title').toLowerCase()}
          </DialogDescription>
        </DialogHeader>

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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                disabled={isCreating}
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={isCreating || codeExists}>
                {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('common.create')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};