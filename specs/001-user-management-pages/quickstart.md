# Quickstart: User Management Pages

**Feature**: User Management Pages Implementation  
**Purpose**: Validate user story implementation with end-to-end testing scenarios  
**Target**: Test implementation against all 20 functional requirements

## Prerequisites

- ASUBK Financial Management System running locally
- Admin user account with credentials
- Test data seeded (roles, departments, sample users)
- Frontend development server running on port 5173
- Backend API server running on port 8080

## Quick Validation Test (5 minutes)

### 1. Authentication & Access Control (FR-014, FR-016)

```bash
# Start development server
cd subi-frontend && npm run dev

# Navigate to: http://localhost:5173/login
# Login with ADMIN credentials
# Verify redirect to dashboard
# Navigate to: /admin/users
# Verify user management page loads
```

**Expected**: Access granted to ADMIN user, user management page displays

### 2. User List Display (FR-001, FR-015)

```bash
# On /admin/users page
# Verify user list displays with pagination
# Check responsive design on mobile (F12 → device simulation)
# Verify sorting controls work
# Check page size controls (10, 20, 50, 100 items)
```

**Expected**: Paginated user list, responsive design, functional controls

### 3. Search & Filter Functionality (FR-008, FR-009)

```bash
# Use search box to search for existing username
# Test search across email addresses
# Apply role filter (select ADMIN role)
# Apply status filter (ACTIVE users only)
# Combine multiple filters
# Clear filters and verify reset
```

**Expected**: Search results update in real-time, filters combine properly

### 4. User Creation Workflow (FR-002, FR-003, FR-004, FR-012, FR-013)

```bash
# Click "Create New User" button
# Fill form with new user data:
#   - username: testuser123
#   - email: test@example.com  
#   - firstName: Test
#   - lastName: User
#   - roles: USER role selected
#   - password: TestPass123!
# Submit form
# Verify success message
# Check new user appears in list
```

**Expected**: Form validation, real-time username/email checking, user created successfully

## Comprehensive User Story Validation (20 minutes)

### Test Scenario 1: Admin User List Management (FR-001, FR-008, FR-009, FR-020)

**Given**: I am an authenticated ADMIN user  
**When**: I navigate to user management  
**Then**: I see a paginated list with user information

**Steps**:
1. Navigate to `/admin/users`
2. Verify columns: Name, Username, Email, Roles, Status, Last Login
3. Test pagination (next/previous/page numbers)
4. Test sorting by each column
5. Test search functionality across multiple fields
6. Test role-based filtering
7. Test status-based filtering
8. Test export functionality (CSV download)

**Validation Checklist**:
- [ ] All users display with correct information
- [ ] Pagination works correctly
- [ ] Sorting is functional for all columns
- [ ] Search finds users by username, email, names
- [ ] Filters work independently and combined
- [ ] Export downloads valid CSV file

### Test Scenario 2: User Creation & Validation (FR-002, FR-003, FR-004, FR-012)

**Given**: I am on user creation form  
**When**: I create a new user with complete information  
**Then**: User is created with proper validation

**Steps**:
1. Click "Create New User" button
2. Test username validation:
   - Enter existing username → should show "already taken"
   - Enter invalid characters → should show format error
   - Enter valid new username → should show "available"
3. Test email validation:
   - Enter existing email → should show "already taken"
   - Enter invalid format → should show format error
   - Enter valid new email → should show "available"
4. Complete form with valid data
5. Submit and verify user creation
6. Check user appears in list with correct information

**Validation Checklist**:
- [ ] Real-time username availability checking
- [ ] Real-time email availability checking
- [ ] Form validation prevents invalid submissions
- [ ] Success message displays in current language
- [ ] New user appears in user list immediately

### Test Scenario 3: User Details & Editing (FR-005, FR-006, FR-011)

**Given**: I am viewing a user's details  
**When**: I edit user information  
**Then**: Changes are saved with proper validation

**Steps**:
1. Click on user name in list to view details
2. Verify complete user profile displays:
   - Basic information (name, email, username)
   - Role assignments
   - Account status and creation date
   - Last login information
   - Activity history timeline
3. Click "Edit" button
4. Modify user information (except username - should be disabled)
5. Change user roles
6. Save changes
7. Verify updates reflected immediately

**Validation Checklist**:
- [ ] User details page shows complete information
- [ ] Activity history displays recent actions
- [ ] Edit form pre-populates with current data
- [ ] Username field is disabled (immutable)
- [ ] Role changes are validated
- [ ] Updates save successfully

### Test Scenario 4: User Status Management (FR-007, FR-011, FR-017)

**Given**: I am managing user accounts  
**When**: I change user status or delete users  
**Then**: Actions are completed with proper confirmation

**Steps**:
1. Select user from list
2. Test status changes:
   - Activate user → verify status changes to ACTIVE
   - Suspend user with reason → verify SUSPENDED status
   - Reactivate suspended user
