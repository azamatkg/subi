# Decision Management API Documentation
## Frontend Integration Guide for React Application

**Base URL:** `http://localhost:8080`
**Authentication:** JWT Bearer Token required for all endpoints
**Content-Type:** `application/json`

---

## 🔐 Authentication & Authorization

All decision-related endpoints require:
- **JWT Token:** Include in header: `Authorization: Bearer {token}`
- **Admin Role Required:** `@PreAuthorize("hasRole('ADMIN')")` for all endpoints
- **CORS Enabled:** Origins `*` allowed for development

---

## 📋 Table of Contents

1. [Decision Management API](#1-decision-management-api) (`/api/decisions/**`)
2. [Decision Types API](#2-decision-types-api) (`/api/decision-types/**`)
3. [Decision Making Bodies API](#3-decision-making-bodies-api) (`/api/decision-making-bodies/**`)
4. [TypeScript Interfaces](#4-typescript-interfaces)
5. [Error Handling](#5-error-handling)
6. [Usage Examples](#6-usage-examples)

---

## 1. Decision Management API

### Base Path: `/api/decisions`

#### 1.1 Create Decision
```http
POST /api/decisions
```

**Request Body:**
```json
{
  "nameEn": "Credit Committee Decision Q1 2024",
  "nameRu": "Решение кредитного комитета I кв. 2024",
  "nameKg": "Кредит комитетинин чечими I кв. 2024",
  "date": "2024-03-15",
  "number": "CC-2024-001",
  "decisionMakingBodyId": 1,
  "decisionTypeId": 2,
  "note": "Quarterly credit policy decisions",
  "status": "DRAFT",
  "documentPackageId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response:** `201 Created`
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "nameEn": "Credit Committee Decision Q1 2024",
  "nameRu": "Решение кредитного комитета I кв. 2024",
  "nameKg": "Кредит комитетинин чечими I кв. 2024",
  "date": "2024-03-15",
  "number": "CC-2024-001",
  "decisionMakingBodyNameEn": "Credit Committee",
  "decisionMakingBodyNameRu": "Кредитный комитет",
  "decisionMakingBodyNameKg": "Кредит комитети",
  "decisionTypeNameEn": "Policy Decision",
  "decisionTypeNameRu": "Политическое решение",
  "decisionTypeNameKg": "Саясий чечим",
  "note": "Quarterly credit policy decisions",
  "status": "DRAFT",
  "documentPackageId": "550e8400-e29b-41d4-a716-446655440000"
}
```

#### 1.2 Get Decision by ID
```http
GET /api/decisions/{id}
```

**Path Parameters:**
- `id` (UUID, required): Decision unique identifier

**Response:** `200 OK` - Same structure as create response

#### 1.3 Get All Decisions (Paginated)
```http
GET /api/decisions?page=0&size=20&sort=date,desc
```

**Query Parameters:**
- `page` (integer, optional, default=0): Page number
- `size` (integer, optional, default=20): Page size
- `sort` (string, optional): Sort criteria (e.g., `date,desc`, `nameEn,asc`)

**Response:** `200 OK`
```json
{
  "content": [...], // Array of DecisionResponseDto
  "pageable": {
    "sort": {"sorted": true, "unsorted": false},
    "pageNumber": 0,
    "pageSize": 20
  },
  "totalElements": 150,
  "totalPages": 8,
  "last": false,
  "first": true
}
```

#### 1.4 Search Decisions
```http
GET /api/decisions/search?searchTerm=credit&page=0&size=20
```

**Query Parameters:**
- `searchTerm` (string, required): Search term for names or numbers
- `page`, `size`, `sort`: Pagination parameters

**Response:** `200 OK` - Paginated results

#### 1.5 Advanced Search & Filter
```http
GET /api/decisions/search-and-filter?searchTerm=credit&decisionMakingBodyId=1&decisionTypeId=2&status=APPROVED&page=0&size=20
```

**Query Parameters:**
- `searchTerm` (string, optional): Search term
- `decisionMakingBodyId` (Long, optional): Filter by decision making body
- `decisionTypeId` (Long, optional): Filter by decision type
- `status` (DecisionStatus, optional): Filter by status
- Pagination parameters

**Response:** `200 OK` - Paginated results

#### 1.6 Update Decision
```http
PUT /api/decisions/{id}
```

**Path Parameters:**
- `id` (UUID, required): Decision ID to update

**Request Body:** (All fields optional for updates)
```json
{
  "nameEn": "Updated Credit Committee Decision",
  "status": "APPROVED"
}
```

**Response:** `200 OK` - Updated decision object

#### 1.7 Delete Decision
```http
DELETE /api/decisions/{id}
```

**Path Parameters:**
- `id` (UUID, required): Decision ID to delete

**Response:** `204 No Content`

#### 1.8 Check Decision Existence by Number
```http
GET /api/decisions/exists/number/{number}
```

**Path Parameters:**
- `number` (string, required): Decision number to check (URL encoded)

**Response:** `200 OK`
```json
true
```

---

## 2. Decision Types API

### Base Path: `/api/decision-types`

#### 2.1 Create Decision Type
```http
POST /api/decision-types
```

**Request Body:**
```json
{
  "nameEn": "Policy Decision",
  "nameRu": "Политическое решение",
  "nameKg": "Саясий чечим",
  "description": "Decisions related to organizational policies",
  "status": "ACTIVE"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "nameEn": "Policy Decision",
  "nameRu": "Политическое решение", 
  "nameKg": "Саясий чечим",
  "description": "Decisions related to organizational policies",
  "status": "ACTIVE",
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:30:00"
}
```

#### 2.2 Get Decision Type by ID
```http
GET /api/decision-types/{id}
```

#### 2.3 Get All Decision Types (Paginated)
```http
GET /api/decision-types?page=0&size=20
```

#### 2.4 Get Active Decision Types Only
```http
GET /api/decision-types/active?page=0&size=50
```

#### 2.5 Search Decision Types
```http
GET /api/decision-types/search?searchTerm=policy&page=0&size=20
```

#### 2.6 Update Decision Type
```http
PUT /api/decision-types/{id}
```

#### 2.7 Delete Decision Type
```http
DELETE /api/decision-types/{id}
```

#### 2.8 Check Existence by Russian Name
```http
GET /api/decision-types/exists/name-ru/{nameRu}
```

---

## 3. Decision Making Bodies API

### Base Path: `/api/decision-making-bodies`

#### 3.1 Create Decision Making Body
```http
POST /api/decision-making-bodies
```

**Request Body:**
```json
{
  "nameEn": "Credit Committee",
  "nameRu": "Кредитный комитет",
  "nameKg": "Кредит комитети",
  "description": "Committee responsible for credit decisions",
  "status": "ACTIVE"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "nameEn": "Credit Committee",
  "nameRu": "Кредитный комитет",
  "nameKg": "Кредит комитети", 
  "description": "Committee responsible for credit decisions",
  "status": "ACTIVE",
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:30:00"
}
```

#### 3.2 Get Decision Making Body by ID
```http
GET /api/decision-making-bodies/{id}
```

#### 3.3 Get All Decision Making Bodies (Paginated)
```http
GET /api/decision-making-bodies?page=0&size=20
```

#### 3.4 Get Active Decision Making Bodies Only
```http
GET /api/decision-making-bodies/active?page=0&size=50
```

#### 3.5 Search Decision Making Bodies
```http
GET /api/decision-making-bodies/search?searchTerm=credit&page=0&size=20
```

#### 3.6 Update Decision Making Body
```http
PUT /api/decision-making-bodies/{id}
```

#### 3.7 Delete Decision Making Body
```http
DELETE /api/decision-making-bodies/{id}
```

#### 3.8 Check Existence by Russian Name
```http
GET /api/decision-making-bodies/exists/name-ru/{nameRu}
```

---

## 4. TypeScript Interfaces

### 4.1 Decision Interfaces

```typescript
// Enums
export enum DecisionStatus {
  DRAFT = 'DRAFT',
  PENDING_CONFIRMATION = 'PENDING_CONFIRMATION', 
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export enum ReferenceEntityStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

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
  decisionMakingBodyNameEn: string;
  decisionMakingBodyNameRu: string;
  decisionMakingBodyNameKg: string;
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
```

### 4.2 Decision Type Interfaces

```typescript
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
```

### 4.3 Decision Making Body Interfaces

```typescript
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
```

### 4.4 Pagination Interface

```typescript
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
```

---

## 5. Error Handling

### 5.1 Common Error Responses

#### Validation Error (400 Bad Request)
```json
{
  "timestamp": "2024-01-15T10:30:00.000+00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/decisions",
  "errors": [
    {
      "field": "nameEn",
      "rejectedValue": "",
      "message": "English name is required"
    },
    {
      "field": "date", 
      "rejectedValue": null,
      "message": "Decision date is required"
    }
  ]
}
```

#### Unauthorized (401)
```json
{
  "timestamp": "2024-01-15T10:30:00.000+00:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "JWT token is missing or invalid",
  "path": "/api/decisions"
}
```

#### Forbidden (403)
```json
{
  "timestamp": "2024-01-15T10:30:00.000+00:00",
  "status": 403,
  "error": "Forbidden", 
  "message": "Access denied. ADMIN role required",
  "path": "/api/decisions"
}
```

#### Not Found (404)
```json
{
  "timestamp": "2024-01-15T10:30:00.000+00:00",
  "status": 404,
  "error": "Not Found",
  "message": "Decision not found with id: 123e4567-e89b-12d3-a456-426614174000",
  "path": "/api/decisions/123e4567-e89b-12d3-a456-426614174000"
}
```

#### Conflict (409)
```json
{
  "timestamp": "2024-01-15T10:30:00.000+00:00",
  "status": 409,
  "error": "Conflict",
  "message": "Decision with number 'CC-2024-001' already exists",
  "path": "/api/decisions"
}
```

### 5.2 Field Validation Rules

#### Decision Validation
- `nameEn`, `nameRu`, `nameKg`: Required, max 100 characters
- `date`: Required, valid date format
- `number`: Required, max 50 characters, must be unique
- `decisionMakingBodyId`: Required, must exist
- `decisionTypeId`: Required, must exist  
- `note`: Optional, max 1000 characters
- `status`: Required, valid DecisionStatus enum value

#### Reference Data Validation
- `nameEn`, `nameRu`, `nameKg`: Required, max 100 characters
- `description`: Optional, max 500 characters
- `status`: Required, valid ReferenceEntityStatus enum value

---

## 6. Usage Examples

### 6.1 React Component Example - Decision List

```typescript
import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface DecisionListProps {
  token: string;
}

const DecisionList: React.FC<DecisionListProps> = ({ token }) => {
  const [decisions, setDecisions] = useState<PageableResponse<DecisionResponseDto>>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiClient = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  useEffect(() => {
    fetchDecisions();
  }, []);

  const fetchDecisions = async (page = 0, size = 20) => {
    try {
      setLoading(true);
      const response = await apiClient.get<PageableResponse<DecisionResponseDto>>(
        `/decisions?page=${page}&size=${size}&sort=date,desc`
      );
      setDecisions(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch decisions');
    } finally {
      setLoading(false);
    }
  };

  const searchDecisions = async (searchTerm: string) => {
    try {
      setLoading(true);
      const response = await apiClient.get<PageableResponse<DecisionResponseDto>>(
        `/decisions/search?searchTerm=${encodeURIComponent(searchTerm)}&page=0&size=20`
      );
      setDecisions(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Decisions</h2>
      {decisions?.content.map(decision => (
        <div key={decision.id}>
          <h3>{decision.nameEn}</h3>
          <p>Number: {decision.number}</p>
          <p>Date: {decision.date}</p>
          <p>Status: {decision.status}</p>
          <p>Body: {decision.decisionMakingBodyNameEn}</p>
          <p>Type: {decision.decisionTypeNameEn}</p>
        </div>
      ))}
      
      {/* Pagination controls */}
      <div>
        Page {(decisions?.pageable.pageNumber ?? 0) + 1} of {decisions?.totalPages}
      </div>
    </div>
  );
};

export default DecisionList;
```

### 6.2 Create Decision Form Example

```typescript
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const decisionSchema = yup.object({
  nameEn: yup.string().required('English name is required').max(100),
  nameRu: yup.string().required('Russian name is required').max(100),
  nameKg: yup.string().required('Kyrgyz name is required').max(100),
  date: yup.date().required('Date is required'),
  number: yup.string().required('Number is required').max(50),
  decisionMakingBodyId: yup.number().required('Decision making body is required'),
  decisionTypeId: yup.number().required('Decision type is required'),
  note: yup.string().max(1000),
  status: yup.mixed<DecisionStatus>().oneOf(Object.values(DecisionStatus)).required()
});

interface CreateDecisionFormProps {
  token: string;
  onSuccess: () => void;
}

const CreateDecisionForm: React.FC<CreateDecisionFormProps> = ({ token, onSuccess }) => {
  const [submitting, setSubmitting] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<CreateDecisionDto>({
    resolver: yupResolver(decisionSchema)
  });

  const onSubmit = async (data: CreateDecisionDto) => {
    try {
      setSubmitting(true);
      const response = await axios.post<DecisionResponseDto>(
        'http://localhost:8080/api/decisions',
        data,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Decision created:', response.data);
      onSuccess();
    } catch (err: any) {
      console.error('Failed to create decision:', err.response?.data);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>English Name:</label>
        <input {...register('nameEn')} />
        {errors.nameEn && <span>{errors.nameEn.message}</span>}
      </div>
      
      <div>
        <label>Russian Name:</label>
        <input {...register('nameRu')} />
        {errors.nameRu && <span>{errors.nameRu.message}</span>}
      </div>
      
      <div>
        <label>Kyrgyz Name:</label>
        <input {...register('nameKg')} />
        {errors.nameKg && <span>{errors.nameKg.message}</span>}
      </div>
      
      <div>
        <label>Date:</label>
        <input type="date" {...register('date')} />
        {errors.date && <span>{errors.date.message}</span>}
      </div>
      
      <div>
        <label>Number:</label>
        <input {...register('number')} />
        {errors.number && <span>{errors.number.message}</span>}
      </div>
      
      <div>
        <label>Status:</label>
        <select {...register('status')}>
          {Object.values(DecisionStatus).map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        {errors.status && <span>{errors.status.message}</span>}
      </div>
      
      <button type="submit" disabled={submitting}>
        {submitting ? 'Creating...' : 'Create Decision'}
      </button>
    </form>
  );
};

export default CreateDecisionForm;
```

### 6.3 Advanced Search Hook Example

```typescript
import { useState, useCallback } from 'react';
import axios from 'axios';

interface UseDecisionSearchProps {
  token: string;
}

export const useDecisionSearch = ({ token }: UseDecisionSearchProps) => {
  const [results, setResults] = useState<PageableResponse<DecisionResponseDto>>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiClient = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  const search = useCallback(async (criteria: SearchAndFilterDto, page = 0, size = 20) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (criteria.searchTerm) params.append('searchTerm', criteria.searchTerm);
      if (criteria.decisionMakingBodyId) params.append('decisionMakingBodyId', criteria.decisionMakingBodyId.toString());
      if (criteria.decisionTypeId) params.append('decisionTypeId', criteria.decisionTypeId.toString());
      if (criteria.status) params.append('status', criteria.status);
      params.append('page', page.toString());
      params.append('size', size.toString());

      const response = await apiClient.get<PageableResponse<DecisionResponseDto>>(
        `/decisions/search-and-filter?${params.toString()}`
      );
      
      setResults(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  }, [apiClient]);

  return { results, loading, error, search };
};
```

---

## 📝 Additional Notes

### Multilingual Support
All decision-related entities support three languages:
- **English (En):** Primary for international use
- **Russian (Ru):** Secondary for regional use  
- **Kyrgyz (Kg):** Local language support

### Date Formats
- **API:** ISO date format `YYYY-MM-DD`
- **Frontend:** Use date picker components with proper locale formatting

### URL Encoding
When passing decision numbers or names in URL paths, ensure proper URL encoding:
```typescript
const encodedNumber = encodeURIComponent(decisionNumber);
```

### Pagination Best Practices
- Default page size: 20
- Maximum recommended page size: 100
- Always handle pagination metadata for UI controls

### Error Handling
- Implement global error handling for common HTTP status codes
- Show user-friendly error messages
- Handle network errors and timeouts gracefully