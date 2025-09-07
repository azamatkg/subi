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
  Scale,
  X,
  Grid,
  List,
  SortAsc,
  SortDesc,
  RefreshCw,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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
  AccessibleDate,
} from '@/components/ui/accessible-status-badge';
import { LiveRegion } from '@/components/ui/focus-trap';
import { ErrorFallback } from '@/components/ui/error-fallback';
import { cn } from '@/lib/utils';

import { useTranslation } from '@/hooks/useTranslation';
import { useSetPageTitle } from '@/hooks/useSetPageTitle';
import {
  useSearchAndFilterDecisionsQuery,
  useDeleteDecisionMutation,
} from '@/store/api/decisionApi';
import { useGetActiveDecisionTypesQuery } from '@/store/api/decisionTypeApi';
import { useGetActiveDecisionMakingBodiesQuery } from '@/store/api/decisionMakingBodyApi';
import type {
  DecisionResponseDto,
  DecisionSearchAndFilterParams,
  DecisionStatus,
} from '@/types/decision';
import { DecisionStatus as DecisionStatusEnum } from '@/types/decision';
import { ROUTES, PAGINATION } from '@/constants';
import { getStoredViewMode, setStoredViewMode } from '@/utils/auth';

interface FilterState {
  searchTerm: string;
  decisionTypeId: number | null;
  decisionMakingBodyId: number | null;
  status: DecisionStatus | null;
  dateFrom: string;
  dateTo: string;
}

type SortField = 'date' | 'number' | 'nameEn' | 'status';
type SortDirection = 'asc' | 'desc';
type ViewMode = 'table' | 'card';

