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
import type { UserFilterState, UserStatus } from '@/types/user';
import { UserStatus as UserStatusEnum } from '@/types/user';

interface UserFiltersProps {
  filters: UserFilterState;
  isFilterOpen: boolean;
  filtersApplied: number;
  isMobile: boolean;
  onFilterChange: (
    key: keyof UserFilterState,
    value: string | string[] | boolean | UserStatus | null
  ) => void;
  onToggleFilter: () => void;
  onClearFilters: () => void;
  onCreate: () => void;
}

export const UserFilters: React.FC<UserFiltersProps> = ({
  filters,
  isFilterOpen,
  filtersApplied,
  isMobile,
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
                placeholder={t('userManagement.searchPlaceholder')}
                value={filters.searchTerm}
                onChange={e => onFilterChange('searchTerm', e.target.value)}
                className='pl-10'
                aria-label={t('userManagement.searchPlaceholder')}
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
                className='add-new-user-button bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-shadow w-full sm:w-auto relative group'
                size={isMobile ? 'default' : 'default'}
              >
                <Plus className='h-4 w-4' />
                <span
                  className='absolute left-1/2 -translate-x-1/2 top-full mt-2 bg-background border border-border rounded-md px-2 py-1 text-xs text-foreground shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10'
                  role='tooltip'
                  aria-hidden='true'
                >
                  {t('userManagement.createUser')}
                </span>
              </Button>
            </div>
          )}
        </div>

        {/* Collapsible Advanced Filters */}
        {isFilterOpen && (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6 bg-gradient-to-br from-muted/60 to-accent/40 rounded-xl transition-all duration-300 ease-out mt-6 border border-border/10 shadow-inner'>
            {/* Status Filter */}
            <div className='space-y-2'>
              <Label htmlFor='status-filter'>
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
              >
                <SelectTrigger id='status-filter'>
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

            {/* Active Status Filter */}
            <div className='space-y-2'>
              <Label htmlFor='active-filter'>
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
              >
                <SelectTrigger id='active-filter'>
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

            {/* Department Filter */}
            <div className='space-y-2'>
              <Label htmlFor='department-filter'>
                {t('userManagement.fields.department')}
              </Label>
              <Input
                id='department-filter'
                placeholder={t('userManagement.enterDepartment')}
                value={filters.department}
                onChange={e => onFilterChange('department', e.target.value)}
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
