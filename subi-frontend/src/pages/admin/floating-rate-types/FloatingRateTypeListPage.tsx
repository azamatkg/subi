import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  RefreshCw,
  Download,
  Upload,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import { FloatingRateTypeCard } from '@/components/floating-rate-types/FloatingRateTypeCard';
import { FloatingRateTypeTable } from '@/components/floating-rate-types/FloatingRateTypeTable';
import { FloatingRateTypeFilters } from '@/components/floating-rate-types/FloatingRateTypeFilters';
import { FloatingRateTypeDeleteDialog } from '@/components/floating-rate-types/FloatingRateTypeDeleteDialog';
import { PageHeader } from '@/components/common/PageHeader';
import { PaginationControls } from '@/components/common/PaginationControls';
import { ViewModeToggle } from '@/components/common/ViewModeToggle';
import { EmptyState } from '@/components/common/EmptyState';

import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/hooks/useAuth';
import { useFloatingRateTypeFilters } from '@/hooks/useFloatingRateTypeFilters';
import { useFloatingRateTypeActions } from '@/hooks/useFloatingRateTypeActions';
import {
  useGetFloatingRateTypesQuery,
  useSearchFloatingRateTypesQuery,
} from '@/store/api/floatingRateTypeApi';

import type { ViewMode, SortDirection } from '@/types/reference';
import { ROUTES } from '@/constants';

const ITEMS_PER_PAGE_OPTIONS = [10, 20, 50, 100];
const DEFAULT_PAGE_SIZE = 20;

