import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash,
  ChevronDown,
  ChevronUp,
  Calendar,
  FileText,
  CreditCard,
  X,
  Grid,
  List,
  SortAsc,
  SortDesc,
  RefreshCw,
  DollarSign,
  Clock,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { PageSkeleton } from '@/components/ui/skeleton';
import {
  AccessibleStatusBadge,
} from '@/components/ui/accessible-status-badge';
import { LiveRegion } from '@/components/ui/focus-trap';
import { ErrorFallback } from '@/components/ui/error-fallback';
import { cn } from '@/lib/utils';

import { useTranslation } from '@/hooks/useTranslation';
import { useSetPageTitle } from '@/hooks/useSetPageTitle';
import { useAuth } from '@/hooks/useAuth';
import {
  useSearchAndFilterCreditProgramsQuery,
  useDeleteCreditProgramMutation,
} from '@/store/api/creditProgramApi';
import type {
  CreditProgramResponseDto,
  CreditProgramSearchAndFilterParams,
  CreditProgramFilterState,
} from '@/types/creditProgram';
import { ProgramStatus as ProgramStatusEnum } from '@/types/creditProgram';
import { ROUTES, PAGINATION } from '@/constants';
import { getStoredViewMode, setStoredViewMode } from '@/utils/auth';

type SortField = 'nameEn' | 'status' | 'validFrom' | 'validTo' | 'createdAt';
type SortDirection = 'asc' | 'desc';
type ViewMode = 'table' | 'card';

