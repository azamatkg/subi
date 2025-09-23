import React, { useState, useEffect } from 'react';
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
  Plus,
  Grid,
  List,
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
import { CreateCreditProgramDto } from '@/types/creditProgram';
import {
  useSearchAndFilterCreditProgramsQuery,
  useCreateCreditProgramMutation,
  useDeleteCreditProgramMutation,
  useActivateCreditProgramMutation,
  useSuspendCreditProgramMutation,
  useCloseCreditProgramMutation,
} from '@/store/api/creditProgramApi';
import type { DecisionStatus } from '@/types/decision';
import { DecisionStatus as DecisionStatusEnum } from '@/types/decision';
import type {
  CreditProgramResponseDto,
  CreditProgramFilterState,
  CreditProgramSearchAndFilterParams,
} from '@/types/creditProgram';
import { ROUTES, PAGINATION } from '@/constants';
import { CreditProgramFilters } from '@/components/credit-programs/CreditProgramFilters';
import { CreditProgramTable } from '@/components/credit-programs/CreditProgramTable';
import { CreditProgramCard } from '@/components/credit-programs/CreditProgramCard';
import { CreditProgramForm } from '@/components/credit-programs/CreditProgramForm';
import { getStoredViewMode, setStoredViewMode } from '@/utils/auth';

type SortField =
  | 'nameEn'
  | 'status'
  | 'currencyCode'
  | 'amountMin'
  | 'amountMax'
  | 'validFrom'
  | 'validTo';
type SortDirection = 'asc' | 'desc';
type ViewMode = 'table' | 'card';

