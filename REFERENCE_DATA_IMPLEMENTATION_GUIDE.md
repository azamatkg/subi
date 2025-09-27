# Reference Data Implementation Guide & Task List

## 📋 Implementation Guide Document

### Overview
This guide provides a step-by-step approach to implement reference data management following the established patterns in the ASUBK system. Each reference entity should follow this consistent structure for maintainability and user experience consistency.

### Core Architecture Patterns

#### 1. File Structure Pattern (per reference entity)
```
src/
├── types/
│   └── {entity}.ts                    # TypeScript interfaces
├── store/api/
│   └── {entity}Api.ts                # RTK Query endpoints
├── hooks/
│   ├── use{Entity}Filters.ts         # Filter state management
│   └── use{Entity}Actions.ts         # CRUD actions
├── components/{entities}/
│   ├── {Entity}Card.tsx              # Card view component
│   ├── {Entity}Table.tsx             # Table view component
│   ├── {Entity}Filters.tsx           # Filter component
│   ├── {Entity}CreateForm.tsx        # Create form
│   ├── {Entity}EditForm.tsx          # Edit form
│   └── {Entity}DeleteDialog.tsx      # Delete confirmation
├── pages/admin/
│   ├── {Entity}ListPage.tsx          # Main list page
│   └── {Entity}DetailPage.tsx        # Detail page (if needed)
```

#### 2. TypeScript Interface Pattern
```typescript
// Base entity interface
export interface {Entity}ResponseDto {
  id: string | number;
  version?: number;
  nameEn: string;
  nameRu: string;
  nameKg: string;
  description?: string;
  status: ReferenceEntityStatus;
  createdAt: string;
  updatedAt: string;
  createdByUsername?: string;
  updatedByUsername?: string;
  // Entity-specific fields
}

// Create/Update DTOs
export interface {Entity}CreateDto {
  nameEn: string;
  nameRu: string;
  nameKg: string;
  description?: string;
  status: ReferenceEntityStatus;
  // Entity-specific fields
}

// Filter interfaces
export interface {Entity}FilterState {
  searchTerm: string;
  status: ReferenceEntityStatus | null;
  // Entity-specific filters
}
```

#### 3. API Integration Pattern
```typescript
// RTK Query endpoints following API manual
export const {entity}Api = baseApi.injectEndpoints({
  endpoints: builder => ({
    get{Entities}: builder.query<PaginatedResponse<{Entity}ResponseDto>, PaginationParams>({...}),
    getActive{Entities}: builder.query<{Entity}ResponseDto[], void>({...}),
    get{Entity}ById: builder.query<{Entity}ResponseDto, string>({...}),
    search{Entities}: builder.query<PaginatedResponse<{Entity}ResponseDto>, SearchParams>({...}),
    create{Entity}: builder.mutation<{Entity}ResponseDto, {Entity}CreateDto>({...}),
    update{Entity}: builder.mutation<{Entity}ResponseDto, UpdateParams>({...}),
    delete{Entity}: builder.mutation<void, string>({...}),
    // Entity-specific endpoints (e.g., exists checks, reference checks)
  })
});
```

#### 4. Component Pattern Guidelines

**Card Component Structure:**
- Header with icon, title, status badge, actions dropdown
- Details section with key information
- Role-based action visibility
- Hover effects and animations
- Accessibility attributes

**Table Component Structure:**
- Sortable headers using SortableTableHead
- Role-based column visibility
- Action dropdown in last column
- Responsive design with hidden columns on mobile
- Proper ARIA labels

**Filter Component Structure:**
- Search bar with icon
- Advanced filters in collapsible section
- Filter count badge
- Clear filters functionality
- Create button for admin users

### Reference Entity Specifications

#### 1. Currencies
**API Endpoints:** `/api/currencies`
**Special Features:**
- Currency code validation (3-letter codes)
- Reference checking before deletion
- Code-based lookups
**Required Fields:** `code`, `nameEn`, `nameRu`, `nameKg`
**Access Level:** Admin for CUD, All for Read

#### 2. Credit Purposes
**API Endpoints:** `/api/credit-purposes`
**Special Features:**
- Business category classification
- Reference checking for credit programs
**Required Fields:** `nameEn`, `nameRu`, `nameKg`
**Access Level:** Admin for CUD, All for Read

#### 3. Document Types
**API Endpoints:** `/api/document-types`
**Special Features:**
- Complex metadata fields structure
- Category and applicant type filtering
- Mandatory/optional flags
**Required Fields:** `name`, `nameEn`, `nameRu`, `nameKg`, `category`, `applicantType`
**Access Level:** Admin for CUD, All for Read

#### 4. Decision Making Bodies
**API Endpoints:** `/api/decision-making-bodies`
**Special Features:**
- Admin-only access
- Name uniqueness checking
**Required Fields:** `nameEn`, `nameRu`, `nameKg`
**Access Level:** Admin only