export const CreditProgramListPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { hasAnyRole } = useAuth();
  useSetPageTitle(t('creditProgram.programs'));

  // State management
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
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] =
    useState<CreditProgramResponseDto | null>(null);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return getStoredViewMode() || 'card';
  });
  const [isMobile, setIsMobile] = useState(false);
  const [filtersApplied, setFiltersApplied] = useState(0);

  // Custom view mode setter that persists to localStorage
  const handleSetViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    setStoredViewMode(mode);
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

  // Count applied filters
  useEffect(() => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.status) count++;
    if (filters.amountMin !== null) count++;
    if (filters.amountMax !== null) count++;
    if (filters.termMin !== null) count++;
    if (filters.termMax !== null) count++;
    if (filters.validFromStart) count++;
    if (filters.validFromEnd) count++;
    if (filters.validToStart) count++;
    if (filters.validToEnd) count++;
    if (filters.collateralRequired !== null) count++;
    if (filters.activeOnly) count++;
    setFiltersApplied(count);
  }, [filters]);

  // Build query parameters
  const queryParams: CreditProgramSearchAndFilterParams = {
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

  // API queries
  const {
    data: programsData,
    isLoading: programsLoading,
    error: programsError,
  } = useSearchAndFilterCreditProgramsQuery(queryParams);

  const [deleteProgram, { isLoading: isDeleting }] =
    useDeleteCreditProgramMutation();

  // Handle filter changes
  const handleFilterChange = (
    key: keyof CreditProgramFilterState,
    value: string | number | boolean | null
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const clearFilters = () => {
    setFilters({
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
    setPage(0);
  };

  // Sorting handlers
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setPage(0);
  };

  // Navigation handlers
  const handleCreate = () => {
    navigate(`${ROUTES.CREDIT_PROGRAMS}/new`);
  };

  const handleView = (id: string) => {
    navigate(`${ROUTES.CREDIT_PROGRAMS}/${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`${ROUTES.CREDIT_PROGRAMS}/${id}/edit`);
  };

  const handleDeleteClick = (program: CreditProgramResponseDto) => {
    setSelectedProgram(program);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProgram) return;

    try {
      await deleteProgram(selectedProgram.id).unwrap();
      setDeleteDialogOpen(false);
      setSelectedProgram(null);
    } catch (error) {
      console.error('Failed to delete credit program:', error);
    }
  };

  // Format currency amount
  const formatAmount = (min?: number, max?: number, currency?: string) => {
    if (!min && !max) return t('common.notSpecified');
    if (min && max && min === max) {
      return `${min.toLocaleString()} ${currency || ''}`;
    }
    if (min && max) {
      return `${min.toLocaleString()} - ${max.toLocaleString()} ${currency || ''}`;
    }
    if (min) return `${t('common.from')} ${min.toLocaleString()} ${currency || ''}`;
    if (max) return `${t('common.to')} ${max.toLocaleString()} ${currency || ''}`;
    return t('common.notSpecified');
  };

  // Format term range
  const formatTerm = (min?: number, max?: number) => {
    if (!min && !max) return t('common.notSpecified');
    if (min && max && min === max) {
      return `${min} ${t('common.months')}`;
    }
    if (min && max) {
      return `${min} - ${max} ${t('common.months')}`;
    }
    if (min) return `${t('common.from')} ${min} ${t('common.months')}`;
    if (max) return `${t('common.to')} ${max} ${t('common.months')}`;
    return t('common.notSpecified');
  };

  // Enhanced mobile-first card component
  const ProgramCard: React.FC<{ program: CreditProgramResponseDto }> = ({
    program,
  }) => (
    <div
      className="group hover:shadow-xl hover:shadow-primary/5 hover:bg-card-elevated hover:scale-[1.02] transition-all duration-300 border border-card-elevated-border bg-card shadow-md backdrop-blur-sm rounded-lg"
      role="article"
      aria-labelledby={`program-title-${program.id}`}
    >
      <div className="p-7">
        <div className="space-y-4">
          {/* Header with status and actions */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 border border-primary-300 shadow-sm">
                  <CreditCard className="h-5 w-5 text-primary-700 shrink-0" />
                </div>
                <span className="text-sm font-mono font-bold text-primary-700 tabular-nums tracking-wide">
                  {program.currencyCode}
                </span>
              </div>
              <button
                onClick={() => handleView(program.id)}
                className="text-left w-full"
              >
                <h3
                  id={`program-title-${program.id}`}
                  className="text-xl font-bold leading-tight text-card-foreground hover:text-primary-600 transition-colors cursor-pointer tracking-wide"
                >
                  {program.nameEn}
                </h3>
              </button>
              {program.description && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2 font-medium">
                  {program.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <AccessibleStatusBadge
                status={program.status}
                className="shrink-0 shadow-sm"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 opacity-60 group-hover:opacity-100 transition-all duration-300 hover:bg-accent hover:shadow-md hover:scale-110 focus:ring-2 focus:ring-primary/30 rounded-lg"
                    aria-label={t('common.actions', { item: program.nameEn })}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="shadow-lg border-border/20"
                >
                  <DropdownMenuItem
                    onClick={() => handleView(program.id)}
                    className="hover:bg-accent focus:bg-accent"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    {t('common.view')}
                  </DropdownMenuItem>
                  {hasAnyRole(['ADMIN', 'CREDIT_MANAGER']) && (
                    <DropdownMenuItem
                      onClick={() => handleEdit(program.id)}
                      className="hover:bg-accent focus:bg-accent"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      {t('common.edit')}
                    </DropdownMenuItem>
                  )}
                  {hasAnyRole(['ADMIN', 'CREDIT_MANAGER']) && program.canBeDeleted && (
                    <>
                      <Separator />
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(program)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        {t('common.delete')}
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Details grid */}
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground shrink-0" />
              <div>
                <span className="font-medium">{t('creditProgram.fields.amountRange')}:</span>
                <span className="ml-2 font-semibold">
                  {formatAmount(program.amountMin, program.amountMax, program.currencyCode)}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground shrink-0" />
              <div>
                <span className="font-medium">{t('creditProgram.fields.termRange')}:</span>
                <span className="ml-2 font-semibold">
                  {formatTerm(program.termMin, program.termMax)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
              <div>
                <span className="font-medium">{t('creditProgram.fields.validPeriod')}:</span>
                <span className="ml-2 font-semibold">
                  {program.validFrom && program.validTo
                    ? `${new Date(program.validFrom).toLocaleDateString()} - ${new Date(program.validTo).toLocaleDateString()}`
                    : t('common.notSpecified')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Enhanced table header with sorting
  const SortableTableHead: React.FC<{
    field: SortField;
    children: React.ReactNode;
    className?: string;
  }> = ({ field, children, className }) => (
    <TableHead
      className={cn(
        'cursor-pointer transition-all duration-300 select-none border-b-2 border-b-primary-200/50 bg-gradient-to-b from-table-header to-table-header/70',
        className
      )}
    >
      <button
        onClick={() => handleSort(field)}
        className="flex items-center gap-2 w-full text-left font-bold text-table-header-foreground hover:text-primary-600 transition-colors duration-300 py-3 px-1 rounded-lg hover:bg-primary-50/50"
        aria-label={t('common.sortBy', { field: children })}
      >
        {children}
        {sortField === field ? (
          sortDirection === 'asc' ? (
            <SortAsc className="h-4 w-4 text-primary animate-in slide-in-from-bottom-1 duration-200" />
          ) : (
            <SortDesc className="h-4 w-4 text-primary animate-in slide-in-from-top-1 duration-200" />
          )
        ) : (
          <div className="h-4 w-4 opacity-40 group-hover:opacity-70 transition-opacity">
            <SortAsc className="h-4 w-4 text-table-header-foreground" />
          </div>
        )}
      </button>
    </TableHead>
  );

  // Pagination component
  const PaginationControls: React.FC = () => {
    if (!programsData) return null;

    const totalPages = programsData.totalPages;
    const currentPage = programsData.number;

    return (
      <div className="flex items-center justify-between">
        <div className="flex-1 text-sm text-muted-foreground">
          {t('common.showing')} {programsData.numberOfElements}{' '}
          {t('common.of')} {programsData.totalElements}{' '}
          {t('creditProgram.programs').toLowerCase()}
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">{t('common.rowsPerPage')}</p>
            <Select
              value={size.toString()}
              onValueChange={value => {
                setSize(Number(value));
                setPage(0);
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGINATION.PAGE_SIZE_OPTIONS.map(pageSize => (
                  <SelectItem key={pageSize} value={pageSize.toString()}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            {t('common.page')} {currentPage + 1} {t('common.of')}{' '}
            {totalPages || 1}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => setPage(0)}
              disabled={currentPage === 0}
            >
              <span className="sr-only">{t('common.first')}</span>
              ««
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => setPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
            >
              <span className="sr-only">{t('common.previous')}</span>«
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => setPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage >= totalPages - 1}
            >
              <span className="sr-only">{t('common.next')}</span>»
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => setPage(totalPages - 1)}
              disabled={currentPage >= totalPages - 1}
            >
              <span className="sr-only">{t('common.last')}</span>
              »»
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Handle loading states
  if (programsLoading) {
    return <PageSkeleton />;
  }

  // Handle error states
  if (programsError) {
    return <ErrorFallback error={programsError as Error} type="network" />;
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <LiveRegion />

      {/* Search and Filter Controls */}
      <div className="bg-muted/10 rounded-lg border border-border/20 shadow-sm">
        <div className="p-3 sm:p-4">
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t('creditProgram.searchPlaceholder')}
                  value={filters.searchTerm}
                  onChange={e =>
                    handleFilterChange('searchTerm', e.target.value)
                  }
                  className="pl-10"
                  aria-label={t('creditProgram.searchPlaceholder')}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={cn(
                  'relative gap-2 transition-all duration-200',
                  isFilterOpen && 'bg-primary text-primary-foreground'
                )}
                aria-expanded={isFilterOpen}
              >
                <Filter className="h-4 w-4" />
                {t('creditProgram.advancedFilters')}
                {filtersApplied > 0 && (
                  <Badge
                    variant={isFilterOpen ? 'secondary' : 'destructive'}
                    className="ml-2 px-1.5 py-0.5 text-xs -mr-1"
                  >
                    {filtersApplied}
                  </Badge>
                )}
                {isFilterOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>

              {filtersApplied > 0 && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={clearFilters}
                  aria-label={t('common.clearFilters')}
                  className="shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {hasAnyRole(['ADMIN', 'CREDIT_MANAGER']) && (
              <div className="flex gap-2">
                <Button
                  onClick={handleCreate}
                  className="add-new-program-button shadow-md hover:shadow-lg transition-shadow w-full sm:w-auto relative group"
                  size={isMobile ? 'default' : 'default'}
                >
                  <Plus className="h-4 w-4" />
                  <span
                    className="absolute left-1/2 -translate-x-1/2 top-full mt-2 bg-background border border-border rounded-md px-2 py-1 text-xs text-foreground shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10"
                    role="tooltip"
                    aria-hidden="true"
                  >
                    {t('creditProgram.newProgram')}
                  </span>
                </Button>
              </div>
            )}
          </div>

          {/* Collapsible Advanced Filters */}
          {isFilterOpen && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6 bg-gradient-to-br from-muted/60 to-accent/40 rounded-xl transition-all duration-300 ease-out mt-6 border border-border/10 shadow-inner">
              {/* Status Filter */}
              <div className="space-y-2">
                <Label htmlFor="status-filter">
                  {t('creditProgram.fields.status')}
                </Label>
                <Select
                  value={filters.status || 'all'}
                  onValueChange={value =>
                    handleFilterChange('status', value === 'all' ? null : value)
                  }
                >
                  <SelectTrigger id="status-filter">
                    <SelectValue placeholder={t('common.selectStatus')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('common.all')}</SelectItem>
                    {Object.values(ProgramStatusEnum).map(status => (
                      <SelectItem key={status} value={status}>
                        {t(`creditProgram.status.${status.toLowerCase()}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Amount Range Filters */}
              <div className="space-y-2">
                <Label htmlFor="amount-min-filter">
                  {t('creditProgram.fields.amountMin')}
                </Label>
                <Input
                  id="amount-min-filter"
                  type="number"
                  placeholder="0"
                  value={filters.amountMin || ''}
                  onChange={e =>
                    handleFilterChange(
                      'amountMin',
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount-max-filter">
                  {t('creditProgram.fields.amountMax')}
                </Label>
                <Input
                  id="amount-max-filter"
                  type="number"
                  placeholder="1000000"
                  value={filters.amountMax || ''}
                  onChange={e =>
                    handleFilterChange(
                      'amountMax',
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                />
              </div>

              {/* Term Range Filters */}
              <div className="space-y-2">
                <Label htmlFor="term-min-filter">
                  {t('creditProgram.fields.termMin')}
                </Label>
                <Input
                  id="term-min-filter"
                  type="number"
                  placeholder="1"
                  value={filters.termMin || ''}
                  onChange={e =>
                    handleFilterChange(
                      'termMin',
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="term-max-filter">
                  {t('creditProgram.fields.termMax')}
                </Label>
                <Input
                  id="term-max-filter"
                  type="number"
                  placeholder="120"
                  value={filters.termMax || ''}
                  onChange={e =>
                    handleFilterChange(
                      'termMax',
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                />
              </div>

              {/* Collateral Required Filter */}
              <div className="space-y-2">
                <Label htmlFor="collateral-filter">
                  {t('creditProgram.fields.collateralRequired')}
                </Label>
                <Select
                  value={
                    filters.collateralRequired === null
                      ? 'all'
                      : filters.collateralRequired.toString()
                  }
                  onValueChange={value =>
                    handleFilterChange(
                      'collateralRequired',
                      value === 'all' ? null : value === 'true'
                    )
                  }
                >
                  <SelectTrigger id="collateral-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('common.all')}</SelectItem>
                    <SelectItem value="true">{t('common.yes')}</SelectItem>
                    <SelectItem value="false">{t('common.no')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filter Actions */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2 col-span-full">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  disabled={filtersApplied === 0}
                  className="w-full sm:w-auto"
                >
                  <X className="mr-2 h-4 w-4" />
                  {t('common.clear')}
                  {filtersApplied > 0 && ` (${filtersApplied})`}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="w-full sm:w-auto"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {t('common.refresh')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      <div className="bg-transparent rounded-lg">
        <div className="pb-3 border-b border-border/10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="flex items-center gap-4 text-xl font-bold tracking-wide">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 border border-primary-300 flex items-center justify-center shadow-lg">
                <CreditCard className="h-6 w-6 text-primary-700" />
              </div>
              <span className="text-foreground">{t('creditProgram.programs')}</span>
            </h2>

            {/* View Toggle and Sort Controls */}
            <div className="flex items-center gap-2">
              {!isMobile && (
                <>
                  <Button
                    variant={viewMode === 'card' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSetViewMode('card')}
                    aria-label={t('common.cardView')}
                  >
                    <Grid className="h-5 w-5" />
                  </Button>
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSetViewMode('table')}
                    aria-label={t('common.tableView')}
                  >
                    <List className="h-5 w-5" />
                  </Button>
                </>
              )}

              {(viewMode === 'card' || isMobile) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      {sortDirection === 'asc' ? (
                        <SortAsc className="h-4 w-4 mr-2" />
                      ) : (
                        <SortDesc className="h-4 w-4 mr-2" />
                      )}
                      {t(`creditProgram.fields.${sortField}`)}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleSort('nameEn')}>
                      <FileText className="mr-2 h-4 w-4" />
                      {t('creditProgram.fields.nameEn')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSort('status')}>
                      <CreditCard className="mr-2 h-4 w-4" />
                      {t('creditProgram.fields.status')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSort('validFrom')}>
                      <Calendar className="mr-2 h-4 w-4" />
                      {t('creditProgram.fields.validFrom')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSort('createdAt')}>
                      <Calendar className="mr-2 h-4 w-4" />
                      {t('common.created')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>

        <div>
          {!programsData?.content.length ? (
            <div className="text-center py-12">
              <div className="space-y-3">
                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto opacity-50" />
                <div>
                  <p className="text-lg font-medium text-muted-foreground">
                    {t('creditProgram.messages.noResults')}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {filtersApplied > 0
                      ? t('common.tryAdjustingFilters')
                      : t('creditProgram.messages.noProgramsYet')}
                  </p>
                </div>
                {filtersApplied > 0 && (
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="mt-4"
                  >
                    <X className="mr-2 h-4 w-4" />
                    {t('common.clearFilters')}
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Card View (Mobile First) */}
              {(viewMode === 'card' || isMobile) && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {programsData.content.map(program => (
                    <ProgramCard key={program.id} program={program} />
                  ))}
                </div>
              )}

              {/* Table View (Desktop Only) */}
              {viewMode === 'table' && !isMobile && (
                <div className="overflow-x-auto rounded-lg border border-card-elevated-border shadow-sm">
                  <Table>
                    <TableHeader className="bg-gradient-to-r from-table-header to-table-header/90 border-b-2 border-primary-200/30">
                      <TableRow className="group border-b-0 hover:bg-primary-50/20 transition-all duration-300">
                        <SortableTableHead field="nameEn">
                          {t('creditProgram.fields.nameEn')}
                        </SortableTableHead>
                        <SortableTableHead field="status">
                          {t('creditProgram.fields.status')}
                        </SortableTableHead>
                        <TableHead className="text-table-header-foreground font-bold border-b-2 border-b-primary-200/50 bg-gradient-to-b from-table-header to-table-header/70">
                          {t('creditProgram.fields.currency')}
                        </TableHead>
                        <TableHead className="text-table-header-foreground font-bold border-b-2 border-b-primary-200/50 bg-gradient-to-b from-table-header to-table-header/70">
                          {t('creditProgram.table.amountRange')}
                        </TableHead>
                        <TableHead className="text-table-header-foreground font-bold border-b-2 border-b-primary-200/50 bg-gradient-to-b from-table-header to-table-header/70">
                          {t('creditProgram.table.termRange')}
                        </TableHead>
                        <SortableTableHead field="validFrom">
                          {t('creditProgram.table.validPeriod')}
                        </SortableTableHead>
                        <TableHead className="w-[100px] text-center text-table-header-foreground font-bold border-b-2 border-b-primary-200/50 bg-gradient-to-b from-table-header to-table-header/70">
                          {t('common.actions')}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {programsData.content.map((program, index) => (
                        <TableRow
                          key={program.id}
                          className={`group ${index % 2 === 1 ? 'bg-muted/30' : 'bg-background'} hover:bg-primary-50/20 hover:shadow-sm transition-all duration-300 border-b border-border/5`}
                        >
                          <TableCell className="py-4">
                            <div className="space-y-1 max-w-[300px]">
                              <button
                                onClick={() => handleView(program.id)}
                                className="text-left w-full"
                              >
                                <p className="font-bold text-base leading-tight hover:text-primary-600 transition-colors cursor-pointer tracking-wide">
                                  {program.nameEn}
                                </p>
                              </button>
                              {program.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2 font-medium">
                                  {program.description}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <AccessibleStatusBadge status={program.status} />
                          </TableCell>
                          <TableCell className="font-mono font-semibold tabular-nums py-4">
                            {program.currencyCode}
                          </TableCell>
                          <TableCell className="py-4">
                            {formatAmount(program.amountMin, program.amountMax, program.currencyCode)}
                          </TableCell>
                          <TableCell className="py-4">
                            {formatTerm(program.termMin, program.termMax)}
                          </TableCell>
                          <TableCell className="py-4">
                            {program.validFrom && program.validTo ? (
                              <div className="text-sm">
                                <div>{new Date(program.validFrom).toLocaleDateString()}</div>
                                <div className="text-muted-foreground">
                                  {new Date(program.validTo).toLocaleDateString()}
                                </div>
                              </div>
                            ) : (
                              t('common.notSpecified')
                            )}
                          </TableCell>
                          <TableCell className="w-[100px] py-4">
                            <div className="flex items-center justify-center">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 opacity-70 hover:opacity-100 transition-all duration-200 hover:bg-accent hover:shadow-lg focus:ring-2 focus:ring-primary/20"
                                    aria-label={t('common.actions', {
                                      item: program.nameEn,
                                    })}
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="shadow-lg border-border/20"
                                >
                                  <DropdownMenuItem
                                    onClick={() => handleView(program.id)}
                                    className="hover:bg-accent focus:bg-accent"
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    {t('common.view')}
                                  </DropdownMenuItem>
                                  {hasAnyRole(['ADMIN', 'CREDIT_MANAGER']) && (
                                    <DropdownMenuItem
                                      onClick={() => handleEdit(program.id)}
                                      className="hover:bg-accent focus:bg-accent"
                                    >
                                      <Edit className="mr-2 h-4 w-4" />
                                      {t('common.edit')}
                                    </DropdownMenuItem>
                                  )}
                                  {hasAnyRole(['ADMIN', 'CREDIT_MANAGER']) && program.canBeDeleted && (
                                    <>
                                      <Separator />
                                      <DropdownMenuItem
                                        onClick={() => handleDeleteClick(program)}
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                      >
                                        <Trash className="mr-2 h-4 w-4" />
                                        {t('common.delete')}
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Pagination */}
              {programsData.content.length > 0 && (
                <>
                  <Separator className="opacity-30" />
                  <div className="bg-gradient-to-r from-muted/40 to-accent/30 px-6 py-6 rounded-b-lg border-t border-border/10 backdrop-blur-sm">
                    <PaginationControls />
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
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
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? t('common.deleting') : t('common.delete')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
