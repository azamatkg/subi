import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, ArrowUpDown, Plus } from 'lucide-react';
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
import { useCreateRepaymentOrderMutation, useCheckRepaymentOrderExistsByNameEnQuery, useCheckPriorityOrderExistsQuery } from '@/store/api/repaymentOrderApi';
import { ReferenceEntityStatus } from '@/types/reference';
import { RepaymentOrderPriority } from '@/types/repaymentOrder';
import { repaymentOrderCreateSchema, type RepaymentOrderCreateFormData } from './schemas/repaymentOrderSchemas';

interface RepaymentOrderCreateFormProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export const RepaymentOrderCreateForm: React.FC<RepaymentOrderCreateFormProps> = ({
  trigger,
  onSuccess
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const [createRepaymentOrder, { isLoading: isCreating }] = useCreateRepaymentOrderMutation();

  const form = useForm<RepaymentOrderCreateFormData>({
    resolver: zodResolver(repaymentOrderCreateSchema),
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

  // Watch nameEn field for existence checking
  const nameEnValue = form.watch('nameEn');
  const { data: nameExists } = useCheckRepaymentOrderExistsByNameEnQuery(nameEnValue, {
    skip: !nameEnValue || nameEnValue.length < 2,
  });

  // Watch priorityOrder field for existence checking
  const priorityOrderValue = form.watch('priorityOrder');
  const { data: priorityOrderExists } = useCheckPriorityOrderExistsQuery({ priorityOrder: priorityOrderValue }, {
    skip: !priorityOrderValue || priorityOrderValue < 1,
  });

  // Set name error if it exists
  React.useEffect(() => {
    if (nameExists && nameEnValue?.length >= 2) {
      form.setError('nameEn', {
        type: 'manual',
        message: t('repaymentOrder.validation.nameEnExists'),
      });
    }
  }, [nameExists, nameEnValue, form, t]);

  // Set priority order error if it exists
  React.useEffect(() => {
    if (priorityOrderExists && priorityOrderValue >= 1) {
      form.setError('priorityOrder', {
        type: 'manual',
        message: t('repaymentOrder.validation.priorityOrderExists'),
      });
    }
  }, [priorityOrderExists, priorityOrderValue, form, t]);

  const onSubmit = async (data: RepaymentOrderCreateFormData) => {
    // Double-check name doesn't exist
    if (nameExists) {
      form.setError('nameEn', {
        type: 'manual',
        message: t('repaymentOrder.validation.nameEnExists'),
      });
      return;
    }

    // Double-check priority order doesn't exist
    if (priorityOrderExists) {
      form.setError('priorityOrder', {
        type: 'manual',
        message: t('repaymentOrder.validation.priorityOrderExists'),
      });
      return;
    }

    try {
      await createRepaymentOrder({
        nameEn: data.nameEn,
        nameRu: data.nameRu,
        nameKg: data.nameKg,
        description: data.description || undefined,
        priority: data.priority,
        priorityOrder: data.priorityOrder,
        status: data.status,
      }).unwrap();

      form.reset();
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create repayment order:', error);
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
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t('repaymentOrder.newRepaymentOrder')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5" />
            {t('repaymentOrder.newRepaymentOrder')}
          </DialogTitle>
          <DialogDescription>
            {t('references.actions.create')} {t('repaymentOrder.title').toLowerCase()}
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                disabled={isCreating}
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={isCreating || nameExists || priorityOrderExists}>
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