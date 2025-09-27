# Reference Data API Manual for Frontend Integration

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Common Response Patterns](#common-response-patterns)
4. [Error Handling](#error-handling)
5. [Pagination & Search](#pagination--search)
6. [Multilingual Support](#multilingual-support)
7. [API Endpoints](#api-endpoints)
   - [Currencies](#currencies)
   - [Credit Purposes](#credit-purposes)
   - [Document Types](#document-types)
   - [Decision Making Bodies](#decision-making-bodies)
   - [Decision Types](#decision-types)
   - [Floating Rate Types](#floating-rate-types)
   - [Repayment Orders](#repayment-orders)
8. [Data Models & Enums](#data-models--enums)
9. [Frontend Integration Guidelines](#frontend-integration-guidelines)

## Overview

This manual provides comprehensive documentation for all reference data API endpoints in the ASUBK (Financial Application Management System). These endpoints are designed for a React.js frontend and follow RESTful conventions with JWT authentication.

**Base URL**: `http://localhost:8080`

**Key Features**:
- JWT-based authentication
- Multilingual support (English, Russian, Kyrgyz)
- Comprehensive CRUD operations
- Advanced search and filtering
- Pagination support
- Status management (ACTIVE/INACTIVE)

## Authentication

All reference data endpoints require authentication except the login endpoint.

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "type": "Bearer",
  "username": "admin",
  "email": "admin@example.com",
  "fullName": "System Administrator",
  "roles": ["ROLE_ADMIN"],
  "expiresIn": 86400
}
```

### Using JWT Token
Include the token in all subsequent requests:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

### Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

## Common Response Patterns

### Single Item Response
```json
{
  "id": 1,
  "version": 0,
  "nameEn": "US Dollar",
  "nameRu": "Доллар США",
  "nameKg": "АКШ доллары",
  "status": "ACTIVE",
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:30:00",
  "createdByUsername": "admin",
  "updatedByUsername": null
}
```

### Paginated Response
```json
{
  "content": [
    {
      "id": 1,
      "nameEn": "US Dollar",
      "status": "ACTIVE"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20,
    "sort": {
      "empty": false,
      "sorted": true,
      "unsorted": false
    }
  },
  "totalElements": 25,
  "totalPages": 2,
  "first": true,
  "last": false,
  "size": 20,
  "number": 0,
  "numberOfElements": 20,
  "empty": false
}
```

## Error Handling

### Validation Errors (400 Bad Request)
```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/currencies",
  "errors": [
    {
      "field": "code",
      "message": "Currency code is required"
    },
    {
      "field": "nameEn",
      "message": "English name must not exceed 100 characters"
    }
  ]
}
```

### Not Found (404)
```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 404,
  "error": "Not Found",
  "message": "Currency not found with ID: 999",
  "path": "/api/currencies/999"
}
```

### Unauthorized (401)
```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "JWT token is missing or invalid",
  "path": "/api/currencies"
}
```

### Forbidden (403)
```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 403,
  "error": "Forbidden",
  "message": "Access denied. Admin role required",
  "path": "/api/currencies"
}
```

## Pagination & Search

### Pagination Parameters
- `page`: Page number (0-based, default: 0)
- `size`: Items per page (default: 20)
- `sort`: Sorting criteria (e.g., `nameRu,asc`)

### Example Pagination Request
```http
GET /api/currencies?page=0&size=10&sort=nameRu,asc
```

### Search Parameters
- `searchTerm`: Search across name fields (English, Russian, Kyrgyz)

### Example Search Request
```http
GET /api/currencies/search?searchTerm=dollar&page=0&size=20
```

## Multilingual Support

All reference entities support three languages:
- **nameEn**: English name
- **nameRu**: Russian name
- **nameKg**: Kyrgyz name

### Status Enum Localization
```javascript
const ReferenceEntityStatus = {
  ACTIVE: {
    nameEn: "Active",
    nameRu: "Активный",
    nameKg: "Активдүү"
  },
  INACTIVE: {
    nameEn: "Inactive",
    nameRu: "Неактивный",
    nameKg: "Активдүү эмес"
  }
};
```

## API Endpoints

## Currencies

**Base Path**: `/api/currencies`

### Get All Currencies
```http
GET /api/currencies?page=0&size=20&sort=code,asc
Authorization: Bearer <token>
```

**Response:**
```json
{
  "content": [
    {
      "id": 1,
      "version": 0,
      "code": "USD",
      "nameEn": "US Dollar",
      "nameRu": "Доллар США",
      "nameKg": "АКШ доллары",
      "description": "United States Dollar currency",
      "status": "ACTIVE",
      "createdAt": "2024-01-15T10:30:00",
      "updatedAt": "2024-01-15T10:30:00",
      "createdByUsername": "admin",
      "updatedByUsername": null,
      "isReferencedByCreditPrograms": false
    }
  ],
  "totalElements": 1,
  "totalPages": 1,
  "first": true,
  "last": true,
  "size": 20,
  "number": 0
}
```

### Get Currency by ID
```http
GET /api/currencies/1
Authorization: Bearer <token>
```

### Get Currency by Code
```http
GET /api/currencies/code/USD
Authorization: Bearer <token>
```

### Get Active Currencies
```http
GET /api/currencies/active
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": 1,
    "code": "USD",
    "nameEn": "US Dollar",
    "nameRu": "Доллар США",
    "nameKg": "АКШ доллары",
    "status": "ACTIVE"
  }
]
```

### Search Currencies
```http
GET /api/currencies/search?searchTerm=dollar&page=0&size=20
Authorization: Bearer <token>
```

### Create Currency (Admin Only)
```http
POST /api/currencies
Authorization: Bearer <token>
Content-Type: application/json

{
  "code": "EUR",
  "nameEn": "Euro",
  "nameRu": "Евро",
  "nameKg": "Евро",
  "description": "European Union currency",
  "status": "ACTIVE"
}
```

**Response:** Same as single currency response with HTTP 201 Created

### Update Currency (Admin Only)
```http
PUT /api/currencies/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "nameEn": "US Dollar (Updated)",
  "description": "Updated description"
}
```

### Delete Currency (Admin Only)
```http
DELETE /api/currencies/1
Authorization: Bearer <token>
```

**Response:** HTTP 204 No Content

### Check Currency Exists by Code
```http
GET /api/currencies/exists/code/USD
Authorization: Bearer <token>
```

**Response:**
```json
true
```

### Check if Currency is Referenced (Admin Only)
```http
GET /api/currencies/1/referenced
Authorization: Bearer <token>
```

**Response:**
```json
false
```

## Credit Purposes

**Base Path**: `/api/credit-purposes`

### Get All Credit Purposes
```http
GET /api/credit-purposes?page=0&size=20
Authorization: Bearer <token>
```

### Get Active Credit Purposes
```http
GET /api/credit-purposes/active
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": 1,
    "nameEn": "Business Development",
    "nameRu": "Развитие бизнеса",
    "nameKg": "Бизнести өнүктүрүү",
    "description": "Loans for business expansion and development",
    "status": "ACTIVE",
    "isReferencedByCreditPrograms": false
  }
]
```

### Create Credit Purpose (Admin Only)
```http
POST /api/credit-purposes
Authorization: Bearer <token>
Content-Type: application/json

{
  "nameEn": "Agricultural Development",
  "nameRu": "Сельскохозяйственное развитие",
  "nameKg": "Айыл чарба өнүгүүсү",
  "description": "Loans for agricultural projects",
  "status": "ACTIVE"
}
```

### Update Credit Purpose (Admin Only)
```http
PUT /api/credit-purposes/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "description": "Updated description for business development loans"
}
```

### Delete Credit Purpose (Admin Only)
```http
DELETE /api/credit-purposes/1
Authorization: Bearer <token>
```

### Search Credit Purposes
```http
GET /api/credit-purposes/search?searchTerm=business&page=0&size=20
Authorization: Bearer <token>
```

## Document Types

**Base Path**: `/api/document-types`

Document types are more complex entities that include metadata fields and category classifications.

### Get All Document Types
```http
GET /api/document-types?page=0&size=20
Authorization: Bearer <token>
```

### Get Active Document Types
```http
GET /api/document-types/active
Authorization: Bearer <token>
```

### Get Document Types by Category and Applicant Type
```http
GET /api/document-types/by-category-and-applicant?category=CREDIT&applicantType=INDIVIDUAL
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "passport",
    "nameEn": "Passport",
    "nameRu": "Паспорт",
    "nameKg": "Паспорт",
    "description": "Identity document for individuals",
    "category": "CREDIT",
    "collateralType": null,
    "applicantType": "INDIVIDUAL",
    "mandatory": true,
    "externalCollection": false,
    "internalCollection": true,
    "metadataFields": [
      {
        "name": "passportNumber",
        "labelEn": "Passport Number",
        "labelRu": "Номер паспорта",
        "labelKg": "Паспорт номери",
        "fieldType": "TEXT",
        "required": true,
        "validationPattern": "[A-Z]{2}\\d{7}",
        "minLength": 9,
        "maxLength": 9
      }
    ],
    "status": "ACTIVE"
  }
]
```

### Get Document Types Suitable for Applicant Type
```http
GET /api/document-types/suitable-for-applicant?applicantType=INDIVIDUAL&category=CREDIT
Authorization: Bearer <token>
```

### Create Document Type (Admin Only)
```http
POST /api/document-types
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "income_statement",
  "nameEn": "Income Statement",
  "nameRu": "Справка о доходах",
  "nameKg": "Киреше жөнүндө маалымат",
  "description": "Document showing monthly income",
  "category": "CREDIT",
  "applicantType": "INDIVIDUAL",
  "mandatory": true,
  "externalCollection": true,
  "internalCollection": false,
  "metadataFields": [
    {
      "name": "monthlyIncome",
      "labelEn": "Monthly Income",
      "labelRu": "Месячный доход",
      "labelKg": "Айлык киреше",
      "fieldType": "NUMBER",
      "required": true,
      "minValue": "1000",
      "maxValue": "1000000"
    }
  ],
  "status": "ACTIVE"
}
```

### Update Document Type (Admin Only)
```http
PUT /api/document-types/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <token>
Content-Type: application/json

{
  "description": "Updated passport document description",
  "mandatory": false
}
```

### Search Document Types
```http
GET /api/document-types/search?searchTerm=passport&page=0&size=20
Authorization: Bearer <token>
```

## Decision Making Bodies

**Base Path**: `/api/decision-making-bodies`

**Note**: All endpoints require ADMIN role.

### Get All Decision Making Bodies
```http
GET /api/decision-making-bodies?page=0&size=20
Authorization: Bearer <admin-token>
```

### Get Active Decision Making Bodies
```http
GET /api/decision-making-bodies/active?page=0&size=20
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "content": [
    {
      "id": 1,
      "nameEn": "Credit Committee",
      "nameRu": "Кредитный комитет",
      "nameKg": "Кредит комитети",
      "description": "Main decision making body for credit approvals",
      "status": "ACTIVE",
      "createdAt": "2024-01-15T10:30:00"
    }
  ]
}
```

### Create Decision Making Body (Admin Only)
```http
POST /api/decision-making-bodies
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "nameEn": "Board of Directors",
  "nameRu": "Совет директоров",
  "nameKg": "Директорлор кеңеши",
  "description": "Highest decision making authority",
  "status": "ACTIVE"
}
```

### Search Decision Making Bodies
```http
GET /api/decision-making-bodies/search?searchTerm=committee&page=0&size=20
Authorization: Bearer <admin-token>
```

### Check if Exists by Name
```http
GET /api/decision-making-bodies/exists/name-ru/Кредитный%20комитет
Authorization: Bearer <admin-token>
```

## Decision Types

**Base Path**: `/api/decision-types`

**Note**: All endpoints require ADMIN role.

### Get All Decision Types
```http
GET /api/decision-types?page=0&size=20
Authorization: Bearer <admin-token>
```

### Get Active Decision Types
```http
GET /api/decision-types/active?page=0&size=20
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "content": [
    {
      "id": 1,
      "nameEn": "Credit Approval",
      "nameRu": "Одобрение кредита",
      "nameKg": "Кредитти жактыруу",
      "description": "Decision type for credit approval processes",
      "status": "ACTIVE"
    }
  ]
}
```

### Create Decision Type (Admin Only)
```http
POST /api/decision-types
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "nameEn": "Risk Assessment",
  "nameRu": "Оценка рисков",
  "nameKg": "Тобокелдикти баалоо",
  "description": "Decision type for risk evaluation",
  "status": "ACTIVE"
}
```

## Floating Rate Types

**Base Path**: `/api/floating-rate-types`

### Get All Floating Rate Types
```http
GET /api/floating-rate-types?page=0&size=20
Authorization: Bearer <token>
```

### Get Active Floating Rate Types
```http
GET /api/floating-rate-types/active
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": 1,
    "nameEn": "LIBOR",
    "nameRu": "ЛИБОР",
    "nameKg": "ЛИБОР",
    "description": "London Interbank Offered Rate",
    "status": "ACTIVE",
    "isReferencedByCreditPrograms": true
  }
]
```

### Create Floating Rate Type (Admin Only)
```http
POST /api/floating-rate-types
Authorization: Bearer <token>
Content-Type: application/json