export const DecisionListPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  useSetPageTitle(t('decision.decisionManagement'));

  // State management
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    decisionTypeId: null,
    decisionMakingBodyId: null,
    status: null,
    dateFrom: '',
    dateTo: '',
  });
  const [page, setPage] = useState(0);
  const [size, setSize] = useState<number>(PAGINATION.DEFAULT_PAGE_SIZE);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDecision, setSelectedDecision] =
    useState<DecisionResponseDto | null>(null);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    // Initialize with stored preference, fallback to 'card'
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
      // On mobile, force card view regardless of stored preference
      if (isMobileView && viewMode === 'table') {
        setViewMode('card'); // Only update state, don't persist mobile override
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
    if (filters.decisionTypeId) count++;
    if (filters.decisionMakingBodyId) count++;
    if (filters.status) count++;
    if (filters.dateFrom) count++;
    if (filters.dateTo) count++;
    setFiltersApplied(count);
  }, [filters]);

  // Build query parameters
  const queryParams: DecisionSearchAndFilterParams = {
    page,
    size,
    sort: `${sortField},${sortDirection}`,
    ...(filters.searchTerm && { searchTerm: filters.searchTerm }),
    ...(filters.decisionTypeId && { decisionTypeId: filters.decisionTypeId }),
    ...(filters.decisionMakingBodyId && {
      decisionMakingBodyId: filters.decisionMakingBodyId,
    }),
    ...(filters.status && { status: filters.status }),
  };

  // API queries
  const {
    data: decisionsData,
    isLoading: decisionsLoading,
    error: decisionsError,
  } = useSearchAndFilterDecisionsQuery(queryParams);

  const { data: decisionTypesData } = useGetActiveDecisionTypesQuery({
    page: 0,
    size: 100,
  });

  const { data: decisionMakingBodiesData } =
    useGetActiveDecisionMakingBodiesQuery({ page: 0, size: 100 });

  const [deleteDecision, { isLoading: isDeleting }] =
    useDeleteDecisionMutation();

  // Handle filter changes
  const handleFilterChange = (
    key: keyof FilterState,
    value: string | number | null
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(0); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      decisionTypeId: null,
      decisionMakingBodyId: null,
      status: null,
      dateFrom: '',
      dateTo: '',
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
    navigate(`${ROUTES.DECISIONS}/new`);
  };

  const handleView = (id: string) => {
    navigate(`${ROUTES.DECISIONS}/${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`${ROUTES.DECISIONS}/${id}/edit`);
  };

  const handleDeleteClick = (decision: DecisionResponseDto) => {
    setSelectedDecision(decision);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedDecision) return;

    try {
      await deleteDecision(selectedDecision.id).unwrap();
      setDeleteDialogOpen(false);
      setSelectedDecision(null);
    } catch (error) {
      console.error('Failed to delete decision:', error);
    }
  };

  // Enhanced mobile-first card component
  const DecisionCard: React.FC<{ decision: DecisionResponseDto }> = ({
    decision,
  }) => (
    <Card
      className="group hover:shadow-lg hover:bg-muted/20 hover:scale-[1.02] transition-all duration-200 border border-border/20 bg-card shadow-sm"
      role="article"
      aria-labelledby={`decision-title-${decision.id}`}
    >
      <CardContent className="p-7">
        <div className="space-y-4">
          {/* Header with status and actions */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 border border-primary/20">
                  <Scale className="h-4 w-4 text-primary shrink-0" />
                </div>
                <span className="text-sm font-mono font-semibold text-primary tabular-nums">
                  #{decision.number}
                </span>
              </div>
              <button
                onClick={() => handleView(decision.id)}
                className="text-left w-full"
              >
                <h3
                  id={`decision-title-${decision.id}`}
                  className="text-xl font-semibold leading-tight text-card-foreground hover:text-primary transition-colors cursor-pointer tracking-wide"
                >
                  {decision.nameEn}
                </h3>
              </button>
              {decision.note && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2 font-medium">
                  {decision.note}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <AccessibleStatusBadge
                status={decision.status}
                className="shrink-0"
              />
              <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 opacity-70 group-hover:opacity-100 transition-all duration-200 hover:bg-accent hover:shadow-lg hover:scale-110 focus:ring-2 focus:ring-primary/20"
                      aria-label={t('common.actions', { item: decision.nameEn })}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="shadow-lg border-border/20">
                    <DropdownMenuItem 
                      onClick={() => handleView(decision.id)}
                      className="hover:bg-accent focus:bg-accent"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      {t('common.view')}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleEdit(decision.id)}
                      className="hover:bg-accent focus:bg-accent"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      {t('common.edit')}
                    </DropdownMenuItem>
                    <Separator />
                    <DropdownMenuItem
                      onClick={() => handleDeleteClick(decision)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      {t('common.delete')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

          {/* Details grid */}
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
            <div>
              <span className="font-medium">
                {t('decision.fields.date')}:
              </span>
              <AccessibleDate
                date={decision.date}
                className="ml-2 font-semibold"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Enhanced table header with sorting
  const SortableTableHead: React.FC<{
    field: SortField;
    children: React.ReactNode;
    className?: string;
  }> = ({ field, children, className }) => (
    <TableHead
      className={cn(
        'cursor-pointer hover:bg-muted/80 transition-all duration-200 select-none border-b-2 border-b-border/20',
        className
      )}
    >
      <button
        onClick={() => handleSort(field)}
        className="flex items-center gap-2 w-full text-left font-semibold text-foreground hover:text-primary transition-colors duration-200 py-2"
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
          <div className="h-4 w-4 opacity-50 group-hover:opacity-80 transition-opacity">
            <SortAsc className="h-4 w-4 text-foreground" />
          </div>
        )}
      </button>
    </TableHead>
  );

  // Pagination component
  const PaginationControls: React.FC = () => {
    if (!decisionsData) return null;

    const totalPages = decisionsData.totalPages;
    const currentPage = decisionsData.number;

    return (
      <div className="flex items-center justify-between">
        <div className="flex-1 text-sm text-muted-foreground">
          {t('common.showing')} {decisionsData.numberOfElements}{' '}
          {t('common.of')} {decisionsData.totalElements}{' '}
          {t('decision.decisions').toLowerCase()}
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
  if (decisionsLoading) {
    return <PageSkeleton />;
  }

  // Handle error states
  if (decisionsError) {
    return <ErrorFallback error={decisionsError as Error} type="network" />;
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <LiveRegion />

      {/* Search and Filter Controls */}
      <Card className="border-0 shadow-sm bg-muted/30">
        <CardContent className="p-4 sm:p-6">
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t('decision.placeholders.searchTerm')}
                  value={filters.searchTerm}
                  onChange={e =>
                    handleFilterChange('searchTerm', e.target.value)
                  }
                  className="pl-10"
                  aria-label={t('decision.placeholders.searchTerm')}
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
                {t('decision.advancedSearch')}
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
            <div className="flex gap-2">
              <Button
                  onClick={handleCreate}
                  className="add-new-decision-button shadow-md hover:shadow-lg transition-shadow w-full sm:w-auto relative group"
                  size={isMobile ? 'default' : 'default'}
              >
                <Plus className="h-4 w-4" />
                <span
                  className="absolute left-1/2 -translate-x-1/2 top-full mt-2 bg-background border border-border rounded-md px-2 py-1 text-xs text-foreground shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10"
                  role="tooltip"
                  aria-hidden="true"
                >
                  {t('decision.newDecision')}
                </span>
              </Button>
            </div>
          </div>

          {/* Collapsible Advanced Filters */}
          {isFilterOpen && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6 bg-muted/50 rounded-xl transition-all duration-300 ease-out mt-6">
              {/* Decision Type Filter */}
              <div className="space-y-2">
                <Label htmlFor="decision-type-filter">
                  {t('decision.fields.decisionType')}
                </Label>
                <Select
                  value={filters.decisionTypeId?.toString() || 'all'}
                  onValueChange={value =>
                    handleFilterChange(
                      'decisionTypeId',
                      value === 'all' ? null : Number(value)
                    )
                  }
                >
                  <SelectTrigger id="decision-type-filter">
                    <SelectValue
                      placeholder={t(
                        'decision.placeholders.selectDecisionType'
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('common.all')}</SelectItem>
                    {decisionTypesData?.content.map(type => (
                      <SelectItem
                        key={type.id}
                        value={type.id.toString()}
                      >
                        {type.nameEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Decision Making Body Filter */}
              <div className="space-y-2">
                <Label htmlFor="decision-body-filter">
                  {t('decision.fields.decisionMakingBody')}
                </Label>
                <Select
                  value={filters.decisionMakingBodyId?.toString() || 'all'}
                  onValueChange={value =>
                    handleFilterChange(
                      'decisionMakingBodyId',
                      value === 'all' ? null : Number(value)
                    )
                  }
                >
                  <SelectTrigger id="decision-body-filter">
                    <SelectValue
                      placeholder={t(
                        'decision.placeholders.selectDecisionMakingBody'
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('common.all')}</SelectItem>
                    {decisionMakingBodiesData?.content.map(body => (
                      <SelectItem
                        key={body.id}
                        value={body.id.toString()}
                      >
                        {body.nameEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <Label htmlFor="status-filter">
                  {t('decision.fields.status')}
                </Label>
                <Select
                  value={filters.status || 'all'}
                  onValueChange={value =>
                    handleFilterChange('status', value === 'all' ? null : value)
                  }
                >
                  <SelectTrigger id="status-filter">
                    <SelectValue
                      placeholder={t(
                        'decision.placeholders.selectStatus'
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('common.all')}</SelectItem>
                    {Object.values(DecisionStatusEnum).map(status => (
                      <SelectItem key={status} value={status}>
                        {t(`decision.status.${status.toLowerCase()}`)}
                      </SelectItem>
                    ))}
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
        </CardContent>
      </Card>

      {/* Results Section */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-3 text-xl font-semibold tracking-wide">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-200/30 flex items-center justify-center">
                <Scale className="h-5 w-5 text-emerald-600" />
              </div>
              {t('decision.decisions')}
            </CardTitle>

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
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSetViewMode('table')}
                    aria-label={t('common.tableView')}
                  >
                    <List className="h-4 w-4" />
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
                      {t(`decision.fields.${sortField}`)}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleSort('date')}>
                      <Calendar className="mr-2 h-4 w-4" />
                      {t('decision.fields.date')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSort('number')}>
                      <FileText className="mr-2 h-4 w-4" />
                      {t('decision.fields.number')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSort('nameEn')}>
                      <FileText className="mr-2 h-4 w-4" />
                      {t('decision.fields.nameEn')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSort('status')}>
                      <Scale className="mr-2 h-4 w-4" />
                      {t('decision.fields.status')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {!decisionsData?.content.length ? (
            <div className="text-center py-12">
              <div className="space-y-3">
                <Scale className="h-12 w-12 text-muted-foreground mx-auto opacity-50" />
                <div>
                  <p className="text-lg font-medium text-muted-foreground">
                    {t('decision.messages.noResults')}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {filtersApplied > 0
                      ? t('common.tryAdjustingFilters')
                      : t('decision.messages.noDecisionsYet')}
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
                  {decisionsData.content.map(decision => (
                    <DecisionCard key={decision.id} decision={decision} />
                  ))}
                </div>
              )}

              {/* Table View (Desktop Only) */}
              {viewMode === 'table' && !isMobile && (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-gradient-to-r from-muted/30 to-muted/50">
                      <TableRow className="group border-b-0 hover:bg-muted transition-all duration-200">
                        <SortableTableHead field="number">
                          {t('decision.fields.number')}
                        </SortableTableHead>
                        <SortableTableHead field="nameEn">
                          {t('decision.fields.nameEn')}
                        </SortableTableHead>
                        <SortableTableHead field="date">
                          {t('decision.fields.date')}
                        </SortableTableHead>
                        <SortableTableHead field="status">
                          {t('decision.fields.status')}
                        </SortableTableHead>
                        <TableHead className="w-[100px] text-center text-foreground font-semibold border-b-2 border-b-border/20">{t('common.actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {decisionsData.content.map((decision, index) => (
                        <TableRow key={decision.id} className={`group ${index % 2 === 1 ? 'bg-muted/20' : 'bg-background'} hover:bg-muted/40 transition-colors duration-200`}>
                          <TableCell className="font-mono font-semibold tabular-nums py-4">
                            {decision.number}
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="space-y-1 max-w-[300px]">
                              <button
                                onClick={() => handleView(decision.id)}
                                className="text-left w-full"
                              >
                                <p className="font-semibold text-base leading-tight hover:text-primary transition-colors cursor-pointer tracking-wide">
                                  {decision.nameEn}
                                </p>
                              </button>
                              {decision.note && (
                                <p className="text-sm text-muted-foreground line-clamp-2 font-medium">
                                  {decision.note}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <AccessibleDate date={decision.date} />
                          </TableCell>
                          <TableCell className="py-4">
                            <AccessibleStatusBadge status={decision.status} />
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
                                      item: decision.nameEn,
                                    })}
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="shadow-lg border-border/20">
                                  <DropdownMenuItem
                                    onClick={() => handleView(decision.id)}
                                    className="hover:bg-accent focus:bg-accent"
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    {t('common.view')}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleEdit(decision.id)}
                                    className="hover:bg-accent focus:bg-accent"
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    {t('common.edit')}
                                  </DropdownMenuItem>
                                  <Separator />
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteClick(decision)}
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  >
                                    <Trash className="mr-2 h-4 w-4" />
                                    {t('common.delete')}
                                  </DropdownMenuItem>
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
              {decisionsData.content.length > 0 && (
                <>
                  <Separator />
                  <div className="bg-gradient-to-r from-muted/30 to-muted/50 px-6 py-5 rounded-b-lg border-t border-border/20">
                    <PaginationControls />
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('common.confirm')}</DialogTitle>
            <DialogDescription>
              {t('decision.messages.confirmDelete', {
                item: selectedDecision
                  ? `"${selectedDecision.nameEn}"`
                  : t('decision.title').toLowerCase(),
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
