import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TrendingUp, Loader2, Edit, Trash, Percent, Calendar, Shield } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { PageHeader } from '@/components/common/PageHeader';
import { FloatingRateTypeDeleteDialog } from '@/components/floating-rate-types/FloatingRateTypeDeleteDialog';

import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/hooks/useAuth';
import { useFloatingRateTypeActions } from '@/hooks/useFloatingRateTypeActions';
import { useGetFloatingRateTypeByIdQuery } from '@/store/api/floatingRateTypeApi';
import type { FloatingRateCalculationType } from '@/types/floatingRateType';
import type { ReferenceEntityStatus } from '@/types/reference';
import { ROUTES } from '@/constants';
import { cn } from '@/lib/utils';

export const FloatingRateTypeDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    deleteDialogOpen,
    selectedFloatingRateType,
    error,
    isDeleting,
    isReferenced,
    referenceCount,
    handleEdit,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
  } = useFloatingRateTypeActions();

  const floatingRateTypeId = parseInt(id || '0', 10);

  const {
    data: floatingRateType,
    isLoading,
    isError,
    error: apiError,
  } = useGetFloatingRateTypeByIdQuery(floatingRateTypeId, {
    skip: !floatingRateTypeId,
  });

  const userRoles = user?.roles || [];
  const canEdit = userRoles.includes('ADMIN');
  const canDelete = userRoles.includes('ADMIN');

  const getStatusBadgeColor = (status: ReferenceEntityStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'INACTIVE':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getRateCalculationTypeBadgeColor = (type: FloatingRateCalculationType) => {
    switch (type) {
      case 'FIXED_SPREAD':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'VARIABLE_SPREAD':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'BASE_RATE_PLUS':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'MARKET_LINKED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'INDEXED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'TIERED':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatSpreadRange = (min?: number, max?: number) => {
    if (min !== undefined && max !== undefined) {
      return `${min}% - ${max}%`;
    }
    if (min !== undefined) {
      return `${min}%+`;
    }
    if (max !== undefined) {
      return `≤${max}%`;
    }
    return t('common.notSpecified');
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
          title={t('floatingRateType.floatingRateTypeDetails')}
          icon={TrendingUp}
          breadcrumbs={[
            { label: t('navigation.admin'), href: ROUTES.ADMIN },
            { label: t('navigation.references'), href: `${ROUTES.ADMIN}/references` },
            { label: t('floatingRateType.floatingRateTypes'), href: `${ROUTES.ADMIN}/floating-rate-types` },
            { label: t('common.details') },
          ]}
        />

        <Alert variant="destructive">
          <AlertDescription>
            {(apiError as any)?.data?.message || t('floatingRateType.messages.notFound')}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={floatingRateType.nameEn}
        subtitle={t('floatingRateType.floatingRateTypeDetails')}
        icon={TrendingUp}
        breadcrumbs={[
          { label: t('navigation.admin'), href: ROUTES.ADMIN },
          { label: t('navigation.references'), href: `${ROUTES.ADMIN}/references` },
          { label: t('floatingRateType.floatingRateTypes'), href: `${ROUTES.ADMIN}/floating-rate-types` },
          { label: floatingRateType.nameEn },
        ]}
        actions={
          <div className="flex gap-2">
            {canEdit && (
              <Button onClick={() => handleEdit(floatingRateType.id)}>
                <Edit className="h-4 w-4 mr-2" />
                {t('common.edit')}
              </Button>
            )}
            {canDelete && (
              <Button
                variant="destructive"
                onClick={() => handleDeleteClick(floatingRateType)}
              >
                <Trash className="h-4 w-4 mr-2" />
                {t('common.delete')}
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>{t('common.basicInformation')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    {t('floatingRateType.fields.nameEn')}
                  </label>
                  <p className="text-sm text-gray-900">{floatingRateType.nameEn}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    {t('floatingRateType.fields.nameRu')}
                  </label>
                  <p className="text-sm text-gray-900">{floatingRateType.nameRu}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    {t('floatingRateType.fields.nameKg')}
                  </label>
                  <p className="text-sm text-gray-900">{floatingRateType.nameKg}</p>
                </div>
              </div>

              {floatingRateType.description && (
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    {t('floatingRateType.fields.description')}
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 rounded-md p-3">
                    {floatingRateType.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rate Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>{t('floatingRateType.sections.rateConfiguration')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    {t('floatingRateType.fields.rateCalculationType')}
                  </label>
                  <div className="mt-1">
                    <Badge
                      variant="outline"
                      className={cn("text-sm", getRateCalculationTypeBadgeColor(floatingRateType.rateCalculationType))}
                    >
                      {t(`floatingRateType.rateCalculationTypes.${floatingRateType.rateCalculationType?.toLowerCase()}`)}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                    <Percent className="h-3 w-3" />
                    {t('floatingRateType.fields.spreadRange')}
                  </label>
                  <p className="text-sm text-gray-900 font-medium">
                    {formatSpreadRange(floatingRateType.spreadMin, floatingRateType.spreadMax)}
                  </p>
                </div>
              </div>

              {floatingRateType.baseRateDescription && (
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    {t('floatingRateType.fields.baseRateDescription')}
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 rounded-md p-3">
                    {floatingRateType.baseRateDescription}
                  </p>
                </div>
              )}

              {(floatingRateType.spreadMin !== undefined || floatingRateType.spreadMax !== undefined) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {floatingRateType.spreadMin !== undefined && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        {t('floatingRateType.fields.spreadMin')}
                      </label>
                      <p className="text-sm text-gray-900">{floatingRateType.spreadMin}%</p>
                    </div>
                  )}
                  {floatingRateType.spreadMax !== undefined && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        {t('floatingRateType.fields.spreadMax')}
                      </label>
                      <p className="text-sm text-gray-900">{floatingRateType.spreadMax}%</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>{t('common.status')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Badge
                  variant="outline"
                  className={cn("text-sm", getStatusBadgeColor(floatingRateType.status))}
                >
                  {t(`references.status.${floatingRateType.status?.toLowerCase()}`)}
                </Badge>
              </div>

              <Separator />

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-600">{t('common.createdAt')}</p>
                    <p className="text-gray-900">{new Date(floatingRateType.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-600">{t('common.updatedAt')}</p>
                    <p className="text-gray-900">{new Date(floatingRateType.updatedAt).toLocaleString()}</p>
                  </div>
                </div>

                {floatingRateType.createdByUsername && (
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-600">{t('common.createdBy')}</p>
                      <p className="text-gray-900">{floatingRateType.createdByUsername}</p>
                    </div>
                  </div>
                )}

                {floatingRateType.updatedByUsername && (
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-600">{t('common.updatedBy')}</p>
                      <p className="text-gray-900">{floatingRateType.updatedByUsername}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Dialog */}
      <FloatingRateTypeDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={() => {}}
        floatingRateType={selectedFloatingRateType}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        loading={isDeleting}
        isReferenced={isReferenced}
        referenceCount={referenceCount}
        error={error}
      />
    </div>
  );
};