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
  DecisionResponseDto,
  UpdateDecisionDto,
} from '@/types/decision';
import { DecisionStatus } from '@/types/decision';
import {
  CreateDecisionFormData,
  UpdateDecisionFormData,
  createDecisionSchema,
  updateDecisionSchema,
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

      

      // Use both reset and manual setValue as backup
      form.reset(resetValues);

      // Add a slight delay to ensure form is ready and verify the reset worked
      setTimeout(() => {
        const currentValues = form.getValues();
        

        // If reset didn't work properly, manually set the values
        if (
          currentValues.decisionMakingBodyId !==
            initialData.decisionMakingBodyId ||
          currentValues.decisionTypeId !== initialData.decisionTypeId
        ) {
          
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
    } catch {
      // TODO: handle error
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
        {/* Card 1: Multilingual Names */}
        <Card>
          <CardHeader>
            <CardTitle>{t('decision.fields.names')}</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <FormField
              control={form.control}
              name='nameRu'
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
              name='nameKg'
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

            <FormField
              control={form.control}
              name='nameEn'
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
          </CardContent>
        </Card>

        {/* Card 2: Date and Number */}
        <Card>
          <CardHeader>
            <CardTitle>{t('decision.fields.dateAndNumber')}</CardTitle>
          </CardHeader>
          <CardContent className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <FormField
              control={form.control}
              name='date'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('decision.fields.date')}</FormLabel>
                  <FormControl>
                    <Input type='date' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='number'
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
          </CardContent>
        </Card>

        {/* Card 3: Type and Decision Making Body */}
        <Card>
          <CardHeader>
            <CardTitle>{t('decision.fields.typeAndBody')}</CardTitle>
          </CardHeader>
          <CardContent className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <FormField
              control={form.control}
              name='decisionTypeId'
              render={({ field }) => {
                
                return (
                  <FormItem>
                    <FormLabel>{t('decision.fields.decisionType')}</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value ? field.value.toString() : ''}
                        onValueChange={value => {
                          
                          field.onChange(value ? Number(value) : undefined);
                        }}
                        disabled={typesLoading}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              typesLoading
                                ? t('common.loading')
                                : t('decision.placeholders.selectDecisionType')
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {decisionTypesData?.content.map(type => (
                            <SelectItem
                              key={type.id}
                              value={type.id.toString()}
                            >
                              <div className='space-y-1'>
                                <p className='font-medium'>{type.nameEn}</p>
                                <p className='text-sm text-muted-foreground'>
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
              name='decisionMakingBodyId'
              render={({ field }) => {
                
                return (
                  <FormItem>
                    <FormLabel>
                      {t('decision.fields.decisionMakingBody')}
                    </FormLabel>
                    <FormControl>
                      <Select
                        value={field.value ? field.value.toString() : ''}
                        onValueChange={value => {
                          
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
                              <div className='space-y-1'>
                                <p className='font-medium'>{body.nameEn}</p>
                                <p className='text-sm text-muted-foreground'>
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
          </CardContent>
        </Card>

        {/* Card 4: Description */}
        <Card>
          <CardHeader>
            <CardTitle>{t('decision.fields.description')}</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name='note'
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
        <div className='flex justify-end space-x-4'>
          <Button
            type='button'
            variant='outline'
            onClick={onCancel}
            disabled={isSubmitting}
          >
            {t('common.cancel')}
          </Button>
          <Button type='submit' disabled={isSubmitting}>
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
