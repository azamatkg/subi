// Repayment Order Reference Entity Type Definitions
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

// Payment Priority Classification for Repayment Orders
export const RepaymentOrderPriority = {
  PRINCIPAL: 'PRINCIPAL',
  INTEREST: 'INTEREST',
  PENALTIES: 'PENALTIES',
  FEES: 'FEES',
  COMMISSION: 'COMMISSION',
  INSURANCE: 'INSURANCE',
  OTHER: 'OTHER',
} as const;

export type RepaymentOrderPriority =
  (typeof RepaymentOrderPriority)[keyof typeof RepaymentOrderPriority];

// Repayment Order Response DTO
export interface RepaymentOrderResponseDto extends BaseReferenceEntity {
  id: number;
  nameEn: string;
  nameRu: string;
  nameKg: string;
  description?: string;
  priority?: RepaymentOrderPriority; // Optional - not provided by current API
  priorityOrder?: number; // Optional - not provided by current API
  status: ReferenceEntityStatus;
  createdAt: string;
  updatedAt: string;
  createdByUsername?: string;
  updatedByUsername?: string;
  isReferencedByCreditPrograms?: boolean; // Added based on API documentation
}

// Repayment Order Create DTO
export interface RepaymentOrderCreateDto extends Omit<BaseReferenceCreateDto, 'id'> {
  nameEn: string;
  nameRu: string;
  nameKg: string;
  description?: string;
  priority?: RepaymentOrderPriority; // Optional - not supported by current API
  priorityOrder?: number; // Optional - not supported by current API
  status: ReferenceEntityStatus;
}

// Repayment Order Update DTO
export interface RepaymentOrderUpdateDto extends BaseReferenceUpdateDto {
  nameEn?: string;
  nameRu?: string;
  nameKg?: string;
  description?: string;
  priority?: RepaymentOrderPriority;
  priorityOrder?: number;
  status?: ReferenceEntityStatus;
}

// Repayment Order Filter State (for UI filters)
export interface RepaymentOrderFilterState extends BaseReferenceFilterState {
  searchTerm: string; // Search by name
  status: ReferenceEntityStatus | null;
  priority?: RepaymentOrderPriority | null; // Priority filtering - optional (not supported by current API)
  priorityOrderMin?: number | null; // Min priority order - optional (not supported by current API)
  priorityOrderMax?: number | null; // Max priority order - optional (not supported by current API)
}

// Repayment Order Search Parameters (for API calls)
export interface RepaymentOrderSearchParams extends ReferenceSearchParams {
  searchTerm?: string; // Searches name fields
  status?: ReferenceEntityStatus;
  // Priority-related parameters removed as they're not supported by current API
  // priority?: RepaymentOrderPriority;
  // priorityOrderMin?: number;
  // priorityOrderMax?: number;
}

// Sort fields specific to repayment orders
export const RepaymentOrderSortFields = {
  NAME_EN: 'nameEn',
  NAME_RU: 'nameRu',
  NAME_KG: 'nameKg',
  STATUS: 'status',
  CREATED_AT: 'createdAt',
  UPDATED_AT: 'updatedAt',
  // Priority fields removed as they're not supported by current API
  // PRIORITY: 'priority',
  // PRIORITY_ORDER: 'priorityOrder',
} as const;

export type RepaymentOrderSortFields =
  (typeof RepaymentOrderSortFields)[keyof typeof RepaymentOrderSortFields];

// Form data interfaces for React Hook Form
export interface RepaymentOrderCreateFormData {
  nameEn: string;
  nameRu: string;
  nameKg: string;
  description?: string;
  priority?: RepaymentOrderPriority; // Optional - not supported by current API
  priorityOrder?: number; // Optional - not supported by current API
  status: ReferenceEntityStatus;
}

export interface RepaymentOrderEditFormData extends RepaymentOrderCreateFormData {
  id: number;
}

// API Response types
export type RepaymentOrderListResponse = PaginatedResponse<RepaymentOrderResponseDto>;
export type RepaymentOrderResponse = RepaymentOrderResponseDto;

// Hook return types
export interface RepaymentOrderFiltersHookReturn {
  filters: RepaymentOrderFilterState;
  updateFilters: (updates: Partial<RepaymentOrderFilterState>) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  getSearchParams: () => RepaymentOrderSearchParams;
}

export interface RepaymentOrderActionsHookReturn {
  createRepaymentOrder: (data: RepaymentOrderCreateDto) => Promise<RepaymentOrderResponseDto>;
  updateRepaymentOrder: (id: number, data: RepaymentOrderUpdateDto) => Promise<RepaymentOrderResponseDto>;
  deleteRepaymentOrder: (id: number) => Promise<void>;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
}