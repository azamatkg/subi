import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';

import { PageHeader } from '@/components/common/PageHeader';
import { FloatingRateTypeCreateForm } from '@/components/floating-rate-types/FloatingRateTypeCreateForm';

import { useTranslation } from '@/hooks/useTranslation';
import { useFloatingRateTypeActions } from '@/hooks/useFloatingRateTypeActions';
import type { FloatingRateTypeCreateDto } from '@/types/floatingRateType';
import { ROUTES } from '@/constants';

export const FloatingRateTypeCreatePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { createFloatingRateType, isCreating } = useFloatingRateTypeActions();

  const handleSubmit = async (data: FloatingRateTypeCreateDto) => {
    try {
      const result = await createFloatingRateType(data);
      navigate(`${ROUTES.ADMIN}/floating-rate-types/${result.id}`);
    } catch (error) {
      // Error is handled by the hook
      console.error('Failed to create floating rate type:', error);
    }
  };

  const handleCancel = () => {
    navigate(`${ROUTES.ADMIN}/floating-rate-types`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('floatingRateType.newFloatingRateType')}
        subtitle={t('floatingRateType.createDescription')}
        icon={TrendingUp}
        breadcrumbs={[
          { label: t('navigation.admin'), href: ROUTES.ADMIN },
          { label: t('navigation.references'), href: `${ROUTES.ADMIN}/references` },
          { label: t('floatingRateType.floatingRateTypes'), href: `${ROUTES.ADMIN}/floating-rate-types` },
          { label: t('common.create') },
        ]}
      />

      <FloatingRateTypeCreateForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={isCreating}
      />
    </div>
  );
};