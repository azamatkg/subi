import React from 'react';
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  X,
  RefreshCw,
  Plus,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/hooks/useAuth';
import type { RepaymentOrderFilterState, RepaymentOrderPriority } from '@/types/repaymentOrder';
import { ReferenceEntityStatus } from '@/types/reference';

interface RepaymentOrderFiltersProps {
  filters: RepaymentOrderFilterState;
  onFiltersChange: (filters: RepaymentOrderFilterState) => void;
  onCreateClick?: () => void;
  loading?: boolean;
  className?: string;
}

export const RepaymentOrderFilters: React.FC<RepaymentOrderFiltersProps> = ({
  filters,
  onFiltersChange,
  onCreateClick,
  loading = false,
  className,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);

  const userRoles = user?.roles || [];
  const canCreate = userRoles.includes('ADMIN');

  // Count applied filters
  const filtersApplied = React.useMemo(() => {
    let count = 0;
    if (filters.searchTerm.trim()) count++;
    if (filters.status) count++;
    if (filters.priority) count++;
    if (filters.priorityOrderMin !== null) count++;
    if (filters.priorityOrderMax !== null) count++;
    return count;
  }, [filters]);

  const handleFilterChange = <K extends keyof RepaymentOrderFilterState>(
    key: K,
    value: RepaymentOrderFilterState[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      searchTerm: '',
      status: null,
      priority: null,
      priorityOrderMin: null,
      priorityOrderMax: null,
    });
  };

  // Repayment order priorities for filter dropdown
  const repaymentOrderPriorities = [
    'PRINCIPAL',
    'INTEREST',
    'PENALTIES',
    'FEES',
    'COMMISSION',
    'INSURANCE',
    'OTHER',
  ] as const;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Main search and actions bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={t('repaymentOrder.searchPlaceholder')}
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            className="pl-10"
            disabled={loading}
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          {/* Advanced filters toggle */}
          <Button
            variant="outline"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2"
            disabled={loading}
          >
            <Filter className="h-4 w-4" />
            {t('common.filter')}
            {filtersApplied > 0 && (
              <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                {filtersApplied}
              </Badge>
            )}
            {isFilterOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>

          {/* Create button */}
          {canCreate && onCreateClick && (
            <Button onClick={onCreateClick} disabled={loading}>
              <Plus className="mr-2 h-4 w-4" />
              {t('repaymentOrder.newRepaymentOrder')}
            </Button>
          )}

          {/* Refresh button */}
          <Button variant="outline" size="icon" disabled={loading}>
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          </Button>
        </div>
      </div>

      {/* Advanced filters panel */}
      {isFilterOpen && (
        <div className="border rounded-lg p-4 bg-gray-50 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">
              {t('common.advancedFilters')}
            </h3>
            {filtersApplied > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="mr-1 h-3 w-3" />
                {t('common.clearFilters')}
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status filter */}
            <div className="space-y-2">
              <Label htmlFor="status-filter" className="text-sm font-medium">
                {t('repaymentOrder.fields.status')}
              </Label>
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) =>
                  handleFilterChange('status', value === 'all' ? null : value as typeof ReferenceEntityStatus.ACTIVE)
                }
              >
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder={t('common.selectStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all')}</SelectItem>
                  <SelectItem value={ReferenceEntityStatus.ACTIVE}>
                    {t('references.status.active')}
                  </SelectItem>
                  <SelectItem value={ReferenceEntityStatus.INACTIVE}>
                    {t('references.status.inactive')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Priority filter */}
            <div className="space-y-2">
              <Label htmlFor="priority-filter" className="text-sm font-medium">
                {t('repaymentOrder.fields.priority')}
              </Label>
              <Select
                value={filters.priority || 'all'}
                onValueChange={(value) =>
                  handleFilterChange('priority', value === 'all' ? null : value as RepaymentOrderPriority)
                }
              >
                <SelectTrigger id="priority-filter">
                  <SelectValue placeholder={t('common.selectPriority')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all')}</SelectItem>
                  {repaymentOrderPriorities.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {t(`repaymentOrder.priority.${priority.toLowerCase()}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority Order Min filter */}
            <div className="space-y-2">
              <Label htmlFor="priority-order-min-filter" className="text-sm font-medium">
                {t('repaymentOrder.fields.priorityOrderMin')}
              </Label>
              <Input
                id="priority-order-min-filter"
                type="number"
                min="1"
                max="100"
                placeholder={t('common.min')}
                value={filters.priorityOrderMin || ''}
                onChange={(e) =>
                  handleFilterChange('priorityOrderMin', e.target.value ? parseInt(e.target.value) : null)
                }
                disabled={loading}
              />
            </div>

            {/* Priority Order Max filter */}
            <div className="space-y-2">
              <Label htmlFor="priority-order-max-filter" className="text-sm font-medium">
                {t('repaymentOrder.fields.priorityOrderMax')}
              </Label>
              <Input
                id="priority-order-max-filter"
                type="number"
                min="1"
                max="100"
                placeholder={t('common.max')}
                value={filters.priorityOrderMax || ''}
                onChange={(e) =>
                  handleFilterChange('priorityOrderMax', e.target.value ? parseInt(e.target.value) : null)
                }
                disabled={loading}
              />
            </div>
          </div>

          {/* Active filters display */}
          {filtersApplied > 0 && (
            <div className="flex items-center gap-2 pt-2 border-t">
              <span className="text-sm text-gray-600">
                {t('common.activeFilters')}:
              </span>
              <div className="flex flex-wrap gap-1">
                {filters.status && (
                  <Badge variant="secondary" className="text-xs">
                    {t('repaymentOrder.fields.status')}: {t(`references.status.${filters.status.toLowerCase()}`)}
                  </Badge>
                )}
                {filters.priority && (
                  <Badge variant="secondary" className="text-xs">
                    {t('repaymentOrder.fields.priority')}: {t(`repaymentOrder.priority.${filters.priority.toLowerCase()}`)}
                  </Badge>
                )}
                {filters.priorityOrderMin !== null && (
                  <Badge variant="secondary" className="text-xs">
                    {t('repaymentOrder.fields.priorityOrderMin')}: {filters.priorityOrderMin}
                  </Badge>
                )}
                {filters.priorityOrderMax !== null && (
                  <Badge variant="secondary" className="text-xs">
                    {t('repaymentOrder.fields.priorityOrderMax')}: {filters.priorityOrderMax}
                  </Badge>
                )}
                {filters.searchTerm && (
                  <Badge variant="secondary" className="text-xs">
                    {t('common.search')}: {filters.searchTerm}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};