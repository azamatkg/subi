import React from 'react';
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash,
  Target,
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
import type { CreditPurposeResponseDto, CreditPurposeCategory } from '@/types/creditPurpose';
import type { ReferenceEntityStatus } from '@/types/reference';

interface CreditPurposeCardProps {
  creditPurpose: CreditPurposeResponseDto;
  onView: (creditPurpose: CreditPurposeResponseDto) => void;
  onEdit: (creditPurpose: CreditPurposeResponseDto) => void;
  onDelete: (creditPurpose: CreditPurposeResponseDto) => void;
  loading?: boolean;
  className?: string;
}

export const CreditPurposeCard: React.FC<CreditPurposeCardProps> = ({
  creditPurpose,
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

  // Category badge component
  const CategoryBadge: React.FC<{ category: CreditPurposeCategory | null | undefined }> = ({ category }) => {
    if (!category) {
      return (
        <Badge
          variant="outline"
          className={cn('px-2 py-1 text-xs font-medium', 'bg-gray-100 text-gray-800 border-gray-300')}
        >
          {t('creditPurpose.category.unknown')}
        </Badge>
      );
    }

    const getCategoryStyle = (category: CreditPurposeCategory) => {
      switch (category) {
        case 'CONSUMER':
          return 'bg-blue-100 text-blue-800 border-blue-300';
        case 'BUSINESS':
          return 'bg-purple-100 text-purple-800 border-purple-300';
        case 'AGRICULTURAL':
          return 'bg-green-100 text-green-800 border-green-300';
        case 'MORTGAGE':
          return 'bg-orange-100 text-orange-800 border-orange-300';
        case 'MICROFINANCE':
          return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        case 'CORPORATE':
          return 'bg-red-100 text-red-800 border-red-300';
        default:
          return 'bg-gray-100 text-gray-800 border-gray-300';
      }
    };

    return (
      <Badge
        variant="outline"
        className={cn('px-2 py-1 text-xs font-medium', getCategoryStyle(category))}
      >
        {t(`creditPurpose.category.${category.toLowerCase()}`)}
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
                <Target className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <StatusBadge status={creditPurpose.status} />
                <CategoryBadge category={creditPurpose.category} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {creditPurpose.nameEn}
              </h3>
              <p className="text-sm text-gray-600 truncate">
                {creditPurpose.nameRu} • {creditPurpose.nameKg}
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
              <DropdownMenuItem onClick={() => onView(creditPurpose)}>
                <Eye className="mr-2 h-4 w-4" />
                {t('common.view')}
              </DropdownMenuItem>

              {canEdit && (
                <>
                  <DropdownMenuItem onClick={() => onEdit(creditPurpose)}>
                    <Edit className="mr-2 h-4 w-4" />
                    {t('common.edit')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(creditPurpose)}
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
        {creditPurpose.description && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 line-clamp-2">
              {creditPurpose.description}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-gray-500">{t('references.fields.created')}</p>
              <p className="font-medium">{formatDate(creditPurpose.createdAt)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-gray-500">{t('references.fields.updated')}</p>
              <p className="font-medium">{formatDate(creditPurpose.updatedAt)}</p>
            </div>
          </div>
        </div>

        {creditPurpose.createdByUsername && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              {t('common.by')} {creditPurpose.createdByUsername}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};