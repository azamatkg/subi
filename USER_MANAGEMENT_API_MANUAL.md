# User Management API Manual

**Version:** 1.0  
**Last Updated:** December 2024  
**Base URL:** `http://localhost:8080/api`

## Table of Contents

1. [Overview](#overview)
2. [Authentication Flow](#authentication-flow)
3. [Common Headers](#common-headers)
4. [Error Response Format](#error-response-format)
5. [Authentication Endpoints](#authentication-endpoints)
6. [User Management Endpoints](#user-management-endpoints)
7. [Role Management Endpoints](#role-management-endpoints)
8. [Permission Management Endpoints](#permission-management-endpoints)
9. [Data Models](#data-models)
10. [Integration Examples](#integration-examples)

---

## Overview

The User Management API provides comprehensive functionality for managing users, roles, and permissions in the ASUBK financial application. The system implements:

- **JWT-based Authentication** with Bearer tokens
- **Role-Based Access Control (RBAC)** with hierarchical permissions
- **RESTful API Design** with consistent patterns
- **Comprehensive Validation** with multilingual error messages
- **Pagination Support** for list endpoints

### Key Features
- User authentication and session management
- User CRUD operations with validation
- Role and permission management
- Search functionality across all entities
- Existence checking for unique fields

---

## Authentication Flow

1. **Login**: POST `/api/auth/login` with username/password
2. **Token Receipt**: Receive JWT token with user information
3. **API Access**: Include token in `Authorization` header for all protected endpoints
4. **Token Expiry**: Tokens expire after 24 hours (configurable)
5. **Logout**: POST `/api/auth/logout` (client-side token removal)

### Default Test Credentials
- **Admin**: username=`admin`, password=`admin123`
- **User**: username=`user`, password=`user123`

---

## Common Headers

### Required for All Requests
```
Content-Type: application/json
Accept: application/json
```

### Required for Protected Endpoints
```
Authorization: Bearer {jwt_token}
```

### Optional
```
Accept-Language: en,ru,kg  # For multilingual error messages
```

---

## Error Response Format

All API endpoints return consistent error responses:

```json
{
  "timestamp": "2024-12-19T10:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/users",
  "validationErrors": {
    "username": "Username must be between 3 and 50 characters",
    "email": "Email must be valid"
  }
}
```

### Common HTTP Status Codes
- `200 OK` - Success
- `201 Created` - Resource created successfully
- `204 No Content` - Success with no response body
- `400 Bad Request` - Validation errors
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Access denied
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource already exists
- `500 Internal Server Error` - Server error

---

## Authentication Endpoints

### Login

**POST** `/api/auth/login`

Authenticate user and receive JWT token.

**Access:** Public

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Validation:**
- `username`: Required, non-blank
- `password`: Required, non-blank

**Success Response (200 OK):**
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

**Error Response (401 Unauthorized):**
```json
{
  "timestamp": "2024-12-19T10:30:00Z",
  "status": 401,
  "error": "Unauthorized",
  "message": "Invalid username or password",
  "path": "/api/auth/login"
}
```

### Logout

**POST** `/api/auth/logout`

Logout user (token invalidation handled client-side).

**Access:** Authenticated

**Request Body:** None

**Success Response (200 OK):**
```json
"Logged out successfully"
```

---

## User Management Endpoints

**Access Required:** ADMIN role for all user management endpoints

### Create User

**POST** `/api/users`

Create a new user in the system.

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john.doe@example.com",
  "password": "secure123",
  "firstName": "John",
  "lastName": "Doe",
  "enabled": true
}
```

**Validation Rules:**
- `username`: Required, 3-50 characters, unique
- `email`: Required, valid email format, unique
- `password`: Required, minimum 6 characters
- `firstName`: Required, 2-50 characters
- `lastName`: Required, 2-50 characters
- `enabled`: Optional, defaults to true

**Success Response (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "john_doe",
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "enabled": true,
  "roles": [],
  "createdAt": "2024-12-19T10:30:00Z",
  "updatedAt": "2024-12-19T10:30:00Z"
}
```

### Get User by ID

**GET** `/api/users/{id}`

Retrieve a specific user by their UUID.

**Path Parameters:**
- `id` (UUID): User identifier

**Success Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "john_doe",
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "enabled": true,
  "roles": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440000",
      "name": "ROLE_USER",
      "description": "Standard user role",
      "permissions": []
    }
  ],
  "createdAt": "2024-12-19T10:30:00Z",
  "updatedAt": "2024-12-19T10:30:00Z"
}
```

### Get User by Username

**GET** `/api/users/username/{username}`

Retrieve a user by their username.

**Path Parameters:**
- `username` (String): Username to lookup

**Success Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "john_doe",
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "enabled": true,
  "roles": [],
  "createdAt": "2024-12-19T10:30:00Z",
  "updatedAt": "2024-12-19T10:30:00Z"
}
```

### Get All Users

**GET** `/api/users`

Retrieve paginated list of all users.

**Query Parameters:**
- `page` (int): Page number (0-based, default: 0)
- `size` (int): Page size (default: 20, max: 100)
- `sort` (String): Sort criteria (e.g., "username,asc" or "createdAt,desc")

**Example Request:**
```
GET /api/users?page=0&size=10&sort=username,asc
```

**Success Response (200 OK):**
```json
{
  "content": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "admin",
      "email": "admin@example.com",
      "firstName": "System",
      "lastName": "Administrator",
      "enabled": true,
      "roles": [
        {
          "id": "660e8400-e29b-41d4-a716-446655440000",
          "name": "ROLE_ADMIN",
          "description": "Administrator role"
        }
      ],
      "createdAt": "2024-12-19T10:30:00Z",
      "updatedAt": "2024-12-19T10:30:00Z"
    }
  ],
  "pageable": {
    "sort": {
      "sorted": true,
      "unsorted": false,
      "empty": false
    },
    "pageNumber": 0,
    "pageSize": 10,
    "offset": 0,
    "paged": true,
    "unpaged": false
  },
  "totalElements": 1,
  "totalPages": 1,
  "last": true,
  "first": true,
  "numberOfElements": 1,
  "size": 10,
  "number": 0,
  "sort": {
    "sorted": true,
    "unsorted": false,
    "empty": false
  },
  "empty": false
}
```

### Search Users

**GET** `/api/users/search`

Search users by term across username, email, firstName, and lastName.

**Query Parameters:**
- `searchTerm` (String): Search term (required)
- `page` (int): Page number (0-based, default: 0)
- `size` (int): Page size (default: 20)
- `sort` (String): Sort criteria

**Example Request:**
```
GET /api/users/search?searchTerm=john&page=0&size=10
```

**Success Response (200 OK):**
Same format as "Get All Users" but filtered by search term.

### Update User

**PUT** `/api/users/{id}`

Update an existing user. All fields are optional in update request.

**Path Parameters:**
- `id` (UUID): User identifier

**Request Body:**
```json
{
  "username": "john_doe_updated",
  "email": "john.updated@example.com",
  "password": "new_password123",
  "firstName": "John Updated",
  "lastName": "Doe Updated",
  "enabled": false
}
```

**Validation Rules:**
- `username`: Optional, 3-50 characters, unique if provided
- `email`: Optional, valid email format, unique if provided
- `password`: Optional, minimum 6 characters if provided
- `firstName`: Optional, 2-50 characters if provided
- `lastName`: Optional, 2-50 characters if provided
- `enabled`: Optional boolean

**Success Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "john_doe_updated",
  "email": "john.updated@example.com",
  "firstName": "John Updated",
  "lastName": "Doe Updated",
  "enabled": false,
  "roles": [],
  "createdAt": "2024-12-19T10:30:00Z",
  "updatedAt": "2024-12-19T11:45:00Z"
}
```

### Delete User

**DELETE** `/api/users/{id}`

Delete a user from the system.

**Path Parameters:**
- `id` (UUID): User identifier

**Success Response (204 No Content):**
No response body.

### Check Username Availability

**GET** `/api/users/exists/username/{username}`

Check if a username is already taken.

**Path Parameters:**
- `username` (String): Username to check

**Success Response (200 OK):**
```json
true
```
- `true`: Username exists (not available)
- `false`: Username doesn't exist (available)

### Check Email Availability

**GET** `/api/users/exists/email/{email}`

Check if an email address is already registered.

**Path Parameters:**
- `email` (String): Email to check

**Success Response (200 OK):**
```json
false
```
- `true`: Email exists (not available)
- `false`: Email doesn't exist (available)

---

## Role Management Endpoints

**Access Required:** ADMIN role for all role management endpoints

### Create Role

**POST** `/api/roles`

Create a new role with optional permissions.

**Request Body:**
```json
{
  "name": "ROLE_MANAGER",
  "description": "Manager role with specific permissions",
  "permissionIds": [
    "770e8400-e29b-41d4-a716-446655440000",
    "880e8400-e29b-41d4-a716-446655440000"
  ]
}
```

**Validation Rules:**
- `name`: Required, 2-50 characters, unique
- `description`: Optional, max 255 characters
- `permissionIds`: Optional array of permission UUIDs

**Success Response (201 Created):**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440000",
  "name": "ROLE_MANAGER",
  "description": "Manager role with specific permissions",
  "permissions": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440000",
      "name": "USER_READ",
      "description": "Read user information"
    }
  ],
  "createdAt": "2024-12-19T10:30:00Z",
  "updatedAt": "2024-12-19T10:30:00Z"
}
```

### Get Role by ID

**GET** `/api/roles/{id}`

Retrieve a specific role by its UUID.

**Path Parameters:**
- `id` (UUID): Role identifier

**Success Response (200 OK):**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440000",
  "name": "ROLE_ADMIN",
  "description": "Administrator role",
  "permissions": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440000",
      "name": "USER_MANAGE",
      "description": "Full user management access",
      "createdAt": "2024-12-19T10:30:00Z",
      "updatedAt": "2024-12-19T10:30:00Z"
    }
  ],
  "createdAt": "2024-12-19T10:30:00Z",
  "updatedAt": "2024-12-19T10:30:00Z"
}
```

### Get Role by Name

**GET** `/api/roles/name/{name}`

Retrieve a role by its name.

**Path Parameters:**
- `name` (String): Role name

**Success Response (200 OK):**
Same format as "Get Role by ID".

### Get All Roles

**GET** `/api/roles`

Retrieve paginated list of all roles.

**Query Parameters:**
- `page` (int): Page number (0-based, default: 0)
- `size` (int): Page size (default: 20)
- `sort` (String): Sort criteria

**Success Response (200 OK):**
```json
{
  "content": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440000",
      "name": "ROLE_ADMIN",
      "description": "Administrator role",
      "permissions": [],
      "createdAt": "2024-12-19T10:30:00Z",
      "updatedAt": "2024-12-19T10:30:00Z"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20
  },
  "totalElements": 1,
  "totalPages": 1,
  "last": true,
  "first": true
}
```

### Search Roles

**GET** `/api/roles/search`

Search roles by term across name and description.

**Query Parameters:**
- `searchTerm` (String): Search term (required)
- `page` (int): Page number (0-based, default: 0)
- `size` (int): Page size (default: 20)
- `sort` (String): Sort criteria

**Success Response (200 OK):**
Same format as "Get All Roles" but filtered by search term.

### Update Role

**PUT** `/api/roles/{id}`

Update an existing role.

**Path Parameters:**
- `id` (UUID): Role identifier

**Request Body:**
```json
{
  "name": "ROLE_MANAGER_UPDATED",
  "description": "Updated manager role description",
  "permissionIds": [
    "770e8400-e29b-41d4-a716-446655440000"
  ]
}
```

**Success Response (200 OK):**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440000",
  "name": "ROLE_MANAGER_UPDATED",
  "description": "Updated manager role description",
  "permissions": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440000",
      "name": "USER_READ",
      "description": "Read user information"
    }
  ],
  "createdAt": "2024-12-19T10:30:00Z",
  "updatedAt": "2024-12-19T11:45:00Z"
}
```

### Delete Role

**DELETE** `/api/roles/{id}`

Delete a role from the system.

**Path Parameters:**
- `id` (UUID): Role identifier

**Success Response (204 No Content):**
No response body.

### Check Role Name Availability

**GET** `/api/roles/exists/name/{name}`

Check if a role name is already taken.

**Path Parameters:**
- `name` (String): Role name to check

**Success Response (200 OK):**
```json
true
```

---

## Permission Management Endpoints

**Access Required:** ADMIN role for all permission management endpoints

### Create Permission

**POST** `/api/permissions`

Create a new permission in the system.

**Request Body:**
```json
{
  "name": "USER_CREATE",
  "description": "Permission to create new users"
}
```

**Validation Rules:**
- `name`: Required, 3-50 characters, unique
- `description`: Optional, max 255 characters

**Success Response (201 Created):**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440000",
  "name": "USER_CREATE",
  "description": "Permission to create new users",
  "createdAt": "2024-12-19T10:30:00Z",
  "updatedAt": "2024-12-19T10:30:00Z"
}
```

### Get Permission by ID

**GET** `/api/permissions/{id}`

Retrieve a specific permission by its UUID.

**Path Parameters:**
- `id` (UUID): Permission identifier

**Success Response (200 OK):**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440000",
  "name": "USER_MANAGE",
  "description": "Full user management access",
  "createdAt": "2024-12-19T10:30:00Z",
  "updatedAt": "2024-12-19T10:30:00Z"
}
```

