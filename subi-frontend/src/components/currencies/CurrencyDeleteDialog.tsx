import React from 'react';
import { Loader2, AlertTriangle, DollarSign } from 'lucide-react';
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
import { useTranslation } from '@/hooks/useTranslation';
import type { CurrencyResponseDto } from '@/types/currency';

interface CurrencyDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currency: CurrencyResponseDto | null;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
  isReferenced?: boolean;
  referenceCount?: number;
  error?: string | null;
}

export const CurrencyDeleteDialog: React.FC<CurrencyDeleteDialogProps> = ({
  open,
  onOpenChange,
  currency,
  onConfirm,
  onCancel,
  isDeleting,
  isReferenced = false,
  referenceCount = 0,
  error,
}) => {
  const { t } = useTranslation();

  if (!currency) return null;

  const handleConfirm = () => {
    if (!isReferenced) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    onCancel();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            {t('references.actions.delete')} {t('currency.title')}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-mono bg-gray-200 px-2 py-1 rounded text-gray-800">
                    {currency.code}
                  </span>
                  <Badge
                    variant="outline"
                    className={
                      currency.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-800 border-green-300'
                        : 'bg-gray-100 text-gray-800 border-gray-300'
                    }
                  >
                    {t(`references.status.${currency.status.toLowerCase()}`)}
                  </Badge>
                </div>
                <p className="font-medium text-gray-900">{currency.nameEn}</p>
                <p className="text-sm text-gray-600">
                  {currency.nameRu} • {currency.nameKg}
                </p>
              </div>
            </div>

            {isReferenced ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800">
                      {t('references.messages.referenced')}
                    </p>
                    <p className="text-sm text-red-700 mt-1">
                      {t('currency.messages.deleteRestricted')}
                    </p>
                    {referenceCount > 0 && (
                      <p className="text-sm text-red-600 mt-2">
                        Referenced by {referenceCount} entities
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-gray-700">
                <p>{t('currency.messages.deleteConfirm', { name: currency.nameEn })}</p>
                <p className="text-sm text-gray-500 mt-2">
                  This action cannot be undone.
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={isDeleting}>
            {t('common.cancel')}
          </AlertDialogCancel>

          {!isReferenced && (
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('common.delete')}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};