3. Test user deletion:
   - Click delete button
   - Verify confirmation dialog appears
   - Confirm deletion
   - Verify user removed from list
4. Check activity log records all changes

**Validation Checklist**:
- [ ] Status changes reflect immediately
- [ ] Confirmation dialogs prevent accidental deletion
- [ ] Activity log records all administrative actions
- [ ] Cannot delete last ADMIN user (business rule)

### Test Scenario 5: Bulk Operations (FR-019)

**Given**: I need to manage multiple users  
**When**: I perform bulk operations  
**Then**: All selected users are updated

**Steps**:
1. Select multiple users using checkboxes
2. Use bulk actions toolbar:
   - Bulk status update (activate/suspend multiple users)
   - Bulk role assignment
3. Verify confirmation dialog for bulk operations
4. Confirm and verify all selected users updated
5. Check activity log for bulk operation records

**Validation Checklist**:
- [ ] Bulk selection works correctly
- [ ] Bulk status updates apply to all selected users
- [ ] Bulk role changes apply correctly
- [ ] Confirmation prevents accidental bulk changes
- [ ] Activity log records bulk operations

### Test Scenario 6: Multilingual Support (FR-013)

**Given**: I am using the system in different languages  
**When**: I switch languages  
**Then**: All UI elements update correctly

**Steps**:
1. Switch to Kyrgyz language
2. Navigate user management pages
3. Create/edit user (verify form labels)
4. Check error messages appear in Kyrgyz
5. Switch to Russian and repeat
6. Switch to English and verify
7. Test status enum translations (ACTIVE, SUSPENDED, etc.)

**Validation Checklist**:
- [ ] All UI text translates correctly
- [ ] Form labels and placeholders translate
- [ ] Error messages appear in selected language
- [ ] Status enums display translated values
- [ ] Date/time formats follow locale conventions

### Test Scenario 7: Error Handling (FR-018)

**Given**: System encounters API errors  
**When**: Backend is unavailable or returns errors  
**Then**: User-friendly error messages display

**Steps**:
1. Temporarily stop backend server
2. Try to load user list → should show connection error
3. Try to create user → should show submission error
4. Restart backend server
5. Test form validation errors:
   - Submit incomplete form
   - Try to create duplicate username
   - Try invalid email format
6. Verify all errors display user-friendly messages

**Validation Checklist**:
- [ ] Network errors show appropriate messages
- [ ] Validation errors are clear and helpful
- [ ] System recovers gracefully when backend returns
- [ ] Error messages respect current language setting

## Performance Validation (5 minutes)

### Page Load Performance
```bash
# Open browser dev tools (F12)
# Navigate to user management page
# Check Network tab for load times
# Verify initial page load < 3 seconds
```

**Expected**: Page loads within performance targets

### Real-time Validation Performance
```bash
# On user creation form
# Type in username field rapidly
# Verify debounced validation (not every keystroke)
# Check response time < 200ms for validation
```

**Expected**: Smooth typing experience, fast validation feedback

## Success Criteria Verification

After completing all test scenarios, verify:

- [ ] **FR-001**: Paginated user list with sorting/filtering ✅
- [ ] **FR-002**: User creation with validation ✅
- [ ] **FR-003**: Real-time username validation ✅
- [ ] **FR-004**: Real-time email validation ✅
- [ ] **FR-005**: Complete user details view ✅
- [ ] **FR-006**: User editing with validation ✅
- [ ] **FR-007**: User deletion with confirmation ✅
- [ ] **FR-008**: Multi-field search functionality ✅
- [ ] **FR-009**: Advanced filtering capabilities ✅
- [ ] **FR-010**: Role and permission integration ✅
- [ ] **FR-011**: User status management ✅
- [ ] **FR-012**: Input validation per API spec ✅
- [ ] **FR-013**: Multilingual error messages ✅
- [ ] **FR-014**: Role-based access control ✅
- [ ] **FR-015**: Responsive design ✅
- [ ] **FR-016**: Session security ✅
- [ ] **FR-017**: Activity audit logging ✅
- [ ] **FR-018**: Graceful error handling ✅
- [ ] **FR-019**: Bulk operations ✅
- [ ] **FR-020**: Data export functionality ✅

## Troubleshooting Common Issues

### Issue: User list not loading
**Solution**: Check backend API is running on port 8080, verify JWT token is valid

### Issue: Real-time validation not working  
**Solution**: Verify debouncing is working, check network requests in dev tools

### Issue: Language switching not working
**Solution**: Check i18n configuration, verify translation files exist

### Issue: Responsive design problems
**Solution**: Test in browser dev tools device mode, check CSS media queries

### Issue: Form submission errors
**Solution**: Check form validation, verify API contract matches backend expectations

---

**Quickstart Status**: ✅ Ready for implementation validation  
**Estimated Testing Time**: 30 minutes total  
**Success Criteria**: All functional requirements validated ✅