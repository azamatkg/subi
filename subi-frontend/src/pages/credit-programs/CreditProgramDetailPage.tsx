import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash,
  FileText,
  Calendar,
  Hash,
  DollarSign,
  CreditCard,
  Clock,
  Shield,
  User,
  Building,
  Loader2,
  Play,
  Pause,
  X as CloseIcon,
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

import { useTranslation } from '@/hooks/useTranslation';
import { useSetPageTitle } from '@/hooks/useSetPageTitle';
import {
  useGetCreditProgramByIdQuery,
  useDeleteCreditProgramMutation,
  useActivateCreditProgramMutation,
  useSuspendCreditProgramMutation,
  useCloseCreditProgramMutation,
} from '@/store/api/creditProgramApi';
import type { ProgramStatus } from '@/types/creditProgram';
import { ProgramStatus as ProgramStatusEnum } from '@/types/creditProgram';
import { ROUTES } from '@/constants';

export const CreditProgramDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  useSetPageTitle(t('creditProgram.programDetails'));

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const {
    data: program,
    isLoading,
    error,
  } = useGetCreditProgramByIdQuery(id!, {
    skip: !id,
  });

  const [deleteProgram, { isLoading: deleteLoading }] =
    useDeleteCreditProgramMutation();
  const [activateProgram, { isLoading: activateLoading }] =
    useActivateCreditProgramMutation();
  const [suspendProgram, { isLoading: suspendLoading }] =
    useSuspendCreditProgramMutation();
  const [closeProgram, { isLoading: closeLoading }] =
    useCloseCreditProgramMutation();

  const handleBack = () => {
    navigate(ROUTES.CREDIT_PROGRAMS);
  };

  const handleEdit = () => {
    if (id) {
      navigate(`${ROUTES.CREDIT_PROGRAMS}/${id}/edit`);
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!id) return;

    try {
      await deleteProgram(id).unwrap();
      toast.success(t('creditProgram.messages.programDeleted'));
      navigate(ROUTES.CREDIT_PROGRAMS);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && 'data' in error
          ? (error as { data?: { message?: string } }).data?.message
          : undefined;
      toast.error(errorMessage || t('common.error'));
    }
  };

  const handleActivate = async () => {
    if (!id) return;

    try {
      await activateProgram(id).unwrap();
      toast.success(t('creditProgram.messages.programActivated'));
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && 'data' in error
          ? (error as { data?: { message?: string } }).data?.message
          : undefined;
      toast.error(errorMessage || t('common.error'));
    }
  };

  const handleSuspend = async () => {
    if (!id) return;

    try {
      await suspendProgram({ id }).unwrap();
      toast.success(t('creditProgram.messages.programSuspended'));
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && 'data' in error
          ? (error as { data?: { message?: string } }).data?.message
          : undefined;
      toast.error(errorMessage || t('common.error'));
    }
  };

  const handleClose = async () => {
    if (!id) return;

    try {
      await closeProgram({ id }).unwrap();
      toast.success(t('creditProgram.messages.programClosed'));
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && 'data' in error
          ? (error as { data?: { message?: string } }).data?.message
          : undefined;
      toast.error(errorMessage || t('common.error'));
    }
  };

  // Status badge component
  const StatusBadge: React.FC<{ status: ProgramStatus }> = ({ status }) => {
    const getStatusColor = (status: ProgramStatus) => {
      switch (status) {
        case ProgramStatusEnum.DRAFT:
          return 'secondary';
        case ProgramStatusEnum.PENDING_APPROVAL:
          return 'default';
        case ProgramStatusEnum.APPROVED:
          return 'default';
        case ProgramStatusEnum.ACTIVE:
          return 'default';
        case ProgramStatusEnum.SUSPENDED:
          return 'destructive';
        case ProgramStatusEnum.CLOSED:
          return 'outline';
        case ProgramStatusEnum.CANCELLED:
          return 'destructive';
        case ProgramStatusEnum.REJECTED:
          return 'destructive';
        default:
          return 'secondary';
      }
    };

    return (
      <Badge variant={getStatusColor(status)}>
        {t(`creditProgram.status.${status.toLowerCase()}`)}
      </Badge>
    );
  };

  // Format currency display
  const formatCurrency = (amount: number | undefined, currencyCode: string) => {
    if (amount === undefined || amount === null) return 'N/A';
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format percentage display
  const formatPercentage = (value: number | undefined) => {
    if (value === undefined || value === null) return 'N/A';
    return `${value}%`;
  };

  if (!id) {
    return (
      <Card>
        <CardContent className='p-6'>
          <p className='text-center text-muted-foreground'>
            {t('errors.notFound')}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className='p-6'>
          <div className='flex items-center justify-center space-x-2'>
            <Loader2 className='h-4 w-4 animate-spin' />
            <span>{t('creditProgram.messages.loadingPrograms')}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !program) {
    return (
      <Card>
        <CardContent className='p-6'>
          <p className='text-center text-destructive'>
            {t('errors.serverError')}
          </p>
        </CardContent>
      </Card>
    );
  }

  const canActivate = [
    ProgramStatusEnum.APPROVED,
    ProgramStatusEnum.SUSPENDED,
  ].includes(program.status);
  const canSuspend = program.status === ProgramStatusEnum.ACTIVE;
  const canClose = [
    ProgramStatusEnum.ACTIVE,
    ProgramStatusEnum.SUSPENDED,
  ].includes(program.status);
  const canEdit = ![
    ProgramStatusEnum.CLOSED,
    ProgramStatusEnum.CANCELLED,
  ].includes(program.status);
  const canDelete = program.canBeDeleted;

  return (
    <div className='space-y-6'>
      {/* Page Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-4'>
          <Button variant='ghost' size='sm' onClick={handleBack}>
            <ArrowLeft className='mr-2 h-4 w-4' />
            {t('common.back')}
          </Button>
          <div>
            <h1 className='text-2xl font-semibold'>{program.nameEn}</h1>
            <p className='text-muted-foreground'>
              {t('creditProgram.programDetails')}
            </p>
          </div>
        </div>

        <div className='flex items-center space-x-2'>
          {canActivate && (
            <Button
              variant='outline'
              onClick={handleActivate}
              disabled={activateLoading}
            >
              <Play className='mr-2 h-4 w-4' />
              {activateLoading ? t('common.activating') : t('common.activate')}
            </Button>
          )}
          {canSuspend && (
            <Button
              variant='outline'
              onClick={handleSuspend}
              disabled={suspendLoading}
            >
              <Pause className='mr-2 h-4 w-4' />
              {suspendLoading ? t('common.suspending') : t('common.suspend')}
            </Button>
          )}
          {canClose && (
            <Button
              variant='outline'
              onClick={handleClose}
              disabled={closeLoading}
            >
              <CloseIcon className='mr-2 h-4 w-4' />
              {closeLoading ? t('common.closing') : t('common.close')}
            </Button>
          )}
          {canEdit && (
            <Button variant='outline' onClick={handleEdit}>
              <Edit className='mr-2 h-4 w-4' />
              {t('common.edit')}
            </Button>
          )}
          {canDelete && (
            <Button variant='destructive' onClick={handleDeleteClick}>
              <Trash className='mr-2 h-4 w-4' />
              {t('common.delete')}
            </Button>
          )}
        </div>
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        {/* Main Information */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center space-x-2'>
                <FileText className='h-5 w-5' />
                <span>{t('creditProgram.basicInformation')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                <div className='space-y-2'>
                  <p className='text-sm font-medium text-muted-foreground'>
                    {t('creditProgram.fields.nameEn')}
                  </p>
                  <p className='font-medium'>{program.nameEn}</p>
                </div>

                <div className='space-y-2'>
                  <p className='text-sm font-medium text-muted-foreground'>
                    {t('creditProgram.fields.nameRu')}
                  </p>
                  <p className='font-medium'>{program.nameRu}</p>
                </div>

                <div className='space-y-2'>
                  <p className='text-sm font-medium text-muted-foreground'>
                    {t('creditProgram.fields.nameKg')}
                  </p>
                  <p className='font-medium'>{program.nameKg}</p>
                </div>
              </div>

              {program.description && (
                <>
                  <Separator />
                  <div className='space-y-2'>
                    <p className='text-sm font-medium text-muted-foreground'>
                      {t('creditProgram.fields.description')}
                    </p>
                    <p className='text-sm leading-relaxed bg-muted/50 p-3 rounded-lg'>
                      {program.description}
                    </p>
                  </div>
                </>
              )}

              <Separator />

              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div className='space-y-2'>
                  <p className='text-sm font-medium text-muted-foreground'>
                    {t('creditProgram.fields.creditPurpose')}
                  </p>
                  <div className='space-y-1'>
                    <p className='font-medium'>{program.creditPurposeNameEn}</p>
                    <p className='text-sm text-muted-foreground'>
                      {program.creditPurposeNameRu}
                    </p>
                    <p className='text-sm text-muted-foreground'>
                      {program.creditPurposeNameKg}
                    </p>
                  </div>
                </div>

                <div className='space-y-2'>
                  <p className='text-sm font-medium text-muted-foreground'>
                    {t('creditProgram.fields.validityPeriod')}
                  </p>
                  <div className='space-y-1'>
                    {program.validFrom && (
                      <p className='text-sm'>
                        {t('common.from')}:{' '}
                        {new Date(program.validFrom).toLocaleDateString()}
                      </p>
                    )}
                    {program.validTo && (
                      <p className='text-sm'>
                        {t('common.to')}:{' '}
                        {new Date(program.validTo).toLocaleDateString()}
                      </p>
                    )}
                    {!program.validFrom && !program.validTo && (
                      <p className='text-sm text-muted-foreground'>
                        {t('common.unlimited')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Details */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center space-x-2'>
                <DollarSign className='h-5 w-5' />
                <span>{t('creditProgram.financialDetails')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div className='space-y-2'>
                  <p className='text-sm font-medium text-muted-foreground'>
                    {t('creditProgram.fields.currency')}
                  </p>
                  <div className='space-y-1'>
                    <p className='font-medium font-mono'>
                      {program.currencyCode}
                    </p>
                    <p className='text-sm text-muted-foreground'>
                      {program.currencyNameEn}
                    </p>
                  </div>
                </div>

                <div className='space-y-2'>
                  <p className='text-sm font-medium text-muted-foreground'>
                    {t('creditProgram.fields.amountRange')}
                  </p>
                  <div className='space-y-1'>
                    <p className='font-medium'>
                      {formatCurrency(program.amountMin, program.currencyCode)}{' '}
                      -{' '}
                      {formatCurrency(program.amountMax, program.currencyCode)}
                    </p>
                    {program.fixedAmounts.length > 0 && (
                      <p className='text-sm text-muted-foreground'>
                        {t('creditProgram.fields.fixedAmounts')}:{' '}
                        {program.fixedAmounts
                          .map(amount =>
                            formatCurrency(amount, program.currencyCode)
                          )
                          .join(', ')}
                      </p>
                    )}
                  </div>
                </div>

                <div className='space-y-2'>
                  <p className='text-sm font-medium text-muted-foreground'>
                    {t('creditProgram.fields.termRange')}
                  </p>
                  <div className='space-y-1'>
                    <p className='font-medium'>
                      {program.termMin || 'N/A'} - {program.termMax || 'N/A'}{' '}
                      {t('common.months')}
                    </p>
                    {program.fixedTerms.length > 0 && (
                      <p className='text-sm text-muted-foreground'>
                        {t('creditProgram.fields.fixedTerms')}:{' '}
                        {program.fixedTerms.join(', ')} {t('common.months')}
                      </p>
                    )}
                  </div>
                </div>

                <div className='space-y-2'>
                  <p className='text-sm font-medium text-muted-foreground'>
                    {t('creditProgram.fields.interestRate')}
                  </p>
                  <div className='space-y-1'>
                    <p className='font-medium'>
                      {formatPercentage(program.interestRateFixed)}
                    </p>
                    {program.interestRateTypeNameEn && (
                      <p className='text-sm text-muted-foreground'>
                        {program.interestRateTypeNameEn}
                      </p>
                    )}
                  </div>
                </div>

                <div className='space-y-2'>
                  <p className='text-sm font-medium text-muted-foreground'>
                    {t('creditProgram.fields.processingFee')}
                  </p>
                  <div className='space-y-1'>
                    {program.processingFee && (
                      <p className='font-medium'>
                        {formatCurrency(
                          program.processingFee,
                          program.currencyCode
                        )}
                      </p>
                    )}
                    {program.processingFeePercentage && (
                      <p className='font-medium'>
                        {formatPercentage(program.processingFeePercentage)}
                      </p>
                    )}
                    {!program.processingFee &&
                      !program.processingFeePercentage && (
                        <p className='text-sm text-muted-foreground'>
                          {t('common.none')}
                        </p>
                      )}
                  </div>
                </div>

                <div className='space-y-2'>
                  <p className='text-sm font-medium text-muted-foreground'>
                    {t('creditProgram.fields.penaltyRates')}
                  </p>
                  <div className='space-y-1'>
                    {program.penaltyRatePrincipalFixed && (
                      <p className='text-sm'>
                        {t('creditProgram.fields.principalPenalty')}:{' '}
                        {formatPercentage(program.penaltyRatePrincipalFixed)}
                      </p>
                    )}
                    {program.penaltyRateInterestFixed && (
                      <p className='text-sm'>
                        {t('creditProgram.fields.interestPenalty')}:{' '}
                        {formatPercentage(program.penaltyRateInterestFixed)}
                      </p>
                    )}
                    {!program.penaltyRatePrincipalFixed &&
                      !program.penaltyRateInterestFixed && (
                        <p className='text-sm text-muted-foreground'>
                          {t('common.none')}
                        </p>
                      )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment & Scheduling */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center space-x-2'>
                <Clock className='h-5 w-5' />
                <span>{t('creditProgram.paymentScheduling')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div className='space-y-2'>
                  <p className='text-sm font-medium text-muted-foreground'>
                    {t('creditProgram.fields.paymentFrequency')}
                  </p>
                  <p className='font-medium'>
                    {program.paymentFrequencyMonths
                      ? `${t('common.every')} ${program.paymentFrequencyMonths} ${t('common.months')}`
                      : 'N/A'}
                  </p>
                </div>

                <div className='space-y-2'>
                  <p className='text-sm font-medium text-muted-foreground'>
                    {t('creditProgram.fields.numberOfInstallments')}
                  </p>
                  <p className='font-medium'>
                    {program.numberOfInstallments || 'N/A'}
                  </p>
                </div>

                <div className='space-y-2'>
                  <p className='text-sm font-medium text-muted-foreground'>
                    {t('creditProgram.fields.firstInstallmentDay')}
                  </p>
                  <p className='font-medium'>
                    {program.firstInstallmentDay
                      ? `${t('common.day')} ${program.firstInstallmentDay}`
                      : 'N/A'}
                  </p>
                </div>

                <div className='space-y-2'>
                  <p className='text-sm font-medium text-muted-foreground'>
                    {t('creditProgram.fields.repaymentOrder')}
                  </p>
                  <div className='space-y-1'>
                    <p className='font-medium'>
                      {program.repaymentOrderNameEn}
                    </p>
                    <p className='text-sm text-muted-foreground'>
                      {program.repaymentOrderNameRu}
                    </p>
                  </div>
                </div>
              </div>

              {/* Grace Period */}
              {(program.gracePeriodPrincipal ||
                program.gracePeriodInterest ||
                program.gracePeriodAccrual) && (
                <>
                  <Separator />
                  <div>
                    <p className='text-sm font-medium text-muted-foreground mb-2'>
                      {t('creditProgram.fields.gracePeriod')}
                    </p>
                    <div className='grid grid-cols-1 gap-2 md:grid-cols-3'>
                      {program.gracePeriodPrincipal && (
                        <p className='text-sm'>
                          {t('creditProgram.fields.principalGracePeriod')}:{' '}
                          {program.gracePeriodPrincipal} {t('common.days')}
                        </p>
                      )}
                      {program.gracePeriodInterest && (
                        <p className='text-sm'>
                          {t('creditProgram.fields.interestGracePeriod')}:{' '}
                          {program.gracePeriodInterest} {t('common.days')}
                        </p>
                      )}
                      {program.gracePeriodAccrual && (
                        <p className='text-sm'>
                          {t('creditProgram.fields.accrualGracePeriod')}:{' '}
                          {program.gracePeriodAccrual} {t('common.days')}
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Custom Payment Months */}
              {program.customPaymentMonths.length > 0 && (
                <>
                  <Separator />
                  <div className='space-y-2'>
                    <p className='text-sm font-medium text-muted-foreground'>
                      {t('creditProgram.fields.customPaymentMonths')}
                    </p>
                    <p className='text-sm'>
                      {program.customPaymentMonths.join(', ')}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center space-x-2'>
                <Shield className='h-5 w-5' />
                <span>{t('creditProgram.requirements')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-4'>
                <div className='space-y-2'>
                  <p className='text-sm font-medium text-muted-foreground'>
                    {t('creditProgram.fields.collateralRequired')}
                  </p>
                  <Badge
                    variant={program.collateralRequired ? 'default' : 'outline'}
                  >
                    {program.collateralRequired
                      ? t('common.yes')
                      : t('common.no')}
                  </Badge>
                </div>

                {program.collateralRequired && (
                  <>
                    {program.acceptedCollateralTypes.length > 0 && (
                      <div className='space-y-2'>
                        <p className='text-sm font-medium text-muted-foreground'>
                          {t('creditProgram.fields.acceptedCollateralTypes')}
                        </p>
                        <div className='flex flex-wrap gap-2'>
                          {program.acceptedCollateralTypes.map(type => (
                            <Badge key={type} variant='outline'>
                              {t(
                                `creditProgram.collateralType.${type.toLowerCase()}`
                              )}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {program.minimumCollateralCoverageRatio && (
                      <div className='space-y-2'>
                        <p className='text-sm font-medium text-muted-foreground'>
                          {t('creditProgram.fields.minimumCollateralCoverage')}
                        </p>
                        <p className='font-medium'>
                          {formatPercentage(
                            program.minimumCollateralCoverageRatio
                          )}
                        </p>
                      </div>
                    )}

                    {(program.collateralValuationRequirementsEn ||
                      program.collateralValuationRequirementsRu ||
                      program.collateralValuationRequirementsKg) && (
                      <div className='space-y-2'>
                        <p className='text-sm font-medium text-muted-foreground'>
                          {t(
                            'creditProgram.fields.collateralValuationRequirements'
                          )}
                        </p>
                        <div className='space-y-2'>
                          {program.collateralValuationRequirementsEn && (
                            <div>
                              <p className='text-xs text-muted-foreground'>
                                EN:
                              </p>
                              <p className='text-sm bg-muted/50 p-2 rounded'>
                                {program.collateralValuationRequirementsEn}
                              </p>
                            </div>
                          )}
                          {program.collateralValuationRequirementsRu && (
                            <div>
                              <p className='text-xs text-muted-foreground'>
                                RU:
                              </p>
                              <p className='text-sm bg-muted/50 p-2 rounded'>
                                {program.collateralValuationRequirementsRu}
                              </p>
                            </div>
                          )}
                          {program.collateralValuationRequirementsKg && (
                            <div>
                              <p className='text-xs text-muted-foreground'>
                                KG:
                              </p>
                              <p className='text-sm bg-muted/50 p-2 rounded'>
                                {program.collateralValuationRequirementsKg}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}

                <Separator />

                <div className='space-y-2'>
                  <p className='text-sm font-medium text-muted-foreground'>
                    {t('creditProgram.fields.applicantList')}
                  </p>
                  {program.applicantList.length > 0 ? (
                    <div className='flex flex-wrap gap-2'>
                      {program.applicantList.map((applicant, index) => (
                        <Badge key={index} variant='outline'>
                          {applicant}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className='text-sm text-muted-foreground'>
                      {t('common.none')}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className='space-y-6'>
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>{t('creditProgram.fields.status')}</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <StatusBadge status={program.status} />
              <div className='space-y-2'>
                <div className='flex items-center space-x-2'>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      program.isActive ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                  />
                  <span className='text-sm'>
                    {program.isActive
                      ? t('common.active')
                      : t('common.inactive')}
                  </span>
                </div>
                <div className='flex items-center space-x-2'>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      program.isAvailableForApplications
                        ? 'bg-blue-500'
                        : 'bg-gray-400'
                    }`}
                  />
                  <span className='text-sm'>
                    {program.isAvailableForApplications
                      ? t('creditProgram.availableForApplications')
                      : t('creditProgram.notAvailableForApplications')}
                  </span>
                </div>
                <div className='flex items-center space-x-2'>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      program.isWithinValidityPeriod
                        ? 'bg-green-500'
                        : 'bg-orange-500'
                    }`}
                  />
                  <span className='text-sm'>
                    {program.isWithinValidityPeriod
                      ? t('creditProgram.withinValidityPeriod')
                      : t('creditProgram.outsideValidityPeriod')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Decision Information */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center space-x-2'>
                <Building className='h-5 w-5' />
                <span>{t('creditProgram.relatedDecision')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='space-y-2'>
                <p className='text-sm font-medium text-muted-foreground'>
                  {t('decision.fields.number')}
                </p>
                <p className='font-mono text-sm'>{program.decisionNumber}</p>
              </div>
              <div className='space-y-2'>
                <p className='text-sm font-medium text-muted-foreground'>
                  {t('decision.fields.nameEn')}
                </p>
                <div className='space-y-1'>
                  <p className='font-medium text-sm'>
                    {program.decisionNameEn}
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    {program.decisionNameRu}
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    {program.decisionNameKg}
                  </p>
                </div>
              </div>
              <Button
                variant='outline'
                size='sm'
                className='w-full'
                onClick={() =>
                  navigate(`${ROUTES.DECISIONS}/${program.decisionId}`)
                }
              >
                {t('decision.viewDecision')}
              </Button>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center space-x-2'>
                <User className='h-5 w-5' />
                <span>{t('common.metadata')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <p className='text-sm font-medium text-muted-foreground flex items-center space-x-2'>
                  <Calendar className='h-4 w-4' />
                  <span>{t('common.createdAt')}</span>
                </p>
                <p className='text-sm'>
                  {new Date(program.createdAt).toLocaleDateString()}
                </p>
                <p className='text-xs text-muted-foreground'>
                  {t('common.by')} {program.createdByUsername}
                </p>
              </div>

              <Separator />

              <div className='space-y-2'>
                <p className='text-sm font-medium text-muted-foreground flex items-center space-x-2'>
                  <Calendar className='h-4 w-4' />
                  <span>{t('common.updatedAt')}</span>
                </p>
                <p className='text-sm'>
                  {new Date(program.updatedAt).toLocaleDateString()}
                </p>
                <p className='text-xs text-muted-foreground'>
                  {t('common.by')} {program.updatedByUsername}
                </p>
              </div>

              <Separator />

              <div className='space-y-2'>
                <p className='text-sm font-medium text-muted-foreground flex items-center space-x-2'>
                  <Hash className='h-4 w-4' />
                  <span>{t('common.version')}</span>
                </p>
                <p className='font-mono text-sm'>{program.version}</p>
              </div>

              <div className='space-y-2'>
                <p className='text-sm font-medium text-muted-foreground flex items-center space-x-2'>
                  <CreditCard className='h-4 w-4' />
                  <span>{t('creditProgram.applicationCount')}</span>
                </p>
                <p className='font-medium text-sm'>
                  {program.applicationCount}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('common.confirm')}</DialogTitle>
            <DialogDescription>
              {t('creditProgram.messages.confirmDelete', {
                item: `"${program.nameEn}"`,
              })}
            </DialogDescription>
          </DialogHeader>
          <div className='flex justify-end space-x-2'>
            <Button
              variant='outline'
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteLoading}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant='destructive'
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
