// Document Type Reference Entity Type Definitions
// Following the patterns established in REFERENCE_DATA_IMPLEMENTATION_GUIDE.md
// Document Types are the most complex reference entity with metadata structure

import {
  BaseReferenceEntity,
  BaseReferenceCreateDto,
  BaseReferenceUpdateDto,
  BaseReferenceFilterState,
  ReferenceEntityStatus,
  PaginatedResponse,
  ReferenceSearchParams
} from './reference';

// Document Category Classification
export const DocumentCategory = {
  IDENTITY: 'IDENTITY',
  FINANCIAL: 'FINANCIAL',
  LEGAL: 'LEGAL',
  COLLATERAL: 'COLLATERAL',
  INSURANCE: 'INSURANCE',
  BUSINESS: 'BUSINESS',
  PERSONAL: 'PERSONAL',
  GUARANTOR: 'GUARANTOR',
  OTHER: 'OTHER',
} as const;

export type DocumentCategory =
  (typeof DocumentCategory)[keyof typeof DocumentCategory];

// Applicant Type Classification
export const ApplicantType = {
  INDIVIDUAL: 'INDIVIDUAL',
  LEGAL_ENTITY: 'LEGAL_ENTITY',
  SOLE_PROPRIETOR: 'SOLE_PROPRIETOR',
  GUARANTOR: 'GUARANTOR',
  ALL: 'ALL',
} as const;

export type ApplicantType =
  (typeof ApplicantType)[keyof typeof ApplicantType];

// Document Priority Level
export const DocumentPriority = {
  MANDATORY: 'MANDATORY',
  OPTIONAL: 'OPTIONAL',
  CONDITIONAL: 'CONDITIONAL',
} as const;

export type DocumentPriority =
  (typeof DocumentPriority)[keyof typeof DocumentPriority];

// Document Verification Level
export const VerificationLevel = {
  NONE: 'NONE',
  BASIC: 'BASIC',
  ENHANCED: 'ENHANCED',
  NOTARIZED: 'NOTARIZED',
} as const;

export type VerificationLevel =
  (typeof VerificationLevel)[keyof typeof VerificationLevel];

// Complex Metadata Structure for Document Types
export interface DocumentTypeMetadata {
  // File handling constraints
  maxFileSize?: number; // in bytes
  allowedFileTypes?: string[]; // MIME types
  maxFiles?: number;

  // Document properties
  hasExpiryDate?: boolean;
  expiryDaysWarning?: number; // days before expiry to warn
  requiresOriginal?: boolean;
  acceptsCopies?: boolean;

  // Validation rules
  requiresSignature?: boolean;
  requiresStamp?: boolean;
  requiresTranslation?: boolean;

  // Processing flags
  autoVerify?: boolean;
  requiresManualReview?: boolean;
  notifyOnSubmission?: boolean;

  // Business rules
  conditionalOn?: string[]; // document type IDs this depends on
  mutuallyExclusiveWith?: string[]; // document type IDs this conflicts with

  // Template information
  hasTemplate?: boolean;
  templateUrl?: string;
  instructions?: string;
}

// Document Type Response DTO
export interface DocumentTypeResponseDto extends BaseReferenceEntity {
  id: number;
  name: string; // Internal system name
  nameEn: string;
  nameRu: string;
  nameKg: string;
  description?: string;
  category: DocumentCategory;
  applicantType: ApplicantType;
  priority: DocumentPriority;
  verificationLevel: VerificationLevel;
  metadata: DocumentTypeMetadata;
  status: ReferenceEntityStatus;
  sortOrder?: number; // for UI ordering
  createdAt: string;
  updatedAt: string;
  createdByUsername?: string;
  updatedByUsername?: string;
}

// Document Type Create DTO
export interface DocumentTypeCreateDto extends Omit<BaseReferenceCreateDto, 'id'> {
  name: string;
  nameEn: string;
  nameRu: string;
  nameKg: string;
  description?: string;
  category: DocumentCategory;
  applicantType: ApplicantType;
  priority: DocumentPriority;
  verificationLevel: VerificationLevel;
  metadata: DocumentTypeMetadata;
  status: ReferenceEntityStatus;
  sortOrder?: number;
}

