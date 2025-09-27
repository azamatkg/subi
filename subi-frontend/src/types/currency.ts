// Currency Reference Entity Type Definitions
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

// Currency Response DTO
export interface CurrencyResponseDto extends BaseReferenceEntity {
  id: number;
  code: string; // 3-letter currency code (e.g., "USD", "KGS", "RUB")
  nameEn: string;
  nameRu: string;
  nameKg: string;
  description?: string;
  status: ReferenceEntityStatus;
  createdAt: string;
  updatedAt: string;
  createdByUsername?: string;
  updatedByUsername?: string;
}

// Currency Create DTO
export interface CurrencyCreateDto extends Omit<BaseReferenceCreateDto, 'id'> {
  code: string; // 3-letter currency code
  nameEn: string;
  nameRu: string;
  nameKg: string;
  description?: string;
  status: ReferenceEntityStatus;
}

// Currency Update DTO
export interface CurrencyUpdateDto extends BaseReferenceUpdateDto {
  code?: string; // Allow code updates with validation
  nameEn?: string;
  nameRu?: string;
  nameKg?: string;
  description?: string;
  status?: ReferenceEntityStatus;
}

// Currency Filter State (for UI filters)
export interface CurrencyFilterState extends BaseReferenceFilterState {
  searchTerm: string; // Search by name or code
  status: ReferenceEntityStatus | null;
  codeFilter?: string; // Specific code filtering
}

// Currency Search Parameters (for API calls)
export interface CurrencySearchParams extends ReferenceSearchParams {
  searchTerm?: string; // Searches both name and code
  code?: string; // Specific code filtering
  status?: ReferenceEntityStatus;
}

// Sort fields specific to currencies
export const CurrencySortFields = {
  CODE: 'code',
  NAME_EN: 'nameEn',
  NAME_RU: 'nameRu',
  NAME_KG: 'nameKg',
  STATUS: 'status',
  CREATED_AT: 'createdAt',
  UPDATED_AT: 'updatedAt',
} as const;

export type CurrencySortFields = (typeof CurrencySortFields)[keyof typeof CurrencySortFields];

// Form data interfaces for React Hook Form
export interface CurrencyCreateFormData {
  code: string;
  nameEn: string;
  nameRu: string;
  nameKg: string;
  description?: string;
  status: ReferenceEntityStatus;
}

export interface CurrencyEditFormData extends CurrencyCreateFormData {
  id: number;
}

// API Response types
export type CurrencyListResponse = PaginatedResponse<CurrencyResponseDto>;
export type CurrencyResponse = CurrencyResponseDto;

// Hook return types
export interface CurrencyFiltersHookReturn {
  filters: CurrencyFilterState;
  updateFilters: (updates: Partial<CurrencyFilterState>) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  getSearchParams: () => CurrencySearchParams;
}

export interface CurrencyActionsHookReturn {
  createCurrency: (data: CurrencyCreateDto) => Promise<CurrencyResponseDto>;
  updateCurrency: (id: number, data: CurrencyUpdateDto) => Promise<CurrencyResponseDto>;
  deleteCurrency: (id: number) => Promise<void>;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
}