import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Target, ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { useTranslation } from '@/hooks/useTranslation';
import { useSetPageTitle } from '@/hooks/useSetPageTitle';
import { useGetCreditPurposeByIdQuery } from '@/store/api/creditPurposeApi';
import { CreditPurposeEditForm } from '@/components/credit-purposes/CreditPurposeEditForm';
import { ROUTES } from '@/constants';

export const CreditPurposeEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const creditPurposeId = parseInt(id || '0', 10);

  const {
    data: creditPurpose,
    isLoading,
    error,
  } = useGetCreditPurposeByIdQuery(creditPurposeId, {
    skip: !creditPurposeId,
  });

  useSetPageTitle(
    creditPurpose
      ? t('creditPurpose.editCreditPurpose', { name: creditPurpose.nameEn })
      : t('creditPurpose.editCreditPurpose')
  );

  const handleSuccess = () => {
    navigate(`${ROUTES.ADMIN}/credit-purposes/${creditPurposeId}`);
  };

  const handleCancel = () => {
    navigate(`${ROUTES.ADMIN}/credit-purposes/${creditPurposeId}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error || !creditPurpose) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t('creditPurpose.messages.creditPurposeNotFound')}
              </h3>
              <Button onClick={() => navigate(`${ROUTES.ADMIN}/credit-purposes`)}>
                {t('common.goBack')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                {t('creditPurpose.editCreditPurpose')}
              </h1>
              <p className="text-gray-500">
                {creditPurpose.nameEn}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>{t('creditPurpose.editForm.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <CreditPurposeEditForm
              creditPurpose={creditPurpose}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};