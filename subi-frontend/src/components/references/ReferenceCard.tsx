import React from 'react';
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash,
  Database,
  Clock,
  CheckCircle,
  XCircle,
  Shield,
  Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { AccessibleStatusBadge } from '@/components/ui/accessible-status-badge';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/hooks/useAuth';
import type { ReferenceListResponseDto } from '@/types/reference';

interface ReferenceCardProps {
  reference: ReferenceListResponseDto;
  onView: (reference: ReferenceListResponseDto) => void;
  onEdit: (reference: ReferenceListResponseDto) => void;
  onDelete: (reference: ReferenceListResponseDto) => void;
  onStatusToggle: (reference: ReferenceListResponseDto) => void;
}

export const ReferenceCard: React.FC<ReferenceCardProps> = ({
  reference,
  onView,
  onEdit,
  onDelete,
  onStatusToggle,
}) => {
  const { t } = useTranslation();
  const { hasAnyRole } = useAuth();

  const getEntityTypeIcon = (entityType: string) => {
    switch (entityType) {
      case 'CURRENCIES':
        return '💱';
      case 'CREDIT_PURPOSES':
        return '🎯';
      case 'DOCUMENT_TYPES':
        return '📄';
      case 'DECISION_MAKING_BODIES':
        return '👥';
      case 'DECISION_TYPES':
        return '⚖️';
      case 'FLOATING_RATE_TYPES':
        return '📈';
      case 'REPAYMENT_ORDERS':
        return '💰';
      default:
        return '📋';
    }
  };

  const getEntityTypeName = (entityType: string) => {
    const key = entityType.toLowerCase().replace(/_/g, '');
    return t(`references.filters.entityTypes.${key}`, entityType);
  };

  const canEdit = hasAnyRole(['ADMIN']) || !reference.adminOnly;
  const canDelete = hasAnyRole(['ADMIN']);

  return (
    <div
      className='group hover:shadow-xl hover:shadow-primary/5 hover:bg-card-elevated hover:scale-[1.02] transition-all duration-300 border border-card-elevated-border bg-card shadow-md backdrop-blur-sm rounded-lg'
      role='article'
      aria-labelledby={`reference-title-${reference.id}`}
    >
      <div className='p-7'>
        <div className='space-y-4'>
          {/* Header with status and actions */}
          <div className='flex items-start justify-between gap-4'>
            <div className='min-w-0 flex-1'>
              <div className='flex items-center gap-3 mb-3'>
                <div className='flex items-center justify-center h-9 w-9 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 border border-primary-300 shadow-sm'>
                  <span className='text-lg'>{getEntityTypeIcon(reference.entityType)}</span>
                </div>
                <div className='flex flex-col gap-1'>
                  <Badge variant='outline' className='text-xs font-mono'>
                    {getEntityTypeName(reference.entityType)}
                  </Badge>
                  {reference.adminOnly && (
                    <Badge variant='secondary' className='text-xs'>
                      <Shield className='h-3 w-3 mr-1' />
                      {t('references.list.adminOnly')}
                    </Badge>
                  )}
                </div>
              </div>
              <button
                onClick={() => onView(reference)}
                className='text-left w-full'
                disabled={!reference.isAvailable}
              >
                <h3
                  id={`reference-title-${reference.id}`}
                  className={`text-xl font-bold leading-tight transition-colors cursor-pointer tracking-wide ${
                    reference.isAvailable
                      ? 'text-card-foreground hover:text-primary-600'
                      : 'text-muted-foreground'
                  }`}
                >
                  {reference.nameEn}
                </h3>
              </button>
              {reference.description && (
                <p className='text-sm text-muted-foreground mt-2 font-medium line-clamp-2'>
                  {reference.description}
                </p>
              )}
            </div>
            <div className='flex items-center gap-2 shrink-0'>
              <div className='flex flex-col gap-2'>
                <AccessibleStatusBadge
                  status={reference.status === 'ACTIVE' ? 'active' : 'inactive'}
                  className='shrink-0 shadow-sm'
                />
                <div className='flex items-center gap-1'>
                  {reference.isAvailable ? (
                    <CheckCircle className='h-4 w-4 text-green-600' />
                  ) : (
                    <XCircle className='h-4 w-4 text-red-600' />
                  )}
                  <span className='text-xs text-muted-foreground'>
                    {reference.isAvailable
                      ? t('references.list.available')
                      : t('references.list.notAvailable')
                    }
                  </span>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-8 w-8 p-0 opacity-60 group-hover:opacity-100 transition-all duration-300 hover:bg-accent hover:shadow-md hover:scale-110 focus:ring-2 focus:ring-primary/30 rounded-lg'
                    aria-label={t('common.actions', {
                      item: reference.nameEn,
                    })}
                  >
                    <MoreHorizontal className='h-4 w-4' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align='end'
                  className='shadow-lg border-border/20'
                >
                  <DropdownMenuItem
                    onClick={() => onView(reference)}
                    disabled={!reference.isAvailable}
                    className='hover:bg-accent focus:bg-accent'
                  >
                    <Eye className='mr-2 h-4 w-4' />
                    {reference.isAvailable ? t('references.actions.view') : t('common.view')}
                  </DropdownMenuItem>
                  {canEdit && reference.isAvailable && (
                    <DropdownMenuItem
                      onClick={() => onEdit(reference)}
                      className='hover:bg-accent focus:bg-accent'
                    >
                      <Edit className='mr-2 h-4 w-4' />
                      {t('common.edit')}
                    </DropdownMenuItem>
                  )}
                  {hasAnyRole(['ADMIN']) && (
                    <DropdownMenuItem
                      onClick={() => onStatusToggle(reference)}
                      className='hover:bg-accent focus:bg-accent'
                    >
                      {reference.status === 'ACTIVE' ? (
                        <>
                          <XCircle className='mr-2 h-4 w-4' />
                          {t('references.list.deactivate')}
                        </>
                      ) : (
                        <>
                          <CheckCircle className='mr-2 h-4 w-4' />
                          {t('references.list.activate')}
                        </>
                      )}
                    </DropdownMenuItem>
                  )}
                  {canDelete && (
                    <>
                      <Separator />
                      <DropdownMenuItem
                        onClick={() => onDelete(reference)}
                        className='text-destructive hover:text-destructive hover:bg-destructive/10'
                      >
                        <Trash className='mr-2 h-4 w-4' />
                        {t('common.delete')}
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Details grid */}
          <div className='space-y-3 text-sm'>
            {/* Multilingual names */}
            <div className='grid grid-cols-1 gap-2'>
              {reference.nameRu && (
                <div className='flex items-center gap-3'>
                  <Globe className='h-4 w-4 text-muted-foreground shrink-0' />
                  <div>
                    <span className='font-medium text-muted-foreground'>RU:</span>
                    <span className='ml-2 font-semibold'>{reference.nameRu}</span>
                  </div>
                </div>
              )}
              {reference.nameKg && (
                <div className='flex items-center gap-3'>
                  <Globe className='h-4 w-4 text-muted-foreground shrink-0' />
                  <div>
                    <span className='font-medium text-muted-foreground'>KG:</span>
                    <span className='ml-2 font-semibold'>{reference.nameKg}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Timestamps */}
            <div className='flex items-center gap-3'>
              <Clock className='h-4 w-4 text-muted-foreground shrink-0' />
              <div>
                <span className='font-medium'>
                  {t('references.fields.created')}:
                </span>
                <span className='ml-2 font-semibold'>
                  {new Date(reference.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {reference.updatedAt !== reference.createdAt && (
              <div className='flex items-center gap-3'>
                <Clock className='h-4 w-4 text-muted-foreground shrink-0' />
                <div>
                  <span className='font-medium'>
                    {t('references.fields.updated')}:
                  </span>
                  <span className='ml-2 font-semibold'>
                    {new Date(reference.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )}

            {/* Created/Updated by */}
            {reference.createdByUsername && (
              <div className='flex items-center gap-3'>
                <Database className='h-4 w-4 text-muted-foreground shrink-0' />
                <div>
                  <span className='font-medium'>
                    {t('common.createdBy')}:
                  </span>
                  <span className='ml-2 font-semibold font-mono'>
                    @{reference.createdByUsername}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};