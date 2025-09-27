import { useState, useEffect, useMemo } from 'react';
import type {
  CurrencyFilterState,
  CurrencySearchParams
} from '@/types/currency';
import type { ReferenceEntityStatus } from '@/types/reference';

export const useCurrencyFilters = () => {
  const [filters, setFilters] = useState<CurrencyFilterState>({
    searchTerm: '',
    status: null,
    codeFilter: '',
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filtersApplied, setFiltersApplied] = useState(0);

  // Count applied filters
  useEffect(() => {
    let count = 0;
    if (filters.searchTerm.trim()) count++;
    if (filters.status) count++;
    if (filters.codeFilter?.trim()) count++;
    setFiltersApplied(count);
  }, [filters]);

  const handleFilterChange = (
    key: keyof CurrencyFilterState,
    value: string | ReferenceEntityStatus | null
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const updateFilters = (updates: Partial<CurrencyFilterState>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      status: null,
      codeFilter: '',
    });
  };

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return filtersApplied > 0;
  }, [filtersApplied]);

  // Convert UI filters to API search parameters
  const getSearchParams = (): CurrencySearchParams => {
    const params: CurrencySearchParams = {};

    if (filters.searchTerm.trim()) {
      params.searchTerm = filters.searchTerm.trim();
    }

    if (filters.status) {
      params.status = filters.status;
    }

    if (filters.codeFilter?.trim()) {
      params.code = filters.codeFilter.trim().toUpperCase();
    }

    return params;
  };

  return {
    filters,
    isFilterOpen,
    setIsFilterOpen,
    filtersApplied,
    hasActiveFilters,
    handleFilterChange,
    updateFilters,
    clearFilters,
    getSearchParams,
  };
};