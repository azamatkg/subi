import React from 'react';
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  X,
  RefreshCw,
  Plus,
  Shield,
  Key,
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

interface RoleFilterState {
  searchTerm: string;
  roleType: 'all' | 'system' | 'custom';
  permissionCountMin: string;
  permissionCountMax: string;
}

interface RoleFiltersProps {
  filters: RoleFilterState;
  isFilterOpen: boolean;
  filtersApplied: number;
  isMobile: boolean;
  onFilterChange: (
    key: keyof RoleFilterState,
    value: string
  ) => void;
  onToggleFilter: () => void;
  onClearFilters: () => void;
  onCreate: () => void;
}

export const RoleFilters: React.FC<RoleFiltersProps> = ({
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
                placeholder={t('roleManagement.searchRoles')}
                value={filters.searchTerm}
                onChange={e => onFilterChange('searchTerm', e.target.value)}
                className='pl-10'
                aria-label={t('roleManagement.searchRoles')}
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
              {t('common.advancedFilters')}
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
                size='sm'
                onClick={onClearFilters}
                className='gap-2 text-muted-foreground hover:text-foreground'
                aria-label={t('common.clearFilters')}
              >
                <RefreshCw className='h-4 w-4' />
                {!isMobile && t('common.clear')}
              </Button>
            )}

            {hasAnyRole(['ADMIN']) && (
              <Button
                onClick={onCreate}
                className='gap-2 shadow-sm'
                aria-label={t('roleManagement.createRole')}
              >
                <Plus className='h-4 w-4' />
                {!isMobile && t('roleManagement.createRole')}
              </Button>
            )}
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {isFilterOpen && (
          <div className='mt-4 space-y-4 border-t border-border/10 pt-4'>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
              {/* Role Type Filter */}
              <div className='space-y-2'>
                <Label className='text-sm font-medium flex items-center gap-2'>
                  <Shield className='h-4 w-4' />
                  {t('roleManagement.roleType')}
                </Label>
                <Select
                  value={filters.roleType}
                  onValueChange={(value) => onFilterChange('roleType', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>{t('common.all')}</SelectItem>
                    <SelectItem value='system'>{t('roleManagement.systemRoles')}</SelectItem>
                    <SelectItem value='custom'>{t('roleManagement.customRoles')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Permission Count Range */}
              <div className='space-y-2'>
                <Label className='text-sm font-medium flex items-center gap-2'>
                  <Key className='h-4 w-4' />
                  {t('roleManagement.minPermissions')}
                </Label>
                <Input
                  type='number'
                  placeholder='0'
                  value={filters.permissionCountMin}
                  onChange={e => onFilterChange('permissionCountMin', e.target.value)}
                  min='0'
                />
              </div>

              <div className='space-y-2'>
                <Label className='text-sm font-medium flex items-center gap-2'>
                  <Key className='h-4 w-4' />
                  {t('roleManagement.maxPermissions')}
                </Label>
                <Input
                  type='number'
                  placeholder={t('common.infinity')}
                  value={filters.permissionCountMax}
                  onChange={e => onFilterChange('permissionCountMax', e.target.value)}
                  min='0'
                />
              </div>

              {/* Clear Filters Button for Mobile */}
              {isMobile && filtersApplied > 0 && (
                <div className='flex items-end'>
                  <Button
                    variant='outline'
                    onClick={onClearFilters}
                    className='w-full gap-2'
                  >
                    <X className='h-4 w-4' />
                    {t('common.clearFilters')}
                  </Button>
                </div>
              )}
            </div>

            {/* Applied Filters Summary */}
            {filtersApplied > 0 && (
              <div className='flex flex-wrap gap-2 pt-2 border-t border-border/10'>
                <span className='text-sm font-medium text-muted-foreground'>
                  {t('common.activeFilters')}:
                </span>
                {filters.roleType !== 'all' && (
                  <Badge variant='outline' className='gap-1'>
                    <Shield className='h-3 w-3' />
                    {t(`roleManagement.${filters.roleType}Roles`)}
                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-auto p-0 ml-1 hover:bg-transparent'
                      onClick={() => onFilterChange('roleType', 'all')}
                    >
                      <X className='h-3 w-3' />
                    </Button>
                  </Badge>
                )}
                {filters.permissionCountMin && (
                  <Badge variant='outline' className='gap-1'>
                    <Key className='h-3 w-3' />
                    {t('roleManagement.min')}: {filters.permissionCountMin}
                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-auto p-0 ml-1 hover:bg-transparent'
                      onClick={() => onFilterChange('permissionCountMin', '')}
                    >
                      <X className='h-3 w-3' />
                    </Button>
                  </Badge>
                )}
                {filters.permissionCountMax && (
                  <Badge variant='outline' className='gap-1'>
                    <Key className='h-3 w-3' />
                    {t('roleManagement.max')}: {filters.permissionCountMax}
                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-auto p-0 ml-1 hover:bg-transparent'
                      onClick={() => onFilterChange('permissionCountMax', '')}
                    >
                      <X className='h-3 w-3' />
                    </Button>
                  </Badge>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};