{
  "nameEn": "SOFR",
  "nameRu": "СОФР",
  "nameKg": "СОФР",
  "description": "Secured Overnight Financing Rate",
  "status": "ACTIVE"
}
```

### Search Floating Rate Types
```http
GET /api/floating-rate-types/search?searchTerm=LIBOR&page=0&size=20
Authorization: Bearer <token>
```

## Repayment Orders

**Base Path**: `/api/repayment-orders`

### Get All Repayment Orders
```http
GET /api/repayment-orders?page=0&size=20
Authorization: Bearer <token>
```

### Get Active Repayment Orders
```http
GET /api/repayment-orders/active
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": 1,
    "nameEn": "Principal First",
    "nameRu": "Сначала основной долг",
    "nameKg": "Алгач негизги карыз",
    "description": "Pay principal amount before interest",
    "status": "ACTIVE",
    "isReferencedByCreditPrograms": false
  }
]
```

### Create Repayment Order (Admin Only)
```http
POST /api/repayment-orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "nameEn": "Interest First",
  "nameRu": "Сначала проценты",
  "nameKg": "Алгач пайыздар",
  "description": "Pay interest before principal amount",
  "status": "ACTIVE"
}
```

## Data Models & Enums

### ReferenceEntityStatus
```javascript
const ReferenceEntityStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE"
};
```

### DocumentCategory
```javascript
const DocumentCategory = {
  CREDIT: "CREDIT",      // Credit-related documents
  COLLATERAL: "COLLATERAL" // Collateral-related documents
};
```

### ApplicantType
```javascript
const ApplicantType = {
  INDIVIDUAL: "INDIVIDUAL",     // Individual person
  LEGAL_ENTITY: "LEGAL_ENTITY", // Company/organization
  GROUP: "GROUP",               // Group of applicants
  ALL: "ALL"                    // Applicable to all types
};
```

### CollateralType
```javascript
const CollateralType = {
  REAL_ESTATE: "REAL_ESTATE", // Property/land
  VEHICLE: "VEHICLE",         // Cars, trucks, etc.
  LIVESTOCK: "LIVESTOCK"      // Animals/cattle
};
```

### Metadata Field Types
```javascript
const FieldFormat = {
  TEXT: "TEXT",
  NUMBER: "NUMBER",
  DATE: "DATE",
  BOOLEAN: "BOOLEAN",
  EMAIL: "EMAIL",
  PHONE: "PHONE",
  URL: "URL",
  TEXTAREA: "TEXTAREA",
  SELECT: "SELECT",
  MULTISELECT: "MULTISELECT",
  FILE: "FILE"
};
```

## Frontend Integration Guidelines

### React.js API Service Example

```javascript
// apiService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Handle token expiration
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication
  async login(username, password) {
    const response = await this.api.post('/auth/login', {
      username,
      password,
    });

    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }

    return response.data;
  }

  async logout() {
    await this.api.post('/auth/logout');
    localStorage.removeItem('authToken');
  }

  // Currencies
  async getCurrencies(page = 0, size = 20, sort = 'code,asc') {
    const response = await this.api.get('/currencies', {
      params: { page, size, sort }
    });
    return response.data;
  }

  async getActiveCurrencies() {
    const response = await this.api.get('/currencies/active');
    return response.data;
  }

  async createCurrency(currencyData) {
    const response = await this.api.post('/currencies', currencyData);
    return response.data;
  }

  async updateCurrency(id, currencyData) {
    const response = await this.api.put(`/currencies/${id}`, currencyData);
    return response.data;
  }

  async deleteCurrency(id) {
    await this.api.delete(`/currencies/${id}`);
  }

  async searchCurrencies(searchTerm, page = 0, size = 20) {
    const response = await this.api.get('/currencies/search', {
      params: { searchTerm, page, size }
    });
    return response.data;
  }

  // Credit Purposes
  async getCreditPurposes(page = 0, size = 20) {
    const response = await this.api.get('/credit-purposes', {
      params: { page, size }
    });
    return response.data;
  }

  async getActiveCreditPurposes() {
    const response = await this.api.get('/credit-purposes/active');
    return response.data;
  }

  // Document Types
  async getDocumentTypes(page = 0, size = 20) {
    const response = await this.api.get('/document-types', {
      params: { page, size }
    });
    return response.data;
  }

  async getDocumentTypesByCategory(category, applicantType) {
    const response = await this.api.get('/document-types/by-category-and-applicant', {
      params: { category, applicantType }
    });
    return response.data;
  }

  async getSuitableDocumentTypes(applicantType, category) {
    const response = await this.api.get('/document-types/suitable-for-applicant', {
      params: { applicantType, category }
    });
    return response.data;
  }
}

