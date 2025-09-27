import React from 'react';
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash,
  FileText,
  Calendar,
  Shield,
  Copy,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  User,
  Building,
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
import type {
  DocumentTypeResponseDto,
  DocumentCategory,
  ApplicantType,
  DocumentPriority,
  VerificationLevel,
} from '@/types/documentType';
import type { ReferenceEntityStatus } from '@/types/reference';

interface DocumentTypeCardProps {
  documentType: DocumentTypeResponseDto;
  onView: (documentType: DocumentTypeResponseDto) => void;
  onEdit: (documentType: DocumentTypeResponseDto) => void;
  onDelete: (documentType: DocumentTypeResponseDto) => void;
  onDuplicate?: (documentType: DocumentTypeResponseDto) => void;
  loading?: boolean;
  className?: string;
}

export const DocumentTypeCard: React.FC<DocumentTypeCardProps> = ({
  documentType,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
  loading = false,
  className,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const userRoles = user?.roles || [];
  const canEdit = userRoles.includes('ADMIN');

  // Status badge component
  const StatusBadge: React.FC<{ status: ReferenceEntityStatus }> = ({ status }) => {
    const safeStatus = status || 'INACTIVE';
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
        className={cn('px-2 py-1 text-xs font-medium', getStatusStyle(safeStatus))}
      >
        {t(`references.status.${safeStatus.toLowerCase()}`)}
      </Badge>
    );
  };

  // Category badge component
  const CategoryBadge: React.FC<{ category: DocumentCategory }> = ({ category }) => {
    const safeCategory = category || 'OTHER';
    const getCategoryStyle = (category: DocumentCategory) => {
      switch (category) {
        case 'IDENTITY':
          return 'bg-blue-100 text-blue-800 border-blue-300';
        case 'FINANCIAL':
          return 'bg-green-100 text-green-800 border-green-300';
        case 'LEGAL':
          return 'bg-purple-100 text-purple-800 border-purple-300';
        case 'COLLATERAL':
          return 'bg-orange-100 text-orange-800 border-orange-300';
        case 'INSURANCE':
          return 'bg-cyan-100 text-cyan-800 border-cyan-300';
        case 'BUSINESS':
          return 'bg-indigo-100 text-indigo-800 border-indigo-300';
        case 'PERSONAL':
          return 'bg-pink-100 text-pink-800 border-pink-300';
        case 'GUARANTOR':
          return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        case 'OTHER':
          return 'bg-gray-100 text-gray-800 border-gray-300';
        default:
          return 'bg-gray-100 text-gray-800 border-gray-300';
      }
    };

    return (
      <Badge
        variant="outline"
        className={cn('px-2 py-1 text-xs font-medium', getCategoryStyle(safeCategory))}
      >
        {t(`documentType.category.${safeCategory.toLowerCase()}`)}
      </Badge>
    );
  };

  // Priority badge component
  const PriorityBadge: React.FC<{ priority: DocumentPriority }> = ({ priority }) => {
    const safePriority = priority || 'OPTIONAL';
    const getPriorityStyle = (priority: DocumentPriority) => {
      switch (priority) {
        case 'MANDATORY':
          return 'bg-red-100 text-red-800 border-red-300';
        case 'OPTIONAL':
          return 'bg-gray-100 text-gray-800 border-gray-300';
        case 'CONDITIONAL':
          return 'bg-amber-100 text-amber-800 border-amber-300';
        default:
          return 'bg-gray-100 text-gray-800 border-gray-300';
      }
    };

    const getPriorityIcon = (priority: DocumentPriority) => {
      switch (priority) {
        case 'MANDATORY':
          return <AlertTriangle className="w-3 h-3" />;
        case 'OPTIONAL':
          return <CheckCircle className="w-3 h-3" />;
        case 'CONDITIONAL':
          return <Clock className="w-3 h-3" />;
        default:
          return null;
      }
    };

    return (
      <Badge
        variant="outline"
        className={cn('px-2 py-1 text-xs font-medium flex items-center gap-1', getPriorityStyle(safePriority))}
      >
        {getPriorityIcon(safePriority)}
        {t(`documentType.priority.${safePriority.toLowerCase()}`)}
      </Badge>
    );
  };

  // Applicant type icon
  const getApplicantTypeIcon = (applicantType: ApplicantType) => {
    switch (applicantType) {
      case 'INDIVIDUAL':
        return <User className="w-4 h-4 text-blue-600" />;
      case 'LEGAL_ENTITY':
        return <Building className="w-4 h-4 text-purple-600" />;
      case 'SOLE_PROPRIETOR':
        return <User className="w-4 h-4 text-green-600" />;
      case 'GUARANTOR':
        return <Shield className="w-4 h-4 text-orange-600" />;
      case 'ALL':
        return <User className="w-4 h-4 text-gray-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  // Verification level badge
  const VerificationBadge: React.FC<{ level: VerificationLevel }> = ({ level }) => {
    const safeLevel = level || 'NONE';
    const getVerificationStyle = (level: VerificationLevel) => {
      switch (level) {
        case 'NONE':
          return 'bg-gray-100 text-gray-800 border-gray-300';
        case 'BASIC':
          return 'bg-blue-100 text-blue-800 border-blue-300';
        case 'ENHANCED':
          return 'bg-purple-100 text-purple-800 border-purple-300';
        case 'NOTARIZED':
          return 'bg-emerald-100 text-emerald-800 border-emerald-300';
        default:
          return 'bg-gray-100 text-gray-800 border-gray-300';
      }
    };

    return (
      <Badge
        variant="outline"
        className={cn('px-2 py-1 text-xs font-medium', getVerificationStyle(safeLevel))}
      >
        {t(`documentType.verification.${safeLevel.toLowerCase()}`)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleTemplateDownload = () => {
    if (documentType.metadata?.templateUrl) {
      window.open(documentType.metadata.templateUrl, '_blank');
    }
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
                {getApplicantTypeIcon(documentType.applicantType)}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <StatusBadge status={documentType.status} />
                <PriorityBadge priority={documentType.priority} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {documentType.nameEn}
              </h3>
              <p className="text-sm text-gray-600 truncate">
                {documentType.nameRu} • {documentType.nameKg}
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
              <DropdownMenuItem onClick={() => onView(documentType)}>
                <Eye className="mr-2 h-4 w-4" />
                {t('common.view')}
              </DropdownMenuItem>

              {documentType.metadata?.hasTemplate && (
                <DropdownMenuItem onClick={handleTemplateDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  {t('documentType.actions.downloadTemplate')}
                </DropdownMenuItem>
              )}

              {canEdit && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onEdit(documentType)}>
                    <Edit className="mr-2 h-4 w-4" />
                    {t('common.edit')}
                  </DropdownMenuItem>

                  {onDuplicate && (
                    <DropdownMenuItem onClick={() => onDuplicate(documentType)}>
                      <Copy className="mr-2 h-4 w-4" />
                      {t('documentType.actions.duplicate')}
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(documentType)}
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
        <div className="space-y-3">
          {/* Category and Verification */}
          <div className="flex items-center gap-2 flex-wrap">
            <CategoryBadge category={documentType.category} />
            <VerificationBadge level={documentType.verificationLevel} />
          </div>

          {/* Applicant Type */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            {getApplicantTypeIcon(documentType.applicantType || 'ALL')}
            <span>{t(`documentType.applicantType.${(documentType.applicantType || 'ALL').toLowerCase()}`)}</span>
          </div>

          {/* Description */}
          {documentType.description && (
            <div>
              <p className="text-sm text-gray-600 line-clamp-2">
                {documentType.description}
              </p>
            </div>
          )}

          {/* Metadata indicators */}
          <div className="flex items-center gap-3 text-xs text-gray-500">
            {documentType.metadata?.hasTemplate && (
              <div className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                <span>{t('documentType.features.template')}</span>
              </div>
            )}
            {documentType.metadata?.requiresOriginal && (
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <span>{t('documentType.features.original')}</span>
              </div>
            )}
            {documentType.metadata?.autoVerify && (
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                <span>{t('documentType.features.autoVerify')}</span>
              </div>
            )}
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4 text-sm pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-gray-500">{t('references.fields.created')}</p>
                <p className="font-medium">{formatDate(documentType.createdAt)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-gray-500">{t('references.fields.updated')}</p>
                <p className="font-medium">{formatDate(documentType.updatedAt)}</p>
              </div>
            </div>
          </div>

          {/* Created by */}
          {documentType.createdByUsername && (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                {t('common.by')} {documentType.createdByUsername}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};