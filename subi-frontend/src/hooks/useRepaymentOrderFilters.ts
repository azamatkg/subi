import { useState, useEffect, useMemo } from 'react';
import type {
  RepaymentOrderFilterState,
  RepaymentOrderSearchParams,
  RepaymentOrderPriority
} from '@/types/repaymentOrder';
import type { ReferenceEntityStatus } from '@/types/reference';

export const useRepaymentOrderFilters = () => {
  const [filters, setFilters] = useState<RepaymentOrderFilterState>({
    searchTerm: '',
    status: null,
    priority: null,
    priorityOrderMin: null,
    priorityOrderMax: null,
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filtersApplied, setFiltersApplied] = useState(0);

  // Count applied filters
  useEffect(() => {
    let count = 0;
    if (filters.searchTerm.trim()) count++;
    if (filters.status) count++;
    if (filters.priority) count++;
    if (filters.priorityOrderMin !== null) count++;
    if (filters.priorityOrderMax !== null) count++;
    setFiltersApplied(count);
  }, [filters]);

  const handleFilterChange = (
    key: keyof RepaymentOrderFilterState,
    value: string | ReferenceEntityStatus | RepaymentOrderPriority | number | null
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const updateFilters = (updates: Partial<RepaymentOrderFilterState>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      status: null,
      priority: null,
      priorityOrderMin: null,
      priorityOrderMax: null,
    });
  };

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return filtersApplied > 0;
  }, [filtersApplied]);

  // Convert UI filters to API search parameters
  const getSearchParams = (): RepaymentOrderSearchParams => {
    const params: RepaymentOrderSearchParams = {};

    if (filters.searchTerm.trim()) {
      params.searchTerm = filters.searchTerm.trim();
    }

    if (filters.status) {
      params.status = filters.status;
    }

    if (filters.priority) {
      params.priority = filters.priority;
    }

    if (filters.priorityOrderMin !== null) {
      params.priorityOrderMin = filters.priorityOrderMin;
    }

    if (filters.priorityOrderMax !== null) {
      params.priorityOrderMax = filters.priorityOrderMax;
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