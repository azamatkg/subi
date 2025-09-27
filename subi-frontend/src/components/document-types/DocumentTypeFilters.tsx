import React from 'react';
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  X,
  RefreshCw,
  Plus,
  Settings,
  FileText,
  Shield,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/hooks/useAuth';
import type {
  DocumentTypeFilterState,
  DocumentCategory,
  ApplicantType,
  DocumentPriority,
  VerificationLevel,
} from '@/types/documentType';
import { ReferenceEntityStatus } from '@/types/reference';

interface DocumentTypeFiltersProps {
  filters: DocumentTypeFilterState;
  onFiltersChange: (filters: DocumentTypeFilterState) => void;
  onCreateClick?: () => void;
  onRefresh?: () => void;
  loading?: boolean;
  className?: string;
}

export const DocumentTypeFilters: React.FC<DocumentTypeFiltersProps> = ({
  filters,
  onFiltersChange,
  onCreateClick,
  onRefresh,
  loading = false,
  className,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);

  const userRoles = user?.roles || [];
  const canCreate = userRoles.includes('ADMIN');

  // Count applied filters
  const filtersApplied = React.useMemo(() => {
    let count = 0;
    if (filters.searchTerm.trim()) count++;
    if (filters.status) count++;
    if (filters.category) count++;
    if (filters.applicantType) count++;
    if (filters.priority) count++;
    if (filters.verificationLevel) count++;
    if (filters.hasTemplate !== null) count++;
    if (filters.requiresOriginal !== null) count++;
    return count;
  }, [filters]);

  const handleFilterChange = <K extends keyof DocumentTypeFilterState>(
    key: K,
    value: DocumentTypeFilterState[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      searchTerm: '',
      status: null,
      category: null,
      applicantType: null,
      priority: null,
      verificationLevel: null,
      hasTemplate: null,
      requiresOriginal: null,
    });
  };

  const clearBasicFilters = () => {
    onFiltersChange({
      ...filters,
      searchTerm: '',
      status: null,
      category: null,
      applicantType: null,
    });
  };

  const clearAdvancedFilters = () => {
    onFiltersChange({
      ...filters,
      priority: null,
      verificationLevel: null,
      hasTemplate: null,
      requiresOriginal: null,
    });
  };

  // Filter options
  const documentCategories: DocumentCategory[] = [
    'IDENTITY',
    'FINANCIAL',
    'LEGAL',
    'COLLATERAL',
    'INSURANCE',
    'BUSINESS',
    'PERSONAL',
    'GUARANTOR',
    'OTHER',
  ];

  const applicantTypes: ApplicantType[] = [
    'INDIVIDUAL',
    'LEGAL_ENTITY',
    'SOLE_PROPRIETOR',
    'GUARANTOR',
    'ALL',
  ];

  const priorities: DocumentPriority[] = [
    'MANDATORY',
    'OPTIONAL',
    'CONDITIONAL',
  ];

  const verificationLevels: VerificationLevel[] = [
    'NONE',
    'BASIC',
    'ENHANCED',
    'NOTARIZED',
  ];

  return (
    <div className={cn('space-y-4', className)}>
      {/* Main search and actions bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={t('documentType.searchPlaceholder')}
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            className="pl-10"
            disabled={loading}
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          {/* Advanced filters toggle */}
          <Button
            variant="outline"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2"
            disabled={loading}
          >
            <Filter className="h-4 w-4" />
            {t('common.filter')}
            {filtersApplied > 0 && (
              <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                {filtersApplied}
              </Badge>
            )}
            {isFilterOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>

          {/* Create button */}
          {canCreate && onCreateClick && (
            <Button onClick={onCreateClick} disabled={loading}>
              <Plus className="mr-2 h-4 w-4" />
              {t('documentType.newDocumentType')}
            </Button>
          )}

          {/* Refresh button */}
          <Button
            variant="outline"
            size="icon"
            disabled={loading}
            onClick={onRefresh}
          >
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          </Button>
        </div>
      </div>

      {/* Advanced filters panel */}
      {isFilterOpen && (
        <div className="border rounded-lg p-4 bg-gray-50 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">
              {t('common.filters')}
            </h3>
            {filtersApplied > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="mr-1 h-3 w-3" />
                {t('common.clearFilters')}
              </Button>
            )}
          </div>

          {/* Basic filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Status filter */}
            <div className="space-y-2">
              <Label htmlFor="status-filter" className="text-sm font-medium">
                {t('documentType.fields.status')}
              </Label>
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) =>
                  handleFilterChange('status', value === 'all' ? null : value as typeof ReferenceEntityStatus.ACTIVE)
                }
              >
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder={t('common.selectStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all')}</SelectItem>
                  <SelectItem value={ReferenceEntityStatus.ACTIVE}>
                    {t('references.status.active')}
                  </SelectItem>
                  <SelectItem value={ReferenceEntityStatus.INACTIVE}>
                    {t('references.status.inactive')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category filter */}
            <div className="space-y-2">
              <Label htmlFor="category-filter" className="text-sm font-medium">
                {t('documentType.fields.category')}
              </Label>
              <Select
                value={filters.category || 'all'}
                onValueChange={(value) =>
                  handleFilterChange('category', value === 'all' ? null : value as DocumentCategory)
                }
              >
                <SelectTrigger id="category-filter">
                  <SelectValue placeholder={t('common.selectCategory')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all')}</SelectItem>
                  {documentCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {t(`documentType.category.${category.toLowerCase()}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Applicant Type filter */}
            <div className="space-y-2">
              <Label htmlFor="applicant-filter" className="text-sm font-medium">
                {t('documentType.fields.applicantType')}
              </Label>
              <Select
                value={filters.applicantType || 'all'}
                onValueChange={(value) =>
                  handleFilterChange('applicantType', value === 'all' ? null : value as ApplicantType)
                }
              >
                <SelectTrigger id="applicant-filter">
                  <SelectValue placeholder={t('common.selectApplicantType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all')}</SelectItem>
                  {applicantTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {t(`documentType.applicantType.${type.toLowerCase()}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority filter */}
            <div className="space-y-2">
              <Label htmlFor="priority-filter" className="text-sm font-medium">
                {t('documentType.fields.priority')}
              </Label>
              <Select
                value={filters.priority || 'all'}
                onValueChange={(value) =>
                  handleFilterChange('priority', value === 'all' ? null : value as DocumentPriority)
                }
              >
                <SelectTrigger id="priority-filter">
                  <SelectValue placeholder={t('common.selectPriority')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all')}</SelectItem>
                  {priorities.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {t(`documentType.priority.${priority.toLowerCase()}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Advanced filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Verification Level filter */}
            <div className="space-y-2">
              <Label htmlFor="verification-filter" className="text-sm font-medium">
                {t('documentType.fields.verificationLevel')}
              </Label>
              <Select
                value={filters.verificationLevel || 'all'}
                onValueChange={(value) =>
                  handleFilterChange('verificationLevel', value === 'all' ? null : value as VerificationLevel)
                }
              >
                <SelectTrigger id="verification-filter">
                  <SelectValue placeholder={t('common.selectVerification')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all')}</SelectItem>
                  {verificationLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {t(`documentType.verification.${level.toLowerCase()}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Has Template filter */}
            <div className="space-y-2">
              <Label htmlFor="template-filter" className="text-sm font-medium">
                {t('documentType.features.hasTemplate')}
              </Label>
              <Select
                value={filters.hasTemplate === null ? 'all' : filters.hasTemplate ? 'yes' : 'no'}
                onValueChange={(value) =>
                  handleFilterChange('hasTemplate', value === 'all' ? null : value === 'yes')
                }
              >
                <SelectTrigger id="template-filter">
                  <SelectValue placeholder={t('common.selectTemplate')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all')}</SelectItem>
                  <SelectItem value="yes">{t('common.yes')}</SelectItem>
                  <SelectItem value="no">{t('common.no')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Requires Original filter */}
            <div className="space-y-2">
              <Label htmlFor="original-filter" className="text-sm font-medium">
                {t('documentType.features.requiresOriginal')}
              </Label>
              <Select
                value={filters.requiresOriginal === null ? 'all' : filters.requiresOriginal ? 'yes' : 'no'}
                onValueChange={(value) =>
                  handleFilterChange('requiresOriginal', value === 'all' ? null : value === 'yes')
                }
              >
                <SelectTrigger id="original-filter">
                  <SelectValue placeholder={t('common.selectOriginal')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all')}</SelectItem>
                  <SelectItem value="yes">{t('common.yes')}</SelectItem>
                  <SelectItem value="no">{t('common.no')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active filters display */}
          {filtersApplied > 0 && (
            <div className="flex items-center gap-2 pt-2 border-t">
              <span className="text-sm text-gray-600">
                {t('common.activeFilters')}:
              </span>
              <div className="flex flex-wrap gap-1">
                {filters.searchTerm && (
                  <Badge variant="secondary" className="text-xs">
                    {t('common.search')}: {filters.searchTerm}
                  </Badge>
                )}
                {filters.status && (
                  <Badge variant="secondary" className="text-xs">
                    {t('documentType.fields.status')}: {t(`references.status.${filters.status.toLowerCase()}`)}
                  </Badge>
                )}
                {filters.category && (
                  <Badge variant="secondary" className="text-xs">
                    {t('documentType.fields.category')}: {t(`documentType.category.${filters.category.toLowerCase()}`)}
                  </Badge>
                )}
                {filters.applicantType && (
                  <Badge variant="secondary" className="text-xs">
                    {t('documentType.fields.applicantType')}: {t(`documentType.applicantType.${filters.applicantType.toLowerCase()}`)}
                  </Badge>
                )}
                {filters.priority && (
                  <Badge variant="secondary" className="text-xs">
                    {t('documentType.fields.priority')}: {t(`documentType.priority.${filters.priority.toLowerCase()}`)}
                  </Badge>
                )}
                {filters.verificationLevel && (
                  <Badge variant="secondary" className="text-xs">
                    {t('documentType.fields.verificationLevel')}: {t(`documentType.verification.${filters.verificationLevel.toLowerCase()}`)}
                  </Badge>
                )}
                {filters.hasTemplate !== null && (
                  <Badge variant="secondary" className="text-xs">
                    {t('documentType.features.hasTemplate')}: {filters.hasTemplate ? t('common.yes') : t('common.no')}
                  </Badge>
                )}
                {filters.requiresOriginal !== null && (
                  <Badge variant="secondary" className="text-xs">
                    {t('documentType.features.requiresOriginal')}: {filters.requiresOriginal ? t('common.yes') : t('common.no')}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};