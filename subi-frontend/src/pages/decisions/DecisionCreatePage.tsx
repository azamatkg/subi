import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { DecisionForm } from '@/components/decisions/DecisionForm';

import { useTranslation } from '@/hooks/useTranslation';
import { useSetPageTitle } from '@/hooks/useSetPageTitle';
import { useCreateDecisionMutation } from '@/store/api/decisionApi';
import type { CreateDecisionDto, UpdateDecisionDto } from '@/types/decision';
import { ROUTES } from '@/constants';

export const DecisionCreatePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  useSetPageTitle('Создание решения');
  const [createDecision, { isLoading }] = useCreateDecisionMutation();

  const handleSubmit = async (data: CreateDecisionDto | UpdateDecisionDto) => {
    try {
      const result = await createDecision(data as CreateDecisionDto).unwrap();
      toast.success(t('decision.messages.decisionCreated'));
      navigate(`${ROUTES.DECISIONS}/${result.id}`);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && 'data' in error
          ? (error as { data?: { message?: string } }).data?.message
          : undefined;
      toast.error(errorMessage || t('common.error'));
      throw error;
    }
  };

  const handleCancel = () => {
    navigate(ROUTES.DECISIONS);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={handleCancel}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('common.back')}
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">
            {t('decision.newDecision')}
          </h1>
          <p className="text-muted-foreground">
            {t('common.create')} {t('decision.title').toLowerCase()}
          </p>
        </div>
      </div>

      {/* Form */}
      <DecisionForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isLoading}
      />
    </div>
  );
};
