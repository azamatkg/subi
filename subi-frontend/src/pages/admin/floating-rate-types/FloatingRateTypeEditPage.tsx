import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TrendingUp, Loader2 } from 'lucide-react';

import { PageHeader } from '@/components/common/PageHeader';
import { FloatingRateTypeEditForm } from '@/components/floating-rate-types/FloatingRateTypeEditForm';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { useTranslation } from '@/hooks/useTranslation';
import { useFloatingRateTypeActions } from '@/hooks/useFloatingRateTypeActions';
import { useGetFloatingRateTypeByIdQuery } from '@/store/api/floatingRateTypeApi';
import type { FloatingRateTypeUpdateDto } from '@/types/floatingRateType';
import { ROUTES } from '@/constants';

export const FloatingRateTypeEditPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateFloatingRateType, isUpdating } = useFloatingRateTypeActions();

  const floatingRateTypeId = parseInt(id || '0', 10);

  const {
    data: floatingRateType,
    isLoading,
    isError,
    error,
  } = useGetFloatingRateTypeByIdQuery(floatingRateTypeId, {
    skip: !floatingRateTypeId,
  });

  const handleSubmit = async (id: number, data: FloatingRateTypeUpdateDto) => {
    try {
      await updateFloatingRateType(id, data);
      navigate(`${ROUTES.ADMIN}/floating-rate-types/${id}`);
    } catch (error) {
      // Error is handled by the hook
      console.error('Failed to update floating rate type:', error);
    }
  };

  const handleCancel = () => {
    navigate(floatingRateType ? `${ROUTES.ADMIN}/floating-rate-types/${floatingRateType.id}` : `${ROUTES.ADMIN}/floating-rate-types`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  if (isError || !floatingRateType) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={t('floatingRateType.editFloatingRateType')}
          icon={TrendingUp}
          breadcrumbs={[
            { label: t('navigation.admin'), href: ROUTES.ADMIN },
            { label: t('navigation.references'), href: `${ROUTES.ADMIN}/references` },
            { label: t('floatingRateType.floatingRateTypes'), href: `${ROUTES.ADMIN}/floating-rate-types` },
            { label: t('common.edit') },
          ]}
        />

        <Alert variant="destructive">
          <AlertDescription>
            {(error as any)?.data?.message || t('floatingRateType.messages.notFound')}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('floatingRateType.editFloatingRateType')}
        subtitle={floatingRateType.nameEn}
        icon={TrendingUp}
        breadcrumbs={[
          { label: t('navigation.admin'), href: ROUTES.ADMIN },
          { label: t('navigation.references'), href: `${ROUTES.ADMIN}/references` },
          { label: t('floatingRateType.floatingRateTypes'), href: `${ROUTES.ADMIN}/floating-rate-types` },
          { label: floatingRateType.nameEn, href: `${ROUTES.ADMIN}/floating-rate-types/${floatingRateType.id}` },
          { label: t('common.edit') },
        ]}
      />

      <FloatingRateTypeEditForm
        floatingRateType={floatingRateType}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={isUpdating}
      />
    </div>
  );
};