import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash,
  FileText,
  Calendar,
  Hash,
  Building,
  Tag,
  StickyNote,
  Loader2,
  CreditCard,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { useTranslation } from '@/hooks/useTranslation';
import { useSetPageTitle } from '@/hooks/useSetPageTitle';
import {
  useGetDecisionByIdQuery,
  useDeleteDecisionMutation,
} from '@/store/api/decisionApi';
import type { DecisionStatus } from '@/types/decision';
import { DecisionStatus as DecisionStatusEnum } from '@/types/decision';
import { ROUTES } from '@/constants';

export const DecisionDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  useSetPageTitle('Детали решения');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const {
    data: decision,
    isLoading: decisionLoading,
    error: decisionError,
  } = useGetDecisionByIdQuery(id!, {
    skip: !id,
  });

  const [deleteDecision, { isLoading: deleteLoading }] =
    useDeleteDecisionMutation();

  const handleBack = () => {
    navigate(ROUTES.DECISIONS);
  };

  const handleEdit = () => {
    if (id) {
      navigate(`${ROUTES.DECISIONS}/${id}/edit`);
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!id) return;

    try {
      await deleteDecision(id).unwrap();
      toast.success(t('decision.messages.decisionDeleted'));
      navigate(ROUTES.DECISIONS);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && 'data' in error
          ? (error as { data?: { message?: string } }).data?.message
          : undefined;
      toast.error(errorMessage || t('common.error'));
    }
  };

  // Status badge component
  const StatusBadge: React.FC<{ status: DecisionStatus }> = ({ status }) => {
    const getStatusColor = (status: DecisionStatus) => {
      switch (status) {
        case DecisionStatusEnum.DRAFT:
          return 'secondary';
        case DecisionStatusEnum.PENDING_CONFIRMATION:
          return 'default';
        case DecisionStatusEnum.APPROVED:
          return 'default';
        case DecisionStatusEnum.REJECTED:
          return 'destructive';
        case DecisionStatusEnum.ACTIVE:
          return 'default';
        case DecisionStatusEnum.INACTIVE:
          return 'outline';
        default:
          return 'secondary';
      }
    };

    return (
      <Badge variant={getStatusColor(status)}>
        {t(`decision.status.${status.toLowerCase()}`)}
      </Badge>
    );
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('common.back')}
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">{decision.nameEn}</h1>
            <p className="text-muted-foreground">
              {t('decision.decisionDetails')}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            {t('common.edit')}
          </Button>
          <Button variant="destructive" onClick={handleDeleteClick}>
            <Trash className="mr-2 h-4 w-4" />
            {t('common.delete')}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="main" className="space-y-6">
        <TabsList className="inline-flex w-auto h-12 p-1">
          <TabsTrigger 
            value="main" 
            className="px-4 py-2 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
          >
            {t('common.main')}
          </TabsTrigger>
          <TabsTrigger 
            value="programs" 
            className="px-4 py-2 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
          >
            {t('common.programs')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="main" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Main Information */}
            <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>{t('decision.fields.nameEn')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {t('decision.fields.nameEn')}
                  </p>
                  <p className="font-medium">{decision.nameEn}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {t('decision.fields.nameRu')}
                  </p>
                  <p className="font-medium">{decision.nameRu}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {t('decision.fields.nameKg')}
                  </p>
                  <p className="font-medium">{decision.nameKg}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{t('decision.fields.date')}</span>
                  </p>
                  <p className="font-medium">
                    {new Date(decision.date).toLocaleDateString()}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground flex items-center space-x-2">
                    <Hash className="h-4 w-4" />
                    <span>{t('decision.fields.number')}</span>
                  </p>
                  <p className="font-medium font-mono">{decision.number}</p>
                </div>
              </div>

              {decision.note && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground flex items-center space-x-2">
                      <StickyNote className="h-4 w-4" />
                      <span>{t('decision.fields.note')}</span>
                    </p>
                    <p className="text-sm leading-relaxed bg-muted/50 p-3 rounded-lg">
                      {decision.note}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Classification Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Tag className="h-5 w-5" />
                <span>
                  {t('decision.decisionType')} &{' '}
                  {t('decision.decisionMakingBody')}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {t('decision.fields.decisionType')}
                  </p>
                  <div className="space-y-1">
                    <p className="font-medium">{decision.decisionTypeNameEn}</p>
                    <p className="text-sm text-muted-foreground">
                      {decision.decisionTypeNameRu}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {decision.decisionTypeNameKg}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground flex items-center space-x-2">
                    <Building className="h-4 w-4" />
                    <span>{t('decision.fields.decisionMakingBody')}</span>
                  </p>
                  <div className="space-y-1">
                    <p className="font-medium">
                      {decision.decisionMakingBodyNameEn}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {decision.decisionMakingBodyNameRu}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {decision.decisionMakingBodyNameKg}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>{t('decision.fields.status')}</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusBadge status={decision.status} />
            </CardContent>
          </Card>

          {/* Document Package */}
          {decision.documentPackageId && (
            <Card>
              <CardHeader>
                <CardTitle>{t('decision.fields.documentPackage')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-mono break-all bg-muted p-2 rounded">
                  {decision.documentPackageId}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>{t('common.quickActions')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleEdit}
              >
                <Edit className="mr-2 h-4 w-4" />
                {t('decision.editDecision')}
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-destructive hover:text-destructive"
                onClick={handleDeleteClick}
              >
                <Trash className="mr-2 h-4 w-4" />
                {t('common.delete')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
        </TabsContent>

        <TabsContent value="programs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>{t('common.programs')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <CreditCard className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>Функциональность в разработке</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('common.confirm')}</DialogTitle>
            <DialogDescription>
              {t('decision.messages.confirmDelete', {
                item: `"${decision.nameEn}"`,
              })}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteLoading}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteLoading}
            >
              {deleteLoading ? t('common.deleting') : t('common.delete')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
