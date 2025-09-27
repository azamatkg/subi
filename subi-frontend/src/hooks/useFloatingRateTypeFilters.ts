import { useState, useEffect, useMemo } from 'react';
import type {
  FloatingRateTypeFilterState,
  FloatingRateTypeSearchParams,
  FloatingRateCalculationType
} from '@/types/floatingRateType';
import type { ReferenceEntityStatus } from '@/types/reference';

export const useFloatingRateTypeFilters = () => {
  const [filters, setFilters] = useState<FloatingRateTypeFilterState>({
    searchTerm: '',
    status: null,
    rateCalculationType: null,
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filtersApplied, setFiltersApplied] = useState(0);

  // Count applied filters
  useEffect(() => {
    let count = 0;
    if (filters.searchTerm.trim()) count++;
    if (filters.status) count++;
    if (filters.rateCalculationType) count++;
    setFiltersApplied(count);
  }, [filters]);

  const handleFilterChange = (
    key: keyof FloatingRateTypeFilterState,
    value: string | ReferenceEntityStatus | FloatingRateCalculationType | null
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const updateFilters = (updates: Partial<FloatingRateTypeFilterState>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      status: null,
      rateCalculationType: null,
    });
  };

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return filtersApplied > 0;
  }, [filtersApplied]);

  // Convert UI filters to API search parameters
  const getSearchParams = (): FloatingRateTypeSearchParams => {
    const params: FloatingRateTypeSearchParams = {};

    if (filters.searchTerm.trim()) {
      params.searchTerm = filters.searchTerm.trim();
    }

    if (filters.status) {
      params.status = filters.status;
    }

    if (filters.rateCalculationType) {
      params.rateCalculationType = filters.rateCalculationType;
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