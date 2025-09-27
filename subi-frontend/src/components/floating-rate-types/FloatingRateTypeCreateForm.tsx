import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, TrendingUp } from 'lucide-react';

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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import { useTranslation } from '@/hooks/useTranslation';
import {
  floatingRateTypeCreateSchema,
  type FloatingRateTypeCreateFormData,
  transformFloatingRateTypeFormData,
} from './schemas/floatingRateTypeSchemas';
import { FloatingRateCalculationType } from '@/types/floatingRateType';
import { ReferenceEntityStatus } from '@/types/reference';
import type { FloatingRateTypeCreateDto } from '@/types/floatingRateType';

interface FloatingRateTypeCreateFormProps {
  onSubmit: (data: FloatingRateTypeCreateDto) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  initialData?: Partial<FloatingRateTypeCreateFormData>;
}

export const FloatingRateTypeCreateForm: React.FC<FloatingRateTypeCreateFormProps> = ({
  onSubmit,
  onCancel,
  loading = false,
  initialData,
}) => {
  const { t } = useTranslation();

  const form = useForm<FloatingRateTypeCreateFormData>({
    resolver: zodResolver(floatingRateTypeCreateSchema),
    defaultValues: {
      nameEn: initialData?.nameEn || '',
      nameRu: initialData?.nameRu || '',
      nameKg: initialData?.nameKg || '',
      description: initialData?.description || '',
      rateCalculationType: initialData?.rateCalculationType || FloatingRateCalculationType.FIXED_SPREAD,
      baseRateDescription: initialData?.baseRateDescription || '',
      spreadMin: initialData?.spreadMin || null,
      spreadMax: initialData?.spreadMax || null,
      status: initialData?.status || ReferenceEntityStatus.ACTIVE,
    },
  });

  const handleSubmit = async (data: FloatingRateTypeCreateFormData) => {
    try {
      const transformedData = transformFloatingRateTypeFormData(data);
      await onSubmit(transformedData);
    } catch (error) {
      console.error('Failed to create floating rate type:', error);
    }
  };

  const rateCalculationTypeOptions = Object.values(FloatingRateCalculationType).map(type => ({
    value: type,
    label: t(`floatingRateType.rateCalculationTypes.${type.toLowerCase()}`),
  }));

  const statusOptions = Object.values(ReferenceEntityStatus).map(status => ({
    value: status,
    label: t(`references.status.${status.toLowerCase()}`),
  }));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {t('floatingRateType.newFloatingRateType')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">{t('common.basicInformation')}</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="nameEn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('floatingRateType.fields.nameEn')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('floatingRateType.placeholders.nameEn')}
                          {...field}
                          disabled={loading}
                        />
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
                      <FormLabel>{t('floatingRateType.fields.nameRu')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('floatingRateType.placeholders.nameRu')}
                          {...field}
                          disabled={loading}
                        />
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
                      <FormLabel>{t('floatingRateType.fields.nameKg')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('floatingRateType.placeholders.nameKg')}
                          {...field}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('floatingRateType.fields.description')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('floatingRateType.placeholders.description')}
                        {...field}
                        disabled={loading}
                        rows={3}
                      />
                    </FormControl>
                    <FormDescription>
                      {t('common.optional')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Rate Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">{t('floatingRateType.sections.rateConfiguration')}</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="rateCalculationType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('floatingRateType.fields.rateCalculationType')}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={loading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('floatingRateType.placeholders.rateCalculationType')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {rateCalculationTypeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('common.status')}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={loading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('floatingRateType.placeholders.status')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="baseRateDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('floatingRateType.fields.baseRateDescription')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('floatingRateType.placeholders.baseRateDescription')}
                        {...field}
                        disabled={loading}
                        rows={2}
                      />
                    </FormControl>
                    <FormDescription>
                      {t('common.optional')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="spreadMin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('floatingRateType.fields.spreadMin')}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          placeholder="0.00"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => {
                            const value = e.target.value === '' ? null : parseFloat(e.target.value);
                            field.onChange(value);
                          }}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormDescription>
                        {t('floatingRateType.descriptions.spreadMin')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="spreadMax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('floatingRateType.fields.spreadMax')}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          placeholder="0.00"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => {
                            const value = e.target.value === '' ? null : parseFloat(e.target.value);
                            field.onChange(value);
                          }}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormDescription>
                        {t('floatingRateType.descriptions.spreadMax')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            {t('common.cancel')}
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('common.create')}
          </Button>
        </div>
      </form>
    </Form>
  );
};