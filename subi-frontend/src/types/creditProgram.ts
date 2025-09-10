// Credit Program Types and Interfaces

// Enums
export enum ProgramStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
}

export enum CollateralType {
  REAL_ESTATE = 'REAL_ESTATE',
  VEHICLE = 'VEHICLE',
  EQUIPMENT = 'EQUIPMENT',
  INVENTORY = 'INVENTORY',
  SECURITIES = 'SECURITIES',
  CASH_DEPOSIT = 'CASH_DEPOSIT',
  GUARANTEE = 'GUARANTEE',
  OTHER = 'OTHER',
}

export enum GracePeriodType {
  FIXED = 'FIXED',
  FLEXIBLE = 'FLEXIBLE',
  CONDITIONAL = 'CONDITIONAL',
}

export enum DayCalculationMethod {
  ACTUAL_360 = 'ACTUAL_360',
  ACTUAL_365 = 'ACTUAL_365',
  THIRTY_360 = 'THIRTY_360',
}

// Main Credit Program Response DTO
export interface CreditProgramResponseDto {
  id: string;
  version: number;
  decisionId: string;
  decisionNameEn: string;
  decisionNameRu: string;
  decisionNameKg: string;
  decisionNumber: string;
  nameEn: string;
  nameRu: string;
  nameKg: string;
  description?: string;
  validFrom?: string;
  validTo?: string;
  creditPurposeId: number;
  creditPurposeNameEn: string;
  creditPurposeNameRu: string;
  creditPurposeNameKg: string;
  termMin?: number;
  termMax?: number;
  fixedTerms: number[];
  amountMin?: number;
  amountMax?: number;
  fixedAmounts: number[];
  currencyId: number;
  currencyCode: string;
  currencyNameEn: string;
  currencyNameRu: string;
  currencyNameKg: string;
  processingFee?: number;
  processingFeePercentage?: number;
  interestRateFixed?: number;
  interestRateTypeId?: number;
  interestRateTypeNameEn?: string;
  interestRateTypeNameRu?: string;
  interestRateTypeNameKg?: string;
  gracePeriodPrincipal?: number;
  gracePeriodInterest?: number;
  gracePeriodAccrual?: number;
  gracePeriodMandatory?: boolean;
  gracePeriodType?: GracePeriodType;
  penaltyRatePrincipalFixed?: number;
  penaltyRatePrincipalTypeId?: number;
  penaltyRateInterestFixed?: number;
  penaltyRateInterestTypeId?: number;
  paymentFrequencyMonths?: number;
  numberOfInstallments?: number;
  firstInstallmentDay?: number;
  minDaysDisbursementToFirstInstallment?: number;
  maxDaysDisbursementToFirstInstallment?: number;
  customPaymentMonths: number[];
  dayCalculationMethodPeriod?: DayCalculationMethod;
  dayCalculationMethodYear?: DayCalculationMethod;
  repaymentOrderId: number;
  repaymentOrderNameEn: string;
  repaymentOrderNameRu: string;
  repaymentOrderNameKg: string;
  applicantList: string[];
  collateralRequired: boolean;
  acceptedCollateralTypes: CollateralType[];
  minimumCollateralCoverageRatio?: number;
  collateralValuationRequirementsEn?: string;
  collateralValuationRequirementsRu?: string;
  collateralValuationRequirementsKg?: string;
  creditDocuments: unknown[];
  collateralDocuments: unknown[];
  singleChoiceDocumentLists: string[][];
  status: ProgramStatus;
  createdAt: string;
  updatedAt: string;
  createdByUsername: string;
  updatedByUsername: string;
  applicationCount: number;
  canBeDeleted: boolean;
  isActive: boolean;
  isAvailableForApplications: boolean;
  isWithinValidityPeriod: boolean;
}

// Credit Program Summary DTO (lightweight version)
export interface CreditProgramSummaryDto {
  id: string;
  nameEn: string;
  nameRu: string;
  nameKg: string;
  status: ProgramStatus;
  currencyCode: string;
  isActive: boolean;
}

// Create Credit Program DTO
export interface CreateCreditProgramDto {
  // Required fields
  decisionId: string;
  nameEn: string;
  nameRu: string;
  nameKg: string;
  creditPurposeId: number;
  currencyId: number;
  repaymentOrderId: number;
  collateralRequired: boolean;