### Get Permission by Name

**GET** `/api/permissions/name/{name}`

Retrieve a permission by its name.

**Path Parameters:**
- `name` (String): Permission name

**Success Response (200 OK):**
Same format as "Get Permission by ID".

### Get All Permissions

**GET** `/api/permissions`

Retrieve paginated list of all permissions.

**Query Parameters:**
- `page` (int): Page number (0-based, default: 0)
- `size` (int): Page size (default: 20)
- `sort` (String): Sort criteria

**Success Response (200 OK):**
```json
{
  "content": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440000",
      "name": "USER_MANAGE",
      "description": "Full user management access",
      "createdAt": "2024-12-19T10:30:00Z",
      "updatedAt": "2024-12-19T10:30:00Z"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20
  },
  "totalElements": 1,
  "totalPages": 1,
  "last": true,
  "first": true
}
```

### Search Permissions

**GET** `/api/permissions/search`

Search permissions by term across name and description.

**Query Parameters:**
- `searchTerm` (String): Search term (required)
- `page` (int): Page number (0-based, default: 0)
- `size` (int): Page size (default: 20)
- `sort` (String): Sort criteria

**Success Response (200 OK):**
Same format as "Get All Permissions" but filtered by search term.

### Update Permission

**PUT** `/api/permissions/{id}`

