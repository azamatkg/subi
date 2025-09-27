import React from 'react';
import { Search, Filter, X, Plus, TrendingUp } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
} from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/hooks/useAuth';
import type { FloatingRateTypeFilterState, FloatingRateCalculationType } from '@/types/floatingRateType';
import type { ReferenceEntityStatus } from '@/types/reference';
import { FloatingRateCalculationType as FloatingRateCalculationTypeEnum } from '@/types/floatingRateType';
import { ReferenceEntityStatus as ReferenceEntityStatusEnum } from '@/types/reference';

interface FloatingRateTypeFiltersProps {
  filters: FloatingRateTypeFilterState;
  onFilterChange: (key: keyof FloatingRateTypeFilterState, value: string | ReferenceEntityStatus | FloatingRateCalculationType | null) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  filtersApplied: number;
  isFilterOpen: boolean;
  onToggleFilter: () => void;
  onCreateNew?: () => void;
  loading?: boolean;
  className?: string;
}

export const FloatingRateTypeFilters: React.FC<FloatingRateTypeFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  hasActiveFilters,
  filtersApplied,
  isFilterOpen,
  onToggleFilter,
  onCreateNew,
  loading = false,
  className,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const userRoles = user?.roles || [];
  const canCreate = userRoles.includes('ADMIN');

  const statusOptions = Object.values(ReferenceEntityStatusEnum).map(status => ({
    value: status,
    label: t(`references.status.${status.toLowerCase()}`),
  }));

  const rateCalculationTypeOptions = Object.values(FloatingRateCalculationTypeEnum).map(type => ({
    value: type,
    label: t(`floatingRateType.rateCalculationTypes.${type.toLowerCase()}`),
  }));

  return (
    <div className={className}>
      {/* Main search and filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={t('floatingRateType.searchPlaceholder')}
            value={filters.searchTerm}
            onChange={(e) => onFilterChange('searchTerm', e.target.value)}
            className="pl-10"
            disabled={loading}
          />
        </div>

        {/* Filter toggle button */}
        <Button
          variant="outline"
          onClick={onToggleFilter}
          className="sm:w-auto"
          disabled={loading}
        >
          <Filter className="h-4 w-4 mr-2" />
          {t('common.filter')}
          {filtersApplied > 0 && (
            <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
              {filtersApplied}
            </Badge>
          )}
        </Button>

        {/* Create new button */}
        {canCreate && onCreateNew && (
          <Button onClick={onCreateNew} disabled={loading}>
            <Plus className="h-4 w-4 mr-2" />
            {t('floatingRateType.newFloatingRateType')}
          </Button>
        )}
      </div>

      {/* Advanced filters */}
      <Collapsible open={isFilterOpen} onOpenChange={onToggleFilter}>
        <CollapsibleContent>
          <Card className="mb-4">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Status filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {t('common.status')}
                  </label>
                  <Select
                    value={filters.status || ''}
                    onValueChange={(value) =>
                      onFilterChange('status', value || null)
                    }
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('floatingRateType.filters.selectStatus')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">
                        {t('common.all')}
                      </SelectItem>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Rate Calculation Type filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {t('floatingRateType.fields.rateCalculationType')}
                  </label>
                  <Select
                    value={filters.rateCalculationType || ''}
                    onValueChange={(value) =>
                      onFilterChange('rateCalculationType', value || null)
                    }
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('floatingRateType.filters.selectRateCalculationType')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">
                        {t('common.all')}
                      </SelectItem>
                      {rateCalculationTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Clear filters button */}
              {hasActiveFilters && (
                <div className="flex justify-end mt-4 pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onClearFilters}
                    disabled={loading}
                  >
                    <X className="h-4 w-4 mr-2" />
                    {t('common.clear')}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Active filters display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          {filters.searchTerm && (
            <Badge variant="secondary" className="gap-1">
              <Search className="h-3 w-3" />
              {filters.searchTerm}
              <button
                onClick={() => onFilterChange('searchTerm', '')}
                className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                disabled={loading}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.status && (
            <Badge variant="secondary" className="gap-1">
              {t(`references.status.${filters.status.toLowerCase()}`)}
              <button
                onClick={() => onFilterChange('status', null)}
                className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                disabled={loading}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.rateCalculationType && (
            <Badge variant="secondary" className="gap-1">
              <TrendingUp className="h-3 w-3" />
              {t(`floatingRateType.rateCalculationTypes.${filters.rateCalculationType.toLowerCase()}`)}
              <button
                onClick={() => onFilterChange('rateCalculationType', null)}
                className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                disabled={loading}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};