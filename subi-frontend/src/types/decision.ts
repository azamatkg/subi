// Decision Management Type Definitions
// Based on DECISION_ENDPOINTS_API.md

// Enums
export const DecisionStatus = {
  DRAFT: 'DRAFT',
  PENDING_CONFIRMATION: 'PENDING_CONFIRMATION',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;

export type DecisionStatus =
  (typeof DecisionStatus)[keyof typeof DecisionStatus];

export const ReferenceEntityStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;

export type ReferenceEntityStatus =
  (typeof ReferenceEntityStatus)[keyof typeof ReferenceEntityStatus];

// Decision DTOs
export interface CreateDecisionDto {
  nameEn: string;
  nameRu: string;
  nameKg: string;
  date: string; // ISO date format: YYYY-MM-DD
  number: string;
  decisionMakingBodyId: number;
  decisionTypeId: number;
  note?: string;
  status: DecisionStatus;
  documentPackageId?: string;
}

export interface UpdateDecisionDto {
  nameEn?: string;
  nameRu?: string;
  nameKg?: string;
  date?: string;
  number?: string;
  decisionMakingBodyId?: number;
  decisionTypeId?: number;
  note?: string;
  status?: DecisionStatus;
  documentPackageId?: string;
}

export interface DecisionResponseDto {
  id: string;
  nameEn: string;
  nameRu: string;
  nameKg: string;
  date: string;
  number: string;
  decisionMakingBodyId: number;
  decisionMakingBodyNameEn: string;
  decisionMakingBodyNameRu: string;
  decisionMakingBodyNameKg: string;
  decisionTypeId: number;
  decisionTypeNameEn: string;
  decisionTypeNameRu: string;
  decisionTypeNameKg: string;
  note?: string;
  status: DecisionStatus;
  documentPackageId?: string;
}

export interface SearchAndFilterDto {
  searchTerm?: string;
  decisionMakingBodyId?: number;
  decisionTypeId?: number;
  status?: DecisionStatus;
}

// Decision Type DTOs
export interface CreateDecisionTypeDto {
  nameEn: string;
  nameRu: string;
  nameKg: string;
  description?: string;
  status: ReferenceEntityStatus;
}

export interface UpdateDecisionTypeDto {
  nameEn?: string;
  nameRu?: string;
  nameKg?: string;
  description?: string;
  status?: ReferenceEntityStatus;
}

export interface DecisionTypeResponseDto {
  id: number;
  nameEn: string;
  nameRu: string;
  nameKg: string;
  description?: string;
  status: ReferenceEntityStatus;
  createdAt: string;
  updatedAt: string;
}

// Decision Making Body DTOs
export interface CreateDecisionMakingBodyDto {
  nameEn: string;
  nameRu: string;
  nameKg: string;
  description?: string;
  status: ReferenceEntityStatus;
}

export interface UpdateDecisionMakingBodyDto {
  nameEn?: string;
  nameRu?: string;
  nameKg?: string;
  description?: string;
  status?: ReferenceEntityStatus;
}

export interface DecisionMakingBodyResponseDto {
  id: number;
  nameEn: string;
  nameRu: string;
  nameKg: string;
  description?: string;
  status: ReferenceEntityStatus;
  createdAt: string;
  updatedAt: string;
}

// Pagination interface (extended from existing types)
export interface PageableResponse<T> {
  content: T[];
  pageable: {
    sort: {
      sorted: boolean;
      unsorted: boolean;
    };
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  numberOfElements: number;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
  };
  empty: boolean;
}

// Query parameters interface
export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
}

export interface SearchParams extends PaginationParams {
  searchTerm?: string;
}

export interface DecisionSearchAndFilterParams extends SearchParams {
  decisionMakingBodyId?: number;
  decisionTypeId?: number;
  status?: DecisionStatus;
}
