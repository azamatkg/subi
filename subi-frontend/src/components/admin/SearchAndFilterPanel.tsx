import React, { useEffect, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Filter,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  EnhancedTooltip,
  HelpTooltip,
  InfoTooltip
} from '@/components/ui/enhanced-tooltip';

import { useTranslation } from '@/hooks/useTranslation';
import type {
  UserFilterState,
  UserRole,
  UserStatus,
} from '@/types/user';
import { UserStatus as UserStatusEnum } from '@/types/user';
import { cn } from '@/lib/utils';
import {
  InputSanitizer,
  ValidationUtils,
  showWarningMessage
} from '@/utils/errorHandling';

export interface SearchAndFilterPanelProps {
  /** Current filter state */
  filters: UserFilterState;
  /** Callback when filters change */
  onFilterChange: (
    key: keyof UserFilterState,
    value: string | string[] | boolean | UserStatus | null
  ) => void;
  /** Callback to clear all filters */
  onClearFilters: () => void;
  /** Whether filters panel is initially open */
  initiallyOpen?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Available roles for filtering */
  availableRoles?: UserRole[];
  /** Whether to show advanced date filters */
  showDateFilters?: boolean;
  /** Whether to show role filters */
  showRoleFilters?: boolean;
  /** Custom placeholder text for search */
  searchPlaceholder?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Callback for refresh action */
  onRefresh?: () => void;
}

/**
 * SearchAndFilterPanel - Reusable search and filter component for user management
 *
 * Features:
 * - Text search with live filtering
 * - Status and active status filters
 * - Department filtering
 * - Optional role and date range filtering
 * - Collapsible advanced filters section
 * - Filter count badge and clear functionality
 * - Responsive design with mobile optimizations
 * - Accessibility support with proper ARIA labels
 */
