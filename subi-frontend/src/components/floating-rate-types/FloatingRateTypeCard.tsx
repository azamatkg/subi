import React from 'react';
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash,
  TrendingUp,
  Calendar,
  Shield,
  Percent,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/hooks/useAuth';
import type { FloatingRateTypeResponseDto, FloatingRateCalculationType } from '@/types/floatingRateType';
import type { ReferenceEntityStatus } from '@/types/reference';

interface FloatingRateTypeCardProps {
  floatingRateType: FloatingRateTypeResponseDto;
  onView: (floatingRateType: FloatingRateTypeResponseDto) => void;
  onEdit: (floatingRateType: FloatingRateTypeResponseDto) => void;
  onDelete: (floatingRateType: FloatingRateTypeResponseDto) => void;
  loading?: boolean;
  className?: string;
}

export const FloatingRateTypeCard: React.FC<FloatingRateTypeCardProps> = ({
  floatingRateType,
  onView,
  onEdit,
  onDelete,
  loading = false,
  className,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const userRoles = user?.roles || [];
  const canEdit = userRoles.includes('ADMIN');
  const canDelete = userRoles.includes('ADMIN');

  const getStatusBadgeColor = (status: ReferenceEntityStatus | undefined) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'INACTIVE':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getRateCalculationTypeBadgeColor = (type: FloatingRateCalculationType | undefined) => {
    switch (type) {
      case 'FIXED_SPREAD':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'VARIABLE_SPREAD':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'BASE_RATE_PLUS':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'MARKET_LINKED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'INDEXED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'TIERED':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatSpreadRange = (min?: number, max?: number) => {
    if (min !== undefined && max !== undefined) {
      return `${min}% - ${max}%`;
    }
    if (min !== undefined) {
      return `${min}%+`;
    }
    if (max !== undefined) {
      return `≤${max}%`;
    }
    return '';
  };

  return (
    <Card
      className={cn(
        'group hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-primary/20',
        loading && 'opacity-60 pointer-events-none',
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3
                className="font-semibold text-gray-900 truncate cursor-pointer hover:text-primary transition-colors"
                onClick={() => onView(floatingRateType)}
                title={floatingRateType.nameEn}
              >
                {floatingRateType.nameEn}
              </h3>
              <p className="text-sm text-gray-600 truncate">
                {floatingRateType.nameRu}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn("text-xs", getStatusBadgeColor(floatingRateType.status))}
            >
              {t(`references.status.${floatingRateType.status?.toLowerCase() ?? 'unknown'}`)}
            </Badge>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">{t('common.openMenu')}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onView(floatingRateType)}>
                  <Eye className="mr-2 h-4 w-4" />
                  {t('common.view')}
                </DropdownMenuItem>
                {canEdit && (
                  <>
                    <DropdownMenuItem onClick={() => onEdit(floatingRateType)}>
                      <Edit className="mr-2 h-4 w-4" />
                      {t('common.edit')}
                    </DropdownMenuItem>
                    {canDelete && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete(floatingRateType)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          {t('common.delete')}
                        </DropdownMenuItem>
                      </>
                    )}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Rate Calculation Type */}
          {floatingRateType.rateCalculationType && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{t('floatingRateType.fields.rateCalculationType')}</span>
              <Badge
                variant="outline"
                className={cn("text-xs", getRateCalculationTypeBadgeColor(floatingRateType.rateCalculationType))}
              >
                {t(`floatingRateType.rateCalculationTypes.${floatingRateType.rateCalculationType.toLowerCase()}`)}
              </Badge>
            </div>
          )}

          {/* Spread Range */}
          {(floatingRateType.spreadMin !== undefined || floatingRateType.spreadMax !== undefined) && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 flex items-center gap-1">
                <Percent className="h-3 w-3" />
                {t('floatingRateType.fields.spreadRange')}
              </span>
              <span className="text-sm font-medium text-gray-900">
                {formatSpreadRange(floatingRateType.spreadMin, floatingRateType.spreadMax)}
              </span>
            </div>
          )}

          {/* Base Rate Description */}
          {floatingRateType.baseRateDescription && (
            <div className="space-y-1">
              <span className="text-sm text-gray-600">{t('floatingRateType.fields.baseRateDescription')}</span>
              <p className="text-sm text-gray-900 bg-gray-50 rounded-md px-2 py-1">
                {floatingRateType.baseRateDescription}
              </p>
            </div>
          )}

          {/* Description */}
          {floatingRateType.description && (
            <div className="space-y-1">
              <span className="text-sm text-gray-600">{t('floatingRateType.fields.description')}</span>
              <p className="text-sm text-gray-900 line-clamp-2">
                {floatingRateType.description}
              </p>
            </div>
          )}

          {/* Footer with metadata */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="h-3 w-3" />
              {new Date(floatingRateType.createdAt).toLocaleDateString()}
            </div>
            {floatingRateType.updatedByUsername && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Shield className="h-3 w-3" />
                {floatingRateType.updatedByUsername}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};