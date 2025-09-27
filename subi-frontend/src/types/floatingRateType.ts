// Floating Rate Type Reference Entity Type Definitions
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

// Rate Calculation Type Classification for Floating Rate Types
export const FloatingRateCalculationType = {
  FIXED_SPREAD: 'FIXED_SPREAD',
  VARIABLE_SPREAD: 'VARIABLE_SPREAD',
  BASE_RATE_PLUS: 'BASE_RATE_PLUS',
  MARKET_LINKED: 'MARKET_LINKED',
  INDEXED: 'INDEXED',
  TIERED: 'TIERED',
} as const;

export type FloatingRateCalculationType =
  (typeof FloatingRateCalculationType)[keyof typeof FloatingRateCalculationType];

// Floating Rate Type Response DTO
export interface FloatingRateTypeResponseDto extends BaseReferenceEntity {
  id: number;
  nameEn: string;
  nameRu: string;
  nameKg: string;
  description?: string;
  rateCalculationType: FloatingRateCalculationType;
  baseRateDescription?: string;
  spreadMin?: number;
  spreadMax?: number;
  status: ReferenceEntityStatus;
  createdAt: string;
  updatedAt: string;
  createdByUsername?: string;
  updatedByUsername?: string;
}

// Floating Rate Type Create DTO
export interface FloatingRateTypeCreateDto extends Omit<BaseReferenceCreateDto, 'id'> {
  nameEn: string;
  nameRu: string;
  nameKg: string;
  description?: string;
  rateCalculationType: FloatingRateCalculationType;
  baseRateDescription?: string;
  spreadMin?: number;
  spreadMax?: number;
  status: ReferenceEntityStatus;
}

// Floating Rate Type Update DTO
export interface FloatingRateTypeUpdateDto extends BaseReferenceUpdateDto {
  nameEn?: string;
  nameRu?: string;
  nameKg?: string;
  description?: string;
  rateCalculationType?: FloatingRateCalculationType;
  baseRateDescription?: string;
  spreadMin?: number;
  spreadMax?: number;
  status?: ReferenceEntityStatus;
}

// Floating Rate Type Filter State (for UI filters)
export interface FloatingRateTypeFilterState extends BaseReferenceFilterState {
  searchTerm: string; // Search by name
  status: ReferenceEntityStatus | null;
  rateCalculationType: FloatingRateCalculationType | null; // Rate calculation type filtering
}

// Floating Rate Type Search Parameters (for API calls)
export interface FloatingRateTypeSearchParams extends ReferenceSearchParams {
  searchTerm?: string; // Searches name fields
  rateCalculationType?: FloatingRateCalculationType; // Rate calculation type filtering
  status?: ReferenceEntityStatus;
}

// Sort fields specific to floating rate types
export const FloatingRateTypeSortFields = {
  NAME_EN: 'nameEn',
  NAME_RU: 'nameRu',
  NAME_KG: 'nameKg',
  RATE_CALCULATION_TYPE: 'rateCalculationType',
  STATUS: 'status',
  CREATED_AT: 'createdAt',
  UPDATED_AT: 'updatedAt',
} as const;

export type FloatingRateTypeSortFields =
  (typeof FloatingRateTypeSortFields)[keyof typeof FloatingRateTypeSortFields];

// Form data interfaces for React Hook Form
export interface FloatingRateTypeCreateFormData {
  nameEn: string;
  nameRu: string;
  nameKg: string;
  description?: string;
  rateCalculationType: FloatingRateCalculationType;
  baseRateDescription?: string;
  spreadMin?: number;
  spreadMax?: number;
  status: ReferenceEntityStatus;
}

export interface FloatingRateTypeEditFormData extends FloatingRateTypeCreateFormData {
  id: number;
}

// API Response types
export type FloatingRateTypeListResponse = PaginatedResponse<FloatingRateTypeResponseDto>;
export type FloatingRateTypeResponse = FloatingRateTypeResponseDto;

// Hook return types
export interface FloatingRateTypeFiltersHookReturn {
  filters: FloatingRateTypeFilterState;
  updateFilters: (updates: Partial<FloatingRateTypeFilterState>) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  getSearchParams: () => FloatingRateTypeSearchParams;
}

export interface FloatingRateTypeActionsHookReturn {
  createFloatingRateType: (data: FloatingRateTypeCreateDto) => Promise<FloatingRateTypeResponseDto>;
  updateFloatingRateType: (id: number, data: FloatingRateTypeUpdateDto) => Promise<FloatingRateTypeResponseDto>;
  deleteFloatingRateType: (id: number) => Promise<void>;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
}