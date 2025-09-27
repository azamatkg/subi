import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  Grid,
  List,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { useTranslation } from '@/hooks/useTranslation';
import { useSetPageTitle } from '@/hooks/useSetPageTitle';
import { useAuth } from '@/hooks/useAuth';
import { useViewMode } from '@/hooks/useViewMode';
import { useCurrencyFilters } from '@/hooks/useCurrencyFilters';
import { useCurrencyActions } from '@/hooks/useCurrencyActions';
import {
  useSearchCurrenciesQuery,
  useGetCurrenciesQuery,
} from '@/store/api/currencyApi';

// Components
import { CurrencyCard } from '@/components/currencies/CurrencyCard';
import { CurrencyTable } from '@/components/currencies/CurrencyTable';
import { CurrencyFilters } from '@/components/currencies/CurrencyFilters';
import { CurrencyCreateForm } from '@/components/currencies/CurrencyCreateForm';
import { CurrencyDeleteDialog } from '@/components/currencies/CurrencyDeleteDialog';

// ViewMode from useViewMode hook uses 'card' | 'table'
import { PAGINATION } from '@/constants';

type CurrencySortField = 'code' | 'nameEn' | 'nameRu' | 'nameKg' | 'status' | 'createdAt' | 'updatedAt';

export const CurrencyListPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { viewMode, setViewMode } = useViewMode();

  // Set page title
  useSetPageTitle(t('currency.currencies'));

  // State management
  const [page, setPage] = useState(0);
  const [sortField, setSortField] = useState<CurrencySortField>('nameEn');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Hooks
  const {
    filters,
    hasActiveFilters,
    clearFilters,
    updateFilters,
    getSearchParams,
  } = useCurrencyFilters();

  const {
    deleteDialogOpen,
    selectedCurrency,
    isDeleting,
    isReferenced,
    referenceCount,
    error,
    handleCreate,
    handleView,
    handleEdit,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
  } = useCurrencyActions();

  // Permissions
  const userRoles = user?.roles || [];
  const canCreate = userRoles.includes('ADMIN');

  // Build sort parameter
  const sortParam = `${sortField},${sortDirection}`;

  // API queries - use search if filters are applied, otherwise use basic query
  const searchParams = useMemo(() => ({
    ...getSearchParams(),
    page,
    size: PAGINATION.DEFAULT_PAGE_SIZE,
    sort: sortParam,
  }), [getSearchParams, page, sortParam]);

  const {
    data: searchResults,
    isLoading: isSearchLoading,
    error: searchError,
  } = useSearchCurrenciesQuery(searchParams, {
    skip: !hasActiveFilters,
  });

  const {
    data: basicResults,
    isLoading: isBasicLoading,
    error: basicError,
  } = useGetCurrenciesQuery({
    page,
    size: PAGINATION.DEFAULT_PAGE_SIZE,
    sort: sortParam,
  }, {
    skip: hasActiveFilters,
  });

  // Use appropriate data source
  const data = hasActiveFilters ? searchResults : basicResults;
  const isLoading = hasActiveFilters ? isSearchLoading : isBasicLoading;
  const apiError = hasActiveFilters ? searchError : basicError;

  const currencies = data?.content || [];
  const totalElements = data?.totalElements || 0;
  const totalPages = data?.totalPages || 0;

  // Handlers
  const handleSort = (field: CurrencySortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setPage(0); // Reset to first page when sorting changes
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleFiltersChange = (newFilters: typeof filters) => {
    updateFilters(newFilters);
    setPage(0); // Reset to first page when filters change
  };

  const handleCreateSuccess = () => {
    // Refresh data by invalidating the cache
    // RTK Query will automatically refetch
  };

  // Loading state
  if (isLoading && currencies.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
          <div className="grid gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (apiError) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-600">Error loading currencies</p>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="mt-4"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{t('currency.currencies')}</h1>
              <p className="text-gray-500">
                {t('references.description')}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <CurrencyFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onCreateClick={canCreate ? handleCreate : undefined}
          loading={isLoading}
        />

        {/* Results header with view toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-500">
              {t('common.showing')} {currencies.length} {t('common.of')} {totalElements} {t('currency.currencies').toLowerCase()}
            </p>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-gray-500 hover:text-gray-700"
              >
                {t('common.clearFilters')}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'card' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('card')}
            >
              <Grid className="h-4 w-4 mr-2" />
              {t('common.cardView')}
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              <List className="h-4 w-4 mr-2" />
              {t('common.tableView')}
            </Button>
          </div>
        </div>

        {/* Content */}
        {currencies.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <DollarSign className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('currency.messages.noCurrenciesFound')}
                </h3>
                <p className="text-gray-500 mb-6">
                  {hasActiveFilters
                    ? t('common.tryAdjustingFilters')
                    : t('currency.messages.noCurrenciesFound')
                  }
                </p>
                {canCreate && !hasActiveFilters && (
                  <CurrencyCreateForm
                    onSuccess={handleCreateSuccess}
                    trigger={
                      <Button>
                        <DollarSign className="mr-2 h-4 w-4" />
                        {t('currency.newCurrency')}
                      </Button>
                    }
                  />
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {viewMode === 'card' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currencies.map((currency) => (
                  <CurrencyCard
                    key={currency.id}
                    currency={currency}
                    onView={(currency) => handleView(currency.id)}
                    onEdit={(currency) => handleEdit(currency.id)}
                    onDelete={handleDeleteClick}
                    loading={isLoading}
                  />
                ))}
              </div>
            ) : (
              <CurrencyTable
                currencies={currencies}
                loading={isLoading}
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
                onView={(currency) => handleView(currency.id)}
                onEdit={(currency) => handleEdit(currency.id)}
                onDelete={handleDeleteClick}
              />
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  {t('common.page')} {page + 1} {t('common.of')} {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 0}
                  >
                    {t('common.previous')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= totalPages - 1}
                  >
                    {t('common.next')}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Delete Dialog */}
        <CurrencyDeleteDialog
          open={deleteDialogOpen}
          onOpenChange={() => {}}
          currency={selectedCurrency}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          isDeleting={isDeleting}
          isReferenced={isReferenced}
          referenceCount={referenceCount}
          error={error}
        />
      </div>
    </div>
  );
};