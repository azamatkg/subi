import React from 'react';
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash,
  DollarSign,
  Calendar,
  Shield,
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
import type { CurrencyResponseDto } from '@/types/currency';
import type { ReferenceEntityStatus } from '@/types/reference';

interface CurrencyCardProps {
  currency: CurrencyResponseDto;
  onView: (currency: CurrencyResponseDto) => void;
  onEdit: (currency: CurrencyResponseDto) => void;
  onDelete: (currency: CurrencyResponseDto) => void;
  loading?: boolean;
  className?: string;
}

export const CurrencyCard: React.FC<CurrencyCardProps> = ({
  currency,
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

  // Status badge component
  const StatusBadge: React.FC<{ status: ReferenceEntityStatus }> = ({ status }) => {
    const getStatusStyle = (status: ReferenceEntityStatus) => {
      switch (status) {
        case 'ACTIVE':
          return 'bg-green-100 text-green-800 border-green-300';
        case 'INACTIVE':
          return 'bg-gray-100 text-gray-800 border-gray-300';
        default:
          return 'bg-gray-100 text-gray-800 border-gray-300';
      }
    };

    return (
      <Badge
        variant="outline"
        className={cn('px-2 py-1 text-xs font-medium', getStatusStyle(status))}
      >
        {t(`references.status.${status.toLowerCase()}`)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card
      className={cn(
        'hover:shadow-lg transition-all duration-200 border border-gray-200',
        loading && 'opacity-50 pointer-events-none',
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-800">
                  {currency.code}
                </span>
                <StatusBadge status={currency.status} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {currency.nameEn}
              </h3>
              <p className="text-sm text-gray-600 truncate">
                {currency.nameRu} • {currency.nameKg}
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                aria-label={t('common.openMenu')}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onView(currency)}>
                <Eye className="mr-2 h-4 w-4" />
                {t('common.view')}
              </DropdownMenuItem>

              {canEdit && (
                <>
                  <DropdownMenuItem onClick={() => onEdit(currency)}>
                    <Edit className="mr-2 h-4 w-4" />
                    {t('common.edit')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(currency)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    {t('common.delete')}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {currency.description && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 line-clamp-2">
              {currency.description}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-gray-500">{t('references.fields.created')}</p>
              <p className="font-medium">{formatDate(currency.createdAt)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-gray-500">{t('references.fields.updated')}</p>
              <p className="font-medium">{formatDate(currency.updatedAt)}</p>
            </div>
          </div>
        </div>

        {currency.createdByUsername && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              {t('common.by')} {currency.createdByUsername}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};