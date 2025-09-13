# Data Model: User Management Pages

**Feature**: User Management Pages Implementation  
**Date**: 2025-09-12  
**Based on**: Existing TypeScript interfaces and API specifications  

## Core Entities

### 1. User Entity

**Primary Entity**: User representation with complete profile information

```typescript
interface User {
  id: string;                    // UUID - Primary identifier
  username: string;              // Unique username (immutable after creation)
  email: string;                 // Unique email address
  firstName: string;             // User's first name
  lastName: string;              // User's last name
  phone?: string;                // Optional phone number
  department?: string;           // Optional department assignment
  roles: Role[];                 // User's assigned roles
  status: UserStatus;            // Current user status
  enabled: boolean;              // Account enabled flag
  createdAt: Date;              // Account creation timestamp
  updatedAt: Date;              // Last modification timestamp
  lastLogin?: Date;             // Last successful login
  avatar?: string;              // Profile image URL
}
```

**Validation Rules**:
- `username`: 3-50 characters, alphanumeric + underscore, unique
- `email`: Valid email format, unique
- `firstName/lastName`: 1-100 characters, required
- `phone`: Optional, international format validation
- `roles`: At least one role required
- `status`: Must be valid UserStatus enum value

**State Transitions**:
- `ACTIVE` ↔ `SUSPENDED` (with reason)
- `ACTIVE` ↔ `INACTIVE` (deactivation)
- `PENDING_ACTIVATION` → `ACTIVE` (first login)

### 2. Role Entity

**Reference Entity**: System role with permissions

```typescript
interface Role {
  id: string;                    // Role identifier
  name: RoleName;               // Role name enum
  description: string;          // Role description
  permissions: Permission[];    // Associated permissions
  createdAt: Date;             // Creation timestamp
  updatedAt: Date;             // Last modification
}

enum RoleName {
  ADMIN = 'ADMIN',
  CREDIT_MANAGER = 'CREDIT_MANAGER',
  CREDIT_ANALYST = 'CREDIT_ANALYST', 
  DECISION_MAKER = 'DECISION_MAKER',
  COMMISSION_MEMBER = 'COMMISSION_MEMBER',
  USER = 'USER'
}
```

### 3. UserActivity Entity

**Audit Entity**: User action tracking for audit logs

```typescript
interface UserActivity {
  id: string;                   // Activity identifier
  userId: string;               // User who performed action
  performedBy: string;          // Admin who made changes (for admin actions)
  action: ActivityAction;       // Type of action performed
  details: Record<string, any>; // Action-specific details
  ipAddress: string;            // Source IP address
  userAgent: string;            // Browser/client information
  timestamp: Date;              // When action occurred
}

enum ActivityAction {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  PROFILE_UPDATE = 'PROFILE_UPDATE',
  ROLE_CHANGE = 'ROLE_CHANGE',
  STATUS_CHANGE = 'STATUS_CHANGE',
  ACCOUNT_CREATED = 'ACCOUNT_CREATED',
  ACCOUNT_DELETED = 'ACCOUNT_DELETED'
}
```

### 4. UserRoleHistory Entity

**Historical Entity**: Role change tracking

```typescript
interface UserRoleHistory {
  id: string;                   // History record identifier
  userId: string;               // Target user
  changedBy: string;            // Admin who made the change
  previousRoles: Role[];        // Roles before change
  newRoles: Role[];            // Roles after change
  reason?: string;             // Optional change reason
  timestamp: Date;              // When change occurred
}
```

## Form Data Models

### UserCreateDto

**Purpose**: User creation form data with validation

```typescript
interface UserCreateDto {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  department?: string;
  roleIds: string[];           // Role IDs to assign
  password: string;            // Initial password
  sendWelcomeEmail: boolean;   // Email notification flag
}
```

**Validation Schema** (Zod):
- Username: 3-50 chars, alphanumeric+underscore, uniqueness check
- Email: Valid format, uniqueness check
- Password: Min 8 chars, complexity requirements
- Roles: At least one role required

### UserUpdateDto

**Purpose**: User modification form data

```typescript
interface UserUpdateDto {
  email: string;               // Can be changed
  firstName: string;
  lastName: string;
  phone?: string;
  department?: string;
  roleIds: string[];
  // Note: username is immutable, password changed separately
}
```

### UserSearchAndFilterParams

**Purpose**: Advanced search and filtering parameters

```typescript
interface UserSearchAndFilterParams {
  search?: string;             // Search across name, username, email
  roles?: string[];            // Filter by role names
  status?: UserStatus[];       // Filter by user status
  departments?: string[];      // Filter by departments
  dateFrom?: Date;             // Created after date
  dateTo?: Date;              // Created before date
  lastLoginFrom?: Date;        // Last login after
  lastLoginTo?: Date;         // Last login before
  page: number;               // Pagination
  size: number;               // Page size
  sort: string;               // Sort specification
}
```

## UI State Models

### UserListState

**Purpose**: User list page UI state management

```typescript
interface UserListState {
  users: User[];               // Current page users
  totalElements: number;       // Total user count
  totalPages: number;          // Total page count
  currentPage: number;         // Current page number
  pageSize: number;           // Items per page
  isLoading: boolean;         // Loading indicator
  error?: string;             // Error message
  selectedUsers: string[];     // Selected user IDs for bulk operations
  filters: UserSearchAndFilterParams; // Active filters
  sortConfig: {
    field: string;
    direction: 'asc' | 'desc';
  };
}
```

### UserFormState

**Purpose**: User creation/editing form state

```typescript
interface UserFormState {
  isSubmitting: boolean;       // Form submission state
  validationErrors: Record<string, string>; // Field validation errors
  availableRoles: Role[];      // Roles for selection
  availableDepartments: string[]; // Departments for selection
  isUsernameAvailable?: boolean; // Username availability
  isEmailAvailable?: boolean;  // Email availability
  mode: 'create' | 'edit';    // Form operation mode
}
```

## Component Data Flow

### Data Flow Direction
1. **API Layer** (RTK Query) → **Component State** → **UI Components**
2. **Form Components** → **Validation** → **API Mutations** → **Cache Updates**

### State Management Strategy
- **Global State**: User lists, role references, authentication
- **Local State**: Form data, UI interactions, temporary selections
- **Server State**: Managed by RTK Query with automatic caching

## Relationships

### User → Role (Many-to-Many)
- Users can have multiple roles
- Roles can be assigned to multiple users
- Junction managed by backend API

### User → UserActivity (One-to-Many)
- Each user has multiple activity records
- Activity records are immutable (audit log)

### User → UserRoleHistory (One-to-Many) 
- Each user has role change history
- Historical records for compliance

## Business Rules

### User Creation Rules
1. Username must be unique across system
2. Email must be unique across system  
3. At least one role must be assigned
4. Password must meet complexity requirements
5. ADMIN role can only be assigned by existing ADMIN

### User Modification Rules
1. Username cannot be changed after creation
2. User cannot remove their own ADMIN role if they are the last ADMIN
3. Role changes require ADMIN privileges
4. Status changes are audited

### Access Control Rules
1. Only ADMIN users can access user management
2. Users can view their own profile
3. Password resets require ADMIN privileges
4. Bulk operations require ADMIN privileges

## Validation Requirements

### Client-Side Validation
- Real-time username/email availability checking
- Form field validation with immediate feedback
- Password complexity validation
- Role selection validation

### Server-Side Validation
- Business rule enforcement
- Data consistency checks
- Authorization validation
- Audit trail creation

---
**Status**: ✅ Complete - All entities, relationships, and business rules defined