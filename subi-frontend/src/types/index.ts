// Global type definitions
export interface User {
  id: string;
  username: string;
  email: string;
  roles: UserRole[];
  firstName?: string;
  lastName?: string;
}

export const UserRole = {
  ADMIN: 'ADMIN',
  CREDIT_MANAGER: 'CREDIT_MANAGER',
  CREDIT_ANALYST: 'CREDIT_ANALYST',
  DECISION_MAKER: 'DECISION_MAKER',
  COMMISSION_MEMBER: 'COMMISSION_MEMBER',
  USER: 'USER',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const ApplicationStatus = {
  SUBMITTED: 'SUBMITTED',
  UNDER_COMPLETION: 'UNDER_COMPLETION',
  NEEDS_REWORK: 'NEEDS_REWORK',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  LOAN_REGISTRATION_COMPLETED: 'LOAN_REGISTRATION_COMPLETED',
  COLLATERAL_COLLECTION_IN_PROGRESS: 'COLLATERAL_COLLECTION_IN_PROGRESS',
  COLLATERAL_REVIEW_POSITIVE: 'COLLATERAL_REVIEW_POSITIVE',
  COLLATERAL_REGISTRATION_PENDING: 'COLLATERAL_REGISTRATION_PENDING',
  COLLATERAL_REGISTERED: 'COLLATERAL_REGISTERED',
  CONTRACT_SIGNED: 'CONTRACT_SIGNED',
  CREDIT_ISSUED: 'CREDIT_ISSUED',
} as const;

export type ApplicationStatus =
  (typeof ApplicationStatus)[keyof typeof ApplicationStatus];

export const Language = {
  KG: 'kg',
  RU: 'ru',
  EN: 'en',
} as const;

export type Language = (typeof Language)[keyof typeof Language];

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
