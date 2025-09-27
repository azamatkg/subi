import React from 'react';
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash,
  Copy,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Building,
  Shield,
  FileText,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { SortableTableHead, type SortDirection } from '@/components/ui/sortable-table-head';
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

type DocumentTypeSortField = 'name' | 'nameEn' | 'nameRu' | 'nameKg' | 'category' | 'applicantType' | 'priority' | 'status' | 'createdAt' | 'updatedAt';

interface DocumentTypeTableProps {
  documentTypes: DocumentTypeResponseDto[];
  loading?: boolean;
  sortField: DocumentTypeSortField;
  sortDirection: SortDirection;
  onSort: (field: DocumentTypeSortField) => void;
  onView: (documentType: DocumentTypeResponseDto) => void;
  onEdit: (documentType: DocumentTypeResponseDto) => void;
  onDelete: (documentType: DocumentTypeResponseDto) => void;
  onDuplicate?: (documentType: DocumentTypeResponseDto) => void;
  className?: string;
}

export const DocumentTypeTable: React.FC<DocumentTypeTableProps> = ({
  documentTypes,
  loading = false,
  sortField,
  sortDirection,
  onSort,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
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
        {t(`references.status.${status?.toLowerCase() || 'unknown'}`)}
      </Badge>
    );
  };

  // Category badge component
  const CategoryBadge: React.FC<{ category: DocumentCategory }> = ({ category }) => {
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
        className={cn('px-2 py-1 text-xs font-medium', getCategoryStyle(category))}
      >
        {t(`documentType.category.${category?.toLowerCase() || 'unknown'}`)}
      </Badge>
    );
  };

  // Priority badge component
  const PriorityBadge: React.FC<{ priority: DocumentPriority }> = ({ priority }) => {
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
        className={cn('px-2 py-1 text-xs font-medium flex items-center gap-1', getPriorityStyle(priority))}
      >
        {getPriorityIcon(priority)}
        {t(`documentType.priority.${priority?.toLowerCase() || 'unknown'}`)}
      </Badge>
    );
  };

  // Applicant type badge
  const ApplicantTypeBadge: React.FC<{ applicantType: ApplicantType }> = ({ applicantType }) => {
    const getApplicantTypeIcon = (applicantType: ApplicantType) => {
      switch (applicantType) {
        case 'INDIVIDUAL':
          return <User className="w-3 h-3" />;
        case 'LEGAL_ENTITY':
          return <Building className="w-3 h-3" />;
        case 'SOLE_PROPRIETOR':
          return <User className="w-3 h-3" />;
        case 'GUARANTOR':
          return <Shield className="w-3 h-3" />;
        case 'ALL':
          return <User className="w-3 h-3" />;
        default:
          return null;
      }
    };

    return (
      <div className="flex items-center gap-1 text-xs text-gray-600">
        {getApplicantTypeIcon(applicantType)}
        <span>{t(`documentType.applicantType.${applicantType?.toLowerCase() || 'unknown'}`)}</span>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleTemplateDownload = (documentType: DocumentTypeResponseDto) => {
    if (documentType.metadata?.templateUrl) {
      window.open(documentType.metadata.templateUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('rounded-md border', className)}>
      <Table>
        <TableHeader>
          <TableRow>
            <SortableTableHead
              field="nameEn"
              currentSortField={sortField}
              currentSortDirection={sortDirection}
              onSort={onSort}
            >
              {t('documentType.fields.nameEn')}
            </SortableTableHead>

            <SortableTableHead
              field="category"
              currentSortField={sortField}
              currentSortDirection={sortDirection}
              onSort={onSort}
            >
              {t('documentType.fields.category')}
            </SortableTableHead>

            <SortableTableHead
              field="applicantType"
              currentSortField={sortField}
              currentSortDirection={sortDirection}
              onSort={onSort}
              className="hidden md:table-cell"
            >
              {t('documentType.fields.applicantType')}
            </SortableTableHead>

            <SortableTableHead
              field="priority"
              currentSortField={sortField}
              currentSortDirection={sortDirection}
              onSort={onSort}
            >
              {t('documentType.fields.priority')}
            </SortableTableHead>

            <SortableTableHead
              field="status"
              currentSortField={sortField}
              currentSortDirection={sortDirection}
              onSort={onSort}
            >
              {t('documentType.fields.status')}
            </SortableTableHead>

            <TableHead className="hidden lg:table-cell">
              {t('documentType.fields.features')}
            </TableHead>

            <SortableTableHead
              field="createdAt"
              currentSortField={sortField}
              currentSortDirection={sortDirection}
              onSort={onSort}
              className="hidden xl:table-cell"
            >
              {t('references.fields.created')}
            </SortableTableHead>

            <TableHead className="w-[50px]">
              <span className="sr-only">{t('common.actions')}</span>
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {documentTypes.map((documentType) => (
            <TableRow key={documentType.id} className="hover:bg-gray-50">
              <TableCell className="font-medium">
                <div>
                  <div className="font-semibold">{documentType.nameEn}</div>
                  <div className="text-sm text-gray-500 truncate max-w-xs">
                    {documentType.nameRu} • {documentType.nameKg}
                  </div>
                  {documentType.description && (
                    <div className="text-sm text-gray-500 truncate max-w-xs mt-1">
                      {documentType.description}
                    </div>
                  )}
                </div>
              </TableCell>

              <TableCell>
                <CategoryBadge category={documentType.category} />
              </TableCell>

              <TableCell className="hidden md:table-cell">
                <ApplicantTypeBadge applicantType={documentType.applicantType} />
              </TableCell>

              <TableCell>
                <PriorityBadge priority={documentType.priority} />
              </TableCell>

              <TableCell>
                <StatusBadge status={documentType.status} />
              </TableCell>

              <TableCell className="hidden lg:table-cell">
                <div className="flex items-center gap-2">
                  {documentType.metadata?.hasTemplate && (
                    <Badge variant="outline" className="text-xs">
                      <FileText className="w-3 h-3 mr-1" />
                      {t('documentType.features.template')}
                    </Badge>
                  )}
                  {documentType.metadata?.requiresOriginal && (
                    <Badge variant="outline" className="text-xs">
                      <Shield className="w-3 h-3 mr-1" />
                      {t('documentType.features.original')}
                    </Badge>
                  )}
                </div>
              </TableCell>

              <TableCell className="hidden xl:table-cell text-sm text-gray-500">
                {formatDate(documentType.createdAt)}
              </TableCell>

              <TableCell>
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
                      <DropdownMenuItem onClick={() => handleTemplateDownload(documentType)}>
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {documentTypes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">{t('documentType.messages.noDocumentTypesFound')}</p>
        </div>
      )}
    </div>
  );
};