import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

import { useTranslation } from '@/hooks/useTranslation';
import type { DocumentTypeResponseDto } from '@/types/documentType';

interface DocumentTypeDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentType: DocumentTypeResponseDto | null;
  onConfirm: () => void;
  loading?: boolean;
  error?: string | null;
  isReferenced?: boolean;
  referenceCount?: number;
  referenceDetails?: string[];
}

export const DocumentTypeDeleteDialog: React.FC<DocumentTypeDeleteDialogProps> = ({
  open,
  onOpenChange,
  documentType,
  onConfirm,
  loading = false,
  error = null,
  isReferenced = false,
  referenceCount = 0,
  referenceDetails = [],
}) => {
  const { t } = useTranslation();

  if (!documentType) return null;

  const handleConfirm = () => {
    if (!isReferenced) {
      onConfirm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            {t('documentType.deleteDialog.title')}
          </DialogTitle>
          <DialogDescription>
            {isReferenced
              ? t('documentType.deleteDialog.warningReferenced')
              : t('documentType.deleteDialog.warning')
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Document type details */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <h4 className="font-medium">{documentType.nameEn}</h4>
              <Badge
                variant="outline"
                className={
                  documentType.status === 'ACTIVE'
                    ? 'bg-green-100 text-green-800 border-green-300'
                    : 'bg-gray-100 text-gray-800 border-gray-300'
                }
              >
                {t(`references.status.${documentType.status.toLowerCase()}`)}
              </Badge>
            </div>
            <p className="text-sm text-gray-600">
              {documentType.nameRu} • {documentType.nameKg}
            </p>
            {documentType.description && (
              <p className="text-sm text-gray-600">{documentType.description}</p>
            )}
            <div className="flex flex-wrap gap-2 pt-2">
              <Badge variant="outline" className="text-xs">
                {t(`documentType.category.${documentType.category.toLowerCase()}`)}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {t(`documentType.applicantType.${documentType.applicantType.toLowerCase()}`)}
              </Badge>
              <Badge
                variant="outline"
                className={cn(
                  'text-xs',
                  documentType.priority === 'MANDATORY'
                    ? 'bg-red-100 text-red-800 border-red-300'
                    : documentType.priority === 'CONDITIONAL'
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : 'bg-gray-100 text-gray-800 border-gray-300'
                )}
              >
                {t(`documentType.priority.${documentType.priority.toLowerCase()}`)}
              </Badge>
            </div>
          </div>

          {/* Reference warning */}
          {isReferenced && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="space-y-2">
                <p>
                  {t('documentType.deleteDialog.referencedBy', { count: referenceCount })}
                </p>
                {referenceDetails.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium text-sm">
                      {t('documentType.deleteDialog.referenceDetails')}:
                    </p>
                    <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                      {referenceDetails.slice(0, 5).map((detail, index) => (
                        <li key={index}>{detail}</li>
                      ))}
                      {referenceDetails.length > 5 && (
                        <li className="text-gray-600">
                          {t('common.andMore', { count: referenceDetails.length - 5 })}
                        </li>
                      )}
                    </ul>
                  </div>
                )}
                <p className="text-sm font-medium">
                  {t('documentType.deleteDialog.cannotDelete')}
                </p>
              </AlertDescription>
            </Alert>
          )}

          {/* Error message */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Consequences warning for non-referenced items */}
          {!isReferenced && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-medium">
                    {t('documentType.deleteDialog.consequences')}:
                  </p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>{t('documentType.deleteDialog.consequenceData')}</li>
                    <li>{t('documentType.deleteDialog.consequenceTemplates')}</li>
                    <li>{t('documentType.deleteDialog.consequenceApplications')}</li>
                    <li>{t('documentType.deleteDialog.consequenceHistory')}</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {t('common.cancel')}
          </Button>
          {!isReferenced && (
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('common.delete')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};