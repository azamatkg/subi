import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  X,
  RefreshCw,
  Calendar,
  DollarSign,
  Clock,
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
import type {
  CreditProgramFilterState,
  ProgramStatus,
} from '@/types/creditProgram';
import { ProgramStatus as ProgramStatusEnum } from '@/types/creditProgram';

interface CreditProgramFiltersProps {
  filters: CreditProgramFilterState;
  onFiltersChange: (filters: CreditProgramFilterState) => void;
  loading?: boolean;
  className?: string;
}

export const CreditProgramFilters: React.FC<CreditProgramFiltersProps> = ({
  filters,
  onFiltersChange,
  loading = false,
  className,
}) => {
  const { t } = useTranslation();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filtersApplied, setFiltersApplied] = useState(0);

  // Count applied filters
  useEffect(() => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.status) count++;
    if (filters.amountMin !== null) count++;
    if (filters.amountMax !== null) count++;
    if (filters.termMin !== null) count++;
    if (filters.termMax !== null) count++;
    if (filters.validFromStart) count++;
    if (filters.validFromEnd) count++;
    if (filters.validToStart) count++;
    if (filters.validToEnd) count++;
    if (filters.collateralRequired !== null) count++;
    if (filters.activeOnly) count++;
    setFiltersApplied(count);
  }, [filters]);

  const handleFilterChange = <K extends keyof CreditProgramFilterState>(
    key: K,
    value: CreditProgramFilterState[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      searchTerm: '',
      status: null,
      amountMin: null,
      amountMax: null,
      termMin: null,
      termMax: null,
      validFromStart: '',
      validFromEnd: '',
      validToStart: '',
      validToEnd: '',
      collateralRequired: null,
      activeOnly: false,
    });
  };

  return (
    <div
      className={cn(
        'bg-muted/10 rounded-lg border border-border/20 shadow-sm',
        className
      )}
    >
      <div className="p-3 sm:p-4">
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('creditProgram.searchPlaceholder')}
                value={filters.searchTerm}
                onChange={e => handleFilterChange('searchTerm', e.target.value)}
                className="pl-10"
                aria-label={t('creditProgram.searchPlaceholder')}
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={cn(
                'relative gap-2 transition-all duration-200',
                isFilterOpen && 'bg-primary text-primary-foreground'
              )}
              aria-expanded={isFilterOpen}
              disabled={loading}
            >
              <Filter className="h-4 w-4" />
              {t('creditProgram.advancedFilters')}
              {filtersApplied > 0 && (
                <Badge
                  variant={isFilterOpen ? 'secondary' : 'destructive'}
                  className="ml-2 px-1.5 py-0.5 text-xs -mr-1"
                >
                  {filtersApplied}
                </Badge>
              )}
              {isFilterOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>

            {filtersApplied > 0 && (
              <Button
                variant="outline"
                size="icon"
                onClick={clearFilters}
                aria-label={t('common.clearFilters')}
                className="shrink-0"
                disabled={loading}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Collapsible Advanced Filters */}
        {isFilterOpen && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6 bg-gradient-to-br from-muted/60 to-accent/40 rounded-xl transition-all duration-300 ease-out mt-6 border border-border/10 shadow-inner">
            {/* Status Filter */}
            <div className="space-y-2">
              <Label
                htmlFor="status-filter"
                className="flex items-center gap-2"
              >
                <Badge variant="outline" className="h-4 w-4 p-0" />
                {t('creditProgram.fields.status')}
              </Label>
              <Select
                value={filters.status || 'all'}
                onValueChange={value =>
                  handleFilterChange(
                    'status',
                    value === 'all' ? null : (value as ProgramStatus)
                  )
                }
                disabled={loading}
              >
                <SelectTrigger id="status-filter">
                  <SelectValue
                    placeholder={t('creditProgram.placeholders.selectStatus')}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all')}</SelectItem>
                  {Object.values(ProgramStatusEnum).map(status => (
                    <SelectItem key={status} value={status}>
                      {t(`creditProgram.status.${status.toLowerCase()}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Amount Range Filters */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                {t('creditProgram.filters.amountRange')}
              </Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder={t('common.min')}
                  value={filters.amountMin || ''}
                  onChange={e =>
                    handleFilterChange(
                      'amountMin',
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  className="flex-1"
                  disabled={loading}
                />
                <Input
                  type="number"
                  placeholder={t('common.max')}
                  value={filters.amountMax || ''}
                  onChange={e =>
                    handleFilterChange(
                      'amountMax',
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  className="flex-1"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Term Range Filters */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {t('creditProgram.filters.termRange')}
              </Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder={t('common.min')}
                  value={filters.termMin || ''}
                  onChange={e =>
                    handleFilterChange(
                      'termMin',
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  className="flex-1"
                  disabled={loading}
                />
                <Input
                  type="number"
                  placeholder={t('common.max')}
                  value={filters.termMax || ''}
                  onChange={e =>
                    handleFilterChange(
                      'termMax',
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  className="flex-1"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Valid From Date Range */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {t('creditProgram.fields.validFrom')} {t('common.range')}
              </Label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={filters.validFromStart}
                  onChange={e =>
                    handleFilterChange('validFromStart', e.target.value)
                  }
                  className="flex-1"
                  disabled={loading}
                />
                <Input
                  type="date"
                  value={filters.validFromEnd}
                  onChange={e =>
                    handleFilterChange('validFromEnd', e.target.value)
                  }
                  className="flex-1"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Valid To Date Range */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {t('creditProgram.fields.validTo')} {t('common.range')}
              </Label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={filters.validToStart}
                  onChange={e =>
                    handleFilterChange('validToStart', e.target.value)
                  }
                  className="flex-1"
                  disabled={loading}
                />
                <Input
                  type="date"
                  value={filters.validToEnd}
                  onChange={e =>
                    handleFilterChange('validToEnd', e.target.value)
                  }
                  className="flex-1"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Collateral Required Filter */}
            <div className="space-y-2">
              <Label>{t('creditProgram.fields.collateralRequired')}</Label>
              <Select
                value={
                  filters.collateralRequired === null
                    ? 'all'
                    : filters.collateralRequired
                      ? 'true'
                      : 'false'
                }
                onValueChange={value =>
                  handleFilterChange(
                    'collateralRequired',
                    value === 'all' ? null : value === 'true'
                  )
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('common.all')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all')}</SelectItem>
                  <SelectItem value="true">{t('common.yes')}</SelectItem>
                  <SelectItem value="false">{t('common.no')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filter Actions */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2 col-span-full">
              <Button
                variant="outline"
                onClick={clearFilters}
                disabled={filtersApplied === 0 || loading}
                className="w-full sm:w-auto"
              >
                <X className="mr-2 h-4 w-4" />
                {t('common.clear')}
                {filtersApplied > 0 && ` (${filtersApplied})`}
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="w-full sm:w-auto"
                disabled={loading}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                {t('common.refresh')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
