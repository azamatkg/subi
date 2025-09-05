import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { useTranslation } from '@/hooks/useTranslation';
import { useGetActiveDecisionTypesQuery } from '@/store/api/decisionTypeApi';
import { useGetActiveDecisionMakingBodiesQuery } from '@/store/api/decisionMakingBodyApi';

import type {
  CreateDecisionDto,
  UpdateDecisionDto,
  DecisionResponseDto,
} from '@/types/decision';
import { DecisionStatus } from '@/types/decision';
import {
  createDecisionSchema,
  updateDecisionSchema,
  CreateDecisionFormData,
  UpdateDecisionFormData,
} from '@/schemas/decision';

interface DecisionFormProps {
  initialData?: DecisionResponseDto;
  isEdit?: boolean;
  onSubmit: (data: CreateDecisionDto | UpdateDecisionDto) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const DecisionForm: React.FC<DecisionFormProps> = ({
  initialData,
  isEdit = false,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const { t } = useTranslation();

  // Get reference data
  const { data: decisionTypesData, isLoading: typesLoading } =
    useGetActiveDecisionTypesQuery({ page: 0, size: 100 });

  const { data: decisionMakingBodiesData, isLoading: bodiesLoading } =
    useGetActiveDecisionMakingBodiesQuery({ page: 0, size: 100 });

  // Form setup
  const form = useForm<CreateDecisionFormData | UpdateDecisionFormData>({
    resolver: zodResolver(isEdit ? updateDecisionSchema : createDecisionSchema),
    defaultValues: isEdit
      ? {
          nameEn: '',
          nameRu: '',
          nameKg: '',
          date: '',
          number: '',
          decisionMakingBodyId: undefined,
          decisionTypeId: undefined,
          note: '',
          status: DecisionStatus.DRAFT,
          documentPackageId: '',
        }
      : {
          nameEn: '',
          nameRu: '',
          nameKg: '',
          date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
          number: '',
          decisionMakingBodyId: undefined,
          decisionTypeId: undefined,
          note: '',
          status: DecisionStatus.DRAFT,
          documentPackageId: '',
        },
  });

  // Reset form when initialData changes (for edit mode)
  useEffect(() => {
    console.log('Form reset useEffect triggered:', {
      isEdit,
      hasInitialData: !!initialData,
      initialData: initialData,
    });

    if (isEdit && initialData) {
      const resetValues = {
        nameEn: initialData.nameEn || '',
        nameRu: initialData.nameRu || '',
        nameKg: initialData.nameKg || '',
        date: initialData.date || '',
        number: initialData.number || '',
        decisionMakingBodyId: initialData.decisionMakingBodyId,
        decisionTypeId: initialData.decisionTypeId,
        note: initialData.note || '',
        status: initialData.status || DecisionStatus.DRAFT,
        documentPackageId: initialData.documentPackageId || '',
      };

      console.log('Resetting form with values:', resetValues);

      // Use both reset and manual setValue as backup
      form.reset(resetValues);

      // Add a slight delay to ensure form is ready and verify the reset worked
      setTimeout(() => {
        const currentValues = form.getValues();
        console.log('Form values after reset:', currentValues);

        // If reset didn't work properly, manually set the values
        if (
          currentValues.decisionMakingBodyId !==
            initialData.decisionMakingBodyId ||
          currentValues.decisionTypeId !== initialData.decisionTypeId
        ) {
          console.log(
            "Form reset didn't work properly, setting values manually"
          );
          form.setValue('nameEn', initialData.nameEn || '');
          form.setValue('nameRu', initialData.nameRu || '');
          form.setValue('nameKg', initialData.nameKg || '');
          form.setValue('date', initialData.date || '');
          form.setValue('number', initialData.number || '');
          form.setValue(
            'decisionMakingBodyId',
            initialData.decisionMakingBodyId
          );
          form.setValue('decisionTypeId', initialData.decisionTypeId);
          form.setValue('note', initialData.note || '');
          form.setValue('status', initialData.status || DecisionStatus.DRAFT);
          form.setValue(
            'documentPackageId',
            initialData.documentPackageId || ''
          );

          // Verify manual setting worked
          setTimeout(() => {
            console.log('Form values after manual setValue:', form.getValues());
          }, 50);
        }
      }, 100);
    }
  }, [isEdit, initialData, form]);

  // Additional effect to handle case where reference data loads after decision data
  useEffect(() => {
    if (
      isEdit &&
      initialData &&
      decisionTypesData &&
      decisionMakingBodiesData
    ) {
      // Double-check that form has the correct values after reference data loads
      const currentValues = form.getValues();
      if (
        currentValues.decisionMakingBodyId !==
          initialData.decisionMakingBodyId ||
        currentValues.decisionTypeId !== initialData.decisionTypeId
      ) {
        console.log(
          'Reference data loaded after decision data - refreshing form values'
        );
        form.setValue('decisionMakingBodyId', initialData.decisionMakingBodyId);
        form.setValue('decisionTypeId', initialData.decisionTypeId);
      }
    }
  }, [isEdit, initialData, decisionTypesData, decisionMakingBodiesData, form]);

  const handleSubmit = async (
    data: CreateDecisionFormData | UpdateDecisionFormData
  ) => {
    try {
      // Clean up empty strings and convert to proper format
      const cleanedData = {
        ...data,
        note: data.note?.trim() || undefined,
        documentPackageId: data.documentPackageId?.trim() || undefined,
      };

      await onSubmit(cleanedData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t('decision.fields.nameEn')} & {t('common.info')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Multilingual Names */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="nameEn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('decision.fields.nameEn')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nameRu"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('decision.fields.nameRu')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nameKg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('decision.fields.nameKg')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Date and Number */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('decision.fields.date')}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('decision.fields.number')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Classification */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t('decision.decisionType')} & {t('decision.decisionMakingBody')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="decisionTypeId"
                render={({ field }) => {
                  console.log(
                    'DecisionType Select render - field.value:',
                    field.value,
                    'converted:',
                    field.value ? field.value.toString() : ''
                  );
                  return (
                    <FormItem>
                      <FormLabel>{t('decision.fields.decisionType')}</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value ? field.value.toString() : ''}
                          onValueChange={value => {
                            console.log(
                              'DecisionType Select onChange - raw value:',
                              value,
                              'converted:',
                              value ? Number(value) : undefined
                            );
                            field.onChange(value ? Number(value) : undefined);
                          }}
                          disabled={typesLoading}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                typesLoading
                                  ? t('common.loading')
                                  : t(
                                      'decision.placeholders.selectDecisionType'
                                    )
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {decisionTypesData?.content.map(type => (
                              <SelectItem
                                key={type.id}
                                value={type.id.toString()}
                              >
                                <div className="space-y-1">
                                  <p className="font-medium">{type.nameEn}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {type.nameRu}
                                  </p>
                                </div>
                              </SelectItem>
                            ))}
                            \n{' '}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="decisionMakingBodyId"
                render={({ field }) => {
                  console.log(
                    'DecisionMakingBody Select render - field.value:',
                    field.value,
                    'converted:',
                    field.value ? field.value.toString() : ''
                  );
                  return (
                    <FormItem>
                      <FormLabel>
                        {t('decision.fields.decisionMakingBody')}
                      </FormLabel>
                      <FormControl>
                        <Select
                          value={field.value ? field.value.toString() : ''}
                          onValueChange={value => {
                            console.log(
                              'DecisionMakingBody Select onChange - raw value:',
                              value,
                              'converted:',
                              value ? Number(value) : undefined
                            );
                            field.onChange(value ? Number(value) : undefined);
                          }}
                          disabled={bodiesLoading}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                bodiesLoading
                                  ? t('common.loading')
                                  : t(
                                      'decision.placeholders.selectDecisionMakingBody'
                                    )
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {decisionMakingBodiesData?.content.map(body => (
                              <SelectItem
                                key={body.id}
                                value={body.id.toString()}
                              >
                                <div className="space-y-1">
                                  <p className="font-medium">{body.nameEn}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {body.nameRu}
                                  </p>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t('decision.fields.status')} & {t('decision.fields.note')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('decision.fields.status')}</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value || ''}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t(
                              'decision.placeholders.selectStatus'
                            )}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(DecisionStatus).map(status => (
                            <SelectItem key={status} value={status}>
                              {t(`decision.status.${status.toLowerCase()}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="documentPackageId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('decision.fields.documentPackage')}{' '}
                      {t('common.optional')}
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="UUID format (optional)" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('decision.fields.note')} {t('common.optional')}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={t('decision.placeholders.enterNote')}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            {t('common.cancel')}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? (isEdit ? t('common.updating') : t('common.creating')) + '...'
              : isEdit
                ? t('common.update')
                : t('common.create')}
          </Button>
        </div>
      </form>
    </Form>
  );
};
