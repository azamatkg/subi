import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Target, Edit } from 'lucide-react';
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
import {
  useUpdateCreditPurposeMutation,
  useCheckCreditPurposeExistsByNameEnQuery,
  useGetCreditPurposeByIdQuery
} from '@/store/api/creditPurposeApi';
import { ReferenceEntityStatus } from '@/types/reference';
import { CreditPurposeCategory } from '@/types/creditPurpose';
import { creditPurposeUpdateSchema, type CreditPurposeUpdateFormData } from './schemas/creditPurposeSchemas';

interface CreditPurposeEditFormProps {
  creditPurposeId: number;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export const CreditPurposeEditForm: React.FC<CreditPurposeEditFormProps> = ({
  creditPurposeId,
  trigger,
  onSuccess
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const { data: creditPurpose, isLoading: isLoadingCreditPurpose } = useGetCreditPurposeByIdQuery(creditPurposeId, {
    skip: !open,
  });
  const [updateCreditPurpose, { isLoading: isUpdating }] = useUpdateCreditPurposeMutation();

  const form = useForm<CreditPurposeUpdateFormData>({
    resolver: zodResolver(creditPurposeUpdateSchema),
    defaultValues: {
      nameEn: '',
      nameRu: '',
      nameKg: '',
      description: '',
      category: CreditPurposeCategory.CONSUMER,
      status: ReferenceEntityStatus.ACTIVE,
    },
  });

  // Watch nameEn field for existence checking (only if changed)
  const nameEnValue = form.watch('nameEn');
  const originalNameEn = creditPurpose?.nameEn;
  const nameEnChanged = nameEnValue && nameEnValue !== originalNameEn;

  const { data: nameExists } = useCheckCreditPurposeExistsByNameEnQuery(nameEnValue || '', {
    skip: !nameEnValue || !nameEnChanged || nameEnValue.length < 2,
  });

  // Set name error if it exists and is different from original
  useEffect(() => {
    if (nameExists && nameEnChanged && nameEnValue?.length >= 2) {
      form.setError('nameEn', {
        type: 'manual',
        message: t('creditPurpose.validation.nameEnExists'),
      });
    }
  }, [nameExists, nameEnChanged, nameEnValue, form, t]);

  // Populate form when credit purpose data is loaded
  useEffect(() => {
    if (creditPurpose && open) {
      form.reset({
        nameEn: creditPurpose.nameEn,
        nameRu: creditPurpose.nameRu,
        nameKg: creditPurpose.nameKg,
        description: creditPurpose.description || '',
        category: creditPurpose.category,
        status: creditPurpose.status,
      });
    }
  }, [creditPurpose, open, form]);

  const onSubmit = async (data: CreditPurposeUpdateFormData) => {
    // Double-check name doesn't exist if changed
    if (nameExists && nameEnChanged) {
      form.setError('nameEn', {
        type: 'manual',
        message: t('creditPurpose.validation.nameEnExists'),
      });
      return;
    }

    try {
      // Only include fields that have actually changed
      const updateData: CreditPurposeUpdateFormData = {};

      if (data.nameEn !== originalNameEn) updateData.nameEn = data.nameEn;
      if (data.nameRu !== creditPurpose?.nameRu) updateData.nameRu = data.nameRu;
      if (data.nameKg !== creditPurpose?.nameKg) updateData.nameKg = data.nameKg;
      if (data.description !== creditPurpose?.description) updateData.description = data.description;
      if (data.category !== creditPurpose?.category) updateData.category = data.category;
      if (data.status !== creditPurpose?.status) updateData.status = data.status;

      // Only make API call if there are changes
      if (Object.keys(updateData).length === 0) {
        setOpen(false);
        return;
      }

      await updateCreditPurpose({ id: creditPurposeId, data: updateData }).unwrap();

      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to update credit purpose:', error);
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
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            {t('common.edit')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {t('references.actions.edit')} {t('creditPurpose.title')}
          </DialogTitle>
          <DialogDescription>
            {creditPurpose && `${creditPurpose.nameEn}`}
          </DialogDescription>
        </DialogHeader>

        {isLoadingCreditPurpose ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
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
                    <Select onValueChange={field.onChange} value={field.value}>
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
                  disabled={isUpdating}
                >
                  {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={isUpdating || (nameExists && nameEnChanged)}>
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