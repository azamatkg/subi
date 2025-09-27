import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { useTranslation } from '@/hooks/useTranslation';
import { useSetPageTitle } from '@/hooks/useSetPageTitle';
import { CreditPurposeCreateForm } from '@/components/credit-purposes/CreditPurposeCreateForm';
import { ROUTES } from '@/constants';

export const CreditPurposeCreatePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  useSetPageTitle(t('creditPurpose.newCreditPurpose'));

  const handleSuccess = () => {
    navigate(`${ROUTES.ADMIN}/credit-purposes`);
  };

  const handleCancel = () => {
    navigate(`${ROUTES.ADMIN}/credit-purposes`);
  };

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
              <h1 className="text-3xl font-bold">{t('creditPurpose.newCreditPurpose')}</h1>
              <p className="text-gray-500">
                {t('creditPurpose.createDescription')}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>{t('creditPurpose.createForm.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <CreditPurposeCreateForm
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};