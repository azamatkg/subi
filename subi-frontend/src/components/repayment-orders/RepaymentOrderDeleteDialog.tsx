import React from 'react';
import { Loader2, AlertTriangle, ArrowUpDown } from 'lucide-react';
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
import type { RepaymentOrderResponseDto } from '@/types/repaymentOrder';

interface RepaymentOrderDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  repaymentOrder: RepaymentOrderResponseDto | null;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
  isReferenced?: boolean;
  referenceCount?: number;
  error?: string | null;
}

export const RepaymentOrderDeleteDialog: React.FC<RepaymentOrderDeleteDialogProps> = ({
  open,
  onOpenChange,
  repaymentOrder,
  onConfirm,
  onCancel,
  isDeleting,
  isReferenced = false,
  referenceCount = 0,
  error,
}) => {
  const { t } = useTranslation();

  if (!repaymentOrder) return null;

  const handleConfirm = () => {
    if (!isReferenced) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    onCancel();
    onOpenChange(false);
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'PRINCIPAL':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'INTEREST':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'PENALTIES':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'FEES':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'COMMISSION':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'INSURANCE':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'OTHER':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityOrderStyle = (order: number) => {
    if (order <= 3) {
      return 'bg-red-100 text-red-800 border-red-300'; // High priority
    } else if (order <= 6) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-300'; // Medium priority
    } else {
      return 'bg-green-100 text-green-800 border-green-300'; // Low priority
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            {t('references.actions.delete')} {t('repaymentOrder.title')}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <ArrowUpDown className="w-5 h-5 text-indigo-600" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge
                    variant="outline"
                    className={
                      repaymentOrder.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-800 border-green-300'
                        : 'bg-gray-100 text-gray-800 border-gray-300'
                    }
                  >
                    {t(`references.status.${repaymentOrder.status.toLowerCase()}`)}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={getPriorityStyle(repaymentOrder.priority)}
                  >
                    {t(`repaymentOrder.priority.${repaymentOrder.priority.toLowerCase()}`)}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={getPriorityOrderStyle(repaymentOrder.priorityOrder)}
                  >
                    #{repaymentOrder.priorityOrder}
                  </Badge>
                </div>
                <p className="font-medium text-gray-900">{repaymentOrder.nameEn}</p>
                <p className="text-sm text-gray-600">
                  {repaymentOrder.nameRu} • {repaymentOrder.nameKg}
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
                      {t('repaymentOrder.messages.deleteRestricted')}
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
                <p>{t('repaymentOrder.messages.deleteConfirm', { name: repaymentOrder.nameEn })}</p>
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