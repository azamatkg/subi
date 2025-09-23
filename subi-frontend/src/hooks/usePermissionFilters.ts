import { useState, useEffect } from 'react';

export interface PermissionFilterState {
  searchTerm: string;
  category: string;
  createdDateFrom: string;
  createdDateTo: string;
}

export const usePermissionFilters = () => {
  const [filters, setFilters] = useState<PermissionFilterState>({
    searchTerm: '',
    category: 'all',
    createdDateFrom: '',
    createdDateTo: '',
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filtersApplied, setFiltersApplied] = useState(0);

  // Count applied filters
  useEffect(() => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.category !== 'all') count++;
    if (filters.createdDateFrom) count++;
    if (filters.createdDateTo) count++;
    setFiltersApplied(count);
  }, [filters]);

  const handleFilterChange = (
    key: keyof PermissionFilterState,
    value: string
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      category: 'all',
      createdDateFrom: '',
      createdDateTo: '',
    });
  };

  return {
    filters,
    isFilterOpen,
    setIsFilterOpen,
    filtersApplied,
    handleFilterChange,
    clearFilters,
  };
};