export default new ApiService();
```

### React Hook for Reference Data

```javascript
// useReferenceData.js
import { useState, useEffect } from 'react';
import ApiService from './apiService';

export const useReferenceData = (entityType, options = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      let response;

      switch (entityType) {
        case 'currencies':
          response = options.activeOnly
            ? await ApiService.getActiveCurrencies()
            : await ApiService.getCurrencies(options.page, options.size);
          break;
        case 'creditPurposes':
          response = options.activeOnly
            ? await ApiService.getActiveCreditPurposes()
            : await ApiService.getCreditPurposes(options.page, options.size);
          break;
        // Add other entity types as needed
        default:
          throw new Error(`Unknown entity type: ${entityType}`);
      }

      setData(options.activeOnly ? response : response.content);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [entityType, options.activeOnly, options.page, options.size]);

  return { data, loading, error, refetch: fetchData };
};
```

### Error Handling Component

```javascript
// ErrorHandler.jsx
import React from 'react';

const ErrorHandler = ({ error }) => {
  if (!error) return null;

  const getErrorMessage = (error) => {
    if (error.response?.data?.errors) {
      // Validation errors
      return error.response.data.errors.map(err =>
        `${err.field}: ${err.message}`
      ).join(', ');
    }

    if (error.response?.data?.message) {
      return error.response.data.message;
    }

    return error.message || 'An unexpected error occurred';
  };

  const getErrorSeverity = (error) => {
    const status = error.response?.status;
    if (status >= 500) return 'error';
    if (status >= 400) return 'warning';
    return 'info';
  };

  return (
    <div className={`alert alert-${getErrorSeverity(error)}`}>
      {getErrorMessage(error)}
    </div>
  );
};

