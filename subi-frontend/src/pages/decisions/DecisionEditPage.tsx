import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { DecisionForm } from '@/components/decisions/DecisionForm';
import { Card, CardContent } from '@/components/ui/card';

import { useTranslation } from '@/hooks/useTranslation';
import { useSetPageTitle } from '@/hooks/useSetPageTitle';
import {
  useGetDecisionByIdQuery,
  useUpdateDecisionMutation,
} from '@/store/api/decisionApi';
import type { UpdateDecisionDto } from '@/types/decision';
import { ROUTES } from '@/constants';

export const DecisionEditPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  useSetPageTitle('Редактирование решения');

  const {
    data: decision,
    isLoading: decisionLoading,
    error: decisionError,
  } = useGetDecisionByIdQuery(id!, {
    skip: !id,
  });

  const [updateDecision, { isLoading: updateLoading }] =
    useUpdateDecisionMutation();

  const handleSubmit = async (data: UpdateDecisionDto) => {
    if (!id) return;

    try {
      const result = await updateDecision({ id, data }).unwrap();
      toast.success(t('decision.messages.decisionUpdated'));
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
    if (id) {
      navigate(`${ROUTES.DECISIONS}/${id}`);
    } else {
      navigate(ROUTES.DECISIONS);
    }
  };

  if (!id) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            {t('errors.notFound')}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (decisionLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{t('decision.messages.loadingDecisions')}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (decisionError || !decision) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-destructive">
            {t('errors.serverError')}
          </p>
        </CardContent>
      </Card>
    );
  }

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
            {t('decision.editDecision')}
          </h1>
          <p className="text-muted-foreground">{decision.nameEn}</p>
        </div>
      </div>

      {/* Form */}
      <DecisionForm
        initialData={decision}
        isEdit={true}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={updateLoading}
      />
    </div>
  );
};
