import React, { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

import { useTranslation } from '@/hooks/useTranslation';
import type {
  CreateCreditProgramDto,
  ProgramStatus,
} from '@/types/creditProgram';
import { ProgramStatus as ProgramStatusEnum } from '@/types/creditProgram';

interface CreditProgramFormProps {
  decisionId: string;
  onSubmit: (data: CreateCreditProgramDto) => Promise<void>;
  loading?: boolean;
  trigger?: React.ReactNode;
}

export const CreditProgramForm: React.FC<CreditProgramFormProps> = ({
  decisionId,
  onSubmit,
  loading = false,
  trigger,
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<CreateCreditProgramDto>({
    decisionId,
    nameEn: '',
    nameRu: '',
    nameKg: '',
    creditPurposeId: 1, // Default value, should be fetched from API
    currencyId: 1, // Default value, should be fetched from API
    repaymentOrderId: 1, // Default value, should be fetched from API
    collateralRequired: false,
    status: ProgramStatusEnum.DRAFT,
  });

  const handleInputChange = (
    field: keyof CreateCreditProgramDto,
    value: unknown
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      setOpen(false);
      // Reset form
      setFormData({
        decisionId,
        nameEn: '',
        nameRu: '',
        nameKg: '',
        creditPurposeId: 1,
        currencyId: 1,
        repaymentOrderId: 1,
        collateralRequired: false,
        status: ProgramStatusEnum.DRAFT,
      });
    } catch (error) {
      // Error handling should be done in parent component
      console.error('Form submission error:', error);
    }
  };

  const DefaultTrigger = () => (
    <Button className="gap-2">
      <Plus className="h-4 w-4" />
      {t('creditProgram.form.createTitle')}
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || <DefaultTrigger />}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{t('creditProgram.form.createTitle')}</DialogTitle>
          <DialogDescription>
            {t('creditProgram.form.createDescription')}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Required Fields Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">
                  {t('creditProgram.form.requiredFields')}
                </h3>
                <span className="text-red-500">*</span>
              </div>

              {/* Program Names */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nameEn">
                    {t('creditProgram.fields.nameEn')}{' '}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nameEn"
                    value={formData.nameEn}
                    onChange={e => handleInputChange('nameEn', e.target.value)}
                    placeholder={t('creditProgram.placeholders.nameEn')}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nameRu">
                    {t('creditProgram.fields.nameRu')}{' '}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nameRu"
                    value={formData.nameRu}
                    onChange={e => handleInputChange('nameRu', e.target.value)}
                    placeholder={t('creditProgram.placeholders.nameRu')}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nameKg">
                    {t('creditProgram.fields.nameKg')}{' '}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nameKg"
                    value={formData.nameKg}
                    onChange={e => handleInputChange('nameKg', e.target.value)}
                    placeholder={t('creditProgram.placeholders.nameKg')}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  {t('creditProgram.fields.description')}
                </Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={e =>
                    handleInputChange('description', e.target.value)
                  }
                  placeholder={t('creditProgram.placeholders.description')}
                  rows={3}
                  disabled={loading}
                />
              </div>

              {/* Collateral Required */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="collateralRequired"
                  checked={formData.collateralRequired}
                  onCheckedChange={checked =>
                    handleInputChange('collateralRequired', checked)
                  }
                  disabled={loading}
                />
                <Label htmlFor="collateralRequired">
                  {t('creditProgram.fields.collateralRequired')}
                </Label>
              </div>
            </div>

            <Separator />

            {/* Optional Fields Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                {t('creditProgram.form.optionalFields')}
              </h3>

              {/* Validity Period */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="validFrom">
                    {t('creditProgram.fields.validFrom')}
                  </Label>
                  <Input
                    id="validFrom"
                    type="date"
                    value={formData.validFrom || ''}
                    onChange={e =>
                      handleInputChange('validFrom', e.target.value)
                    }
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validTo">
                    {t('creditProgram.fields.validTo')}
                  </Label>
                  <Input
                    id="validTo"
                    type="date"
                    value={formData.validTo || ''}
                    onChange={e => handleInputChange('validTo', e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Amount Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amountMin">
                    {t('creditProgram.fields.amountMin')}
                  </Label>
                  <Input
                    id="amountMin"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.amountMin || ''}
                    onChange={e =>
                      handleInputChange(
                        'amountMin',
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    placeholder="0.00"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amountMax">
                    {t('creditProgram.fields.amountMax')}
                  </Label>
                  <Input
                    id="amountMax"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.amountMax || ''}
                    onChange={e =>
                      handleInputChange(
                        'amountMax',
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    placeholder="0.00"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Term Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="termMin">
                    {t('creditProgram.fields.termMin')} ({t('common.months')})
                  </Label>
                  <Input
                    id="termMin"
                    type="number"
                    min="1"
                    value={formData.termMin || ''}
                    onChange={e =>
                      handleInputChange(
                        'termMin',
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    placeholder="1"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="termMax">
                    {t('creditProgram.fields.termMax')} ({t('common.months')})
                  </Label>
                  <Input
                    id="termMax"
                    type="number"
                    min="1"
                    value={formData.termMax || ''}
                    onChange={e =>
                      handleInputChange(
                        'termMax',
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    placeholder="60"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Interest Rate */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="interestRateFixed">
                    {t('creditProgram.fields.interestRate')} (%)
                  </Label>
                  <Input
                    id="interestRateFixed"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.interestRateFixed || ''}
                    onChange={e =>
                      handleInputChange(
                        'interestRateFixed',
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    placeholder="18.00"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="processingFeePercentage">
                    {t('creditProgram.fields.processingFeePercentage')} (%)
                  </Label>
                  <Input
                    id="processingFeePercentage"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.processingFeePercentage || ''}
                    onChange={e =>
                      handleInputChange(
                        'processingFeePercentage',
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    placeholder="1.50"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">
                  {t('creditProgram.fields.status')}
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={value =>
                    handleInputChange('status', value as ProgramStatus)
                  }
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t('creditProgram.placeholders.selectStatus')}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(ProgramStatusEnum).map(status => (
                      <SelectItem key={status} value={status}>
                        {t(`creditProgram.status.${status.toLowerCase()}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('common.creating')}
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    {t('creditProgram.actions.create')}
                  </>
                )}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
