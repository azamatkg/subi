// Credit Purpose Reference Entity Type Definitions
// Following the patterns established in REFERENCE_DATA_IMPLEMENTATION_GUIDE.md

import {
  BaseReferenceEntity,
  BaseReferenceCreateDto,
  BaseReferenceUpdateDto,
  BaseReferenceFilterState,
  ReferenceEntityStatus,
  PaginatedResponse,
  ReferenceSearchParams
} from './reference';

// Business Category Classification for Credit Purposes
export const CreditPurposeCategory = {
  CONSUMER: 'CONSUMER',
  BUSINESS: 'BUSINESS',
  AGRICULTURAL: 'AGRICULTURAL',
  MORTGAGE: 'MORTGAGE',
  MICROFINANCE: 'MICROFINANCE',
  CORPORATE: 'CORPORATE',
} as const;

export type CreditPurposeCategory =
  (typeof CreditPurposeCategory)[keyof typeof CreditPurposeCategory];

// Credit Purpose Response DTO
export interface CreditPurposeResponseDto extends BaseReferenceEntity {
  id: number;
  nameEn: string;
  nameRu: string;
  nameKg: string;
  description?: string;
  category: CreditPurposeCategory;
  status: ReferenceEntityStatus;
  createdAt: string;
  updatedAt: string;
  createdByUsername?: string;
  updatedByUsername?: string;
}

// Credit Purpose Create DTO
export interface CreditPurposeCreateDto extends Omit<BaseReferenceCreateDto, 'id'> {
  nameEn: string;
  nameRu: string;
  nameKg: string;
  description?: string;
  category: CreditPurposeCategory;
  status: ReferenceEntityStatus;
}

// Credit Purpose Update DTO
export interface CreditPurposeUpdateDto extends BaseReferenceUpdateDto {
  nameEn?: string;
  nameRu?: string;
  nameKg?: string;
  description?: string;
  category?: CreditPurposeCategory;
  status?: ReferenceEntityStatus;
}

// Credit Purpose Filter State (for UI filters)
export interface CreditPurposeFilterState extends BaseReferenceFilterState {
  searchTerm: string; // Search by name
  status: ReferenceEntityStatus | null;
  category: CreditPurposeCategory | null; // Category filtering
}

// Credit Purpose Search Parameters (for API calls)
export interface CreditPurposeSearchParams extends ReferenceSearchParams {
  searchTerm?: string; // Searches name fields
  category?: CreditPurposeCategory; // Category filtering
  status?: ReferenceEntityStatus;
}

// Sort fields specific to credit purposes
export const CreditPurposeSortFields = {
  NAME_EN: 'nameEn',
  NAME_RU: 'nameRu',
  NAME_KG: 'nameKg',
  CATEGORY: 'category',
  STATUS: 'status',
  CREATED_AT: 'createdAt',
  UPDATED_AT: 'updatedAt',
} as const;

export type CreditPurposeSortFields =
  (typeof CreditPurposeSortFields)[keyof typeof CreditPurposeSortFields];

// Form data interfaces for React Hook Form
export interface CreditPurposeCreateFormData {
  nameEn: string;
  nameRu: string;
  nameKg: string;
  description?: string;
  category: CreditPurposeCategory;
  status: ReferenceEntityStatus;
}

export interface CreditPurposeEditFormData extends CreditPurposeCreateFormData {
  id: number;
}

// API Response types
export type CreditPurposeListResponse = PaginatedResponse<CreditPurposeResponseDto>;
export type CreditPurposeResponse = CreditPurposeResponseDto;

// Hook return types
export interface CreditPurposeFiltersHookReturn {
  filters: CreditPurposeFilterState;
  updateFilters: (updates: Partial<CreditPurposeFilterState>) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  getSearchParams: () => CreditPurposeSearchParams;
}

export interface CreditPurposeActionsHookReturn {
  createCreditPurpose: (data: CreditPurposeCreateDto) => Promise<CreditPurposeResponseDto>;
  updateCreditPurpose: (id: number, data: CreditPurposeUpdateDto) => Promise<CreditPurposeResponseDto>;
  deleteCreditPurpose: (id: number) => Promise<void>;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
}