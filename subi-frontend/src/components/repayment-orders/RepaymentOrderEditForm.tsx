import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, ArrowUpDown, Edit } from 'lucide-react';
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
  useUpdateRepaymentOrderMutation,
  useCheckRepaymentOrderExistsByNameEnQuery,
  useGetRepaymentOrderByIdQuery,
  useCheckPriorityOrderExistsQuery
} from '@/store/api/repaymentOrderApi';
import { ReferenceEntityStatus } from '@/types/reference';
import { RepaymentOrderPriority } from '@/types/repaymentOrder';
import { repaymentOrderUpdateSchema, type RepaymentOrderUpdateFormData } from './schemas/repaymentOrderSchemas';

interface RepaymentOrderEditFormProps {
  repaymentOrderId: number;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export const RepaymentOrderEditForm: React.FC<RepaymentOrderEditFormProps> = ({
  repaymentOrderId,
  trigger,
  onSuccess
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const { data: repaymentOrder, isLoading: isLoadingRepaymentOrder } = useGetRepaymentOrderByIdQuery(repaymentOrderId, {
    skip: !open,
  });
  const [updateRepaymentOrder, { isLoading: isUpdating }] = useUpdateRepaymentOrderMutation();

  const form = useForm<RepaymentOrderUpdateFormData>({
    resolver: zodResolver(repaymentOrderUpdateSchema),
    defaultValues: {
      nameEn: '',
      nameRu: '',
      nameKg: '',
      description: '',
      priority: RepaymentOrderPriority.PRINCIPAL,
      priorityOrder: 1,
      status: ReferenceEntityStatus.ACTIVE,
    },
  });

  // Watch nameEn field for existence checking (only if changed)
  const nameEnValue = form.watch('nameEn');
  const originalNameEn = repaymentOrder?.nameEn;
  const nameEnChanged = nameEnValue && nameEnValue !== originalNameEn;

  const { data: nameExists } = useCheckRepaymentOrderExistsByNameEnQuery(nameEnValue || '', {
    skip: !nameEnValue || !nameEnChanged || nameEnValue.length < 2,
  });

  // Watch priorityOrder field for existence checking (only if changed)
  const priorityOrderValue = form.watch('priorityOrder');
  const originalPriorityOrder = repaymentOrder?.priorityOrder;
  const priorityOrderChanged = priorityOrderValue && priorityOrderValue !== originalPriorityOrder;

  const { data: priorityOrderExists } = useCheckPriorityOrderExistsQuery(
    { priorityOrder: priorityOrderValue || 1, excludeId: repaymentOrderId },
    {
      skip: !priorityOrderValue || !priorityOrderChanged || priorityOrderValue < 1,
    }
  );

  // Set name error if it exists and is different from original
  useEffect(() => {
    if (nameExists && nameEnChanged && nameEnValue?.length >= 2) {
      form.setError('nameEn', {
        type: 'manual',
        message: t('repaymentOrder.validation.nameEnExists'),
      });
    }
  }, [nameExists, nameEnChanged, nameEnValue, form, t]);

  // Set priority order error if it exists and is different from original
  useEffect(() => {
    if (priorityOrderExists && priorityOrderChanged && priorityOrderValue >= 1) {
      form.setError('priorityOrder', {
        type: 'manual',
        message: t('repaymentOrder.validation.priorityOrderExists'),
      });
    }
  }, [priorityOrderExists, priorityOrderChanged, priorityOrderValue, form, t]);

  // Populate form when repayment order data is loaded
  useEffect(() => {
    if (repaymentOrder && open) {
      form.reset({
        nameEn: repaymentOrder.nameEn,
        nameRu: repaymentOrder.nameRu,
        nameKg: repaymentOrder.nameKg,
        description: repaymentOrder.description || '',
        priority: repaymentOrder.priority,
        priorityOrder: repaymentOrder.priorityOrder,
        status: repaymentOrder.status,
      });
    }
  }, [repaymentOrder, open, form]);

  const onSubmit = async (data: RepaymentOrderUpdateFormData) => {
    // Double-check name doesn't exist if changed
    if (nameExists && nameEnChanged) {
      form.setError('nameEn', {
        type: 'manual',
        message: t('repaymentOrder.validation.nameEnExists'),
      });
      return;
    }

    // Double-check priority order doesn't exist if changed
    if (priorityOrderExists && priorityOrderChanged) {
      form.setError('priorityOrder', {
        type: 'manual',
        message: t('repaymentOrder.validation.priorityOrderExists'),
      });
      return;
    }

    try {
      // Only include fields that have actually changed
      const updateData: RepaymentOrderUpdateFormData = {};

      if (data.nameEn !== originalNameEn) updateData.nameEn = data.nameEn;
      if (data.nameRu !== repaymentOrder?.nameRu) updateData.nameRu = data.nameRu;
      if (data.nameKg !== repaymentOrder?.nameKg) updateData.nameKg = data.nameKg;
      if (data.description !== repaymentOrder?.description) updateData.description = data.description;
      if (data.priority !== repaymentOrder?.priority) updateData.priority = data.priority;
      if (data.priorityOrder !== repaymentOrder?.priorityOrder) updateData.priorityOrder = data.priorityOrder;
      if (data.status !== repaymentOrder?.status) updateData.status = data.status;

      // Only make API call if there are changes
      if (Object.keys(updateData).length === 0) {
        setOpen(false);
        return;
      }

      await updateRepaymentOrder({
        id: repaymentOrderId,
        data: updateData,
      }).unwrap();

      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to update repayment order:', error);
      // Error handling is done by RTK Query middleware and toasts
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      form.reset();
    }
  };

  // Repayment order priorities for dropdown
  const repaymentOrderPriorities = [
    RepaymentOrderPriority.PRINCIPAL,
    RepaymentOrderPriority.INTEREST,
    RepaymentOrderPriority.PENALTIES,
    RepaymentOrderPriority.FEES,
    RepaymentOrderPriority.COMMISSION,
    RepaymentOrderPriority.INSURANCE,
    RepaymentOrderPriority.OTHER,
  ] as const;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            {t('common.edit')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5" />
            {t('repaymentOrder.editRepaymentOrder')}
          </DialogTitle>
          <DialogDescription>
            {t('references.actions.edit')} {t('repaymentOrder.title').toLowerCase()}
          </DialogDescription>
        </DialogHeader>

        {isLoadingRepaymentOrder ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
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
                    <FormLabel>{t('repaymentOrder.fields.nameEn')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Principal Payment" />
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
                    <FormLabel>{t('repaymentOrder.fields.nameRu')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Основной долг" />
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
                    <FormLabel>{t('repaymentOrder.fields.nameKg')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Негизги карыз" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Priority */}
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('repaymentOrder.fields.priority')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('common.selectPriority')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {repaymentOrderPriorities.map((priority) => (
                          <SelectItem key={priority} value={priority}>
                            {t(`repaymentOrder.priority.${priority.toLowerCase()}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Priority Order */}
              <FormField
                control={form.control}
                name="priorityOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('repaymentOrder.fields.priorityOrder')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min="1"
                        max="100"
                        placeholder="1"
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
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
                    <FormLabel>{t('repaymentOrder.fields.status')}</FormLabel>
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
                    <FormLabel>{t('repaymentOrder.fields.description')} {t('common.optional')}</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder={t('repaymentOrder.fields.description')}
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
                <Button type="submit" disabled={isUpdating || (nameExists && nameEnChanged) || (priorityOrderExists && priorityOrderChanged)}>
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