# Credit Program API Endpoints Manual

## Table of Contents
1. [Authentication & Authorization](#authentication--authorization)
2. [Base URL and Common Headers](#base-url-and-common-headers)
3. [Data Types and Enums](#data-types-and-enums)
4. [API Endpoints](#api-endpoints)
5. [Request/Response Examples](#requestresponse-examples)
6. [Error Handling](#error-handling)
7. [Business Rules and Workflows](#business-rules-and-workflows)
8. [Multilingual Support](#multilingual-support)
9. [Frontend Integration Guidelines](#frontend-integration-guidelines)

---

## Authentication & Authorization

### Authentication Method
The API uses **JWT Bearer Token** authentication. All requests (except login) must include the Authorization header:

```
Authorization: Bearer <jwt-token>
```

### Getting Authentication Token
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "your_username",
  "password": "your_password"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": "uuid",
    "username": "user123",
    "roles": ["ADMIN", "CREDIT_MANAGER"]
  },
  "expiresIn": 86400
}
```

### Authorization Levels

#### Public Access (No Authentication Required)
- None for Credit Program endpoints

#### Authenticated Access (Any logged-in user)
- `GET /api/credit-programs` - List credit programs
- `GET /api/credit-programs/{id}` - Get credit program details
- `GET /api/credit-programs/available` - Get available programs
- `GET /api/credit-programs/summaries` - Get program summaries
- `GET /api/credit-programs/by-*` - Various filtered listings
- `POST /api/credit-programs/search` - Search programs
- `GET /api/credit-programs/{id}/available` - Check availability
- `GET /api/credit-programs/{id}/validity` - Check validity

#### Credit Staff Access (`ADMIN`, `CREDIT_ANALYST`, `CREDIT_MANAGER`)
- `POST /api/credit-programs` - Create credit program
- `PUT /api/credit-programs/{id}` - Update credit program

#### Manager Access (`ADMIN`, `CREDIT_MANAGER`)
- `PATCH /api/credit-programs/{id}/status` - Update program status
- `PATCH /api/credit-programs/{id}/activate` - Activate program
- `PATCH /api/credit-programs/{id}/suspend` - Suspend program
- `PATCH /api/credit-programs/{id}/close` - Close program
- `PATCH /api/credit-programs/bulk/status` - Bulk status update
- `GET /api/credit-programs/expiring/{days}` - Get expiring programs
- `GET /api/credit-programs/statistics` - Get statistics

#### Admin Only (`ADMIN`)
- `DELETE /api/credit-programs/{id}` - Delete credit program
- `GET /api/credit-programs/{id}/can-delete` - Check if can be deleted

---

## Base URL and Common Headers

### Base URL
```
http://localhost:8080/api/credit-programs
```

### Required Headers
```http
Content-Type: application/json
Authorization: Bearer <jwt-token>
Accept: application/json
```

### Optional Headers
```http
Accept-Language: en|ru|kg  # For localized responses
X-Request-ID: <unique-id>  # For request tracking
```

### CORS Support
The API supports cross-origin requests with the following configuration:
- **Allowed Origins:** `*`
- **Allowed Methods:** `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`
- **Allowed Headers:** `*`

---

## Data Types and Enums

### ProgramStatus Enum
```typescript
enum ProgramStatus {
  DRAFT = "DRAFT",           // "Draft", "Черновик", "Долбоор"
  PENDING_APPROVAL = "PENDING_APPROVAL", // "Pending Approval", "На утверждении", "Бекитүүгө күтүлүүдө"
  APPROVED = "APPROVED",     // "Approved", "Утвержден", "Бекитилген"
  ACTIVE = "ACTIVE",         // "Active", "Активный", "Активдүү"
  SUSPENDED = "SUSPENDED",   // "Suspended", "Приостановлен", "Токтотулган"
  CLOSED = "CLOSED",         // "Closed", "Закрыт", "Жабылган"
  CANCELLED = "CANCELLED",   // "Cancelled", "Отменён", "Жокко чыгарылган"
  REJECTED = "REJECTED"      // "Rejected", "Отклонён", "Четке кагылган"
}
```

### CollateralType Enum
```typescript
enum CollateralType {
  REAL_ESTATE = "REAL_ESTATE",
  VEHICLE = "VEHICLE",
  EQUIPMENT = "EQUIPMENT",
  INVENTORY = "INVENTORY",
  SECURITIES = "SECURITIES",
  CASH_DEPOSIT = "CASH_DEPOSIT",
  GUARANTEE = "GUARANTEE",
  OTHER = "OTHER"
}
```

### GracePeriodType Enum
```typescript
enum GracePeriodType {
  FIXED = "FIXED",
  FLEXIBLE = "FLEXIBLE",
  CONDITIONAL = "CONDITIONAL"
}
```

### DayCalculationMethod Enum
```typescript
enum DayCalculationMethod {
  ACTUAL_360 = "ACTUAL_360",
  ACTUAL_365 = "ACTUAL_365",
  THIRTY_360 = "THIRTY_360"
}
```

### Core Data Types
```typescript
interface UUID {
  format: string; // "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}

interface LocalDate {
  format: string; // "yyyy-MM-dd"
}

interface LocalDateTime {
  format: string; // "yyyy-MM-dd'T'HH:mm:ss"
}

interface BigDecimal {
  type: number;
  precision: "decimal";
}
```

---

## API Endpoints

### 1. Create Credit Program
**Endpoint:** `POST /api/credit-programs`  
**Authorization:** `ADMIN`, `CREDIT_ANALYST`, `CREDIT_MANAGER`

**Request Body:** `CreateCreditProgramDto`
```typescript
interface CreateCreditProgramDto {
  // Required fields
  decisionId: string;                    // UUID of the decision
  nameEn: string;                       // Max 100 chars
  nameRu: string;                       // Max 100 chars  
  nameKg: string;                       // Max 100 chars
  creditPurposeId: number;              // Required
  currencyId: number;                   // Required
  repaymentOrderId: number;             // Required
  collateralRequired: boolean;          // Required
  
  // Optional fields
  description?: string;                 // Max 2000 chars
  validFrom?: string;                   // yyyy-MM-dd format
  validTo?: string;                     // yyyy-MM-dd format
  termMin?: number;                     // Positive integer
  termMax?: number;                     // Positive integer
  fixedTerms?: number[];               // Array of positive integers
  amountMin?: number;                   // Positive decimal
  amountMax?: number;                   // Positive decimal
  fixedAmounts?: number[];             // Array of positive decimals
  processingFee?: number;               // ≥ 0
  processingFeePercentage?: number;     // 0-100
  interestRateFixed?: number;           // ≥ 0
  interestRateTypeId?: number;
  gracePeriodPrincipal?: number;        // ≥ 0
  gracePeriodInterest?: number;         // ≥ 0
  gracePeriodAccrual?: number;          // ≥ 0
  gracePeriodMandatory?: boolean;
  gracePeriodType?: GracePeriodType;
  penaltyRatePrincipalFixed?: number;   // ≥ 0
  penaltyRatePrincipalTypeId?: number;
  penaltyRateInterestFixed?: number;    // ≥ 0
  penaltyRateInterestTypeId?: number;
  paymentFrequencyMonths?: number;      // Positive integer
  numberOfInstallments?: number;        // Positive integer
  firstInstallmentDay?: number;         // 0-31
  minDaysDisbursementToFirstInstallment?: number; // ≥ 0
  maxDaysDisbursementToFirstInstallment?: number; // ≥ 0
  customPaymentMonths?: number[];
  dayCalculationMethodPeriod?: DayCalculationMethod;
  dayCalculationMethodYear?: DayCalculationMethod;
  applicantList?: string[];
  acceptedCollateralTypes?: CollateralType[];
  minimumCollateralCoverageRatio?: number; // 0-1000
  collateralValuationRequirementsEn?: string; // Max 1000 chars
  collateralValuationRequirementsRu?: string; // Max 1000 chars
  collateralValuationRequirementsKg?: string; // Max 1000 chars
  creditDocumentIds?: string[];         // UUIDs
  collateralDocumentIds?: string[];     // UUIDs
  singleChoiceDocumentLists?: string[][];
  status?: ProgramStatus;
}
```

**Response:** `CreditProgramResponseDto` (201 Created)

### 2. Get Credit Program by ID
**Endpoint:** `GET /api/credit-programs/{id}`  
**Authorization:** Any authenticated user

**Path Parameters:**
- `id` (UUID): Credit program identifier

**Response:** `CreditProgramResponseDto` (200 OK)

### 3. Get All Credit Programs
**Endpoint:** `GET /api/credit-programs`  
**Authorization:** Any authenticated user

**Query Parameters:**
- `page` (number, default: 0): Page number
- `size` (number, default: 20): Page size  
- `sort` (string): Sort field and direction (e.g., "nameEn,asc")

**Response:** Paginated `CreditProgramResponseDto[]` (200 OK)

### 4. Search Credit Programs
**Endpoint:** `POST /api/credit-programs/search`  
**Authorization:** Any authenticated user

**Request Body:** `CreditProgramSearchDto`
```typescript
interface CreditProgramSearchDto {
  searchTerm?: string;                  // Search in name fields
  status?: ProgramStatus;
  decisionId?: string;                  // UUID
  creditPurposeId?: number;
  currencyId?: number;
  collateralRequired?: boolean;
  validFromStart?: string;              // yyyy-MM-dd
  validFromEnd?: string;                // yyyy-MM-dd
  validToStart?: string;                // yyyy-MM-dd
  validToEnd?: string;                  // yyyy-MM-dd
  validFrom?: string;                   // yyyy-MM-dd (deprecated)
  validTo?: string;                     // yyyy-MM-dd (deprecated)
  minAmount?: number;
  maxAmount?: number;
  minTerm?: number;
  maxTerm?: number;
  activeOnly?: boolean;
  availableForApplications?: boolean;
  collateralTypes?: CollateralType[];
  documentTypeIds?: number[];
}
```

**Query Parameters:**
- `page`, `size`, `sort` (same as list endpoint)

**Response:** Paginated `CreditProgramResponseDto[]` (200 OK)

### 5. Get Credit Programs by Decision
**Endpoint:** `GET /api/credit-programs/by-decision/{decisionId}`  
**Authorization:** Any authenticated user

**Path Parameters:**
- `decisionId` (UUID): Decision identifier

**Query Parameters:**
- `page`, `size`, `sort` (same as list endpoint)

**Response:** Paginated `CreditProgramResponseDto[]` (200 OK)

### 6. Get Available Credit Programs
**Endpoint:** `GET /api/credit-programs/available`  
**Authorization:** Any authenticated user

Returns only programs with status `ACTIVE` and within validity period.

**Query Parameters:**
- `page`, `size`, `sort` (same as list endpoint)

**Response:** Paginated `CreditProgramResponseDto[]` (200 OK)

### 7. Get Credit Program Summaries
**Endpoint:** `GET /api/credit-programs/summaries`  
**Authorization:** Any authenticated user

Returns lightweight version of credit programs for dropdowns and lists.

**Query Parameters:**
- `page` (number, default: 0)
- `size` (number, default: 50)
- `sort` (string)

**Response:** Paginated `CreditProgramSummaryDto[]` (200 OK)

### 8. Get Credit Programs by Status
**Endpoint:** `GET /api/credit-programs/by-status/{status}`  
**Authorization:** Any authenticated user

**Path Parameters:**
- `status` (ProgramStatus): Program status

**Query Parameters:**
- `page`, `size`, `sort` (same as list endpoint)

**Response:** Paginated `CreditProgramResponseDto[]` (200 OK)

### 9. Get Expiring Programs
**Endpoint:** `GET /api/credit-programs/expiring/{days}`  
**Authorization:** `ADMIN`, `CREDIT_MANAGER`

Returns programs expiring within specified number of days.

**Path Parameters:**
- `days` (integer): Number of days to check for expiration

**Query Parameters:**
- `page`, `size`, `sort` (same as list endpoint)

**Response:** Paginated `CreditProgramResponseDto[]` (200 OK)

### 10. Update Credit Program
**Endpoint:** `PUT /api/credit-programs/{id}`  
**Authorization:** `ADMIN`, `CREDIT_ANALYST`, `CREDIT_MANAGER`

**Path Parameters:**
- `id` (UUID): Credit program identifier

**Request Body:** `UpdateCreditProgramDto` (same fields as Create, but all optional)

**Response:** `CreditProgramResponseDto` (200 OK)

### 11. Update Credit Program Status
**Endpoint:** `PATCH /api/credit-programs/{id}/status`  
**Authorization:** `ADMIN`, `CREDIT_MANAGER`

**Path Parameters:**
- `id` (UUID): Credit program identifier

**Request Body:** `CreditProgramStatusUpdateDto`
```typescript
interface CreditProgramStatusUpdateDto {
  status: ProgramStatus;  // Required
  reason?: string;        // Optional reason for change
}
```

**Response:** `CreditProgramResponseDto` (200 OK)

### 12. Activate Credit Program
**Endpoint:** `PATCH /api/credit-programs/{id}/activate`  
**Authorization:** `ADMIN`, `CREDIT_MANAGER`

**Path Parameters:**
- `id` (UUID): Credit program identifier

**Response:** `CreditProgramResponseDto` (200 OK)

### 13. Suspend Credit Program
**Endpoint:** `PATCH /api/credit-programs/{id}/suspend`  
**Authorization:** `ADMIN`, `CREDIT_MANAGER`

**Path Parameters:**
- `id` (UUID): Credit program identifier

**Query Parameters:**
- `reason` (string, optional): Suspension reason

**Response:** `CreditProgramResponseDto` (200 OK)

### 14. Close Credit Program
**Endpoint:** `PATCH /api/credit-programs/{id}/close`  
**Authorization:** `ADMIN`, `CREDIT_MANAGER`

**Path Parameters:**
- `id` (UUID): Credit program identifier

**Query Parameters:**
- `reason` (string, optional): Closure reason

**Response:** `CreditProgramResponseDto` (200 OK)

### 15. Bulk Update Status
**Endpoint:** `PATCH /api/credit-programs/bulk/status`  
**Authorization:** `ADMIN`, `CREDIT_MANAGER`

**Query Parameters:**
- `programIds` (UUID[]): List of credit program IDs
- `status` (ProgramStatus): New status for all programs
- `reason` (string, optional): Reason for change

**Response:** `CreditProgramResponseDto[]` (200 OK)

### 16. Delete Credit Program
**Endpoint:** `DELETE /api/credit-programs/{id}`  
**Authorization:** `ADMIN`

**Path Parameters:**
- `id` (UUID): Credit program identifier

**Response:** No content (204 No Content)

### 17. Check if Can Be Deleted
**Endpoint:** `GET /api/credit-programs/{id}/can-delete`  
**Authorization:** `ADMIN`

**Path Parameters:**
- `id` (UUID): Credit program identifier

**Response:** `boolean` (200 OK)

### 18. Check if Available for Applications
**Endpoint:** `GET /api/credit-programs/{id}/available`  
**Authorization:** Any authenticated user

**Path Parameters:**
- `id` (UUID): Credit program identifier

**Response:** `boolean` (200 OK)

### 19. Check Validity Period
**Endpoint:** `GET /api/credit-programs/{id}/validity`  
**Authorization:** Any authenticated user

**Path Parameters:**
- `id` (UUID): Credit program identifier

**Response:** `boolean` (200 OK)

### 20. Get Credit Program Statistics
**Endpoint:** `GET /api/credit-programs/statistics`  
**Authorization:** `ADMIN`, `CREDIT_MANAGER`

**Response:** `CreditProgramStatisticsDto` (200 OK)

---

## Request/Response Examples

### Creating a Credit Program

**Request:**
```http
POST /api/credit-programs
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...

{
  "decisionId": "123e4567-e89b-12d3-a456-426614174000",
  "nameEn": "Small Business Loan Program",
  "nameRu": "Программа кредитования малого бизнеса",
  "nameKg": "Чакан бизнес кредиттөө программасы",
  "description": "Loan program for small and medium enterprises",
  "validFrom": "2024-01-01",
  "validTo": "2024-12-31",
  "creditPurposeId": 1,
  "termMin": 6,
  "termMax": 60,
  "amountMin": 50000,
  "amountMax": 5000000,
  "currencyId": 1,
  "processingFee": 1000,
  "processingFeePercentage": 1.5,
  "interestRateFixed": 18.0,
  "paymentFrequencyMonths": 1,
  "numberOfInstallments": 60,
  "repaymentOrderId": 1,
  "collateralRequired": true,
  "acceptedCollateralTypes": ["REAL_ESTATE", "VEHICLE", "EQUIPMENT"],
  "minimumCollateralCoverageRatio": 1.2,
  "status": "DRAFT"
}
```

**Response (201 Created):**
```json
{
  "id": "789e0123-e89b-12d3-a456-426614174001",
  "version": 1,
  "decisionId": "123e4567-e89b-12d3-a456-426614174000",
  "decisionNameEn": "Board Decision #2024-001",
  "decisionNameRu": "Решение правления №2024-001",
  "decisionNameKg": "Башкармакор чечими №2024-001",
  "decisionNumber": "2024-001",
  "nameEn": "Small Business Loan Program",
  "nameRu": "Программа кредитования малого бизнеса", 
  "nameKg": "Чакан бизнес кредиттөө программасы",
  "description": "Loan program for small and medium enterprises",
  "validFrom": "2024-01-01",
  "validTo": "2024-12-31",
  "creditPurposeId": 1,
  "creditPurposeNameEn": "Business Operations",
  "creditPurposeNameRu": "Бизнес операции",
  "creditPurposeNameKg": "Бизнес операциялары",
  "termMin": 6,
  "termMax": 60,
  "fixedTerms": [],
  "amountMin": 50000,
  "amountMax": 5000000,
  "fixedAmounts": [],
  "currencyId": 1,
  "currencyCode": "KGS",
  "currencyNameEn": "Kyrgyz Som",
  "currencyNameRu": "Кыргызский сом",
  "currencyNameKg": "Кыргыз сому",
  "processingFee": 1000,
  "processingFeePercentage": 1.5,
  "interestRateFixed": 18.0,
  "interestRateTypeId": null,
  "interestRateTypeNameEn": null,
  "interestRateTypeNameRu": null,
  "interestRateTypeNameKg": null,
  "gracePeriodPrincipal": 0,
  "gracePeriodInterest": 0,
  "gracePeriodAccrual": 0,
  "gracePeriodMandatory": false,
  "gracePeriodType": null,
  "penaltyRatePrincipalFixed": null,
  "penaltyRatePrincipalTypeId": null,
  "penaltyRateInterestFixed": null,
  "penaltyRateInterestTypeId": null,
  "paymentFrequencyMonths": 1,
  "numberOfInstallments": 60,
  "firstInstallmentDay": null,
  "minDaysDisbursementToFirstInstallment": null,
  "maxDaysDisbursementToFirstInstallment": null,
  "customPaymentMonths": [],
  "dayCalculationMethodPeriod": null,
  "dayCalculationMethodYear": null,
  "repaymentOrderId": 1,
  "repaymentOrderNameEn": "Principal and Interest",
  "repaymentOrderNameRu": "Основной долг и проценты",
  "repaymentOrderNameKg": "Негизги карыз жана пайыздар",
  "applicantList": [],
  "collateralRequired": true,
  "acceptedCollateralTypes": ["REAL_ESTATE", "VEHICLE", "EQUIPMENT"],
  "minimumCollateralCoverageRatio": 1.2,
  "collateralValuationRequirementsEn": null,
  "collateralValuationRequirementsRu": null,
  "collateralValuationRequirementsKg": null,
  "creditDocuments": [],
  "collateralDocuments": [],
  "singleChoiceDocumentLists": [],
  "status": "DRAFT",
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:30:00",
  "createdByUsername": "admin",
  "updatedByUsername": "admin",
  "applicationCount": 0,
  "canBeDeleted": true,
  "isActive": false,
  "isAvailableForApplications": false,
  "isWithinValidityPeriod": true
}
```

### Searching Credit Programs

**Request:**
```http
POST /api/credit-programs/search?page=0&size=10&sort=nameEn,asc
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...

{
  "searchTerm": "business",
  "status": "ACTIVE",
  "collateralRequired": true,
  "validFromStart": "2024-01-01",
  "validToEnd": "2024-12-31",
  "minAmount": 10000,
  "maxAmount": 1000000,
  "activeOnly": true
}
```

**Response (200 OK):**
```json
{
  "content": [
    {
      "id": "789e0123-e89b-12d3-a456-426614174001",
      "nameEn": "Small Business Loan Program",
      "nameRu": "Программа кредитования малого бизнеса",
      "nameKg": "Чакан бизнес кредиттөө программасы",
      "status": "ACTIVE",
      "currencyCode": "KGS",
      "amountMin": 50000,
      "amountMax": 5000000,
      "termMin": 6,
      "termMax": 60,
      "collateralRequired": true,
      "validFrom": "2024-01-01",
      "validTo": "2024-12-31",
      "isActive": true,
      "isAvailableForApplications": true
    }
  ],
  "pageable": {
    "sort": {
      "sorted": true,
      "unsorted": false
    },
    "pageNumber": 0,
    "pageSize": 10,
    "offset": 0,
    "paged": true,
    "unpaged": false
  },
  "totalPages": 1,
  "totalElements": 1,
  "last": true,
  "first": true,
  "numberOfElements": 1,
  "size": 10,
  "number": 0,
  "sort": {
    "sorted": true,
    "unsorted": false
  }
}
```

### Getting Credit Program Statistics

**Request:**
```http
GET /api/credit-programs/statistics
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

**Response (200 OK):**
```json
{
  "totalPrograms": 25,
  "draftPrograms": 3,
  "pendingApprovalPrograms": 2,
  "approvedPrograms": 5,
  "activePrograms": 12,
  "suspendedPrograms": 2,
  "closedPrograms": 1,
  "programsWithCollateral": 18,
  "programsWithoutCollateral": 7,
  "programsExpiringWithin30Days": 4
}
```

---

## Error Handling

### Standard HTTP Status Codes

#### 200 OK
Successful GET, PUT, PATCH requests

#### 201 Created  
Successful POST requests (resource creation)

#### 204 No Content
Successful DELETE requests

#### 400 Bad Request
Validation errors, malformed requests

```json
{
  "timestamp": "2024-01-15T10:30:00.123Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/credit-programs",
  "errors": [
    {
      "field": "nameEn",
      "message": "Name in English is required",
      "rejectedValue": null
    },
    {
      "field": "amountMin",
      "message": "Minimum amount must be positive",
      "rejectedValue": -1000
    }
  ]
}
```

#### 401 Unauthorized
Missing or invalid JWT token

```json
{
  "timestamp": "2024-01-15T10:30:00.123Z",
  "status": 401,
  "error": "Unauthorized",
  "message": "JWT token is required"
}
```

#### 403 Forbidden
Insufficient permissions

```json
{
  "timestamp": "2024-01-15T10:30:00.123Z",
  "status": 403,
  "error": "Forbidden",
  "message": "Access denied. Required role: ADMIN"
}
```

#### 404 Not Found
Resource not found

```json
{
  "timestamp": "2024-01-15T10:30:00.123Z",
  "status": 404,
  "error": "Not Found",
  "message": "Credit program not found with id: 123e4567-e89b-12d3-a456-426614174000"
}
```

#### 409 Conflict
Business rule violations

```json
{
  "timestamp": "2024-01-15T10:30:00.123Z",
  "status": 409,
  "error": "Conflict",
  "message": "Cannot delete credit program: it has associated applications"
}
```

#### 422 Unprocessable Entity
Business validation errors

```json
{
  "timestamp": "2024-01-15T10:30:00.123Z",
  "status": 422,
  "error": "Unprocessable Entity", 
  "message": "Credit program validation failed",
  "details": [
    "Amount range invalid: minimum (1000000) cannot be greater than maximum (500000)",
    "Term range invalid: minimum (24) cannot be greater than maximum (12)",
    "Collateral is required but no accepted collateral types specified"
  ]
}
```

#### 500 Internal Server Error
Server-side errors

```json
{
  "timestamp": "2024-01-15T10:30:00.123Z",
  "status": 500,
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

### Field Validation Error Format
```json
{
  "field": "fieldName",
  "message": "Human-readable error message",
  "rejectedValue": "The invalid value that was submitted",
  "code": "VALIDATION_ERROR_CODE"
}
```

### Common Validation Messages
- `"{field} is required"` - Missing required field
- `"{field} must be positive"` - Numeric field must be > 0
- `"{field} must not exceed {max} characters"` - String length validation
- `"{field} must be between {min} and {max}"` - Range validation
- `"Invalid {field} format"` - Format validation (dates, UUIDs, etc.)

---

## Business Rules and Workflows

### Credit Program Lifecycle

```mermaid
stateDiagram-v2
    [*] --> DRAFT
    DRAFT --> PENDING_APPROVAL
    DRAFT --> CANCELLED
    PENDING_APPROVAL --> APPROVED
    PENDING_APPROVAL --> REJECTED
    PENDING_APPROVAL --> CANCELLED
    APPROVED --> ACTIVE
    APPROVED --> CANCELLED
    ACTIVE --> SUSPENDED
    ACTIVE --> CLOSED
    SUSPENDED --> ACTIVE
    SUSPENDED --> CLOSED
    CLOSED --> [*]
    CANCELLED --> [*]
    REJECTED --> [*]
```

### Status Transition Rules

#### From DRAFT
- ✅ Can transition to: `PENDING_APPROVAL`, `CANCELLED`
- ❌ Cannot directly activate or approve

#### From PENDING_APPROVAL  
- ✅ Can transition to: `APPROVED`, `REJECTED`, `CANCELLED`
- 📋 Requires management approval

#### From APPROVED
- ✅ Can transition to: `ACTIVE`, `CANCELLED`
- 📋 Ready for activation

#### From ACTIVE
- ✅ Can transition to: `SUSPENDED`, `CLOSED`
- 💰 Can be used for applications
- ⚠️ Cannot be deleted if has applications

#### From SUSPENDED
- ✅ Can transition to: `ACTIVE`, `CLOSED`
- 🚫 Cannot be used for new applications

#### From CLOSED/CANCELLED/REJECTED
- ❌ Final states - no transitions allowed

### Availability Rules

A credit program is available for applications when:
1. **Status** = `ACTIVE`
2. **Validity Period**: Current date is between `validFrom` and `validTo` (inclusive)
3. **No blocking conditions** exist

### Validation Rules

#### Amount and Term Validation
```typescript
// Amount range validation
if (amountMin && amountMax && amountMin > amountMax) {
  throw new ValidationError("Minimum amount cannot be greater than maximum amount");
}

// Term range validation  
if (termMin && termMax && termMin > termMax) {
  throw new ValidationError("Minimum term cannot be greater than maximum term");
}

// Fixed amounts must be within range
fixedAmounts.forEach(amount => {
  if (amountMin && amount < amountMin) {
    throw new ValidationError(`Fixed amount ${amount} is below minimum ${amountMin}`);
  }
  if (amountMax && amount > amountMax) {
    throw new ValidationError(`Fixed amount ${amount} exceeds maximum ${amountMax}`);
  }
});
```

#### Collateral Validation
```typescript
if (collateralRequired) {
  if (!acceptedCollateralTypes || acceptedCollateralTypes.length === 0) {
    throw new ValidationError("Accepted collateral types must be specified when collateral is required");
  }
  if (!minimumCollateralCoverageRatio || minimumCollateralCoverageRatio <= 0) {
    throw new ValidationError("Minimum collateral coverage ratio must be positive when collateral is required");
  }
}
```

#### Validity Period Validation
```typescript
if (validFrom && validTo && validFrom > validTo) {
  throw new ValidationError("Valid from date cannot be after valid to date");
}

if (validTo && validTo < currentDate) {
  throw new ValidationError("Valid to date cannot be in the past");
}
```

#### Grace Period Validation
```typescript
if (gracePeriodMandatory && (!gracePeriodPrincipal || gracePeriodPrincipal <= 0)) {
  throw new ValidationError("Grace period for principal must be specified when mandatory");
}
```

### Deletion Rules

A credit program can be deleted only when:
1. **User Role**: `ADMIN`
2. **No Applications**: `applications.length === 0`  
3. **Status Check**: Use `GET /api/credit-programs/{id}/can-delete` to verify

### Application Integration Rules

When creating applications:
1. Only `ACTIVE` programs can be selected
2. Program must be within validity period
3. Application amount must be within program's amount range
4. Application term must be within program's term range
5. Collateral requirements must be satisfied

---

## Multilingual Support

### Language Codes
- `en` - English (default)
- `ru` - Russian  
- `kg` - Kyrgyz

### Multilingual Fields

#### Credit Program Names
```typescript
interface MultilingualNames {
  nameEn: string;    // "Small Business Loan Program"
  nameRu: string;    // "Программа кредитования малого бизнеса"
  nameKg: string;    // "Чакан бизнес кредиттөө программасы"
}
```

#### Collateral Requirements
```typescript
interface MultilingualCollateralRequirements {
  collateralValuationRequirementsEn?: string;
  collateralValuationRequirementsRu?: string; 
  collateralValuationRequirementsKg?: string;
}
```

### Using Language Headers

Send the `Accept-Language` header to get localized enum values:

```http
GET /api/credit-programs/123
Accept-Language: ru
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

### Status Localization

ProgramStatus enum provides localized names:

```typescript
const statusLabels = {
  DRAFT: {
    en: "Draft",
    ru: "Черновик", 
    kg: "Долбоор"
  },
  ACTIVE: {
    en: "Active",
    ru: "Активный",
    kg: "Активдүү"  
  }
  // ... other statuses
};
```

### Frontend Implementation

```typescript
// Utility function to get localized name
function getLocalizedName(item: any, language: string = 'en'): string {
  switch (language) {
    case 'ru': return item.nameRu || item.nameEn;
    case 'kg': return item.nameKg || item.nameEn;
    default: return item.nameEn;
  }
}

// Utility function to get localized status
function getLocalizedStatus(status: ProgramStatus, language: string = 'en'): string {
  return statusLabels[status][language] || statusLabels[status].en;
}

// Example usage in React component
const CreditProgramCard = ({ program, language }) => {
  return (
    <div>
      <h3>{getLocalizedName(program, language)}</h3>
      <span>{getLocalizedStatus(program.status, language)}</span>
    </div>
  );
};
```

---

## Frontend Integration Guidelines

### State Management Recommendations

#### Redux Toolkit Example
```typescript
// creditProgramSlice.ts
interface CreditProgramState {
  programs: CreditProgramResponseDto[];
  currentProgram: CreditProgramResponseDto | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
  filters: CreditProgramSearchDto;
}

const creditProgramSlice = createSlice({
  name: 'creditPrograms',
  initialState,
  reducers: {
    setPrograms: (state, action) => {
      state.programs = action.payload.content;
      state.pagination = {
        page: action.payload.number,
        size: action.payload.size,
        totalElements: action.payload.totalElements,
        totalPages: action.payload.totalPages,
      };
    },
    setCurrentProgram: (state, action) => {
      state.currentProgram = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    }
  }
});
```

#### API Service Example
```typescript
// creditProgramApi.ts
class CreditProgramApi {
  private baseUrl = '/api/credit-programs';

  async getAll(params?: { page?: number; size?: number; sort?: string }) {
    const response = await fetch(`${this.baseUrl}?${new URLSearchParams(params)}`);
    return response.json();
  }

  async search(searchDto: CreditProgramSearchDto, params?: PaginationParams) {
    const response = await fetch(`${this.baseUrl}/search?${new URLSearchParams(params)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(searchDto)
    });
    return response.json();
  }

  async create(createDto: CreateCreditProgramDto) {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createDto)
    });
    return response.json();
  }

  async updateStatus(id: string, statusDto: CreditProgramStatusUpdateDto) {
    const response = await fetch(`${this.baseUrl}/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(statusDto)
    });
    return response.json();
  }
}
```

### Form Validation

#### React Hook Form Example
```typescript
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const createCreditProgramSchema = yup.object({
  nameEn: yup.string()
    .required('English name is required')
    .max(100, 'Name cannot exceed 100 characters'),
  nameRu: yup.string()
    .required('Russian name is required')
    .max(100, 'Name cannot exceed 100 characters'),
  nameKg: yup.string()
    .required('Kyrgyz name is required')
    .max(100, 'Name cannot exceed 100 characters'),
  amountMin: yup.number()
    .positive('Minimum amount must be positive')
    .nullable(),
  amountMax: yup.number()
    .positive('Maximum amount must be positive')
    .nullable()
    .test('amount-range', 'Maximum amount must be greater than minimum', function(value) {
      const { amountMin } = this.parent;
      return !value || !amountMin || value > amountMin;
    }),
  collateralRequired: yup.boolean().required('Collateral requirement must be specified'),
  acceptedCollateralTypes: yup.array()
    .when('collateralRequired', {
      is: true,
      then: yup.array().min(1, 'At least one collateral type must be selected'),
      otherwise: yup.array()
    })
});

const CreateCreditProgramForm = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: yupResolver(createCreditProgramSchema)
  });

  const collateralRequired = watch('collateralRequired');

  const onSubmit = async (data: CreateCreditProgramDto) => {
    try {
      await creditProgramApi.create(data);
      // Handle success
    } catch (error) {
      // Handle error
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields with validation */}
    </form>
  );
};
```

### Status Badge Component
```typescript
const StatusBadge = ({ status, language = 'en' }) => {
  const getStatusColor = (status: ProgramStatus) => {
    switch (status) {
      case 'DRAFT': return 'gray';
      case 'PENDING_APPROVAL': return 'yellow';
      case 'APPROVED': return 'blue';  
      case 'ACTIVE': return 'green';
      case 'SUSPENDED': return 'orange';
      case 'CLOSED': return 'red';
      case 'CANCELLED': return 'red';
      case 'REJECTED': return 'red';
      default: return 'gray';
    }
  };

  return (
    <span className={`badge badge-${getStatusColor(status)}`}>
      {getLocalizedStatus(status, language)}
    </span>
  );
};
```

### Data Table Component
```typescript
const CreditProgramTable = ({ programs, onSort, onPageChange }) => {
  const columns = [
    { key: 'nameEn', title: 'Name', sortable: true },
    { key: 'status', title: 'Status', sortable: true },
    { key: 'currencyCode', title: 'Currency', sortable: false },
    { key: 'amountMin', title: 'Min Amount', sortable: true },
    { key: 'amountMax', title: 'Max Amount', sortable: true },
    { key: 'validFrom', title: 'Valid From', sortable: true },
    { key: 'validTo', title: 'Valid To', sortable: true },
    { key: 'actions', title: 'Actions', sortable: false }
  ];

  return (
    <DataTable 
      data={programs}
      columns={columns}
      onSort={onSort}
      onPageChange={onPageChange}
      renderCell={(program, column) => {
        switch (column.key) {
          case 'status':
            return <StatusBadge status={program.status} />;
          case 'actions':
            return <ActionButtons program={program} />;
          default:
            return program[column.key];
        }
      }}
    />
  );
};
```

### Search and Filter Component
```typescript
const CreditProgramFilters = ({ onFilter, initialFilters = {} }) => {
  const [filters, setFilters] = useState<CreditProgramSearchDto>(initialFilters);

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  return (
    <div className="filters-panel">
      <SearchInput 
        placeholder="Search programs..."
        value={filters.searchTerm}
        onChange={(value) => handleFilterChange('searchTerm', value)}
      />
      
      <StatusSelect
        value={filters.status}
        onChange={(value) => handleFilterChange('status', value)}
      />
      
      <DateRangePicker
        startDate={filters.validFromStart}
        endDate={filters.validFromEnd}
        onChange={(start, end) => {
          handleFilterChange('validFromStart', start);
          handleFilterChange('validFromEnd', end);
        }}
      />
      
      <AmountRangeSlider
        min={filters.minAmount}
        max={filters.maxAmount}
        onChange={(min, max) => {
          handleFilterChange('minAmount', min);
          handleFilterChange('maxAmount', max);
        }}
      />
    </div>
  );
};
```

### Error Handling
```typescript
const useApiErrorHandler = () => {
  const handleApiError = (error: any) => {
    if (error.status === 400 && error.errors) {
      // Field validation errors
      return error.errors.reduce((acc, err) => ({
        ...acc,
        [err.field]: err.message
      }), {});
    } else if (error.status === 422 && error.details) {
      // Business validation errors
      return { _general: error.details.join(', ') };
    } else if (error.status === 403) {
      return { _general: 'Access denied. Insufficient permissions.' };
    } else if (error.status === 404) {
      return { _general: 'Credit program not found.' };
    } else {
      return { _general: 'An unexpected error occurred.' };
    }
  };

  return { handleApiError };
};
```

### Performance Optimization Tips

1. **Use React.memo** for expensive components
2. **Implement virtual scrolling** for large data sets
3. **Debounce search inputs** to avoid excessive API calls
4. **Use React Query or SWR** for data fetching and caching
5. **Implement optimistic updates** for better UX
6. **Lazy load heavy components** like charts and statistics

### Accessibility Considerations

1. **Proper ARIA labels** for form fields and buttons
2. **Keyboard navigation** support for all interactive elements  
3. **Screen reader compatibility** for status indicators
4. **Color contrast compliance** for status badges
5. **Focus management** in modals and forms
6. **Semantic HTML** structure for better navigation

This completes the comprehensive Credit Program API manual for frontend implementation.