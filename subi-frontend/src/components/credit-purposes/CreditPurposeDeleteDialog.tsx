import React from 'react';
import { Loader2, AlertTriangle, Target } from 'lucide-react';
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
import type { CreditPurposeResponseDto } from '@/types/creditPurpose';

interface CreditPurposeDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creditPurpose: CreditPurposeResponseDto | null;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
  isReferenced?: boolean;
  referenceCount?: number;
  error?: string | null;
}

export const CreditPurposeDeleteDialog: React.FC<CreditPurposeDeleteDialogProps> = ({
  open,
  onOpenChange,
  creditPurpose,
  onConfirm,
  onCancel,
  isDeleting,
  isReferenced = false,
  referenceCount = 0,
  error,
}) => {
  const { t } = useTranslation();

  if (!creditPurpose) return null;

  const handleConfirm = () => {
    if (!isReferenced) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    onCancel();
    onOpenChange(false);
  };

  const getCategoryStyle = (category: string) => {
    switch (category) {
      case 'CONSUMER':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'BUSINESS':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'AGRICULTURAL':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'MORTGAGE':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'MICROFINANCE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'CORPORATE':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            {t('references.actions.delete')} {t('creditPurpose.title')}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge
                    variant="outline"
                    className={
                      creditPurpose.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-800 border-green-300'
                        : 'bg-gray-100 text-gray-800 border-gray-300'
                    }
                  >
                    {t(`references.status.${creditPurpose.status.toLowerCase()}`)}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={getCategoryStyle(creditPurpose.category)}
                  >
                    {t(`creditPurpose.category.${creditPurpose.category.toLowerCase()}`)}
                  </Badge>
                </div>
                <p className="font-medium text-gray-900">{creditPurpose.nameEn}</p>
                <p className="text-sm text-gray-600">
                  {creditPurpose.nameRu} • {creditPurpose.nameKg}
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
                      {t('creditPurpose.messages.deleteRestricted')}
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
                <p>{t('creditPurpose.messages.deleteConfirm', { name: creditPurpose.nameEn })}</p>
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