// Document Type Update DTO
export interface DocumentTypeUpdateDto extends BaseReferenceUpdateDto {
  name?: string;
  nameEn?: string;
  nameRu?: string;
  nameKg?: string;
  description?: string;
  category?: DocumentCategory;
  applicantType?: ApplicantType;
  priority?: DocumentPriority;
  verificationLevel?: VerificationLevel;
  metadata?: Partial<DocumentTypeMetadata>;
  status?: ReferenceEntityStatus;
  sortOrder?: number;
}

// Document Type Filter State (for UI filters)
export interface DocumentTypeFilterState extends BaseReferenceFilterState {
  searchTerm: string; // Search by name
  status: ReferenceEntityStatus | null;
  category: DocumentCategory | null;
  applicantType: ApplicantType | null;
  priority: DocumentPriority | null;
  verificationLevel: VerificationLevel | null;
  hasTemplate: boolean | null;
  requiresOriginal: boolean | null;
}

// Document Type Search Parameters (for API calls)
export interface DocumentTypeSearchParams extends ReferenceSearchParams {
  searchTerm?: string; // Searches name fields
  category?: DocumentCategory;
  applicantType?: ApplicantType;
  priority?: DocumentPriority;
  verificationLevel?: VerificationLevel;
  status?: ReferenceEntityStatus;
  hasTemplate?: boolean;
  requiresOriginal?: boolean;
}

// Sort fields specific to document types
export const DocumentTypeSortFields = {
  NAME: 'name',
  NAME_EN: 'nameEn',
  NAME_RU: 'nameRu',
  NAME_KG: 'nameKg',
  CATEGORY: 'category',
  APPLICANT_TYPE: 'applicantType',
  PRIORITY: 'priority',
  VERIFICATION_LEVEL: 'verificationLevel',
  STATUS: 'status',
  SORT_ORDER: 'sortOrder',
  CREATED_AT: 'createdAt',
  UPDATED_AT: 'updatedAt',
} as const;

export type DocumentTypeSortFields =
  (typeof DocumentTypeSortFields)[keyof typeof DocumentTypeSortFields];

// Form data interfaces for React Hook Form
export interface DocumentTypeCreateFormData {
  name: string;
  nameEn: string;
  nameRu: string;
  nameKg: string;
  description?: string;
  category: DocumentCategory;
  applicantType: ApplicantType;
  priority: DocumentPriority;
  verificationLevel: VerificationLevel;
  metadata: DocumentTypeMetadata;
  status: ReferenceEntityStatus;
  sortOrder?: number;
}

export interface DocumentTypeEditFormData extends DocumentTypeCreateFormData {
  id: number;
}

// API Response types
export type DocumentTypeListResponse = PaginatedResponse<DocumentTypeResponseDto>;
export type DocumentTypeResponse = DocumentTypeResponseDto;

// Hook return types
export interface DocumentTypeFiltersHookReturn {
  filters: DocumentTypeFilterState;
  updateFilters: (updates: Partial<DocumentTypeFilterState>) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  getSearchParams: () => DocumentTypeSearchParams;
}

export interface DocumentTypeActionsHookReturn {
  createDocumentType: (data: DocumentTypeCreateDto) => Promise<DocumentTypeResponseDto>;
  updateDocumentType: (id: number, data: DocumentTypeUpdateDto) => Promise<DocumentTypeResponseDto>;
  deleteDocumentType: (id: number) => Promise<void>;
  checkReferences: (id: number) => Promise<boolean>;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
}

// Utility types for metadata field validation
export interface DocumentTypeValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Constants for metadata defaults
export const DOCUMENT_TYPE_DEFAULTS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILES: 5,
  EXPIRY_WARNING_DAYS: 30,
  ALLOWED_FILE_TYPES: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/tiff',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
} as const;

// Business rule validation helpers
export interface DocumentTypeDependency {
  documentTypeId: number;
  isRequired: boolean;
  description: string;
}

export interface DocumentTypeConflict {
  documentTypeId: number;
  reason: string;
}