export const SearchAndFilterPanel: React.FC<SearchAndFilterPanelProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  initiallyOpen = false,
  className,
  availableRoles = [],
  showDateFilters = true,
  showRoleFilters = true,
  searchPlaceholder,
  isLoading = false,
  onRefresh,
}) => {
  const { t } = useTranslation();
  const [isFilterOpen, setIsFilterOpen] = useState(initiallyOpen);
  const [filtersApplied, setFiltersApplied] = useState(0);

  // Count applied filters for badge display
  useEffect(() => {
    let count = 0;

    if (filters.searchTerm?.trim()) {
      count++;
    }
    if (filters.roles?.length > 0) {
      count++;
    }
    if (filters.status) {
      count++;
    }
    if (filters.isActive !== null) {
      count++;
    }
    if (filters.department?.trim()) {
      count++;
    }
    if (showDateFilters) {
      if (filters.createdDateFrom?.trim()) {
        count++;
      }
      if (filters.createdDateTo?.trim()) {
        count++;
      }
      if (filters.lastLoginFrom?.trim()) {
        count++;
      }
      if (filters.lastLoginTo?.trim()) {
        count++;
      }
    }

    setFiltersApplied(count);
  }, [filters, showDateFilters]);

  // Handle search input changes with validation and sanitization
  const handleSearchChange = (value: string) => {
    // Sanitize input
    const sanitizedValue = InputSanitizer.sanitizeText(value);

    // Validate search term
    if (sanitizedValue !== value.trim()) {
      showWarningMessage(
        t('userManagement.validation.inputSanitized'),
        t('userManagement.validation.invalidCharactersRemoved')
      );
    }

    const validation = ValidationUtils.validateSearchTerm(sanitizedValue);
    if (!validation.isValid && sanitizedValue.length > 0) {
      showWarningMessage(
        t('userManagement.validation.invalidSearch'),
        validation.error
      );
      return;
    }

    onFilterChange('searchTerm', sanitizedValue);
  };

  // Handle role selection
  const handleRoleChange = (roles: string[]) => {
    onFilterChange('roles', roles as UserRole[]);
  };

  // Clear all filters
  const handleClearFilters = () => {
    onClearFilters();
    setIsFilterOpen(false);
  };

  // Get placeholder text for search
  const getSearchPlaceholder = () => {
    return searchPlaceholder || t('userManagement.searchPlaceholder');
  };

  return (
    <div className={cn('bg-muted/10 rounded-lg border border-border/20 shadow-sm', className)}>
      <div className='p-3 sm:p-4'>
        {/* Search Bar and Filter Toggle - Mobile optimized */}
        <div className='flex flex-col gap-3 sm:flex-row sm:gap-4'>
          {/* Search Input - Mobile enhanced */}
          <div className='flex-1'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <div className='absolute right-3 top-1/2 -translate-y-1/2'>
                <HelpTooltip
                  title={t('userManagement.tooltips.searchFilters.searchSyntax.title')}
                  description={
                    <div className='space-y-2'>
                      <div>• {t('userManagement.tooltips.searchFilters.searchSyntax.wildcard')}</div>
                      <div>• {t('userManagement.tooltips.searchFilters.searchSyntax.exact')}</div>
                      <div>• {t('userManagement.tooltips.searchFilters.searchSyntax.multiple')}</div>
                    </div>
                  }
                  iconSize={14}
                />
              </div>
              <Input
                placeholder={getSearchPlaceholder()}
                value={filters.searchTerm}
                onChange={e => handleSearchChange(e.target.value)}
                className='pl-10 pr-10 touch-manipulation min-h-[44px] text-base sm:text-sm'
                aria-label={`${getSearchPlaceholder()}. ${filtersApplied > 0 ? `${filtersApplied} filters applied.` : 'No filters applied.'}`}
                aria-describedby="search-status"
                disabled={isLoading}
                maxLength={100}
                autoComplete='off'
                role="searchbox"
                onPaste={e => {
                  // Handle paste events with sanitization
                  e.preventDefault();
                  const pastedText = e.clipboardData.getData('text');
                  const sanitized = InputSanitizer.sanitizeText(pastedText);
                  handleSearchChange(sanitized);
                }}
              />
              <div id="search-status" className="sr-only" aria-live="polite">
                {filtersApplied > 0 ? `${filtersApplied} filters applied` : 'No filters applied'}
              </div>
            </div>
          </div>

          {/* Filter Controls - Mobile optimized */}
          <div className='flex flex-wrap gap-2 sm:flex-nowrap'>
            <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <CollapsibleTrigger asChild>
                <EnhancedTooltip
                  title={t('userManagement.tooltips.searchFilters.advancedFilters.title')}
                  description={t('userManagement.tooltips.searchFilters.advancedFilters.combination')}
                  content={isFilterOpen ? 'Hide filters' : `Show filters (${filtersApplied} active)`}
                >
                  <Button
                    variant='outline'
                    className={cn(
                      'relative gap-2 transition-all duration-200 touch-manipulation min-h-[44px] flex-1 sm:flex-none',
                      isFilterOpen && 'bg-primary text-primary-foreground'
                    )}
                    aria-expanded={isFilterOpen}
                    aria-controls="advanced-filters"
                    aria-label={`${isFilterOpen ? 'Hide' : 'Show'} advanced filters. ${filtersApplied} filters applied.`}
                    disabled={isLoading}
                  >
                    <Filter className='h-4 w-4' />
                    <span className='hidden sm:inline'>{t('userManagement.advancedFilters')}</span>
                    <span className='sm:hidden'>Filters</span>
                    {filtersApplied > 0 && (
                      <Badge
                        variant={isFilterOpen ? 'secondary' : 'destructive'}
                        className='ml-2 px-1.5 py-0.5 text-xs -mr-1'
                      >
                        {filtersApplied}
                      </Badge>
                    )}
                    {isFilterOpen ? (
                      <ChevronUp className='h-4 w-4' aria-hidden="true" />
                    ) : (
                      <ChevronDown className='h-4 w-4' aria-hidden="true" />
                    )}
                  </Button>
                </EnhancedTooltip>
              </CollapsibleTrigger>

              {/* Clear Filters Button - Mobile optimized */}
              {filtersApplied > 0 && (
                <Button
                  variant='outline'
                  size='icon'
                  onClick={handleClearFilters}
                  aria-label={t('common.clearFilters')}
                  className='shrink-0 touch-manipulation min-h-[44px] min-w-[44px]'
                  disabled={isLoading}
                >
                  <X className='h-4 w-4' />
                </Button>
              )}

              {/* Refresh Button - Mobile optimized */}
              {onRefresh && (
                <Button
                  variant='outline'
                  size='icon'
                  onClick={onRefresh}
                  aria-label={t('common.refresh')}
                  className='shrink-0 touch-manipulation min-h-[44px] min-w-[44px]'
                  disabled={isLoading}
                >
                  <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
                </Button>
              )}

              {/* Collapsible Advanced Filters - Mobile optimized */}
              <CollapsibleContent id="advanced-filters" className='mt-4 sm:mt-6'>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 p-4 sm:p-6 bg-gradient-to-br from-muted/60 to-accent/40 rounded-xl transition-all duration-300 ease-out border border-border/10 shadow-inner'>

                  {/* Status Filter - Mobile enhanced */}
                  <div className='space-y-2'>
                    <Label htmlFor='status-filter' className='text-sm font-medium'>
                      {t('userManagement.fields.status')}
                    </Label>
                    <Select
                      value={filters.status || 'all'}
                      onValueChange={value =>
                        onFilterChange(
                          'status',
                          value === 'all' ? null : (value as UserStatus)
                        )
                      }
                      disabled={isLoading}
                    >
                      <SelectTrigger id='status-filter' className='touch-manipulation min-h-[44px]'>
                        <SelectValue placeholder={t('common.selectStatus')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='all'>{t('common.all')}</SelectItem>
                        {Object.values(UserStatusEnum).map(status => (
                          <SelectItem key={status} value={status}>
                            {t(`userManagement.status.${status.toLowerCase()}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Active Status Filter - Mobile enhanced */}
                  <div className='space-y-2'>
                    <Label htmlFor='active-filter' className='text-sm font-medium'>
                      {t('userManagement.fields.activeStatus')}
                    </Label>
                    <Select
                      value={
                        filters.isActive === null
                          ? 'all'
                          : filters.isActive.toString()
                      }
                      onValueChange={value =>
                        onFilterChange(
                          'isActive',
                          value === 'all' ? null : value === 'true'
                        )
                      }
                      disabled={isLoading}
                    >
                      <SelectTrigger id='active-filter' className='touch-manipulation min-h-[44px]'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='all'>{t('common.all')}</SelectItem>
                        <SelectItem value='true'>
                          {t('userManagement.active')}
                        </SelectItem>
                        <SelectItem value='false'>
                          {t('userManagement.inactive')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Department Filter - Mobile enhanced */}
                  <div className='space-y-2'>
                    <Label htmlFor='department-filter' className='text-sm font-medium'>
                      {t('userManagement.fields.department')}
                    </Label>
                    <Input
                      id='department-filter'
                      placeholder={t('userManagement.enterDepartment')}
                      value={filters.department}
                      onChange={e =>
                        onFilterChange('department', e.target.value)
                      }
                      disabled={isLoading}
                      className='touch-manipulation min-h-[44px] text-base sm:text-sm'
                      autoComplete='organization'
                    />
                  </div>

                  {/* Role Filter - Optional - Mobile enhanced */}
                  {showRoleFilters && availableRoles.length > 0 && (
                    <div className='space-y-2 col-span-1 sm:col-span-2 lg:col-span-3'>
                      <Label htmlFor='roles-filter' className='text-sm font-medium'>
                        {t('userManagement.fields.roles')}
                      </Label>
                      <Select
                        value={filters.roles.length > 0 ? filters.roles[0] : 'all'}
                        onValueChange={value =>
                          handleRoleChange(value === 'all' ? [] : [value])
                        }
                        disabled={isLoading}
                      >
                        <SelectTrigger id='roles-filter' className='touch-manipulation min-h-[44px]'>
                          <SelectValue
                            placeholder={t('userManagement.selectRoles')}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='all'>{t('common.all')}</SelectItem>
                          {availableRoles.map(role => (
                            <SelectItem key={role} value={role}>
                              {t(`userManagement.roles.${role.toLowerCase()}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Date Filters - Optional - Mobile enhanced */}
                  {showDateFilters && (
                    <>
                      <div className='space-y-2'>
                        <div className='flex items-center gap-2'>
                          <Label htmlFor='created-from-filter' className='text-sm font-medium'>
                            <span className='hidden sm:inline'>{t('userManagement.fields.createdFrom')}</span>
                            <span className='sm:hidden'>From</span>
                          </Label>
                          <InfoTooltip
                            title="Date Range Filtering"
                            description={t('userManagement.tooltips.searchFilters.advancedFilters.dateRange')}
                            iconSize={14}
                          />
                        </div>
                        <Input
                          id='created-from-filter'
                          type='date'
                          value={filters.createdDateFrom}
                          onChange={e =>
                            onFilterChange('createdDateFrom', e.target.value)
                          }
                          disabled={isLoading}
                          className='touch-manipulation min-h-[44px] text-base sm:text-sm'
                        />
                      </div>

                      <div className='space-y-2'>
                        <Label htmlFor='created-to-filter' className='text-sm font-medium'>
                          <span className='hidden sm:inline'>{t('userManagement.fields.createdTo')}</span>
                          <span className='sm:hidden'>To</span>
                        </Label>
                        <Input
                          id='created-to-filter'
                          type='date'
                          value={filters.createdDateTo}
                          onChange={e =>
                            onFilterChange('createdDateTo', e.target.value)
                          }
                          disabled={isLoading}
                          className='touch-manipulation min-h-[44px] text-base sm:text-sm'
                        />
                      </div>

                      <div className='space-y-2'>
                        <Label htmlFor='login-from-filter' className='text-sm font-medium'>
                          <span className='hidden sm:inline'>{t('userManagement.fields.lastLoginFrom')}</span>
                          <span className='sm:hidden'>Login From</span>
                        </Label>
                        <Input
                          id='login-from-filter'
                          type='date'
                          value={filters.lastLoginFrom}
                          onChange={e =>
                            onFilterChange('lastLoginFrom', e.target.value)
                          }
                          disabled={isLoading}
                          className='touch-manipulation min-h-[44px] text-base sm:text-sm'
                        />
                      </div>

                      <div className='space-y-2'>
                        <Label htmlFor='login-to-filter' className='text-sm font-medium'>
                          <span className='hidden sm:inline'>{t('userManagement.fields.lastLoginTo')}</span>
                          <span className='sm:hidden'>Login To</span>
                        </Label>
                        <Input
                          id='login-to-filter'
                          type='date'
                          value={filters.lastLoginTo}
                          onChange={e =>
                            onFilterChange('lastLoginTo', e.target.value)
                          }
                          disabled={isLoading}
                          className='touch-manipulation min-h-[44px] text-base sm:text-sm'
                        />
                      </div>
                    </>
                  )}

                  {/* Filter Actions - Mobile optimized */}
                  <div className='flex flex-col sm:flex-row gap-2 pt-2 col-span-full'>
                    <Button
                      variant='outline'
                      onClick={handleClearFilters}
                      disabled={filtersApplied === 0 || isLoading}
                      className='w-full sm:w-auto touch-manipulation min-h-[44px]'
                    >
                      <X className='mr-2 h-4 w-4' />
                      <span>{t('common.clear')}</span>
                      {filtersApplied > 0 && <span className='ml-1'>({filtersApplied})</span>}
                    </Button>

                    {onRefresh && (
                      <Button
                        variant='outline'
                        onClick={onRefresh}
                        className='w-full sm:w-auto touch-manipulation min-h-[44px]'
                        disabled={isLoading}
                      >
                        <RefreshCw className={cn('mr-2 h-4 w-4', isLoading && 'animate-spin')} />
                        {t('common.refresh')}
                      </Button>
                    )}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchAndFilterPanel;