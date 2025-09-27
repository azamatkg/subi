import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Target, Plus } from 'lucide-react';
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
import { useCreateCreditPurposeMutation, useCheckCreditPurposeExistsByNameEnQuery } from '@/store/api/creditPurposeApi';
import { ReferenceEntityStatus } from '@/types/reference';
import { CreditPurposeCategory } from '@/types/creditPurpose';
import { creditPurposeCreateSchema, type CreditPurposeCreateFormData } from './schemas/creditPurposeSchemas';

interface CreditPurposeCreateFormProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export const CreditPurposeCreateForm: React.FC<CreditPurposeCreateFormProps> = ({
  trigger,
  onSuccess
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const [createCreditPurpose, { isLoading: isCreating }] = useCreateCreditPurposeMutation();

  const form = useForm<CreditPurposeCreateFormData>({
    resolver: zodResolver(creditPurposeCreateSchema),
    defaultValues: {
      nameEn: '',
      nameRu: '',
      nameKg: '',
      description: '',
      category: CreditPurposeCategory.CONSUMER,
      status: ReferenceEntityStatus.ACTIVE,
    },
  });

  // Watch nameEn field for existence checking
  const nameEnValue = form.watch('nameEn');
  const { data: nameExists } = useCheckCreditPurposeExistsByNameEnQuery(nameEnValue, {
    skip: !nameEnValue || nameEnValue.length < 2,
  });

  // Set name error if it exists
  React.useEffect(() => {
    if (nameExists && nameEnValue?.length >= 2) {
      form.setError('nameEn', {
        type: 'manual',
        message: t('creditPurpose.validation.nameEnExists'),
      });
    }
  }, [nameExists, nameEnValue, form, t]);

  const onSubmit = async (data: CreditPurposeCreateFormData) => {
    // Double-check name doesn't exist
    if (nameExists) {
      form.setError('nameEn', {
        type: 'manual',
        message: t('creditPurpose.validation.nameEnExists'),
      });
      return;
    }

    try {
      await createCreditPurpose({
        nameEn: data.nameEn,
        nameRu: data.nameRu,
        nameKg: data.nameKg,
        description: data.description || undefined,
        category: data.category,
        status: data.status,
      }).unwrap();

      form.reset();
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create credit purpose:', error);
      // Error handling is done by RTK Query middleware and toasts
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      form.reset();
    }
  };

  // Credit purpose categories for dropdown
  const creditPurposeCategories = [
    CreditPurposeCategory.CONSUMER,
    CreditPurposeCategory.BUSINESS,
    CreditPurposeCategory.AGRICULTURAL,
    CreditPurposeCategory.MORTGAGE,
    CreditPurposeCategory.MICROFINANCE,
    CreditPurposeCategory.CORPORATE,
  ] as const;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t('creditPurpose.newCreditPurpose')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {t('creditPurpose.newCreditPurpose')}
          </DialogTitle>
          <DialogDescription>
            {t('references.actions.create')} {t('creditPurpose.title').toLowerCase()}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* English Name */}
            <FormField
              control={form.control}
              name="nameEn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('creditPurpose.fields.nameEn')}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Working Capital" />
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
                  <FormLabel>{t('creditPurpose.fields.nameRu')}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Оборотный капитал" />
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
                  <FormLabel>{t('creditPurpose.fields.nameKg')}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Айланма капитал" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('creditPurpose.fields.category')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('common.selectCategory')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {creditPurposeCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {t(`creditPurpose.category.${category.toLowerCase()}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  <FormLabel>{t('creditPurpose.fields.status')}</FormLabel>
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
                  <FormLabel>{t('creditPurpose.fields.description')} {t('common.optional')}</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={t('creditPurpose.fields.description')}
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
              <Button type="submit" disabled={isCreating || nameExists}>
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