export default ErrorHandler;
```

### Localization Helper

```javascript
// localizationHelper.js
export const getLocalizedName = (entity, language = 'en') => {
  const languageMap = {
    'en': 'nameEn',
    'ru': 'nameRu',
    'kg': 'nameKg'
  };

  const field = languageMap[language] || 'nameEn';
  return entity[field] || entity.nameEn || entity.name;
};

export const getLocalizedStatus = (status, language = 'en') => {
  const statusTranslations = {
    ACTIVE: {
      en: 'Active',
      ru: 'Активный',
      kg: 'Активдүү'
    },
    INACTIVE: {
      en: 'Inactive',
      ru: 'Неактивный',
      kg: 'Активдүү эмес'
    }
  };

  return statusTranslations[status]?.[language] || status;
};
```

### Best Practices

1. **Caching Strategy**: Cache reference data using React Query or SWR
2. **Error Boundaries**: Implement error boundaries for API failures
3. **Loading States**: Always show loading indicators during API calls
4. **Optimistic Updates**: Use optimistic updates for better UX
5. **Retry Logic**: Implement retry mechanism for failed requests
6. **Validation**: Validate form data before sending to API
7. **Localization**: Store user language preference and use consistently
8. **Security**: Never store sensitive data in localStorage
9. **Performance**: Use pagination for large datasets
10. **Testing**: Mock API responses for unit tests

### Environment Configuration

```javascript
// config.js
const config = {
  development: {
    API_BASE_URL: 'http://localhost:8080/api',
  },
  production: {
    API_BASE_URL: 'https://api.yourcompany.com/api',
  },
  staging: {
    API_BASE_URL: 'https://staging-api.yourcompany.com/api',
  }
};

export default config[process.env.NODE_ENV || 'development'];
```

---

**Note**: This manual covers all reference data endpoints. For business logic endpoints (applications, credit programs, decisions, etc.), refer to the respective API manuals.

**Last Updated**: January 2024
**Version**: 1.0
**Contact**: Backend Development Team