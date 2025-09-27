import { useState, useCallback, useMemo } from 'react';
import type {
  ReferenceFilterState,
  ReferenceEntityStatus,
  ReferenceEntityType,
  ReferenceListSearchParams,
} from '@/types/reference';

const initialFilterState: ReferenceFilterState = {
  searchTerm: '',
  status: null,
  entityType: null,
  isAvailable: null,
  createdDateFrom: '',
  createdDateTo: '',
  updatedDateFrom: '',
  updatedDateTo: '',
};

export const useReferenceFilters = () => {
  const [filters, setFilters] = useState<ReferenceFilterState>(initialFilterState);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Calculate number of active filters
  const filtersApplied = useMemo(() => {
    let count = 0;
    if (filters.searchTerm.trim()) count++;
    if (filters.status) count++;
    if (filters.entityType) count++;
    if (filters.isAvailable !== null) count++;
    if (filters.createdDateFrom) count++;
    if (filters.createdDateTo) count++;
    if (filters.updatedDateFrom) count++;
    if (filters.updatedDateTo) count++;
    return count;
  }, [filters]);

  // Check if any filters are applied
  const hasActiveFilters = useMemo(() => filtersApplied > 0, [filtersApplied]);

  // Handle filter changes
  const handleFilterChange = useCallback(
    (
      key: keyof ReferenceFilterState,
      value: string | ReferenceEntityStatus | ReferenceEntityType | boolean | null
    ) => {
      setFilters(prev => ({
        ...prev,
        [key]: value,
      }));
    },
    []
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters(initialFilterState);
  }, []);

  // Update multiple filters at once
  const updateFilters = useCallback((newFilters: Partial<ReferenceFilterState>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
    }));
  }, []);

  // Get search parameters for API calls
  const getSearchParams = useCallback((): Omit<ReferenceListSearchParams, 'page' | 'size' | 'sort'> => {
    const params: Omit<ReferenceListSearchParams, 'page' | 'size' | 'sort'> = {};

    if (filters.searchTerm.trim()) {
      params.searchTerm = filters.searchTerm.trim();
    }

    if (filters.status) {
      params.status = filters.status;
    }

    if (filters.entityType) {
      params.entityType = filters.entityType;
    }

    if (filters.isAvailable !== null) {
      params.isAvailable = filters.isAvailable;
    }

    if (filters.createdDateFrom) {
      params.createdDateFrom = filters.createdDateFrom;
    }

    if (filters.createdDateTo) {
      params.createdDateTo = filters.createdDateTo;
    }

    if (filters.updatedDateFrom) {
      params.updatedDateFrom = filters.updatedDateFrom;
    }

    if (filters.updatedDateTo) {
      params.updatedDateTo = filters.updatedDateTo;
    }

    return params;
  }, [filters]);

  // Reset specific filter
  const resetFilter = useCallback((key: keyof ReferenceFilterState) => {
    setFilters(prev => ({
      ...prev,
      [key]: key === 'searchTerm' || key === 'createdDateFrom' || key === 'createdDateTo' ||
             key === 'updatedDateFrom' || key === 'updatedDateTo' ? '' : null,
    }));
  }, []);

  // Validate date ranges
  const validateDateRange = useCallback((fromDate: string, toDate: string): boolean => {
    if (!fromDate || !toDate) return true;
    return new Date(fromDate) <= new Date(toDate);
  }, []);

  // Get validation errors for filters
  const getFilterValidationErrors = useCallback(() => {
    const errors: Record<string, string> = {};

    if (!validateDateRange(filters.createdDateFrom, filters.createdDateTo)) {
      errors.createdDateRange = 'Created date "from" must be before "to" date';
    }

    if (!validateDateRange(filters.updatedDateFrom, filters.updatedDateTo)) {
      errors.updatedDateRange = 'Updated date "from" must be before "to" date';
    }

    return errors;
  }, [filters, validateDateRange]);

  // Check if filters have validation errors
  const hasValidationErrors = useMemo(() => {
    const errors = getFilterValidationErrors();
    return Object.keys(errors).length > 0;
  }, [getFilterValidationErrors]);

  return {
    filters,
    isFilterOpen,
    setIsFilterOpen,
    filtersApplied,
    hasActiveFilters,
    hasValidationErrors,
    handleFilterChange,
    clearFilters,
    updateFilters,
    getSearchParams,
    resetFilter,
    getFilterValidationErrors,
  };
};