// Reference Data Management Type Definitions
// Common types and interfaces for all reference entities

// Re-export common types
export type { PaginatedResponse } from './index';

// Reference Entity Status Enum (reused from decision.ts)
export const ReferenceEntityStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;

export type ReferenceEntityStatus =
  (typeof ReferenceEntityStatus)[keyof typeof ReferenceEntityStatus];

// Base interface for all reference entities
export interface BaseReferenceEntity {
  id: number | string;
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

// Base create DTO for reference entities
export interface BaseReferenceCreateDto {
  nameEn: string;
  nameRu: string;
  nameKg: string;
  description?: string;
  status: ReferenceEntityStatus;
}

// Base update DTO for reference entities
export interface BaseReferenceUpdateDto {
  nameEn?: string;
  nameRu?: string;
  nameKg?: string;
  description?: string;
  status?: ReferenceEntityStatus;
}

// Base filter state for reference entities
export interface BaseReferenceFilterState {
  searchTerm: string;
  status: ReferenceEntityStatus | null;
}

// Common query parameters
export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
}

export interface SearchParams extends PaginationParams {
  searchTerm?: string;
}

export interface ReferenceSearchParams extends SearchParams {
  status?: ReferenceEntityStatus;
}

// View mode enum for list pages
export const ViewMode = {
  CARD: 'CARD',
  TABLE: 'TABLE',
} as const;

export type ViewMode = (typeof ViewMode)[keyof typeof ViewMode];

// Sort direction enum
export const SortDirection = {
  ASC: 'asc',
  DESC: 'desc',
} as const;

export type SortDirection = (typeof SortDirection)[keyof typeof SortDirection];

// Common sort field options for reference entities
export const CommonSortFields = {
  NAME_EN: 'nameEn',
  NAME_RU: 'nameRu',
  NAME_KG: 'nameKg',
  STATUS: 'status',
  CREATED_AT: 'createdAt',
  UPDATED_AT: 'updatedAt',
} as const;

export type CommonSortFields = (typeof CommonSortFields)[keyof typeof CommonSortFields];

// Reference Entity Types Enum
export const ReferenceEntityType = {
  CURRENCIES: 'CURRENCIES',
  CREDIT_PURPOSES: 'CREDIT_PURPOSES',
  DOCUMENT_TYPES: 'DOCUMENT_TYPES',
  DECISION_MAKING_BODIES: 'DECISION_MAKING_BODIES',
  DECISION_TYPES: 'DECISION_TYPES',
  FLOATING_RATE_TYPES: 'FLOATING_RATE_TYPES',
  REPAYMENT_ORDERS: 'REPAYMENT_ORDERS',
} as const;

export type ReferenceEntityType = (typeof ReferenceEntityType)[keyof typeof ReferenceEntityType];

// Reference Entity List Response DTO
export interface ReferenceListResponseDto extends BaseReferenceEntity {
  entityType: ReferenceEntityType;
  route: string;
  isAvailable: boolean;
  adminOnly: boolean;
}

// Reference List Filter State
export interface ReferenceFilterState extends BaseReferenceFilterState {
  entityType: ReferenceEntityType | null;
  isAvailable: boolean | null;
  createdDateFrom: string;
  createdDateTo: string;
  updatedDateFrom: string;
  updatedDateTo: string;
}

// Reference List Sort Fields
export type ReferenceListSortField = 'nameEn' | 'nameRu' | 'nameKg' | 'entityType' | 'status' | 'createdAt' | 'updatedAt';

// Reference List Search Parameters
export interface ReferenceListSearchParams extends ReferenceSearchParams {
  entityType?: ReferenceEntityType;
  isAvailable?: boolean;
  createdDateFrom?: string;
  createdDateTo?: string;
  updatedDateFrom?: string;
  updatedDateTo?: string;
}

// Reference Entity Metadata
export interface ReferenceEntityMetadata {
  type: ReferenceEntityType;
  nameKey: string;
  descriptionKey: string;
  route: string;
  icon: string;
  status: 'available' | 'development' | 'planned';
  adminOnly: boolean;
}