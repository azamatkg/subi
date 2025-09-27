import React, { useState, useMemo } from 'react';
import {
  FileText,
  Grid,
  List,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { useTranslation } from '@/hooks/useTranslation';
import { useSetPageTitle } from '@/hooks/useSetPageTitle';
import { useAuth } from '@/hooks/useAuth';
import { useViewMode } from '@/hooks/useViewMode';
import { useDocumentTypeFilters } from '@/hooks/useDocumentTypeFilters';
import { useDocumentTypeActions } from '@/hooks/useDocumentTypeActions';
import {
  useSearchDocumentTypesQuery,
  useGetDocumentTypesQuery,
} from '@/store/api/documentTypeApi';

// Components
import { DocumentTypeCard } from '@/components/document-types/DocumentTypeCard';
import { DocumentTypeTable } from '@/components/document-types/DocumentTypeTable';
import { DocumentTypeFilters } from '@/components/document-types/DocumentTypeFilters';
import { DocumentTypeDeleteDialog } from '@/components/document-types/DocumentTypeDeleteDialog';

import { PAGINATION } from '@/constants';

type DocumentTypeSortField = 'name' | 'nameEn' | 'nameRu' | 'nameKg' | 'category' | 'applicantType' | 'priority' | 'status' | 'createdAt' | 'updatedAt';

export const DocumentTypeListPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { viewMode, setViewMode } = useViewMode();

  // Set page title
  useSetPageTitle(t('documentType.documentTypes'));

  // State management
  const [page, setPage] = useState(0);
  const [sortField, setSortField] = useState<DocumentTypeSortField>('nameEn');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Hooks
  const {
    filters,
    hasActiveFilters,
    clearFilters,
    updateFilters,
    getSearchParams,
  } = useDocumentTypeFilters();

  const {
    deleteDialogOpen,
    selectedDocumentType,
    isDeleting,
    isReferenced,
    referenceCount,
    referenceDetails,
    error,
    handleCreate,
    handleView,
    handleEdit,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
    duplicateDocumentType,
  } = useDocumentTypeActions();

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
    refetch: refetchSearch,
  } = useSearchDocumentTypesQuery(searchParams, {
    skip: !hasActiveFilters,
  });

  const {
    data: basicResults,
    isLoading: isBasicLoading,
    error: basicError,
    refetch: refetchBasic,
  } = useGetDocumentTypesQuery({
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

  const documentTypes = data?.content || [];
  const totalElements = data?.totalElements || 0;
  const totalPages = data?.totalPages || 0;

  // Handlers
  const handleSort = (field: DocumentTypeSortField) => {
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

  const handleRefresh = () => {
    if (hasActiveFilters) {
      refetchSearch();
    } else {
      refetchBasic();
    }
  };

  // Loading state
  if (isLoading && documentTypes.length === 0) {
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
              <p className="text-red-600">{t('documentType.messages.errorLoading')}</p>
              <Button
                variant="outline"
                onClick={handleRefresh}
                className="mt-4"
              >
                {t('common.retry')}
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
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{t('documentType.documentTypes')}</h1>
              <p className="text-gray-500">
                {t('documentType.description')}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <DocumentTypeFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onCreateClick={canCreate ? handleCreate : undefined}
          onRefresh={handleRefresh}
          loading={isLoading}
        />

        {/* Results header with view toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-500">
              {t('common.showing')} {documentTypes.length} {t('common.of')} {totalElements} {t('documentType.documentTypes').toLowerCase()}
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
        {documentTypes.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('documentType.messages.noDocumentTypesFound')}
                </h3>
                <p className="text-gray-500 mb-6">
                  {hasActiveFilters
                    ? t('common.tryAdjustingFilters')
                    : t('documentType.messages.noDocumentTypesDescription')
                  }
                </p>
                {canCreate && !hasActiveFilters && (
                  <Button onClick={handleCreate}>
                    <FileText className="mr-2 h-4 w-4" />
                    {t('documentType.newDocumentType')}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {viewMode === 'card' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {documentTypes.map((documentType) => (
                  <DocumentTypeCard
                    key={documentType.id}
                    documentType={documentType}
                    onView={(documentType) => handleView(documentType.id)}
                    onEdit={(documentType) => handleEdit(documentType.id)}
                    onDelete={handleDeleteClick}
                    onDuplicate={duplicateDocumentType}
                    loading={isLoading}
                  />
                ))}
              </div>
            ) : (
              <DocumentTypeTable
                documentTypes={documentTypes}
                loading={isLoading}
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
                onView={(documentType) => handleView(documentType.id)}
                onEdit={(documentType) => handleEdit(documentType.id)}
                onDelete={handleDeleteClick}
                onDuplicate={duplicateDocumentType}
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
        <DocumentTypeDeleteDialog
          open={deleteDialogOpen}
          onOpenChange={handleDeleteCancel}
          documentType={selectedDocumentType}
          onConfirm={handleDeleteConfirm}
          loading={isDeleting}
          error={error}
          isReferenced={isReferenced}
          referenceCount={referenceCount}
          referenceDetails={referenceDetails}
        />
      </div>
    </div>
  );
};