#### 5. Decision Types
**API Endpoints:** `/api/decision-types`
**Special Features:**
- Admin-only access
- Process classification
**Required Fields:** `nameEn`, `nameRu`, `nameKg`
**Access Level:** Admin only

#### 6. Floating Rate Types
**API Endpoints:** `/api/floating-rate-types`
**Special Features:**
- Interest rate calculations
- Reference checking for credit programs
**Required Fields:** `nameEn`, `nameRu`, `nameKg`
**Access Level:** Admin for CUD, All for Read

#### 7. Repayment Orders
**API Endpoints:** `/api/repayment-orders`
**Special Features:**
- Payment priority configuration
- Reference checking for credit programs
**Required Fields:** `nameEn`, `nameRu`, `nameKg`
**Access Level:** Admin for CUD, All for Read

---

## 🎯 Task List for Sequential Implementation

### Phase 1: Infrastructure Setup
- [ ] **Task 1.1**: Create base reference types and enums
  - [ ] Create `src/types/reference.ts` with common interfaces
  - [ ] Define `ReferenceEntityStatus` enum
  - [ ] Create pagination and response types

- [ ] **Task 1.2**: Setup base API infrastructure
  - [ ] Update `baseApi.ts` with reference data tags
  - [ ] Create base query/mutation patterns

- [ ] **Task 1.3**: Create common translation keys
  - [ ] Add reference management translations to all locales (EN/RU/KG)
  - [ ] Add status enum translations
  - [ ] Add common field translations

### Phase 2: Currencies Implementation (Start with simplest)
- [ ] **Task 2.1**: Create currency types
  - [ ] Define `CurrencyResponseDto`, `CurrencyCreateDto`, etc.
  - [ ] Create filter and search interfaces

- [ ] **Task 2.2**: Implement currency API
  - [ ] Create `currencyApi.ts` with all endpoints
  - [ ] Include code validation and existence checks

- [ ] **Task 2.3**: Create currency hooks
  - [ ] `useCurrencyFilters.ts` for filter state
  - [ ] `useCurrencyActions.ts` for CRUD operations

- [ ] **Task 2.4**: Build currency components
  - [ ] `CurrencyCard.tsx` following user card pattern
  - [ ] `CurrencyTable.tsx` with sortable columns
  - [ ] `CurrencyFilters.tsx` with search and status filter

- [ ] **Task 2.5**: Create currency forms
  - [ ] `CurrencyCreateForm.tsx` with validation
  - [ ] `CurrencyEditForm.tsx` with pre-populated data
  - [ ] `CurrencyDeleteDialog.tsx` with reference checking

- [ ] **Task 2.6**: Build currency list page
  - [ ] `CurrencyListPage.tsx` following user list pattern
  - [ ] Implement card/table view toggle
  - [ ] Add pagination and sorting

- [ ] **Task 2.7**: Testing and refinement
  - [ ] Test all CRUD operations
  - [ ] Verify role-based access
  - [ ] Test responsive design

### Phase 3: Credit Purposes Implementation
- [ ] **Task 3.1**: Create credit purpose types and interfaces
- [ ] **Task 3.2**: Implement credit purpose API endpoints
- [ ] **Task 3.3**: Create credit purpose hooks
- [ ] **Task 3.4**: Build credit purpose components
- [ ] **Task 3.5**: Create credit purpose forms
- [ ] **Task 3.6**: Build credit purpose list page
- [ ] **Task 3.7**: Testing and refinement

### Phase 4: Floating Rate Types Implementation
- [ ] **Task 4.1**: Create floating rate types and interfaces
- [ ] **Task 4.2**: Implement floating rate API endpoints
- [ ] **Task 4.3**: Create floating rate hooks
- [ ] **Task 4.4**: Build floating rate components
- [ ] **Task 4.5**: Create floating rate forms
- [ ] **Task 4.6**: Build floating rate list page
- [ ] **Task 4.7**: Testing and refinement

### Phase 5: Repayment Orders Implementation
- [ ] **Task 5.1**: Create repayment order types and interfaces
- [ ] **Task 5.2**: Implement repayment order API endpoints
- [ ] **Task 5.3**: Create repayment order hooks
- [ ] **Task 5.4**: Build repayment order components
- [ ] **Task 5.5**: Create repayment order forms
- [ ] **Task 5.6**: Build repayment order list page
- [ ] **Task 5.7**: Testing and refinement

### Phase 6: Document Types Implementation (Most Complex)
- [ ] **Task 6.1**: Create document types and metadata interfaces
- [ ] **Task 6.2**: Implement document type API endpoints
- [ ] **Task 6.3**: Create document type hooks with category filtering
- [ ] **Task 6.4**: Build document type components with metadata display
- [ ] **Task 6.5**: Create complex document type forms
- [ ] **Task 6.6**: Build document type list page with advanced filtering
- [ ] **Task 6.7**: Testing and refinement

