import React from 'react';
import { AlertTriangle, Loader2, TrendingUp } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { useTranslation } from '@/hooks/useTranslation';
import type { FloatingRateTypeResponseDto } from '@/types/floatingRateType';

interface FloatingRateTypeDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  floatingRateType: FloatingRateTypeResponseDto | null;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  isReferenced?: boolean;
  referenceCount?: number;
  error?: string | null;
}

export const FloatingRateTypeDeleteDialog: React.FC<FloatingRateTypeDeleteDialogProps> = ({
  open,
  onOpenChange,
  floatingRateType,
  onConfirm,
  onCancel,
  loading = false,
  isReferenced = false,
  referenceCount = 0,
  error,
}) => {
  const { t } = useTranslation();

  if (!floatingRateType) return null;

  const handleCancel = () => {
    onCancel();
    onOpenChange(false);
  };

  const handleConfirm = () => {
    if (!isReferenced) {
      onConfirm();
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            {t('floatingRateType.deleteDialog.title')}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              {/* Floating Rate Type Details */}
              <div className="space-y-3">
                <p>{t('floatingRateType.deleteDialog.message')}</p>

                <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">
                        {floatingRateType.nameEn}
                      </h4>
                      <p className="text-sm text-gray-600 truncate">
                        {floatingRateType.nameRu}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          variant="outline"
                          className="text-xs"
                        >
                          {t(`floatingRateType.rateCalculationTypes.${floatingRateType.rateCalculationType.toLowerCase()}`)}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-xs"
                        >
                          {t(`references.status.${floatingRateType.status.toLowerCase()}`)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reference Check Warning */}
              {isReferenced && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {t('floatingRateType.deleteDialog.referencedWarning', { count: referenceCount })}
                  </AlertDescription>
                </Alert>
              )}

              {/* Error Message */}
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Final Warning */}
              {!isReferenced && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                  <p className="text-sm text-red-800">
                    {t('floatingRateType.deleteDialog.finalWarning')}
                  </p>
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={loading}>
            {t('common.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading || isReferenced}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('common.delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};