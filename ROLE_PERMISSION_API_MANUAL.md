# Role and Permission API Endpoints Manual

## Table of Contents
1. [Authentication & Authorization](#authentication--authorization)
2. [Base URL and Common Headers](#base-url-and-common-headers)
3. [Data Types and Enums](#data-types-and-enums)
4. [API Endpoints](#api-endpoints)
5. [Request/Response Examples](#requestresponse-examples)
6. [Error Handling](#error-handling)
7. [Default System Data](#default-system-data)
8. [Business Rules and Workflows](#business-rules-and-workflows)
9. [Frontend Integration Guidelines](#frontend-integration-guidelines)

---

## Authentication & Authorization

### Authentication Method
The API uses **JWT Bearer Token** authentication. All requests must include the Authorization header:

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
    "username": "admin",
    "roles": ["ADMIN"]
  },
  "expiresIn": 86400
}
```

### Authorization Requirements

#### Admin Only Access
**All role and permission endpoints require ADMIN role:**
- `POST /api/roles/*` - All role management operations
- `POST /api/permissions/*` - All permission management operations
- Only users with `ADMIN` role can access these endpoints

#### Role Hierarchy
```typescript
const roleHierarchy = {
  ADMIN: "Full system access, can manage roles and permissions",
  CREDIT_MANAGER: "Advanced credit management, cannot manage roles/permissions",
  CREDIT_ANALYST: "Credit program analysis, cannot manage roles/permissions", 
  MODERATOR: "Limited administrative access, cannot manage roles/permissions",
  DECISION_MAKER: "Decision approval authority, cannot manage roles/permissions",
  USER: "Basic user access, cannot manage roles/permissions"
};
```

---

## Base URL and Common Headers

### Base URLs
```
http://localhost:8080/api/roles
http://localhost:8080/api/permissions
```

### Required Headers
```http
Content-Type: application/json
Authorization: Bearer <jwt-token>
Accept: application/json
```

### Optional Headers
```http
X-Request-ID: <unique-id>  # For request tracking
```

### CORS Support
The API supports cross-origin requests with the following configuration:
- **Allowed Origins:** `*`
- **Allowed Methods:** `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`
- **Allowed Headers:** `*`

---

## Data Types and Enums

### Core Data Types
```typescript
interface UUID {
  format: string; // "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}

interface LocalDateTime {
  format: string; // "yyyy-MM-dd'T'HH:mm:ss"
}
```

### Role Data Transfer Objects
```typescript
interface CreateRoleDto {
  name: string;                 // Required, 2-50 chars, unique
  description?: string;         // Optional, max 255 chars
  permissionIds?: UUID[];       // Optional, UUIDs of permissions to assign
}

interface UpdateRoleDto {
  name?: string;                // Optional, 2-50 chars, unique
  description?: string;         // Optional, max 255 chars
  permissionIds?: UUID[];       // Optional, UUIDs of permissions to assign
}

interface RoleResponseDto {
  id: UUID;
  name: string;
  description: string;
  permissions: PermissionResponseDto[];
  createdAt: LocalDateTime;
  updatedAt: LocalDateTime;
}
```

### Permission Data Transfer Objects
```typescript
interface CreatePermissionDto {
  name: string;                 // Required, 3-50 chars, unique
  description?: string;         // Optional, max 255 chars
}

interface UpdatePermissionDto {
  name?: string;                // Optional, 3-50 chars, unique
  description?: string;         // Optional, max 255 chars
}

interface PermissionResponseDto {
  id: UUID;
  name: string;
  description: string;
  createdAt: LocalDateTime;
  updatedAt: LocalDateTime;
}
```

### Validation Rules
- **Role names**: 2-50 characters, unique, required for creation
- **Permission names**: 3-50 characters, unique, required for creation
- **Descriptions**: Maximum 255 characters, optional
- **Permission IDs**: Must be valid UUIDs that exist in the system

---

## API Endpoints

## Role Management Endpoints

### 1. Create Role
**Endpoint:** `POST /api/roles`  
**Authorization:** `ADMIN`

**Request Body:** `CreateRoleDto`
```typescript
{
  name: string;                 // Required, 2-50 chars, unique
  description?: string;         // Optional, max 255 chars
  permissionIds?: UUID[];       // Optional permission assignments
}
```

**Response:** `RoleResponseDto` (201 Created)

### 2. Get Role by ID
**Endpoint:** `GET /api/roles/{id}`  
**Authorization:** `ADMIN`

**Path Parameters:**
- `id` (UUID): Role identifier

**Response:** `RoleResponseDto` (200 OK)

### 3. Get Role by Name
**Endpoint:** `GET /api/roles/name/{name}`  
**Authorization:** `ADMIN`

**Path Parameters:**
- `name` (string): Role name

**Response:** `RoleResponseDto` (200 OK)

### 4. Get All Roles
**Endpoint:** `GET /api/roles`  
**Authorization:** `ADMIN`

**Query Parameters:**
- `page` (number, default: 0): Page number
- `size` (number, default: 20): Page size  
- `sort` (string): Sort field and direction (e.g., "name,asc")

**Response:** Paginated `RoleResponseDto[]` (200 OK)

### 5. Search Roles
**Endpoint:** `GET /api/roles/search`  
**Authorization:** `ADMIN`

**Query Parameters:**
- `searchTerm` (string): Search term to match against role names and descriptions
- `page` (number, default: 0): Page number
- `size` (number, default: 20): Page size
- `sort` (string): Sort field and direction

**Response:** Paginated `RoleResponseDto[]` (200 OK)

### 6. Update Role
**Endpoint:** `PUT /api/roles/{id}`  
**Authorization:** `ADMIN`

**Path Parameters:**
- `id` (UUID): Role identifier

**Request Body:** `UpdateRoleDto`

**Response:** `RoleResponseDto` (200 OK)

### 7. Delete Role
**Endpoint:** `DELETE /api/roles/{id}`  
**Authorization:** `ADMIN`

**Path Parameters:**
- `id` (UUID): Role identifier

**Response:** No content (204 No Content)

### 8. Check Role Name Exists
**Endpoint:** `GET /api/roles/exists/name/{name}`  
**Authorization:** `ADMIN`

**Path Parameters:**
- `name` (string): Role name to check

**Response:** `boolean` (200 OK)

## Permission Management Endpoints

### 9. Create Permission
**Endpoint:** `POST /api/permissions`  
**Authorization:** `ADMIN`

**Request Body:** `CreatePermissionDto`
```typescript
{
  name: string;                 // Required, 3-50 chars, unique
  description?: string;         // Optional, max 255 chars
}
```

**Response:** `PermissionResponseDto` (201 Created)

### 10. Get Permission by ID
**Endpoint:** `GET /api/permissions/{id}`  
**Authorization:** `ADMIN`

**Path Parameters:**
- `id` (UUID): Permission identifier

**Response:** `PermissionResponseDto` (200 OK)

### 11. Get Permission by Name
**Endpoint:** `GET /api/permissions/name/{name}`  
**Authorization:** `ADMIN`

**Path Parameters:**
- `name` (string): Permission name

**Response:** `PermissionResponseDto` (200 OK)

### 12. Get All Permissions
**Endpoint:** `GET /api/permissions`  
**Authorization:** `ADMIN`

**Query Parameters:**
- `page` (number, default: 0): Page number
- `size` (number, default: 20): Page size  
- `sort` (string): Sort field and direction (e.g., "name,asc")

**Response:** Paginated `PermissionResponseDto[]` (200 OK)

### 13. Search Permissions
**Endpoint:** `GET /api/permissions/search`  
**Authorization:** `ADMIN`

**Query Parameters:**
- `searchTerm` (string): Search term to match against permission names and descriptions
- `page` (number, default: 0): Page number
- `size` (number, default: 20): Page size
- `sort` (string): Sort field and direction

**Response:** Paginated `PermissionResponseDto[]` (200 OK)

### 14. Update Permission
**Endpoint:** `PUT /api/permissions/{id}`  
**Authorization:** `ADMIN`

**Path Parameters:**
- `id` (UUID): Permission identifier

**Request Body:** `UpdatePermissionDto`

**Response:** `PermissionResponseDto` (200 OK)

### 15. Delete Permission
**Endpoint:** `DELETE /api/permissions/{id}`  
**Authorization:** `ADMIN`

**Path Parameters:**
- `id` (UUID): Permission identifier

**Response:** No content (204 No Content)

### 16. Check Permission Name Exists
**Endpoint:** `GET /api/permissions/exists/name/{name}`  
**Authorization:** `ADMIN`

**Path Parameters:**
- `name` (string): Permission name to check

**Response:** `boolean` (200 OK)

---

## Request/Response Examples

### Creating a Role with Permissions

**Request:**
```http
POST /api/roles
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...

{
  "name": "DOCUMENT_SPECIALIST",
  "description": "Specialist for document management and processing",
  "permissionIds": [
    "11111111-1111-1111-1111-111111111111",
    "66666666-6666-6666-6666-666666666666",
    "99999999-9999-9999-9999-999999999999"
  ]
}
```

**Response (201 Created):**
```json
{
  "id": "dddddddd-dddd-dddd-dddd-dddddddddddd",
  "name": "DOCUMENT_SPECIALIST",
  "description": "Specialist for document management and processing",
  "permissions": [
    {
      "id": "11111111-1111-1111-1111-111111111111",
      "name": "READ_USER",
      "description": "Permission to read user information",
      "createdAt": "2024-01-15T10:30:00",
      "updatedAt": "2024-01-15T10:30:00"
    },
    {
      "id": "66666666-6666-6666-6666-666666666666",
      "name": "READ_CREDIT_PROGRAM",
      "description": "Permission to read credit program information",
      "createdAt": "2024-01-15T10:30:00",
      "updatedAt": "2024-01-15T10:30:00"
    },
    {
      "id": "99999999-9999-9999-9999-999999999999",
      "name": "READ_REFERENCE_DATA",
      "description": "Permission to read reference data",
      "createdAt": "2024-01-15T10:30:00",
      "updatedAt": "2024-01-15T10:30:00"
    }
  ],
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:30:00"
}
```

### Searching Roles

**Request:**
```http
GET /api/roles/search?searchTerm=credit&page=0&size=10&sort=name,asc
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

**Response (200 OK):**
```json
{
  "content": [
    {
      "id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      "name": "CREDIT_ANALYST",
      "description": "Credit Analyst role for credit program analysis",
      "permissions": [
        {
          "id": "11111111-1111-1111-1111-111111111111",
          "name": "READ_USER",
          "description": "Permission to read user information",
          "createdAt": "2024-01-15T10:30:00",
          "updatedAt": "2024-01-15T10:30:00"
        },
        {
          "id": "66666666-6666-6666-6666-666666666666",
          "name": "READ_CREDIT_PROGRAM",
          "description": "Permission to read credit program information",
          "createdAt": "2024-01-15T10:30:00",
          "updatedAt": "2024-01-15T10:30:00"
        }
      ],
      "createdAt": "2024-01-15T10:30:00",
      "updatedAt": "2024-01-15T10:30:00"
    },
    {
      "id": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
      "name": "CREDIT_MANAGER",
      "description": "Credit Manager role with advanced credit management privileges",
      "permissions": [
        {
          "id": "11111111-1111-1111-1111-111111111111",
          "name": "READ_USER",
          "description": "Permission to read user information",
          "createdAt": "2024-01-15T10:30:00",
          "updatedAt": "2024-01-15T10:30:00"
        }
      ],
      "createdAt": "2024-01-15T10:30:00",
      "updatedAt": "2024-01-15T10:30:00"
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
  "totalElements": 2,
  "last": true,
  "first": true,
  "numberOfElements": 2,
  "size": 10,
  "number": 0,
  "sort": {
    "sorted": true,
    "unsorted": false
  }
}
```

### Creating a Permission

**Request:**
```http
POST /api/permissions
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...

{
  "name": "MANAGE_DOCUMENTS",
  "description": "Permission to manage document templates and processing"
}
```

**Response (201 Created):**
```json
{
  "id": "ffffffff-ffff-ffff-ffff-ffffffffffff",
  "name": "MANAGE_DOCUMENTS",
  "description": "Permission to manage document templates and processing",
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:30:00"
}
```

### Getting All Permissions

**Request:**
```http
GET /api/permissions?page=0&size=5&sort=name,asc
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

**Response (200 OK):**
```json
{
  "content": [
    {
      "id": "77777777-7777-7777-7777-777777777777",
      "name": "APPROVE_DECISION",
      "description": "Permission to approve decisions",
      "createdAt": "2024-01-15T10:30:00",
      "updatedAt": "2024-01-15T10:30:00"
    },
    {
      "id": "33333333-3333-3333-3333-333333333333",
      "name": "DELETE_USER",
      "description": "Permission to delete users",
      "createdAt": "2024-01-15T10:30:00",
      "updatedAt": "2024-01-15T10:30:00"
    },
    {
      "id": "ffffffff-ffff-ffff-ffff-ffffffffffff",
      "name": "MANAGE_DOCUMENTS",
      "description": "Permission to manage document templates and processing",
      "createdAt": "2024-01-15T10:30:00",
      "updatedAt": "2024-01-15T10:30:00"
    },
    {
      "id": "64646464-6464-6464-6464-646464646464",
      "name": "MANAGE_SYSTEM",
      "description": "Permission to manage system settings",
      "createdAt": "2024-01-15T10:30:00",
      "updatedAt": "2024-01-15T10:30:00"
    },
    {
      "id": "11111111-1111-1111-1111-111111111111",
      "name": "READ_USER",
      "description": "Permission to read user information",
      "createdAt": "2024-01-15T10:30:00",
      "updatedAt": "2024-01-15T10:30:00"
    }
  ],
  "pageable": {
    "sort": {
      "sorted": true,
      "unsorted": false
    },
    "pageNumber": 0,
    "pageSize": 5,
    "offset": 0,
    "paged": true,
    "unpaged": false
  },
  "totalPages": 5,
  "totalElements": 21,
  "last": false,
  "first": true,
  "numberOfElements": 5,
  "size": 5,
  "number": 0,
  "sort": {
    "sorted": true,
    "unsorted": false
  }
}
```

---

## Error Handling

### Standard HTTP Status Codes

#### 200 OK
Successful GET, PUT requests

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
  "path": "/api/roles",
  "errors": [
    {
      "field": "name",
      "message": "Role name is required",
      "rejectedValue": null
    },
    {
      "field": "name",
      "message": "Role name must be between 2 and 50 characters",
      "rejectedValue": "A"
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
Insufficient permissions (non-admin user)

```json
{
  "timestamp": "2024-01-15T10:30:00.123Z",
  "status": 403,
  "error": "Forbidden",
  "message": "Access denied. Required role: ADMIN"
}
```

#### 404 Not Found
Role or permission not found

```json
{
  "timestamp": "2024-01-15T10:30:00.123Z",
  "status": 404,
  "error": "Not Found",
  "message": "Role not found with id: 123e4567-e89b-12d3-a456-426614174000"
}
```

#### 409 Conflict
Duplicate name violations

```json
{
  "timestamp": "2024-01-15T10:30:00.123Z",
  "status": 409,
  "error": "Conflict",
  "message": "Role with name 'ADMIN' already exists"
}
```

#### 422 Unprocessable Entity
Business validation errors

```json
{
  "timestamp": "2024-01-15T10:30:00.123Z",
  "status": 422,
  "error": "Unprocessable Entity",
  "message": "Role deletion failed",
  "details": [
    "Cannot delete role 'ADMIN': role is assigned to active users",
    "Cannot delete system-required role"
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

### Common Validation Messages
- `"Role name is required"` - Missing required name field
- `"Role name must be between 2 and 50 characters"` - Name length validation
- `"Permission name must be between 3 and 50 characters"` - Permission name length validation
- `"Description must not exceed 255 characters"` - Description length validation
- `"Role with name '{name}' already exists"` - Duplicate name validation
- `"Permission with name '{name}' already exists"` - Duplicate name validation
- `"Invalid permission ID: {id}"` - Referenced permission does not exist

---

## Default System Data

### Default Permissions (21 Total)

The system initializes with the following permissions organized by category:

#### User Management Permissions
```typescript
const userPermissions = [
  { name: "READ_USER", description: "Permission to read user information" },
  { name: "WRITE_USER", description: "Permission to create and update users" },
  { name: "DELETE_USER", description: "Permission to delete users" }
];
```

#### Role Management Permissions
```typescript
const rolePermissions = [
  { name: "READ_ROLE", description: "Permission to read role information" },
  { name: "WRITE_ROLE", description: "Permission to create and update roles" },
  { name: "DELETE_ROLE", description: "Permission to delete roles" }
];
```

#### Permission Management Permissions
```typescript
const permissionPermissions = [
  { name: "READ_PERMISSION", description: "Permission to read permission information" },
  { name: "WRITE_PERMISSION", description: "Permission to create and update permissions" },
  { name: "DELETE_PERMISSION", description: "Permission to delete permissions" }
];
```

#### System Permissions
```typescript
const systemPermissions = [
  { name: "MANAGE_SYSTEM", description: "Permission to manage system settings" }
];
```

#### Credit Program Permissions
```typescript
const creditProgramPermissions = [
  { name: "READ_CREDIT_PROGRAM", description: "Permission to read credit program information" },
  { name: "WRITE_CREDIT_PROGRAM", description: "Permission to create and update credit programs" },
  { name: "DELETE_CREDIT_PROGRAM", description: "Permission to delete credit programs" },
  { name: "MANAGE_CREDIT_PROGRAM_STATUS", description: "Permission to manage credit program status" },
  { name: "VIEW_CREDIT_PROGRAM_STATISTICS", description: "Permission to view credit program statistics" }
];
```

#### Decision Permissions
```typescript
const decisionPermissions = [
  { name: "READ_DECISION", description: "Permission to read decision information" },
  { name: "WRITE_DECISION", description: "Permission to create and update decisions" },
  { name: "DELETE_DECISION", description: "Permission to delete decisions" },
  { name: "APPROVE_DECISION", description: "Permission to approve decisions" }
];
```

#### Reference Data Permissions
```typescript
const referenceDataPermissions = [
  { name: "READ_REFERENCE_DATA", description: "Permission to read reference data" },
  { name: "WRITE_REFERENCE_DATA", description: "Permission to create and update reference data" },
  { name: "DELETE_REFERENCE_DATA", description: "Permission to delete reference data" }
];
```

### Default Roles (6 Total)

#### 1. ADMIN Role
**Description:** Administrator role with full system access  
**Permissions:** All 21 permissions

#### 2. USER Role
**Description:** Standard user role with basic access  
**Permissions:**
- `READ_USER`

#### 3. MODERATOR Role
**Description:** Moderator role with limited administrative access  
**Permissions:**
- `READ_USER`
- `WRITE_USER`
- `READ_ROLE`
- `READ_PERMISSION`

#### 4. CREDIT_ANALYST Role
**Description:** Credit Analyst role for credit program analysis  
**Permissions:**
- `READ_USER`
- `READ_CREDIT_PROGRAM`
- `WRITE_CREDIT_PROGRAM`
- `READ_DECISION`
- `READ_REFERENCE_DATA`

#### 5. CREDIT_MANAGER Role
**Description:** Credit Manager role with advanced credit management privileges  
**Permissions:**
- `READ_USER`
- `READ_CREDIT_PROGRAM`
- `WRITE_CREDIT_PROGRAM`
- `MANAGE_CREDIT_PROGRAM_STATUS`
- `VIEW_CREDIT_PROGRAM_STATISTICS`
- `READ_DECISION`
- `WRITE_DECISION`
- `READ_REFERENCE_DATA`
- `WRITE_REFERENCE_DATA`

#### 6. DECISION_MAKER Role
**Description:** Decision Maker role for approving decisions  
**Permissions:**
- `READ_USER`
- `READ_CREDIT_PROGRAM`
- `READ_DECISION`
- `WRITE_DECISION`
- `APPROVE_DECISION`
- `READ_REFERENCE_DATA`

### Default Users
- **Admin User:** `admin` / `admin123` with `ADMIN` role
- **Regular User:** `user` / `user123` with `USER` role

---

## Business Rules and Workflows

### Role Management Rules

#### Role Creation Rules
1. **Unique Names:** Role names must be unique across the system
2. **Name Format:** 2-50 characters, no special format restrictions
3. **Permission Assignment:** Can assign existing permissions during creation
4. **System Roles:** Default roles cannot be deleted (enforced at application level)

#### Role Update Rules
1. **Name Updates:** Can change name if new name is unique
2. **Permission Updates:** Can add/remove permissions
3. **System Role Protection:** Default system roles should be protected from critical changes

#### Role Deletion Rules
1. **User Assignment Check:** Cannot delete roles that are assigned to users
2. **System Role Protection:** Cannot delete system-required roles (ADMIN, USER)
3. **Cascade Considerations:** Role-permission relationships are automatically cleaned up

### Permission Management Rules

#### Permission Creation Rules
1. **Unique Names:** Permission names must be unique across the system
2. **Name Format:** 3-50 characters, typically UPPERCASE_WITH_UNDERSCORES
3. **Naming Convention:** Follow pattern: `{ACTION}_{RESOURCE}` (e.g., `READ_USER`, `WRITE_ROLE`)

#### Permission Update Rules
1. **Name Updates:** Can change name if new name is unique
2. **Description Updates:** Always allowed
3. **System Permission Protection:** Core system permissions should be protected

#### Permission Deletion Rules
1. **Role Assignment Check:** Cannot delete permissions assigned to roles
2. **System Permission Protection:** Cannot delete system-required permissions
3. **Cascade Impact:** Deletion removes permission from all associated roles

### Role-Permission Relationship Rules

#### Assignment Rules
1. **Valid Permissions Only:** Can only assign existing permissions to roles
2. **Multiple Assignment:** One permission can be assigned to multiple roles
3. **Bulk Operations:** Support bulk permission assignment/removal

#### Many-to-Many Relationship
```typescript
// Relationship structure
Role {
  permissions: Permission[]  // Many-to-many relationship
}

Permission {
  roles: Role[]             // Many-to-many relationship
}
```

### Security Considerations

#### Access Control
1. **Admin-Only Operations:** All role/permission management requires ADMIN role
2. **Token Validation:** All endpoints require valid JWT token
3. **Permission Hierarchy:** No hierarchical permissions (flat structure)

#### Audit Trail
1. **Creation Tracking:** All entities track `createdAt` timestamp
2. **Modification Tracking:** All entities track `updatedAt` timestamp
3. **User Tracking:** Uses `AuditableEntity` for user tracking in creation/updates

---

## Frontend Integration Guidelines

### State Management Recommendations

#### Redux Toolkit Example
```typescript
// rolePermissionSlice.ts
interface RolePermissionState {
  roles: RoleResponseDto[];
  permissions: PermissionResponseDto[];
  currentRole: RoleResponseDto | null;
  currentPermission: PermissionResponseDto | null;
  loading: boolean;
  error: string | null;
  rolePagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
  permissionPagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

const rolePermissionSlice = createSlice({
  name: 'rolePermission',
  initialState,
  reducers: {
    setRoles: (state, action) => {
      state.roles = action.payload.content;
      state.rolePagination = {
        page: action.payload.number,
        size: action.payload.size,
        totalElements: action.payload.totalElements,
        totalPages: action.payload.totalPages,
      };
    },
    setPermissions: (state, action) => {
      state.permissions = action.payload.content;
      state.permissionPagination = {
        page: action.payload.number,
        size: action.payload.size,
        totalElements: action.payload.totalElements,
        totalPages: action.payload.totalPages,
      };
    },
    setCurrentRole: (state, action) => {
      state.currentRole = action.payload;
    },
    setCurrentPermission: (state, action) => {
      state.currentPermission = action.payload;
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
// rolePermissionApi.ts
class RolePermissionApi {
  private roleBaseUrl = '/api/roles';
  private permissionBaseUrl = '/api/permissions';

  // Role operations
  async getRoles(params?: { page?: number; size?: number; sort?: string }) {
    const response = await fetch(`${this.roleBaseUrl}?${new URLSearchParams(params)}`);
    return response.json();
  }

  async searchRoles(searchTerm: string, params?: PaginationParams) {
    const response = await fetch(`${this.roleBaseUrl}/search?searchTerm=${searchTerm}&${new URLSearchParams(params)}`);
    return response.json();
  }

  async createRole(createDto: CreateRoleDto) {
    const response = await fetch(this.roleBaseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createDto)
    });
    return response.json();
  }

  async updateRole(id: string, updateDto: UpdateRoleDto) {
    const response = await fetch(`${this.roleBaseUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateDto)
    });
    return response.json();
  }

  async deleteRole(id: string) {
    const response = await fetch(`${this.roleBaseUrl}/${id}`, {
      method: 'DELETE'
    });
    return response.ok;
  }

  // Permission operations
  async getPermissions(params?: PaginationParams) {
    const response = await fetch(`${this.permissionBaseUrl}?${new URLSearchParams(params)}`);
    return response.json();
  }

  async createPermission(createDto: CreatePermissionDto) {
    const response = await fetch(this.permissionBaseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createDto)
    });
    return response.json();
  }

  async updatePermission(id: string, updateDto: UpdatePermissionDto) {
    const response = await fetch(`${this.permissionBaseUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateDto)
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

const createRoleSchema = yup.object({
  name: yup.string()
    .required('Role name is required')
    .min(2, 'Role name must be at least 2 characters')
    .max(50, 'Role name cannot exceed 50 characters'),
  description: yup.string()
    .max(255, 'Description cannot exceed 255 characters'),
  permissionIds: yup.array()
    .of(yup.string().uuid('Invalid permission ID'))
});

const createPermissionSchema = yup.object({
  name: yup.string()
    .required('Permission name is required')
    .min(3, 'Permission name must be at least 3 characters')
    .max(50, 'Permission name cannot exceed 50 characters'),
  description: yup.string()
    .max(255, 'Description cannot exceed 255 characters')
});

const CreateRoleForm = ({ availablePermissions, onSubmit }) => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: yupResolver(createRoleSchema)
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="name">Role Name *</label>
        <input
          id="name"
          type="text"
          {...register('name')}
          placeholder="Enter role name (e.g., DOCUMENT_SPECIALIST)"
        />
        {errors.name && <span className="error">{errors.name.message}</span>}
      </div>

      <div>
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          {...register('description')}
          placeholder="Enter role description"
        />
        {errors.description && <span className="error">{errors.description.message}</span>}
      </div>

      <div>
        <label>Permissions</label>
        <div className="permission-checkboxes">
          {availablePermissions.map(permission => (
            <div key={permission.id}>
              <input
                type="checkbox"
                id={`permission-${permission.id}`}
                value={permission.id}
                {...register('permissionIds')}
              />
              <label htmlFor={`permission-${permission.id}`}>
                {permission.name} - {permission.description}
              </label>
            </div>
          ))}
        </div>
      </div>

      <button type="submit">Create Role</button>
    </form>
  );
};
```

### Role Badge Component
```typescript
const RoleBadge = ({ role }) => {
  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case 'ADMIN': return 'red';
      case 'CREDIT_MANAGER': return 'blue';
      case 'CREDIT_ANALYST': return 'green';
      case 'MODERATOR': return 'yellow';
      case 'DECISION_MAKER': return 'purple';
      case 'USER': return 'gray';
      default: return 'gray';
    }
  };

  return (
    <span className={`badge badge-${getRoleColor(role.name)}`} title={role.description}>
      {role.name}
    </span>
  );
};
```

### Permission Management Component
```typescript
const PermissionList = ({ permissions, onEdit, onDelete, canManage }) => {
  return (
    <div className="permission-list">
      {permissions.map(permission => (
        <div key={permission.id} className="permission-item">
          <div className="permission-info">
            <h4>{permission.name}</h4>
            <p>{permission.description}</p>
            <small>Created: {formatDate(permission.createdAt)}</small>
          </div>
          {canManage && (
            <div className="permission-actions">
              <button 
                onClick={() => onEdit(permission)}
                className="btn btn-primary btn-sm"
              >
                Edit
              </button>
              <button 
                onClick={() => onDelete(permission.id)}
                className="btn btn-danger btn-sm"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
```

### Data Table Component
```typescript
const RoleDataTable = ({ roles, onSort, onPageChange, onEdit, onDelete }) => {
  const columns = [
    { key: 'name', title: 'Name', sortable: true },
    { key: 'description', title: 'Description', sortable: false },
    { key: 'permissions', title: 'Permissions', sortable: false },
    { key: 'createdAt', title: 'Created', sortable: true },
    { key: 'actions', title: 'Actions', sortable: false }
  ];

  return (
    <DataTable 
      data={roles}
      columns={columns}
      onSort={onSort}
      onPageChange={onPageChange}
      renderCell={(role, column) => {
        switch (column.key) {
          case 'permissions':
            return (
              <div className="permissions-cell">
                {role.permissions.map(permission => (
                  <span key={permission.id} className="permission-tag">
                    {permission.name}
                  </span>
                ))}
                <span className="permission-count">
                  ({role.permissions.length} total)
                </span>
              </div>
            );
          case 'createdAt':
            return formatDate(role.createdAt);
          case 'actions':
            return (
              <div className="action-buttons">
                <button onClick={() => onEdit(role)} className="btn-edit">
                  Edit
                </button>
                <button onClick={() => onDelete(role.id)} className="btn-delete">
                  Delete
                </button>
              </div>
            );
          default:
            return role[column.key];
        }
      }}
    />
  );
};
```

### Error Handling
```typescript
const useRolePermissionErrorHandler = () => {
  const handleApiError = (error: any) => {
    if (error.status === 400 && error.errors) {
      // Field validation errors
      return error.errors.reduce((acc, err) => ({
        ...acc,
        [err.field]: err.message
      }), {});
    } else if (error.status === 409) {
      // Duplicate name conflict
      return { _general: error.message || 'A role or permission with this name already exists.' };
    } else if (error.status === 422 && error.details) {
      // Business validation errors
      return { _general: error.details.join(', ') };
    } else if (error.status === 403) {
      return { _general: 'Access denied. Administrator privileges required.' };
    } else if (error.status === 404) {
      return { _general: 'Role or permission not found.' };
    } else {
      return { _general: 'An unexpected error occurred.' };
    }
  };

  return { handleApiError };
};
```

### Performance Optimization Tips

1. **Use React.memo** for role/permission list components
2. **Implement virtual scrolling** for large role/permission lists
3. **Debounce search inputs** to avoid excessive API calls
4. **Use React Query or SWR** for data fetching and caching
5. **Implement optimistic updates** for better UX
6. **Cache permission lists** since they change infrequently

### Accessibility Considerations

1. **Proper ARIA labels** for form fields and checkboxes
2. **Keyboard navigation** support for all interactive elements  
3. **Screen reader compatibility** for role/permission relationships
4. **Color contrast compliance** for role badges
5. **Focus management** in modals and forms
6. **Semantic HTML** structure for better navigation

This completes the comprehensive Role and Permission API manual for frontend implementation.