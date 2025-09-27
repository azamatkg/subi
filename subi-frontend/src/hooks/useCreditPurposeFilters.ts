import { useState, useEffect, useMemo } from 'react';
import type {
  CreditPurposeFilterState,
  CreditPurposeSearchParams,
  CreditPurposeCategory
} from '@/types/creditPurpose';
import type { ReferenceEntityStatus } from '@/types/reference';

export const useCreditPurposeFilters = () => {
  const [filters, setFilters] = useState<CreditPurposeFilterState>({
    searchTerm: '',
    status: null,
    category: null,
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filtersApplied, setFiltersApplied] = useState(0);

  // Count applied filters
  useEffect(() => {
    let count = 0;
    if (filters.searchTerm.trim()) count++;
    if (filters.status) count++;
    if (filters.category) count++;
    setFiltersApplied(count);
  }, [filters]);

  const handleFilterChange = (
    key: keyof CreditPurposeFilterState,
    value: string | ReferenceEntityStatus | CreditPurposeCategory | null
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const updateFilters = (updates: Partial<CreditPurposeFilterState>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      status: null,
      category: null,
    });
  };

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return filtersApplied > 0;
  }, [filtersApplied]);

  // Convert UI filters to API search parameters
  const getSearchParams = (): CreditPurposeSearchParams => {
    const params: CreditPurposeSearchParams = {};

    if (filters.searchTerm.trim()) {
      params.searchTerm = filters.searchTerm.trim();
    }

    if (filters.status) {
      params.status = filters.status;
    }

    if (filters.category) {
      params.category = filters.category;
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
  };
};