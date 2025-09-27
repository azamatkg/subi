import { useState, useEffect, useMemo } from 'react';
import type {
  DocumentTypeFilterState,
  DocumentTypeSearchParams,
  DocumentCategory,
  ApplicantType,
  DocumentPriority,
  VerificationLevel
} from '@/types/documentType';
import type { ReferenceEntityStatus } from '@/types/reference';

export const useDocumentTypeFilters = () => {
  const [filters, setFilters] = useState<DocumentTypeFilterState>({
    searchTerm: '',
    status: null,
    category: null,
    applicantType: null,
    priority: null,
    verificationLevel: null,
    hasTemplate: null,
    requiresOriginal: null,
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filtersApplied, setFiltersApplied] = useState(0);

  // Count applied filters
  useEffect(() => {
    let count = 0;
    if (filters.searchTerm.trim()) count++;
    if (filters.status) count++;
    if (filters.category) count++;
    if (filters.applicantType) count++;
    if (filters.priority) count++;
    if (filters.verificationLevel) count++;
    if (filters.hasTemplate !== null) count++;
    if (filters.requiresOriginal !== null) count++;
    setFiltersApplied(count);
  }, [filters]);

  const handleFilterChange = (
    key: keyof DocumentTypeFilterState,
    value: string | ReferenceEntityStatus | DocumentCategory | ApplicantType | DocumentPriority | VerificationLevel | boolean | null
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const updateFilters = (updates: Partial<DocumentTypeFilterState>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  };

  const clearFilters = () => {
    setFilters({
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

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return filtersApplied > 0;
  }, [filtersApplied]);

  // Convert UI filters to API search parameters
  const getSearchParams = (): DocumentTypeSearchParams => {
    const params: DocumentTypeSearchParams = {};

    if (filters.searchTerm.trim()) {
      params.searchTerm = filters.searchTerm.trim();
    }

    if (filters.status) {
      params.status = filters.status;
    }

    if (filters.category) {
      params.category = filters.category;
    }

    if (filters.applicantType) {
      params.applicantType = filters.applicantType;
    }

    if (filters.priority) {
      params.priority = filters.priority;
    }

    if (filters.verificationLevel) {
      params.verificationLevel = filters.verificationLevel;
    }

    if (filters.hasTemplate !== null) {
      params.hasTemplate = filters.hasTemplate;
    }

    if (filters.requiresOriginal !== null) {
      params.requiresOriginal = filters.requiresOriginal;
    }

    return params;
  };

  // Filter panel controls
  const toggleFilterPanel = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const closeFilterPanel = () => {
    setIsFilterOpen(false);
  };

  const openFilterPanel = () => {
    setIsFilterOpen(true);
  };

  // Advanced filter helpers
  const hasAdvancedFilters = useMemo(() => {
    return Boolean(
      filters.priority ||
      filters.verificationLevel ||
      filters.hasTemplate !== null ||
      filters.requiresOriginal !== null
    );
  }, [filters.priority, filters.verificationLevel, filters.hasTemplate, filters.requiresOriginal]);

  const getFilterSummary = (): string[] => {
    const summary: string[] = [];

    if (filters.searchTerm.trim()) {
      summary.push(`Search: "${filters.searchTerm}"`);
    }

    if (filters.status) {
      summary.push(`Status: ${filters.status}`);
    }

    if (filters.category) {
      summary.push(`Category: ${filters.category}`);
    }

    if (filters.applicantType) {
      summary.push(`Applicant: ${filters.applicantType}`);
    }

    if (filters.priority) {
      summary.push(`Priority: ${filters.priority}`);
    }

    if (filters.verificationLevel) {
      summary.push(`Verification: ${filters.verificationLevel}`);
    }

    if (filters.hasTemplate !== null) {
      summary.push(`Has Template: ${filters.hasTemplate ? 'Yes' : 'No'}`);
    }

    if (filters.requiresOriginal !== null) {
      summary.push(`Requires Original: ${filters.requiresOriginal ? 'Yes' : 'No'}`);
    }

    return summary;
  };

  // Reset specific filter groups
  const clearBasicFilters = () => {
    updateFilters({
      searchTerm: '',
      status: null,
      category: null,
      applicantType: null,
    });
  };

  const clearAdvancedFilters = () => {
    updateFilters({
      priority: null,
      verificationLevel: null,
      hasTemplate: null,
      requiresOriginal: null,
    });
  };

  return {
    filters,
    updateFilters,
    clearFilters,
    hasActiveFilters,
    filtersApplied,
    getSearchParams,
    handleFilterChange,

    // Filter panel state
    isFilterOpen,
    toggleFilterPanel,
    closeFilterPanel,
    openFilterPanel,

    // Advanced filter helpers
    hasAdvancedFilters,
    getFilterSummary,
    clearBasicFilters,
    clearAdvancedFilters,
  };
};