export const DecisionDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  useSetPageTitle('Детали решения');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Programs tab state
  const [filters, setFilters] = useState<CreditProgramFilterState>({
    searchTerm: '',
    status: null,
    amountMin: null,
    amountMax: null,
    termMin: null,
    termMax: null,
    validFromStart: '',
    validFromEnd: '',
    validToStart: '',
    validToEnd: '',
    collateralRequired: null,
    activeOnly: false,
  });
  const [page, setPage] = useState(0);
  const [size, setSize] = useState<number>(PAGINATION.DEFAULT_PAGE_SIZE);
  const [sortField, setSortField] = useState<SortField>('nameEn');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return getStoredViewMode() || 'table';
  });
  const [isMobile, setIsMobile] = useState(false);
  const [selectedProgram, setSelectedProgram] =
    useState<CreditProgramResponseDto | null>(null);
  const [programDeleteDialogOpen, setProgramDeleteDialogOpen] = useState(false);

  const {
    data: decision,
    isLoading: decisionLoading,
    error: decisionError,
  } = useGetDecisionByIdQuery(id!, {
    skip: !id,
  });

  const [deleteDecision, { isLoading: deleteLoading }] =
    useDeleteDecisionMutation();

  // Programs API hooks
  const queryParams: CreditProgramSearchAndFilterParams = {
    decisionId: id!,
    page,
    size,
    sort: `${sortField},${sortDirection}`,
    ...(filters.searchTerm && { searchTerm: filters.searchTerm }),
    ...(filters.status && { status: filters.status }),
    ...(filters.amountMin !== null && { minAmount: filters.amountMin }),
    ...(filters.amountMax !== null && { maxAmount: filters.amountMax }),
    ...(filters.termMin !== null && { minTerm: filters.termMin }),
    ...(filters.termMax !== null && { maxTerm: filters.termMax }),
    ...(filters.validFromStart && { validFromStart: filters.validFromStart }),
    ...(filters.validFromEnd && { validFromEnd: filters.validFromEnd }),
    ...(filters.validToStart && { validToStart: filters.validToStart }),
    ...(filters.validToEnd && { validToEnd: filters.validToEnd }),
    ...(filters.collateralRequired !== null && {
      collateralRequired: filters.collateralRequired,
    }),
    ...(filters.activeOnly && { activeOnly: filters.activeOnly }),
  };

  const {
    data: programsData,
    isLoading: programsLoading,
    error: programsError,
  } = useSearchAndFilterCreditProgramsQuery(queryParams, {
    skip: !id,
  });

  const [createProgram, { isLoading: isCreating }] =
    useCreateCreditProgramMutation();
  const [deleteProgram, { isLoading: isDeletingProgram }] =
    useDeleteCreditProgramMutation();
  const [activateProgram] = useActivateCreditProgramMutation();
  const [suspendProgram] = useSuspendCreditProgramMutation();
  const [closeProgram] = useCloseCreditProgramMutation();

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

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const isMobileView = window.innerWidth < 768;
      setIsMobile(isMobileView);
      if (isMobileView && viewMode === 'table') {
        setViewMode('card');
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [viewMode]);

  // View mode handler
  const handleSetViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    setStoredViewMode(mode);
  };

  // Programs handlers
  const handleFiltersChange = (newFilters: CreditProgramFilterState) => {
    setFilters(newFilters);
    setPage(0);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setPage(0);
  };

  const handleCreateProgram = async (data: CreateCreditProgramDto) => {
    try {
      await createProgram(data).unwrap();
      toast.success(t('creditProgram.messages.programCreated'));
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && 'data' in error
          ? (error as { data?: { message?: string } }).data?.message
          : undefined;
      toast.error(errorMessage || t('common.error'));
      throw error;
    }
  };

  const handleViewProgram = (program: CreditProgramResponseDto) => {
    // Navigate to program detail page if it exists
    navigate(`${ROUTES.CREDIT_PROGRAMS}/${program.id}`);
  };

  const handleEditProgram = (program: CreditProgramResponseDto) => {
    // Navigate to program edit page if it exists
    navigate(`${ROUTES.CREDIT_PROGRAMS}/${program.id}/edit`);
  };

  const handleDeleteProgramClick = (program: CreditProgramResponseDto) => {
    setSelectedProgram(program);
    setProgramDeleteDialogOpen(true);
  };

  const handleDeleteProgramConfirm = async () => {
    if (!selectedProgram) return;

    try {
      await deleteProgram(selectedProgram.id).unwrap();
      toast.success(t('creditProgram.messages.programDeleted'));
      setProgramDeleteDialogOpen(false);
      setSelectedProgram(null);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && 'data' in error
          ? (error as { data?: { message?: string } }).data?.message
          : undefined;
      toast.error(errorMessage || t('common.error'));
    }
  };

  const handleActivateProgram = async (program: CreditProgramResponseDto) => {
    try {
      await activateProgram(program.id).unwrap();
      toast.success(t('creditProgram.messages.programActivated'));
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && 'data' in error
          ? (error as { data?: { message?: string } }).data?.message
          : undefined;
      toast.error(errorMessage || t('common.error'));
    }
  };

  const handleSuspendProgram = async (program: CreditProgramResponseDto) => {
    try {
      await suspendProgram({ id: program.id }).unwrap();
      toast.success(t('creditProgram.messages.programSuspended'));
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && 'data' in error
          ? (error as { data?: { message?: string } }).data?.message
          : undefined;
      toast.error(errorMessage || t('common.error'));
    }
  };

  const handleCloseProgram = async (program: CreditProgramResponseDto) => {
    try {
      await closeProgram({ id: program.id }).unwrap();
      toast.success(t('creditProgram.messages.programClosed'));
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && 'data' in error
          ? (error as { data?: { message?: string } }).data?.message
          : undefined;
      toast.error(errorMessage || t('common.error'));
    }
  };

  // Pagination handlers
  const PaginationControls: React.FC = () => {
    if (!programsData) return null;

    const totalPages = programsData.totalPages;
    const currentPage = programsData.number;

    return (
      <div className='flex items-center justify-between'>
        <div className='flex-1 text-sm text-muted-foreground'>
          {t('common.showing')} {programsData.numberOfElements} {t('common.of')}{' '}
          {programsData.totalElements}{' '}
          {t('creditProgram.programs').toLowerCase()}
        </div>
        <div className='flex items-center space-x-6 lg:space-x-8'>
          <div className='flex items-center space-x-2'>
            <p className='text-sm font-medium'>{t('common.rowsPerPage')}</p>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setSize(size === 10 ? 20 : size === 20 ? 50 : 10)}
            >
              {size}
            </Button>
          </div>
          <div className='flex w-[100px] items-center justify-center text-sm font-medium'>
            {t('common.page')} {currentPage + 1} {t('common.of')}{' '}
            {totalPages || 1}
          </div>
          <div className='flex items-center space-x-2'>
            <Button
              variant='outline'
              className='h-8 w-8 p-0'
              onClick={() => setPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
            >
              <span className='sr-only'>{t('common.previous')}</span>«
            </Button>
            <Button
              variant='outline'
              className='h-8 w-8 p-0'
              onClick={() => setPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage >= totalPages - 1}
            >
              <span className='sr-only'>{t('common.next')}</span>»
            </Button>
          </div>
        </div>
      </div>
    );
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
        <CardContent className='p-6'>
          <p className='text-center text-muted-foreground'>
            {t('errors.notFound')}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (decisionLoading) {
    return (
      <Card>
        <CardContent className='p-6'>
          <div className='flex items-center justify-center space-x-2'>
            <Loader2 className='h-4 w-4 animate-spin' />
            <span>{t('decision.messages.loadingDecisions')}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (decisionError || !decision) {
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
            <h1 className='text-2xl font-semibold'>{decision.nameEn}</h1>
            <p className='text-muted-foreground'>
              {t('decision.decisionDetails')}
            </p>
          </div>
        </div>

        <div className='flex items-center space-x-2'>
          <Button variant='outline' onClick={handleEdit}>
            <Edit className='mr-2 h-4 w-4' />
            {t('common.edit')}
          </Button>
          <Button variant='destructive' onClick={handleDeleteClick}>
            <Trash className='mr-2 h-4 w-4' />
            {t('common.delete')}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue='main' className='space-y-6'>
        <TabsList className='inline-flex w-auto h-12 p-1'>
          <TabsTrigger
            value='main'
            className='px-4 py-2 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md'
          >
            {t('common.main')}
          </TabsTrigger>
          <TabsTrigger
            value='programs'
            className='px-4 py-2 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md'
          >
            {t('common.programs')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value='main' className='space-y-6'>
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
            {/* Main Information */}
            <div className='lg:col-span-2 space-y-6'>
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center space-x-2'>
                    <FileText className='h-5 w-5' />
                    <span>{t('decision.fields.nameEn')}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                    <div className='space-y-2'>
                      <p className='text-sm font-medium text-muted-foreground'>
                        {t('decision.fields.nameEn')}
                      </p>
                      <p className='font-medium'>{decision.nameEn}</p>
                    </div>

                    <div className='space-y-2'>
                      <p className='text-sm font-medium text-muted-foreground'>
                        {t('decision.fields.nameRu')}
                      </p>
                      <p className='font-medium'>{decision.nameRu}</p>
                    </div>

                    <div className='space-y-2'>
                      <p className='text-sm font-medium text-muted-foreground'>
                        {t('decision.fields.nameKg')}
                      </p>
                      <p className='font-medium'>{decision.nameKg}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <div className='space-y-2'>
                      <p className='text-sm font-medium text-muted-foreground flex items-center space-x-2'>
                        <Calendar className='h-4 w-4' />
                        <span>{t('decision.fields.date')}</span>
                      </p>
                      <p className='font-medium'>
                        {new Date(decision.date).toLocaleDateString()}
                      </p>
                    </div>

                    <div className='space-y-2'>
                      <p className='text-sm font-medium text-muted-foreground flex items-center space-x-2'>
                        <Hash className='h-4 w-4' />
                        <span>{t('decision.fields.number')}</span>
                      </p>
                      <p className='font-medium font-mono'>{decision.number}</p>
                    </div>
                  </div>

                  {decision.note && (
                    <>
                      <Separator />
                      <div className='space-y-2'>
                        <p className='text-sm font-medium text-muted-foreground flex items-center space-x-2'>
                          <StickyNote className='h-4 w-4' />
                          <span>{t('decision.fields.note')}</span>
                        </p>
                        <p className='text-sm leading-relaxed bg-muted/50 p-3 rounded-lg'>
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
                  <CardTitle className='flex items-center space-x-2'>
                    <Tag className='h-5 w-5' />
                    <span>
                      {t('decision.decisionType')} &{' '}
                      {t('decision.decisionMakingBody')}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <div className='space-y-2'>
                      <p className='text-sm font-medium text-muted-foreground'>
                        {t('decision.fields.decisionType')}
                      </p>
                      <div className='space-y-1'>
                        <p className='font-medium'>
                          {decision.decisionTypeNameEn}
                        </p>
                        <p className='text-sm text-muted-foreground'>
                          {decision.decisionTypeNameRu}
                        </p>
                        <p className='text-sm text-muted-foreground'>
                          {decision.decisionTypeNameKg}
                        </p>
                      </div>
                    </div>

                    <div className='space-y-2'>
                      <p className='text-sm font-medium text-muted-foreground flex items-center space-x-2'>
                        <Building className='h-4 w-4' />
                        <span>{t('decision.fields.decisionMakingBody')}</span>
                      </p>
                      <div className='space-y-1'>
                        <p className='font-medium'>
                          {decision.decisionMakingBodyNameEn}
                        </p>
                        <p className='text-sm text-muted-foreground'>
                          {decision.decisionMakingBodyNameRu}
                        </p>
                        <p className='text-sm text-muted-foreground'>
                          {decision.decisionMakingBodyNameKg}
                        </p>
                      </div>
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
                    <CardTitle>
                      {t('decision.fields.documentPackage')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className='text-sm font-mono break-all bg-muted p-2 rounded'>
                      {decision.documentPackageId}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value='programs' className='space-y-6'>
          {/* Programs Search and Filters */}
          <CreditProgramFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            loading={programsLoading}
          />

          {/* Programs Results Section */}
          <div className='bg-transparent rounded-lg'>
            <div className='pb-3 border-b border-border/10'>
              <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                <h2 className='flex items-center gap-4 text-xl font-bold tracking-wide'>
                  <div className='h-11 w-11 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 border border-primary-300 flex items-center justify-center shadow-lg'>
                    <CreditCard className='h-6 w-6 text-primary-700' />
                  </div>
                  <span className='text-foreground'>
                    {t('creditProgram.programs')}
                  </span>
                </h2>

                {/* View Toggle and Add Button */}
                <div className='flex items-center gap-2'>
                  <CreditProgramForm
                    decisionId={id!}
                    onSubmit={handleCreateProgram}
                    loading={isCreating}
                    trigger={
                      <Button className='gap-2 shadow-md hover:shadow-lg transition-shadow'>
                        <Plus className='h-4 w-4' />
                        {t('creditProgram.form.createTitle')}
                      </Button>
                    }
                  />

                  {!isMobile && (
                    <>
                      <Button
                        variant={viewMode === 'card' ? 'default' : 'outline'}
                        size='sm'
                        onClick={() => handleSetViewMode('card')}
                        aria-label={t('common.cardView')}
                      >
                        <Grid className='h-4 w-4' />
                      </Button>
                      <Button
                        variant={viewMode === 'table' ? 'default' : 'outline'}
                        size='sm'
                        onClick={() => handleSetViewMode('table')}
                        aria-label={t('common.tableView')}
                      >
                        <List className='h-4 w-4' />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className='mt-4'>
              {programsError ? (
                <div className='text-center py-12'>
                  <div className='space-y-3'>
                    <CreditCard className='h-12 w-12 text-destructive mx-auto opacity-50' />
                    <div>
                      <p className='text-lg font-medium text-destructive'>
                        {t('errors.loadingError')}
                      </p>
                      <p className='text-sm text-muted-foreground mt-1'>
                        {t('errors.tryRefresh')}
                      </p>
                    </div>
                  </div>
                </div>
              ) : !programsData?.content.length ? (
                <div className='text-center py-12'>
                  <div className='space-y-3'>
                    <CreditCard className='h-12 w-12 text-muted-foreground mx-auto opacity-50' />
                    <div>
                      <p className='text-lg font-medium text-muted-foreground'>
                        {t('creditProgram.messages.noPrograms')}
                      </p>
                      <p className='text-sm text-muted-foreground mt-1'>
                        {t('creditProgram.messages.noProgramsDescription')}
                      </p>
                    </div>
                    <CreditProgramForm
                      decisionId={id!}
                      onSubmit={handleCreateProgram}
                      loading={isCreating}
                      trigger={
                        <Button className='gap-2 mt-4'>
                          <Plus className='h-4 w-4' />
                          {t('creditProgram.form.createTitle')}
                        </Button>
                      }
                    />
                  </div>
                </div>
              ) : (
                <div className='space-y-4'>
                  {/* Card View (Mobile First) */}
                  {(viewMode === 'card' || isMobile) && (
                    <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
                      {programsData.content.map(program => (
                        <CreditProgramCard
                          key={program.id}
                          program={program}
                          onView={handleViewProgram}
                          onEdit={handleEditProgram}
                          onDelete={handleDeleteProgramClick}
                          onActivate={handleActivateProgram}
                          onSuspend={handleSuspendProgram}
                          onClose={handleCloseProgram}
                          userRoles={[]} // TODO: Get from auth context
                          loading={programsLoading}
                        />
                      ))}
                    </div>
                  )}

                  {/* Table View (Desktop Only) */}
                  {viewMode === 'table' && !isMobile && (
                    <CreditProgramTable
                      programs={programsData.content}
                      loading={programsLoading}
                      sortField={sortField}
                      sortDirection={sortDirection}
                      onSort={handleSort}
                      onView={handleViewProgram}
                      onEdit={handleEditProgram}
                      onDelete={handleDeleteProgramClick}
                      onActivate={handleActivateProgram}
                      onSuspend={handleSuspendProgram}
                      onClose={handleCloseProgram}
                      userRoles={[]} // TODO: Get from auth context
                    />
                  )}

                  {/* Pagination */}
                  {programsData.content.length > 0 && (
                    <>
                      <Separator className='opacity-30' />
                      <div className='bg-gradient-to-r from-muted/40 to-accent/30 px-6 py-6 rounded-b-lg border-t border-border/10 backdrop-blur-sm'>
                        <PaginationControls />
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Program Delete Confirmation Dialog */}
      <Dialog
        open={programDeleteDialogOpen}
        onOpenChange={setProgramDeleteDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('common.confirm')}</DialogTitle>
            <DialogDescription>
              {t('creditProgram.messages.confirmDelete', {
                item: selectedProgram
                  ? `"${selectedProgram.nameEn}"`
                  : t('creditProgram.title').toLowerCase(),
              })}
            </DialogDescription>
          </DialogHeader>
          <div className='flex justify-end space-x-2'>
            <Button
              variant='outline'
              onClick={() => setProgramDeleteDialogOpen(false)}
              disabled={isDeletingProgram}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant='destructive'
              onClick={handleDeleteProgramConfirm}
              disabled={isDeletingProgram}
            >
              {isDeletingProgram ? t('common.deleting') : t('common.delete')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Decision Delete Confirmation Dialog */}
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
