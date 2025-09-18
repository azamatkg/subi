import { useState, useEffect } from 'react';
import type { UserFilterState, UserStatus } from '@/types/user';

export const useUserFilters = () => {
  const [filters, setFilters] = useState<UserFilterState>({
    searchTerm: '',
    roles: [],
    status: null,
    isActive: null,
    department: '',
    createdDateFrom: '',
    createdDateTo: '',
    lastLoginFrom: '',
    lastLoginTo: '',
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filtersApplied, setFiltersApplied] = useState(0);

  // Count applied filters
  useEffect(() => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.roles.length > 0) count++;
    if (filters.status) count++;
    if (filters.isActive !== null) count++;
    if (filters.department) count++;
    if (filters.createdDateFrom) count++;
    if (filters.createdDateTo) count++;
    if (filters.lastLoginFrom) count++;
    if (filters.lastLoginTo) count++;
    setFiltersApplied(count);
  }, [filters]);

  const handleFilterChange = (
    key: keyof UserFilterState,
    value: string | string[] | boolean | UserStatus | null
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      roles: [],
      status: null,
      isActive: null,
      department: '',
      createdDateFrom: '',
      createdDateTo: '',
      lastLoginFrom: '',
      lastLoginTo: '',
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