Update an existing permission.

**Path Parameters:**
- `id` (UUID): Permission identifier

**Request Body:**
```json
{
  "name": "USER_CREATE_UPDATED",
  "description": "Updated permission description"
}
```

**Success Response (200 OK):**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440000",
  "name": "USER_CREATE_UPDATED",
  "description": "Updated permission description",
  "createdAt": "2024-12-19T10:30:00Z",
  "updatedAt": "2024-12-19T11:45:00Z"
}
```

### Delete Permission

**DELETE** `/api/permissions/{id}`

Delete a permission from the system.

**Path Parameters:**
- `id` (UUID): Permission identifier

**Success Response (204 No Content):**
No response body.

### Check Permission Name Availability

**GET** `/api/permissions/exists/name/{name}`

Check if a permission name is already taken.

**Path Parameters:**
- `name` (String): Permission name to check

**Success Response (200 OK):**
```json
false
```

---

## Data Models

### User Models

#### CreateUserDto
```json
{
  "username": "string (required, 3-50 chars, unique)",
  "email": "string (required, valid email, unique)", 
  "password": "string (required, min 6 chars)",
  "firstName": "string (required, 2-50 chars)",
  "lastName": "string (required, 2-50 chars)",
  "enabled": "boolean (optional, default: true)"
}
```

#### UpdateUserDto
```json
{
  "username": "string (optional, 3-50 chars, unique)",
  "email": "string (optional, valid email, unique)",
  "password": "string (optional, min 6 chars)",
  "firstName": "string (optional, 2-50 chars)",
  "lastName": "string (optional, 2-50 chars)", 
  "enabled": "boolean (optional)"
}
```

#### UserResponseDto
```json
{
  "id": "UUID",
  "username": "string",
  "email": "string",
  "firstName": "string", 
  "lastName": "string",
  "enabled": "boolean",
  "roles": "RoleResponseDto[]",
  "createdAt": "ISO 8601 DateTime",
  "updatedAt": "ISO 8601 DateTime"
}
```

### Role Models

#### CreateRoleDto
```json
{
  "name": "string (required, 2-50 chars, unique)",
  "description": "string (optional, max 255 chars)",
  "permissionIds": "UUID[] (optional)"
}
```

#### UpdateRoleDto
```json
{
  "name": "string (optional, 2-50 chars, unique)",
  "description": "string (optional, max 255 chars)",
  "permissionIds": "UUID[] (optional)"
}
```

#### RoleResponseDto
```json
{
  "id": "UUID",
  "name": "string",
  "description": "string",
  "permissions": "PermissionResponseDto[]",
  "createdAt": "ISO 8601 DateTime",
  "updatedAt": "ISO 8601 DateTime"
}
```

### Permission Models

#### CreatePermissionDto
```json
{
  "name": "string (required, 3-50 chars, unique)",
  "description": "string (optional, max 255 chars)"
}
```

#### UpdatePermissionDto
```json
{
  "name": "string (optional, 3-50 chars, unique)",
  "description": "string (optional, max 255 chars)"
}
```

#### PermissionResponseDto
```json
{
  "id": "UUID",
  "name": "string", 
  "description": "string",
  "createdAt": "ISO 8601 DateTime",
  "updatedAt": "ISO 8601 DateTime"
}
```

### Authentication Models

#### LoginRequest
```json
{
  "username": "string (required, non-blank)",
  "password": "string (required, non-blank)"
}
```

#### LoginResponse
```json
{
  "token": "string (JWT token)",
  "type": "string (always 'Bearer')",
  "username": "string",
  "email": "string",
  "fullName": "string",
  "roles": "string[] (role names)",
  "expiresIn": "number (seconds until expiration)"
}
```

---

## Integration Examples

### 1. Complete User Registration Flow

```javascript
// 1. Check if username is available
const checkUsername = async (username) => {
  const response = await fetch(`/api/users/exists/username/${username}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return await response.json(); // true if exists, false if available
};

// 2. Check if email is available
const checkEmail = async (email) => {
  const response = await fetch(`/api/users/exists/email/${email}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return await response.json(); // true if exists, false if available
};

// 3. Create user if validations pass
const createUser = async (userData) => {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return await response.json();
};

// Usage example
try {
  const userData = {
    username: 'john_doe',
    email: 'john.doe@example.com',
    password: 'secure123',
    firstName: 'John',
    lastName: 'Doe',
    enabled: true
  };
  
  // Check availability
  const usernameExists = await checkUsername(userData.username);
  const emailExists = await checkEmail(userData.email);
  
  if (usernameExists) {
    throw new Error('Username is already taken');
  }
  
  if (emailExists) {
    throw new Error('Email is already registered');
  }
  
  // Create user
  const newUser = await createUser(userData);
  console.log('User created:', newUser);
  
} catch (error) {
  console.error('User creation failed:', error.message);
}
```

### 2. Authentication and Token Management

```javascript
class AuthService {
  constructor() {
    this.token = localStorage.getItem('auth_token');
  }
  
  async login(username, password) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    
    const loginData = await response.json();
    this.token = loginData.token;
    localStorage.setItem('auth_token', this.token);
    
    return loginData;
  }
  
  async logout() {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    this.token = null;
    localStorage.removeItem('auth_token');
    
    return response.ok;
  }
  
  getAuthHeaders() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    };
  }
  
  isAuthenticated() {
    return !!this.token;
  }
}

