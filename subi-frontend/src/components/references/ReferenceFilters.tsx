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
import type {
  ReferenceFilterState,
  ReferenceEntityStatus,
  ReferenceEntityType,
} from '@/types/reference';

interface ReferenceFiltersProps {
  filters: ReferenceFilterState;
  isFilterOpen: boolean;
  filtersApplied: number;
  hasValidationErrors: boolean;
  onFilterChange: (
    key: keyof ReferenceFilterState,
    value: string | ReferenceEntityStatus | ReferenceEntityType | boolean | null
  ) => void;
  onToggleFilter: () => void;
  onClearFilters: () => void;
  onCreate: () => void;
}

export const ReferenceFilters: React.FC<ReferenceFiltersProps> = ({
  filters,
  isFilterOpen,
  filtersApplied,
  hasValidationErrors,
  onFilterChange,
  onToggleFilter,
  onClearFilters,
  onCreate,
}) => {
  const { t } = useTranslation();
  const { hasAnyRole } = useAuth();

  const entityTypeOptions = [
    { value: 'CURRENCIES', label: t('references.filters.entityTypes.currencies') },
    { value: 'CREDIT_PURPOSES', label: t('references.filters.entityTypes.creditPurposes') },
    { value: 'DOCUMENT_TYPES', label: t('references.filters.entityTypes.documentTypes') },
    { value: 'DECISION_MAKING_BODIES', label: t('references.filters.entityTypes.decisionMakingBodies') },
    { value: 'DECISION_TYPES', label: t('references.filters.entityTypes.decisionTypes') },
    { value: 'FLOATING_RATE_TYPES', label: t('references.filters.entityTypes.floatingRateTypes') },
    { value: 'REPAYMENT_ORDERS', label: t('references.filters.entityTypes.repaymentOrders') },
  ];

  return (
    <div className='bg-muted/10 rounded-lg border border-border/20 shadow-sm'>
      <div className='p-3 sm:p-4'>
        {/* Search Bar */}
        <div className='flex flex-col sm:flex-row gap-3 sm:gap-4'>
          <div className='flex-1'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                placeholder={t('references.list.searchPlaceholder')}
                value={filters.searchTerm}
                onChange={e => onFilterChange('searchTerm', e.target.value)}
                className='pl-10'
                aria-label={t('references.list.searchPlaceholder')}
              />
            </div>
          </div>

          <div className='flex gap-2'>
            <Button
              variant='outline'
              onClick={onToggleFilter}
              className={cn(
                'relative gap-2 transition-all duration-200',
                isFilterOpen && 'bg-primary text-primary-foreground'
              )}
              aria-expanded={isFilterOpen}
            >
              <Filter className='h-4 w-4' />
              {t('references.list.advancedFilters')}
              {filtersApplied > 0 && (
                <Badge
                  variant={isFilterOpen ? 'secondary' : 'destructive'}
                  className='ml-2 px-1.5 py-0.5 text-xs -mr-1'
                >
                  {filtersApplied}
                </Badge>
              )}
              {isFilterOpen ? (
                <ChevronUp className='h-4 w-4' />
              ) : (
                <ChevronDown className='h-4 w-4' />
              )}
            </Button>

            {filtersApplied > 0 && (
              <Button
                variant='ghost'
                size='sm'
                onClick={onClearFilters}
                className='text-muted-foreground hover:text-foreground'
                aria-label={t('common.clearFilters')}
              >
                <RefreshCw className='h-4 w-4' />
              </Button>
            )}

            {hasAnyRole(['ADMIN']) && (
              <Button onClick={onCreate} className='gap-2'>
                <Plus className='h-4 w-4' />
                {t('references.actions.create')}
              </Button>
            )}
          </div>
        </div>

        {/* Advanced Filters */}
        {isFilterOpen && (
          <div className='mt-4 pt-4 border-t border-border/20'>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
              {/* Entity Type Filter */}
              <div className='space-y-2'>
                <Label className='text-sm font-medium'>
                  {t('references.list.entityType')}
                </Label>
                <Select
                  value={filters.entityType || ''}
                  onValueChange={(value) =>
                    onFilterChange('entityType', value ? (value as ReferenceEntityType) : null)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('common.all')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{t('common.all')}</SelectItem>
                    {entityTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className='space-y-2'>
                <Label className='text-sm font-medium'>
                  {t('references.fields.status')}
                </Label>
                <Select
                  value={filters.status || ''}
                  onValueChange={(value) =>
                    onFilterChange('status', value ? (value as ReferenceEntityStatus) : null)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('common.all')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{t('common.all')}</SelectItem>
                    <SelectItem value="ACTIVE">{t('references.status.active')}</SelectItem>
                    <SelectItem value="INACTIVE">{t('references.status.inactive')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Availability Filter */}
              <div className='space-y-2'>
                <Label className='text-sm font-medium'>
                  {t('references.list.availability')}
                </Label>
                <Select
                  value={filters.isAvailable === null ? '' : filters.isAvailable.toString()}
                  onValueChange={(value) =>
                    onFilterChange('isAvailable', value === '' ? null : value === 'true')
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('common.all')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{t('common.all')}</SelectItem>
                    <SelectItem value="true">{t('references.list.available')}</SelectItem>
                    <SelectItem value="false">{t('references.list.notAvailable')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date Range Filters */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4'>
              {/* Created Date Range */}
              <div className='space-y-2'>
                <Label className='text-sm font-medium'>
                  {t('references.list.createdDate')}
                </Label>
                <div className='grid grid-cols-2 gap-2'>
                  <div>
                    <Label className='text-xs text-muted-foreground'>
                      {t('references.list.from')}
                    </Label>
                    <Input
                      type='date'
                      value={filters.createdDateFrom}
                      onChange={(e) => onFilterChange('createdDateFrom', e.target.value)}
                      className='text-sm'
                    />
                  </div>
                  <div>
                    <Label className='text-xs text-muted-foreground'>
                      {t('references.list.to')}
                    </Label>
                    <Input
                      type='date'
                      value={filters.createdDateTo}
                      onChange={(e) => onFilterChange('createdDateTo', e.target.value)}
                      className='text-sm'
                    />
                  </div>
                </div>
              </div>

              {/* Updated Date Range */}
              <div className='space-y-2'>
                <Label className='text-sm font-medium'>
                  {t('references.list.updatedDate')}
                </Label>
                <div className='grid grid-cols-2 gap-2'>
                  <div>
                    <Label className='text-xs text-muted-foreground'>
                      {t('references.list.from')}
                    </Label>
                    <Input
                      type='date'
                      value={filters.updatedDateFrom}
                      onChange={(e) => onFilterChange('updatedDateFrom', e.target.value)}
                      className='text-sm'
                    />
                  </div>
                  <div>
                    <Label className='text-xs text-muted-foreground'>
                      {t('references.list.to')}
                    </Label>
                    <Input
                      type='date'
                      value={filters.updatedDateTo}
                      onChange={(e) => onFilterChange('updatedDateTo', e.target.value)}
                      className='text-sm'
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Validation Errors */}
            {hasValidationErrors && (
              <div className='mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md'>
                <p className='text-sm text-destructive'>
                  {t('references.messages.dateRangeError')}
                </p>
              </div>
            )}

            {/* Filter Actions */}
            <div className='flex items-center justify-between mt-4 pt-4 border-t border-border/20'>
              <div className='flex items-center gap-2'>
                {filtersApplied > 0 && (
                  <Badge variant='secondary' className='px-2 py-1'>
                    {t('common.filtersApplied', { count: filtersApplied })}
                  </Badge>
                )}
              </div>
              <div className='flex gap-2'>
                {filtersApplied > 0 && (
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={onClearFilters}
                    className='gap-2'
                  >
                    <X className='h-4 w-4' />
                    {t('common.clearFilters')}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};