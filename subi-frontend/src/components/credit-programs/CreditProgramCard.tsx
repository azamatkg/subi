import React from 'react';
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash,
  CreditCard,
  Calendar,
  DollarSign,
  Clock,
  Shield,
  Play,
  Pause,
  X as CloseIcon,
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
import { cn } from '@/lib/utils';

import { useTranslation } from '@/hooks/useTranslation';
import type {
  CreditProgramResponseDto,
  ProgramStatus,
} from '@/types/creditProgram';

interface CreditProgramCardProps {
  program: CreditProgramResponseDto;
  onView: (program: CreditProgramResponseDto) => void;
  onEdit: (program: CreditProgramResponseDto) => void;
  onDelete: (program: CreditProgramResponseDto) => void;
  onActivate?: (program: CreditProgramResponseDto) => void;
  onSuspend?: (program: CreditProgramResponseDto) => void;
  onClose?: (program: CreditProgramResponseDto) => void;
  userRoles?: string[];
  loading?: boolean;
  className?: string;
}

export const CreditProgramCard: React.FC<CreditProgramCardProps> = ({
  program,
  onView,
  onEdit,
  onDelete,
  onActivate,
  onSuspend,
  onClose,
  userRoles = [],
  loading = false,
  className,
}) => {
  const { t } = useTranslation();

  const canManageStatus =
    userRoles.includes('ADMIN') || userRoles.includes('CREDIT_MANAGER');
  const canDelete = userRoles.includes('ADMIN');
  const canEdit =
    userRoles.includes('ADMIN') ||
    userRoles.includes('CREDIT_ANALYST') ||
    userRoles.includes('CREDIT_MANAGER');

  // Status badge component
  const StatusBadge: React.FC<{ status: ProgramStatus }> = ({ status }) => {
    const getStatusStyle = (status: ProgramStatus) => {
      switch (status) {
        case 'DRAFT':
          return 'bg-gray-100 text-gray-800 border-gray-300';
        case 'PENDING_APPROVAL':
          return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        case 'APPROVED':
          return 'bg-blue-100 text-blue-800 border-blue-300';
        case 'ACTIVE':
          return 'bg-green-100 text-green-800 border-green-300';
        case 'SUSPENDED':
          return 'bg-orange-100 text-orange-800 border-orange-300';
        case 'CLOSED':
        case 'CANCELLED':
        case 'REJECTED':
          return 'bg-red-100 text-red-800 border-red-300';
        default:
          return 'bg-gray-100 text-gray-800 border-gray-300';
      }
    };

    return (
      <Badge
        className={cn('font-medium border shadow-sm', getStatusStyle(status))}
      >
        {t(`creditProgram.status.${status.toLowerCase()}`)}
      </Badge>
    );
  };

  // Format amount range
  const formatAmountRange = (program: CreditProgramResponseDto) => {
    if (!program.amountMin && !program.amountMax)
      return t('common.notSpecified');
    if (program.amountMin && program.amountMax) {
      return `${program.amountMin.toLocaleString()} - ${program.amountMax.toLocaleString()} ${program.currencyCode}`;
    }
    if (program.amountMin) {
      return `${t('common.from')} ${program.amountMin.toLocaleString()} ${program.currencyCode}`;
    }
    return `${t('common.up_to')} ${program.amountMax!.toLocaleString()} ${program.currencyCode}`;
  };

  // Format term range
  const formatTermRange = (program: CreditProgramResponseDto) => {
    if (!program.termMin && !program.termMax) return t('common.notSpecified');
    if (program.termMin && program.termMax) {
      return `${program.termMin} - ${program.termMax} ${t('common.months')}`;
    }
    if (program.termMin) {
      return `${t('common.from')} ${program.termMin} ${t('common.months')}`;
    }
    return `${t('common.up_to')} ${program.termMax} ${t('common.months')}`;
  };

  // Format validity period
  const formatValidityPeriod = (program: CreditProgramResponseDto) => {
    if (!program.validFrom && !program.validTo) return t('common.notSpecified');
    const formatDate = (dateStr: string) =>
      new Date(dateStr).toLocaleDateString();

    if (program.validFrom && program.validTo) {
      return `${formatDate(program.validFrom)} - ${formatDate(program.validTo)}`;
    }
    if (program.validFrom) {
      return `${t('common.from')} ${formatDate(program.validFrom)}`;
    }
    return `${t('common.until')} ${formatDate(program.validTo!)}`;
  };

  return (
    <div
      className={cn(
        'group hover:shadow-xl hover:shadow-primary/5 hover:bg-card-elevated hover:scale-[1.02] transition-all duration-300 border border-card-elevated-border bg-card shadow-md backdrop-blur-sm rounded-lg',
        loading && 'opacity-50 pointer-events-none',
        className
      )}
      role="article"
      aria-labelledby={`program-title-${program.id}`}
    >
      <div className="p-6">
        <div className="space-y-4">
          {/* Header with status and actions */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 border border-primary-300 shadow-sm">
                  <CreditCard className="h-5 w-5 text-primary-700 shrink-0" />
                </div>
                <span className="text-sm font-mono font-bold text-primary-700 tabular-nums tracking-wide">
                  {program.currencyCode}
                </span>
              </div>
              <button
                onClick={() => onView(program)}
                className="text-left w-full"
                disabled={loading}
              >
                <h3
                  id={`program-title-${program.id}`}
                  className="text-xl font-bold leading-tight text-card-foreground hover:text-primary-600 transition-colors cursor-pointer tracking-wide"
                >
                  {program.nameEn}
                </h3>
              </button>
              {program.description && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2 font-medium">
                  {program.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <StatusBadge status={program.status} />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 opacity-60 group-hover:opacity-100 transition-all duration-300 hover:bg-accent hover:shadow-md hover:scale-110 focus:ring-2 focus:ring-primary/30 rounded-lg"
                    aria-label={t('common.actions', { item: program.nameEn })}
                    disabled={loading}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="shadow-lg border-border/20"
                >
                  <DropdownMenuItem
                    onClick={() => onView(program)}
                    className="hover:bg-accent focus:bg-accent"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    {t('common.view')}
                  </DropdownMenuItem>

                  {canEdit && (
                    <DropdownMenuItem
                      onClick={() => onEdit(program)}
                      className="hover:bg-accent focus:bg-accent"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      {t('common.edit')}
                    </DropdownMenuItem>
                  )}

                  {canManageStatus && (
                    <>
                      <DropdownMenuSeparator />

                      {program.status === 'APPROVED' && onActivate && (
                        <DropdownMenuItem
                          onClick={() => onActivate(program)}
                          className="hover:bg-green-50 text-green-700"
                        >
                          <Play className="mr-2 h-4 w-4" />
                          {t('creditProgram.actions.activate')}
                        </DropdownMenuItem>
                      )}

                      {program.status === 'ACTIVE' && onSuspend && (
                        <DropdownMenuItem
                          onClick={() => onSuspend(program)}
                          className="hover:bg-orange-50 text-orange-700"
                        >
                          <Pause className="mr-2 h-4 w-4" />
                          {t('creditProgram.actions.suspend')}
                        </DropdownMenuItem>
                      )}

                      {(program.status === 'ACTIVE' ||
                        program.status === 'SUSPENDED') &&
                        onClose && (
                          <DropdownMenuItem
                            onClick={() => onClose(program)}
                            className="hover:bg-red-50 text-red-700"
                          >
                            <CloseIcon className="mr-2 h-4 w-4" />
                            {t('creditProgram.actions.close')}
                          </DropdownMenuItem>
                        )}
                    </>
                  )}

                  {canDelete && program.canBeDeleted && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(program)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        {t('common.delete')}
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Details grid */}
          <div className="space-y-3">
            {/* Amount Range */}
            <div className="flex items-center gap-3 text-sm">
              <DollarSign className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <span className="font-medium text-muted-foreground">
                  {t('creditProgram.table.amountRange')}:
                </span>
                <span className="ml-2 font-semibold">
                  {formatAmountRange(program)}
                </span>
              </div>
            </div>

            {/* Term Range */}
            <div className="flex items-center gap-3 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <span className="font-medium text-muted-foreground">
                  {t('creditProgram.table.termRange')}:
                </span>
                <span className="ml-2 font-semibold">
                  {formatTermRange(program)}
                </span>
              </div>
            </div>

            {/* Validity Period */}
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <span className="font-medium text-muted-foreground">
                  {t('creditProgram.table.validPeriod')}:
                </span>
                <span className="ml-2 font-semibold">
                  {formatValidityPeriod(program)}
                </span>
              </div>
            </div>

            {/* Collateral Required */}
            <div className="flex items-center gap-3 text-sm">
              <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <span className="font-medium text-muted-foreground">
                  {t('creditProgram.fields.collateralRequired')}:
                </span>
                <Badge
                  variant={program.collateralRequired ? 'default' : 'outline'}
                  className="ml-2"
                >
                  {program.collateralRequired
                    ? t('common.yes')
                    : t('common.no')}
                </Badge>
              </div>
            </div>

            {/* Interest Rate */}
            {program.interestRateFixed && (
              <div className="flex items-center gap-3 text-sm">
                <div className="h-4 w-4 flex items-center justify-center text-muted-foreground shrink-0">
                  <span className="text-xs font-bold">%</span>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">
                    {t('creditProgram.fields.interestRate')}:
                  </span>
                  <span className="ml-2 font-semibold">
                    {program.interestRateFixed}%
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Footer with availability indicators */}
          <div className="flex items-center justify-between pt-2 border-t border-border/20">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {program.isActive && (
                <Badge
                  variant="outline"
                  className="text-green-700 border-green-300"
                >
                  {t('creditProgram.indicators.active')}
                </Badge>
              )}
              {program.isAvailableForApplications && (
                <Badge
                  variant="outline"
                  className="text-blue-700 border-blue-300"
                >
                  {t('creditProgram.indicators.availableForApplications')}
                </Badge>
              )}
              {!program.isWithinValidityPeriod && (
                <Badge
                  variant="outline"
                  className="text-orange-700 border-orange-300"
                >
                  {t('creditProgram.indicators.expired')}
                </Badge>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {t('creditProgram.fields.applications')}:{' '}
              {program.applicationCount}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