  // Optional fields
  description?: string;
  validFrom?: string;
  validTo?: string;
  termMin?: number;
  termMax?: number;
  fixedTerms?: number[];
  amountMin?: number;
  amountMax?: number;
  fixedAmounts?: number[];
  processingFee?: number;
  processingFeePercentage?: number;
  interestRateFixed?: number;
  interestRateTypeId?: number;
  gracePeriodPrincipal?: number;
  gracePeriodInterest?: number;
  gracePeriodAccrual?: number;
  gracePeriodMandatory?: boolean;
  gracePeriodType?: GracePeriodType;
  penaltyRatePrincipalFixed?: number;
  penaltyRatePrincipalTypeId?: number;
  penaltyRateInterestFixed?: number;
  penaltyRateInterestTypeId?: number;
  paymentFrequencyMonths?: number;
  numberOfInstallments?: number;
  firstInstallmentDay?: number;
  minDaysDisbursementToFirstInstallment?: number;
  maxDaysDisbursementToFirstInstallment?: number;
  customPaymentMonths?: number[];
  dayCalculationMethodPeriod?: DayCalculationMethod;
  dayCalculationMethodYear?: DayCalculationMethod;
  applicantList?: string[];
  acceptedCollateralTypes?: CollateralType[];
  minimumCollateralCoverageRatio?: number;
  collateralValuationRequirementsEn?: string;
  collateralValuationRequirementsRu?: string;
  collateralValuationRequirementsKg?: string;
  creditDocumentIds?: string[];
  collateralDocumentIds?: string[];
  singleChoiceDocumentLists?: string[][];
  status?: ProgramStatus;
}

// Update Credit Program DTO (same fields as Create, but all optional)
export interface UpdateCreditProgramDto
  extends Partial<CreateCreditProgramDto> {
  id?: string;
}

// Credit Program Search DTO
export interface CreditProgramSearchDto {
  searchTerm?: string;
  status?: ProgramStatus;
  decisionId?: string;
  creditPurposeId?: number;
  currencyId?: number;
  collateralRequired?: boolean;
  validFromStart?: string;
  validFromEnd?: string;
  validToStart?: string;
  validToEnd?: string;
  minAmount?: number;
  maxAmount?: number;
  minTerm?: number;
  maxTerm?: number;
  activeOnly?: boolean;
  availableForApplications?: boolean;
  collateralTypes?: CollateralType[];
  documentTypeIds?: number[];
}

// Credit Program Status Update DTO
export interface CreditProgramStatusUpdateDto {
  status: ProgramStatus;
  reason?: string;
}

// Credit Program Statistics DTO
export interface CreditProgramStatisticsDto {
  totalPrograms: number;
  draftPrograms: number;
  pendingApprovalPrograms: number;
  approvedPrograms: number;
  activePrograms: number;
  suspendedPrograms: number;
  closedPrograms: number;
  programsWithCollateral: number;
  programsWithoutCollateral: number;
  programsExpiringWithin30Days: number;
}

// Search and Filter Parameters for API
export interface CreditProgramSearchAndFilterParams
  extends CreditProgramSearchDto {
  page?: number;
  size?: number;
  sort?: string;
}

// Filter state for UI components
export interface CreditProgramFilterState {
  searchTerm: string;
  status: ProgramStatus | null;
  amountMin: number | null;
  amountMax: number | null;
  termMin: number | null;
  termMax: number | null;
  validFromStart: string;
  validFromEnd: string;
  validToStart: string;
  validToEnd: string;
  collateralRequired: boolean | null;
  activeOnly: boolean;
}

// Type aliases for convenience
export type CreditProgramStatus = ProgramStatus;

// Utility types
export interface PaginatedCreditProgramResponse {
  content: CreditProgramResponseDto[];
  pageable: {
    sort: { sorted: boolean; unsorted: boolean };
    pageNumber: number;
    pageSize: number;
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  first: boolean;
  numberOfElements: number;
  size: number;
  number: number;
  sort: { sorted: boolean; unsorted: boolean };
}

export interface PaginatedCreditProgramSummaryResponse {
  content: CreditProgramSummaryDto[];
  pageable: {
    sort: { sorted: boolean; unsorted: boolean };
    pageNumber: number;
    pageSize: number;
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  first: boolean;
  numberOfElements: number;
  size: number;
  number: number;
  sort: { sorted: boolean; unsorted: boolean };
}