export const FloatingRateTypeListPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // View and pagination state
  const [viewMode, setViewMode] = useState<ViewMode>('CARD');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [sortField, setSortField] = useState<string>('nameEn');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Hooks
  const {
    filters,
    updateFilters,
    clearFilters,
    hasActiveFilters,
    filtersApplied,
    getSearchParams,
    handleFilterChange,
    isFilterOpen,
    toggleFilterPanel,
  } = useFloatingRateTypeFilters();

  const {
    deleteDialogOpen,
    selectedFloatingRateType,
    error,
    isDeleting,
    isReferenced,
    referenceCount,
    handleCreate,
    handleView,
    handleEdit,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
    clearError,
  } = useFloatingRateTypeActions();

  // Determine which query to use based on filters
  const hasSearchFilters = useMemo(() => {
    const params = getSearchParams();
    return Object.keys(params).length > 0;
  }, [getSearchParams]);

  // Build query parameters
  const queryParams = useMemo(() => {
    const params = {
      page: currentPage,
      size: pageSize,
      sort: `${sortField},${sortDirection}`,
    };

    if (hasSearchFilters) {
      return { ...params, ...getSearchParams() };
    }

    return params;
  }, [currentPage, pageSize, sortField, sortDirection, hasSearchFilters, getSearchParams]);

  // Data fetching
  const searchQuery = useSearchFloatingRateTypesQuery(queryParams, { skip: !hasSearchFilters });
  const listQuery = useGetFloatingRateTypesQuery(queryParams, { skip: hasSearchFilters });

  const {
    data: floatingRateTypesResponse,
    isLoading,
    isError,
    error: apiError,
    refetch,
  } = hasSearchFilters ? searchQuery : listQuery;

  const userRoles = user?.roles || [];
  const canCreate = userRoles.includes('ADMIN');
  const canExport = userRoles.includes('ADMIN');

  // URL state synchronization
  useEffect(() => {
    const params = new URLSearchParams();

    if (viewMode !== 'CARD') params.set('view', viewMode.toLowerCase());
    if (currentPage > 0) params.set('page', currentPage.toString());
    if (pageSize !== DEFAULT_PAGE_SIZE) params.set('size', pageSize.toString());
    if (sortField !== 'nameEn') params.set('sort', sortField);
    if (sortDirection !== 'asc') params.set('dir', sortDirection);

    // Add filter parameters
    if (filters.searchTerm) params.set('search', filters.searchTerm);
    if (filters.status) params.set('status', filters.status);
    if (filters.rateCalculationType) params.set('rateType', filters.rateCalculationType);

    setSearchParams(params);
  }, [viewMode, currentPage, pageSize, sortField, sortDirection, filters, setSearchParams]);

  // Initialize from URL params
  useEffect(() => {
    const view = searchParams.get('view') as ViewMode;
    const page = parseInt(searchParams.get('page') || '0', 10);
    const size = parseInt(searchParams.get('size') || DEFAULT_PAGE_SIZE.toString(), 10);
    const sort = searchParams.get('sort') || 'nameEn';
    const dir = searchParams.get('dir') as SortDirection || 'asc';

    if (view && view !== viewMode) setViewMode(view);
    if (page !== currentPage) setCurrentPage(page);
    if (size !== pageSize) setPageSize(size);
    if (sort !== sortField) setSortField(sort);
    if (dir !== sortDirection) setSortDirection(dir);

    // Initialize filters from URL
    const searchTerm = searchParams.get('search') || '';
    const status = searchParams.get('status') || null;
    const rateCalculationType = searchParams.get('rateType') || null;

    updateFilters({
      searchTerm,
      status: status as any,
      rateCalculationType: rateCalculationType as any,
    });
  }, [searchParams]);

  // Event handlers
  const handleSort = (field: string, direction: SortDirection) => {
    setSortField(field);
    setSortDirection(direction);
    setCurrentPage(0); // Reset to first page when sorting
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(0); // Reset to first page when changing page size
  };

  const handleRefresh = () => {
    refetch();
    clearError();
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export floating rate types');
  };

  const handleImport = () => {
    // TODO: Implement import functionality
    console.log('Import floating rate types');
  };

  // Data
  const floatingRateTypes = floatingRateTypesResponse?.content || [];
  const totalElements = floatingRateTypesResponse?.totalElements || 0;
  const totalPages = floatingRateTypesResponse?.totalPages || 0;
  const isEmpty = totalElements === 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={t('floatingRateType.floatingRateTypes')}
        subtitle={t('floatingRateType.subtitle')}
        icon={TrendingUp}
        breadcrumbs={[
          { label: t('navigation.admin'), href: ROUTES.ADMIN },
          { label: t('navigation.references'), href: `${ROUTES.ADMIN}/references` },
          { label: t('floatingRateType.floatingRateTypes') },
        ]}
      />

      {/* Filters */}
      <FloatingRateTypeFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
        filtersApplied={filtersApplied}
        isFilterOpen={isFilterOpen}
        onToggleFilter={toggleFilterPanel}
        onCreateNew={canCreate ? handleCreate : undefined}
        loading={isLoading}
      />

      {/* Toolbar */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <ViewModeToggle
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                disabled={isLoading}
              />
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {t('common.showing')} {isEmpty ? 0 : currentPage * pageSize + 1}-
                  {Math.min((currentPage + 1) * pageSize, totalElements)} {t('common.of')} {totalElements}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {t('common.refresh')}
              </Button>

              {canExport && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExport}
                    disabled={isLoading || isEmpty}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {t('common.export')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleImport}
                    disabled={isLoading}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {t('common.import')}
                  </Button>
                </>
              )}

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{t('common.rowsPerPage')}:</span>
                <Select
                  value={pageSize.toString()}
                  onValueChange={(value) => handlePageSizeChange(parseInt(value, 10))}
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option.toString()}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {isError && (
        <Alert variant="destructive">
          <AlertDescription>
            {(apiError as any)?.data?.message || t('floatingRateType.messages.loadError')}
          </AlertDescription>
        </Alert>
      )}

      {/* Content */}
      {isEmpty && !isLoading ? (
        <EmptyState
          icon={TrendingUp}
          title={hasActiveFilters ? t('floatingRateType.messages.noResults') : t('floatingRateType.messages.empty')}
          description={
            hasActiveFilters
              ? t('floatingRateType.messages.noResultsDescription')
              : t('floatingRateType.messages.emptyDescription')
          }
          action={
            hasActiveFilters ? (
              <Button variant="outline" onClick={clearFilters}>
                {t('common.clearFilters')}
              </Button>
            ) : canCreate ? (
              <Button onClick={handleCreate}>
                {t('floatingRateType.createFirst')}
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-4">
          {/* List Content */}
          {viewMode === 'CARD' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {floatingRateTypes.map((floatingRateType) => (
                <FloatingRateTypeCard
                  key={floatingRateType.id}
                  floatingRateType={floatingRateType}
                  onView={() => handleView(floatingRateType.id)}
                  onEdit={() => handleEdit(floatingRateType.id)}
                  onDelete={() => handleDeleteClick(floatingRateType)}
                  loading={isLoading}
                />
              ))}
              {isLoading &&
                [...Array(6)].map((_, i) => (
                  <div key={i} className="h-48 bg-gray-100 rounded-lg animate-pulse" />
                ))}
            </div>
          ) : (
            <FloatingRateTypeTable
              floatingRateTypes={floatingRateTypes}
              onView={(floatingRateType) => handleView(floatingRateType.id)}
              onEdit={(floatingRateType) => handleEdit(floatingRateType.id)}
              onDelete={handleDeleteClick}
              onSort={handleSort}
              sortField={sortField}
              sortDirection={sortDirection}
              loading={isLoading}
            />
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              disabled={isLoading}
            />
          )}
        </div>
      )}

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