// Usage
const authService = new AuthService();

try {
  const loginResponse = await authService.login('admin', 'admin123');
  console.log('Login successful:', loginResponse);
  
  // Use auth headers for subsequent requests
  const headers = authService.getAuthHeaders();
  
} catch (error) {
  console.error('Login failed:', error.message);
}
```

### 3. User Search with Pagination

```javascript
const searchUsers = async (searchTerm, page = 0, size = 10) => {
  const params = new URLSearchParams({
    searchTerm,
    page: page.toString(),
    size: size.toString(),
    sort: 'username,asc'
  });
  
  const response = await fetch(`/api/users/search?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error('Search failed');
  }
  
  return await response.json();
};

// Usage with pagination
const handleSearch = async (searchTerm) => {
  try {
    let page = 0;
    const size = 10;
    let hasMore = true;
    const allUsers = [];
    
    while (hasMore) {
      const result = await searchUsers(searchTerm, page, size);
      allUsers.push(...result.content);
      
      hasMore = !result.last;
      page++;
    }
    
    console.log('All matching users:', allUsers);
    
  } catch (error) {
    console.error('Search error:', error.message);
  }
};
```

### 4. Role Management with Permissions

```javascript
// Create a role with permissions
const createRoleWithPermissions = async (roleData) => {
  try {
    // First, get available permissions
    const permissionsResponse = await fetch('/api/permissions', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const permissions = await permissionsResponse.json();
    console.log('Available permissions:', permissions.content);
    
    // Create role with specific permission IDs
    const newRoleResponse = await fetch('/api/roles', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(roleData)
    });
    
    if (!newRoleResponse.ok) {
      const error = await newRoleResponse.json();
      throw new Error(error.message);
    }
    
    return await newRoleResponse.json();
    
  } catch (error) {
    console.error('Role creation failed:', error.message);
    throw error;
  }
};

// Usage
const roleData = {
  name: 'ROLE_MANAGER',
  description: 'Manager role with user management permissions',
  permissionIds: [
    '770e8400-e29b-41d4-a716-446655440000', // USER_READ
    '880e8400-e29b-41d4-a716-446655440000'  // USER_UPDATE
  ]
};

createRoleWithPermissions(roleData)
  .then(role => console.log('Role created:', role))
  .catch(error => console.error('Failed:', error.message));
```

### 5. Error Handling Best Practices

```javascript
class ApiClient {
  constructor(baseUrl, token) {
    this.baseUrl = baseUrl;
    this.token = token;
  }
  
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };
    
    if (this.token) {
      config.headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    try {
      const response = await fetch(url, config);
      
      // Handle different response types
      if (response.status === 204) {
        return null; // No content
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        // Handle validation errors
        if (response.status === 400 && data.validationErrors) {
          const validationError = new Error('Validation failed');
          validationError.validationErrors = data.validationErrors;
          validationError.status = response.status;
          throw validationError;
        }
        
        // Handle other errors
        const error = new Error(data.message || 'Request failed');
        error.status = response.status;
        error.data = data;
        throw error;
      }
      
      return data;
      
    } catch (error) {
      if (error instanceof TypeError) {
        // Network error
        throw new Error('Network error: Please check your connection');
      }
      throw error;
    }
  }
  
  // Convenience methods
  get(endpoint) {
    return this.request(endpoint);
  }
  
  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
  
  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
  
  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

// Usage with comprehensive error handling
const apiClient = new ApiClient('http://localhost:8080/api', token);

try {
  const newUser = await apiClient.post('/users', {
    username: '',  // Invalid - will trigger validation error
    email: 'invalid-email',  // Invalid email format
    password: '123',  // Too short
    firstName: 'John',
    lastName: 'Doe'
  });
  
} catch (error) {
  if (error.validationErrors) {
    // Handle validation errors
    Object.entries(error.validationErrors).forEach(([field, message]) => {
      console.error(`${field}: ${message}`);
    });
  } else if (error.status === 401) {
    // Handle authentication error
    console.error('Authentication required');
    // Redirect to login
  } else if (error.status === 403) {
    // Handle authorization error
    console.error('Access denied');
  } else {
    // Handle other errors
    console.error('Request failed:', error.message);
  }
}
```

---

## Notes for Frontend Developers

### Security Considerations
1. **Always validate inputs** on the frontend before sending requests
2. **Store JWT tokens securely** (consider httpOnly cookies for production)
3. **Implement token refresh logic** when approaching expiration
4. **Clear sensitive data** from memory/storage on logout

### Performance Optimization
1. **Use pagination** for large datasets
2. **Implement search debouncing** to reduce API calls
3. **Cache role/permission data** as it changes infrequently
4. **Use optimistic updates** for better UX where appropriate

### Common Patterns
1. **Check existence before creation** for username/email validation
2. **Handle 401/403 errors globally** with redirect to login
3. **Show loading states** during API requests
4. **Implement retry logic** for network errors
5. **Use consistent error messaging** across the application

---

*This manual is automatically generated from the codebase. For the most up-to-date information, refer to the actual API endpoints and DTOs in the source code.*