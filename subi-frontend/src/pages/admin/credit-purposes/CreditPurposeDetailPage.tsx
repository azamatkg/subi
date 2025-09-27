import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Target, ArrowLeft, Edit, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { useTranslation } from '@/hooks/useTranslation';
import { useSetPageTitle } from '@/hooks/useSetPageTitle';
import { useAuth } from '@/hooks/useAuth';
import { useCreditPurposeActions } from '@/hooks/useCreditPurposeActions';
import { useGetCreditPurposeByIdQuery } from '@/store/api/creditPurposeApi';
import { CreditPurposeDeleteDialog } from '@/components/credit-purposes/CreditPurposeDeleteDialog';
import { ROUTES } from '@/constants';

export const CreditPurposeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();

  const creditPurposeId = parseInt(id || '0', 10);

  const {
    data: creditPurpose,
    isLoading,
    error,
  } = useGetCreditPurposeByIdQuery(creditPurposeId, {
    skip: !creditPurposeId,
  });

  const {
    deleteDialogOpen,
    selectedCreditPurpose,
    isDeleting,
    isReferenced,
    referenceCount,
    error: deleteError,
    handleEdit,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
  } = useCreditPurposeActions();

  useSetPageTitle(
    creditPurpose ? creditPurpose.nameEn : t('creditPurpose.creditPurposeDetails')
  );

  // Permissions
  const userRoles = user?.roles || [];
  const canEdit = userRoles.includes('ADMIN');
  const canDelete = userRoles.includes('ADMIN');

  const handleBack = () => {
    navigate(`${ROUTES.ADMIN}/credit-purposes`);
  };

  const handleEditClick = () => {
    if (creditPurpose) {
      handleEdit(creditPurpose.id);
    }
  };

  const handleDeleteCreditPurpose = () => {
    if (creditPurpose) {
      handleDeleteClick(creditPurpose);
    }
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
              <Button onClick={handleBack}>
                {t('common.goBack')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'default';
      case 'INACTIVE':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getCategoryBadgeVariant = (category: string) => {
    switch (category) {
      case 'CONSUMER':
        return 'default';
      case 'BUSINESS':
        return 'secondary';
      case 'AGRICULTURAL':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{creditPurpose.nameEn}</h1>
                <p className="text-gray-500">
                  {t('creditPurpose.creditPurposeDetails')}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canEdit && (
              <Button
                variant="outline"
                onClick={handleEditClick}
              >
                <Edit className="h-4 w-4 mr-2" />
                {t('common.edit')}
              </Button>
            )}
            {canDelete && (
              <Button
                variant="outline"
                onClick={handleDeleteCreditPurpose}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t('common.delete')}
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>{t('common.basicInformation')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  {t('common.nameEn')}
                </label>
                <p className="text-sm font-medium">{creditPurpose.nameEn}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">
                  {t('common.nameRu')}
                </label>
                <p className="text-sm font-medium">{creditPurpose.nameRu}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">
                  {t('common.nameKg')}
                </label>
                <p className="text-sm font-medium">{creditPurpose.nameKg}</p>
              </div>

              {creditPurpose.description && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    {t('common.description')}
                  </label>
                  <p className="text-sm">{creditPurpose.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status and Category */}
          <Card>
            <CardHeader>
              <CardTitle>{t('common.statusAndCategory')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  {t('common.status')}
                </label>
                <div className="mt-1">
                  <Badge variant={getStatusBadgeVariant(creditPurpose.status)}>
                    {t(`creditPurpose.status.${creditPurpose.status?.toLowerCase() || 'unknown'}`)}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">
                  {t('creditPurpose.category')}
                </label>
                <div className="mt-1">
                  <Badge variant={getCategoryBadgeVariant(creditPurpose.category)}>
                    {t(`creditPurpose.categories.${creditPurpose.category?.toLowerCase() || 'unknown'}`)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>{t('common.metadata')}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  {t('common.createdAt')}
                </label>
                <p className="text-sm">
                  {new Date(creditPurpose.createdAt).toLocaleString()}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">
                  {t('common.updatedAt')}
                </label>
                <p className="text-sm">
                  {new Date(creditPurpose.updatedAt).toLocaleString()}
                </p>
              </div>

              {creditPurpose.createdByUsername && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    {t('common.createdBy')}
                  </label>
                  <p className="text-sm">{creditPurpose.createdByUsername}</p>
                </div>
              )}

              {creditPurpose.updatedByUsername && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    {t('common.updatedBy')}
                  </label>
                  <p className="text-sm">{creditPurpose.updatedByUsername}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Delete Dialog */}
        <CreditPurposeDeleteDialog
          open={deleteDialogOpen}
          onOpenChange={() => {}}
          creditPurpose={selectedCreditPurpose}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          isDeleting={isDeleting}
          isReferenced={isReferenced}
          referenceCount={referenceCount}
          error={deleteError}
        />
      </div>
    </div>
  );
};