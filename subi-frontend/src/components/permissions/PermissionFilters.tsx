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
import type { PermissionFilterState } from '@/hooks/usePermissionFilters';

interface PermissionFiltersProps {
  filters: PermissionFilterState;
  isFilterOpen: boolean;
  filtersApplied: number;
  isMobile: boolean;
  categoryCounts: Record<string, number>;
  onFilterChange: (
    key: keyof PermissionFilterState,
    value: string
  ) => void;
  onToggleFilter: () => void;
  onClearFilters: () => void;
  onCreate: () => void;
}

export const PermissionFilters: React.FC<PermissionFiltersProps> = ({
  filters,
  isFilterOpen,
  filtersApplied,
  isMobile,
  categoryCounts,
  onFilterChange,
  onToggleFilter,
  onClearFilters,
  onCreate,
}) => {
  const { t } = useTranslation();
  const { hasAnyRole } = useAuth();

  return (
    <div className='bg-muted/10 rounded-lg border border-border/20 shadow-sm'>
      <div className='p-3 sm:p-4'>
        {/* Search Bar */}
        <div className='flex flex-col sm:flex-row gap-3 sm:gap-4'>
          <div className='flex-1'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                placeholder={t('permissionManagement.searchPermissions')}
                value={filters.searchTerm}
                onChange={e => onFilterChange('searchTerm', e.target.value)}
                className='pl-10'
                aria-label={t('permissionManagement.searchPermissions')}
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
              {t('userManagement.advancedFilters')}
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
                variant='outline'
                size='icon'
                onClick={onClearFilters}
                aria-label={t('common.clearFilters')}
                className='shrink-0'
              >
                <X className='h-4 w-4' />
              </Button>
            )}
          </div>

          {hasAnyRole(['ADMIN']) && (
            <div className='flex gap-2'>
              <Button
                onClick={onCreate}
                className='add-new-permission-button bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-shadow w-full sm:w-auto relative group'
                size={isMobile ? 'default' : 'default'}
              >
                <Plus className='h-4 w-4' />
                <span
                  className='absolute left-1/2 -translate-x-1/2 top-full mt-2 bg-background border border-border rounded-md px-2 py-1 text-xs text-foreground shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10'
                  role='tooltip'
                  aria-hidden='true'
                >
                  {t('permissionManagement.createPermission')}
                </span>
              </Button>
            </div>
          )}
        </div>

        {/* Category Overview */}
        {Object.keys(categoryCounts).length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge
              variant={filters.category === 'all' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => onFilterChange('category', 'all')}
            >
              {t('permissionManagement.allPermissions')} ({Object.values(categoryCounts).reduce((sum, count) => sum + count, 0)})
            </Badge>
            {Object.entries(categoryCounts).map(([category, count]) => (
              <Badge
                key={category}
                variant={filters.category === category ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => onFilterChange('category', category)}
              >
                {t(`permissionManagement.categories.${category}` as keyof typeof t) || category} ({count})
              </Badge>
            ))}
          </div>
        )}

        {/* Collapsible Advanced Filters */}
        {isFilterOpen && (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6 bg-gradient-to-br from-muted/60 to-accent/40 rounded-xl transition-all duration-300 ease-out mt-6 border border-border/10 shadow-inner'>
            {/* Category Filter */}
            <div className='space-y-2'>
              <Label htmlFor='category-filter'>
                {t('permissionManagement.category')}
              </Label>
              <Select
                value={filters.category}
                onValueChange={value => onFilterChange('category', value)}
              >
                <SelectTrigger id='category-filter'>
                  <SelectValue placeholder={t('permissionManagement.selectCategory')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>{t('common.all')}</SelectItem>
                  <SelectItem value='userManagement'>{t('permissionManagement.categories.userManagement')}</SelectItem>
                  <SelectItem value='roleManagement'>{t('permissionManagement.categories.roleManagement')}</SelectItem>
                  <SelectItem value='permissionManagement'>{t('permissionManagement.categories.permissionManagement')}</SelectItem>
                  <SelectItem value='system'>{t('permissionManagement.categories.system')}</SelectItem>
                  <SelectItem value='creditProgram'>{t('permissionManagement.categories.creditProgram')}</SelectItem>
                  <SelectItem value='decision'>{t('permissionManagement.categories.decision')}</SelectItem>
                  <SelectItem value='referenceData'>{t('permissionManagement.categories.referenceData')}</SelectItem>
                  <SelectItem value='other'>{t('permissionManagement.categories.other')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Created Date From */}
            <div className='space-y-2'>
              <Label htmlFor='created-from-filter'>
                {t('common.createdFrom')}
              </Label>
              <Input
                id='created-from-filter'
                type='date'
                value={filters.createdDateFrom}
                onChange={e => onFilterChange('createdDateFrom', e.target.value)}
              />
            </div>

            {/* Created Date To */}
            <div className='space-y-2'>
              <Label htmlFor='created-to-filter'>
                {t('common.createdTo')}
              </Label>
              <Input
                id='created-to-filter'
                type='date'
                value={filters.createdDateTo}
                onChange={e => onFilterChange('createdDateTo', e.target.value)}
              />
            </div>

            {/* Filter Actions */}
            <div className='flex flex-col sm:flex-row gap-2 pt-2 col-span-full'>
              <Button
                variant='outline'
                onClick={onClearFilters}
                disabled={filtersApplied === 0}
                className='w-full sm:w-auto'
              >
                <X className='mr-2 h-4 w-4' />
                {t('common.clear')}
                {filtersApplied > 0 && ` (${filtersApplied})`}
              </Button>
              <Button
                variant='outline'
                onClick={() => window.location.reload()}
                className='w-full sm:w-auto'
              >
                <RefreshCw className='mr-2 h-4 w-4' />
                {t('common.refresh')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};