### Phase 7: Decision Making Bodies Implementation (Admin Only)
- [ ] **Task 7.1**: Create decision making body types and interfaces
- [ ] **Task 7.2**: Implement decision making body API endpoints
- [ ] **Task 7.3**: Create decision making body hooks
- [ ] **Task 7.4**: Build decision making body components
- [ ] **Task 7.5**: Create decision making body forms
- [ ] **Task 7.6**: Build decision making body list page
- [ ] **Task 7.7**: Testing and refinement

### Phase 8: Decision Types Implementation (Admin Only)
- [ ] **Task 8.1**: Create decision type types and interfaces
- [ ] **Task 8.2**: Implement decision type API endpoints
- [ ] **Task 8.3**: Create decision type hooks
- [ ] **Task 8.4**: Build decision type components
- [ ] **Task 8.5**: Create decision type forms
- [ ] **Task 8.6**: Build decision type list page
- [ ] **Task 8.7**: Testing and refinement

### Phase 9: Navigation & Integration
- [ ] **Task 9.1**: Update ReferencesPage with navigation to all entities
- [ ] **Task 9.2**: Add routes for all reference entities
- [ ] **Task 9.3**: Update navigation constants
- [ ] **Task 9.4**: Add breadcrumb support
- [ ] **Task 9.5**: Test navigation flow

### Phase 10: Final Testing & Polish
- [ ] **Task 10.1**: End-to-end testing of all entities
- [ ] **Task 10.2**: Performance optimization
- [ ] **Task 10.3**: Accessibility audit
- [ ] **Task 10.4**: Mobile responsiveness testing
- [ ] **Task 10.5**: Translation completeness check
- [ ] **Task 10.6**: Code review and cleanup

---

## 🔧 Implementation Tips

### Best Practices
1. **Start with Currencies** - simplest entity to establish patterns
2. **Copy-Paste-Modify** - use user management as template
3. **Test Each Phase** - don't move to next entity until current is complete
4. **Consistent Naming** - follow established conventions
5. **Role Security** - always check permissions
6. **Responsive Design** - mobile-first approach
7. **Accessibility** - proper ARIA labels and keyboard navigation

### Common Pitfalls to Avoid
1. Inconsistent file naming conventions
2. Missing translation keys
3. Forgetting role-based access control
4. Not handling loading/error states
5. Inconsistent component styling
6. Missing form validation
7. Not testing reference constraint checking

### Development Order Rationale
1. **Currencies** - Simple, good for establishing patterns
2. **Credit Purposes** - Similar complexity, builds confidence
3. **Floating Rate Types** - Standard reference entity
4. **Repayment Orders** - Standard reference entity
5. **Document Types** - Most complex, saved for when patterns are solid
6. **Decision entities** - Admin-only, different access patterns

### Translation Keys Template

Add these keys to all locale files (`en.json`, `ru.json`, `kg.json`):

```json
{
  "references": {
    "title": "Reference Data Management",
    "description": "Manage system reference data and lookups",
    "entities": {
      "currencies": "Currencies",
      "creditPurposes": "Credit Purposes",
      "documentTypes": "Document Types",
      "decisionMakingBodies": "Decision Making Bodies",
      "decisionTypes": "Decision Types",
      "floatingRateTypes": "Floating Rate Types",
      "repaymentOrders": "Repayment Orders"
    },
    "status": {
      "active": "Active",
      "inactive": "Inactive"
    },
    "fields": {
      "nameEn": "Name (English)",
      "nameRu": "Name (Russian)",
      "nameKg": "Name (Kyrgyz)",
      "description": "Description",
      "status": "Status",
      "code": "Code",
      "created": "Created",
      "updated": "Updated"
    },
    "actions": {
      "create": "Create New",
      "edit": "Edit",
      "delete": "Delete",
      "view": "View Details"
    },
    "messages": {
      "noResults": "No items found",
      "confirmDelete": "Are you sure you want to delete {item}?",
      "deleteSuccess": "Item deleted successfully",
      "createSuccess": "Item created successfully",
      "updateSuccess": "Item updated successfully",
      "referenced": "Cannot delete - item is referenced by other entities"
    }
  }
}
```

### Form Validation Schema Template

```typescript
import { z } from 'zod';

export const {entity}CreateSchema = z.object({
  nameEn: z.string().min(1, 'English name is required').max(100),
  nameRu: z.string().min(1, 'Russian name is required').max(100),
  nameKg: z.string().min(1, 'Kyrgyz name is required').max(100),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']),
  // Entity-specific fields
});

export type {Entity}CreateFormData = z.infer<typeof {entity}CreateSchema>;
```

This implementation approach ensures each reference entity follows consistent patterns, creating a maintainable and user-friendly reference data management system that seamlessly integrates with the existing ASUBK application architecture.