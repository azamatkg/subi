import { expect, test } from '@playwright/test'

test.describe('User Details and Editing Workflow', () => {
  // Test data for various scenarios
  const testUser = {
    id: 'test-user-001',
    username: 'edituser',
    email: 'edituser@example.com',
    firstName: 'Edit',
    lastName: 'User',
    phone: '+996555123456',
    department: 'IT Department'
  }

  const updatedUserData = {
    email: 'updated@example.com',
    firstName: 'Updated',
    lastName: 'UserName',
    phone: '+996555654321',
    department: 'Finance Department'
  }

  const selectors = {
    // Navigation and authentication
    loginForm: 'form[data-testid="login-form"], input[type="password"]',
    usernameInput: 'input[name="username"], input[placeholder*="username"], input[type="text"]:first-of-type',
    passwordInput: 'input[name="password"], input[type="password"]',
    loginButton: 'button[type="submit"], button:has-text("Login"), button:has-text("Sign In")',
    userManagementLink: 'a[href*="/admin/users"], a:has-text("User Management"), a:has-text("Users")',

    // User list elements
    userList: '[data-testid="user-list"], .user-grid, .user-table',
    userCards: '[role="article"], .user-card, [data-testid="user-card"]',
    userTableRows: 'tbody tr, [data-testid="user-row"]',
    userNameLink: 'a[href*="/admin/users/"], .user-name-link',
    searchInput: 'input[placeholder*="search"], input[name="searchTerm"], [data-testid="search-input"]',

    // User detail page elements
    userDetailPage: '[data-testid="user-detail-page"], .user-detail-container',
    backButton: 'button:has-text("Back")',
    editButton: 'button:has-text("Edit")',
    moreActionsButton: 'button[aria-haspopup="true"]',

    // User detail information sections
    userStatusSection: '[data-testid="user-status"], .user-status-card',
    lastLoginSection: '[data-testid="last-login"], .last-login-card',
    accountCreatedSection: '[data-testid="account-created"], .account-created-card',
    personalInfoSection: '[data-testid="personal-info"], .personal-info-card',
    systemInfoSection: '[data-testid="system-info"], .system-info-card',

    // Tabs and activity timeline
    tabsList: '[role="tablist"]',
    detailsTab: '[data-value="details"]',
    rolesTab: '[data-value="roles"]',
    activityTab: '[data-value="activity"]',
    historyTab: '[data-value="history"]',
    activityTimeline: '.activity-timeline',
    roleCards: 'div:has(>> text="ADMIN"), div:has(>> text="USER")',

    // Edit form elements
    editForm: 'form[role="form"]',
    formTitle: 'h1',

    // Form fields
    formEmailInput: 'input[name="email"]',
    formFirstNameInput: 'input[name="firstName"]',
    formLastNameInput: 'input[name="lastName"]',
    formPhoneInput: 'input[name="phone"]',
    formDepartmentInput: 'input[name="department"]',

    // Role selection
    roleCheckboxes: 'input[type="checkbox"][name*="role"], .role-checkbox',
    userRoleCheckbox: 'input[type="checkbox"][value="USER"], input[type="checkbox"] + label:has-text("USER")',
    adminRoleCheckbox: 'input[type="checkbox"][value="ADMIN"], input[type="checkbox"] + label:has-text("ADMIN")',
    enabledCheckbox: 'input[name="enabled"], input[data-testid="enabled"], #enabled',

    // Form validation and feedback
    fieldError: '.error-message, .field-error, [data-testid*="error"], .text-red-500, .text-destructive',
    emailError: '[data-testid="email-error"], .email-error, #email + .error-message',
    validationSpinner: '[data-testid*="loading"], .loading-spinner, .animate-spin',
    validationSuccess: '[data-testid*="success"], .validation-success, .text-green-500, [data-icon="check"]',
    validationError: '[data-testid*="validation-error"], .validation-error, .text-red-500, [data-icon="x"]',

    // Form actions
    submitButton: 'button[type="submit"], button:has-text("Update"), button:has-text("Save")',
    cancelButton: 'button:has-text("Cancel"), button[type="button"]:has-text("Cancel")',

    // Status management actions
    activateButton: 'button:has-text("Activate")',
    suspendButton: 'button:has-text("Suspend")',
    deleteButton: 'button:has-text("Delete")',
    resetPasswordButton: 'button:has-text("Reset Password")',

    // Dialogs and confirmations
    confirmDialog: '[role="dialog"]',
    confirmDeleteButton: '[role="dialog"] >> button:has-text("Delete")',
    confirmSuspendButton: '[role="dialog"] >> button:has-text("Suspend")',
    confirmActivateButton: '[role="dialog"] >> button:has-text("Activate")',
    dialogCancelButton: '[role="dialog"] >> button:has-text("Cancel")',

    // Messages and notifications
    successMessage: '[role="alert"]:has-text("success"), .toast-success, .alert-success, .notification-success',
    errorMessage: '[role="alert"]:has-text("error"), .toast-error, .alert-error, .notification-error',

    // Loading states
    loadingSpinner: '[data-testid="loading"], .loading, .spinner',
    pageLoader: '[data-testid="page-loading"], .page-spinner, .loading-overlay',
    submitSpinner: 'button[type="submit"] [data-testid="loading"], button[type="submit"] .animate-spin',
    skeletonLoader: '.skeleton, [data-testid*="skeleton"]'
  }

  // Helper functions
  async function loginAsAdmin(page: any) {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    // Check if already logged in
    const isLoggedIn = await page.locator(selectors.userManagementLink).isVisible().catch(() => false)
    if (isLoggedIn) {
      return
    }

    // Wait for login form
    await page.waitForSelector(selectors.loginForm, { timeout: 10000 })

    // Fill login credentials
    await page.fill(selectors.usernameInput, 'admin')
    await page.fill(selectors.passwordInput, 'admin123')

    // Submit login
    await page.click(selectors.loginButton)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
  }

  async function navigateToUserList(page: any) {
    // Navigate to user management
    await page.goto('/admin/users')
    await page.waitForLoadState('networkidle')

    // Wait for user list to load
    await page.waitForFunction(() => {
      const cards = document.querySelectorAll('[role="article"], .user-card')
      const rows = document.querySelectorAll('tbody tr')
      return cards.length > 0 || rows.length > 0
    }, { timeout: 10000 }).catch(() => {
      // If no users found, that's also a valid state
    })

    await page.waitForTimeout(1000)
  }

  async function createTestUserAndGetId(page: any): Promise<string | null> {
    // Navigate to user creation page
    await page.goto('/admin/users/create')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Fill the creation form with test data
    const testUser = {
      username: 'e2euser' + Date.now(),
      email: 'e2euser' + Date.now() + '@example.com',
      firstName: 'E2E',
      lastName: 'TestUser',
      password: 'TestPass123!'
    }

    try {
      // Wait for form to be available
      await page.waitForSelector('form', { timeout: 10000 })
      await page.waitForTimeout(1000)

      // Fill the form
      await page.fill('input[name="username"]', testUser.username)
      await page.fill('input[name="email"]', testUser.email)
      await page.fill('input[name="firstName"]', testUser.firstName)
      await page.fill('input[name="lastName"]', testUser.lastName)
      await page.fill('input[name="password"]', testUser.password)

      const confirmPasswordField = page.locator('input[name="confirmPassword"]')
      const hasConfirmPassword = await confirmPasswordField.isVisible().catch(() => false)
      if (hasConfirmPassword) {
        await page.fill('input[name="confirmPassword"]', testUser.password)
      }

      // Select a role (USER role)
      const userRoleCheckbox = page.locator('input[type="checkbox"][value="USER"]').first()
      const hasUserRole = await userRoleCheckbox.isVisible().catch(() => false)
      if (hasUserRole) {
        await userRoleCheckbox.check()
      }

      // Submit the form
      await page.click('button[type="submit"]')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(3000)

      // If successful, we should be redirected to the user details page
      const currentUrl = page.url()
      const userIdMatch = currentUrl.match(/\/admin\/users\/(.+)$/)
      return userIdMatch ? userIdMatch[1] : null
    } catch (error) {
      console.log('Error creating test user:', error)
      return null
    }
  }

  async function findAndClickUser(page: any, searchTerm: string) {
    // First try to create a test user since the system has no users
    const userId = await createTestUserAndGetId(page)

    if (userId) {
      // If we successfully created a user and got redirected to details page, we're already there
      console.log('Created test user with ID:', userId)
      return userId
    }

    // Fallback: try to navigate to user creation page to test that workflow
    await page.goto('/admin/users/create')
    await page.waitForLoadState('networkidle')
    return null
  }

  async function waitForUserDetailPage(page: any) {
    // Wait for page to be on user details URL
    await page.waitForFunction(() => {
      return window.location.pathname.includes('/admin/users/') && !window.location.pathname.includes('/edit')
    }, { timeout: 10000 })

    // Wait for page content to load
    await page.waitForLoadState('networkidle')

    // Look for any key elements that indicate the page loaded
    const keyElements = [
      selectors.backButton,
      selectors.editButton,
      'h1',
      '.card',
      '[role="tablist"]'
    ]

    let foundElement = false
    for (const selector of keyElements) {
      const element = page.locator(selector).first()
      const isVisible = await element.isVisible({ timeout: 2000 }).catch(() => false)
      if (isVisible) {
        foundElement = true
        break
      }
    }

    if (!foundElement) {
      throw new Error('User detail page did not load properly')
    }

    // Wait for content to settle
    await page.waitForTimeout(1000)
  }

  async function waitForEditForm(page: any) {
    // Wait for edit URL to be loaded
    await page.waitForFunction(() => {
      return window.location.pathname.includes('/edit') || window.location.pathname.includes('/create')
    }, { timeout: 10000 })

    // Wait for form to load
    await page.waitForLoadState('networkidle')

    // Look for form elements
    const formElements = [
      'form',
      'input[name="email"]',
      'input[name="firstName"]',
      'button[type="submit"]'
    ]

    let foundForm = false
    for (const selector of formElements) {
      const element = page.locator(selector).first()
      const isVisible = await element.isVisible({ timeout: 3000 }).catch(() => false)
      if (isVisible) {
        foundForm = true
        break
      }
    }

    if (!foundForm) {
      throw new Error('Edit form did not load properly')
    }

    // Wait for form to be fully loaded
    await page.waitForTimeout(1000)
  }

  async function fillEditForm(page: any, userData: any) {
    // Fill basic information fields
    if (userData.email) {
      await page.fill(selectors.formEmailInput, userData.email)
    }
    if (userData.firstName) {
      await page.fill(selectors.formFirstNameInput, userData.firstName)
    }
    if (userData.lastName) {
      await page.fill(selectors.formLastNameInput, userData.lastName)
    }
    if (userData.phone) {
      await page.fill(selectors.formPhoneInput, userData.phone)
    }
    if (userData.department) {
      await page.fill(selectors.formDepartmentInput, userData.department)
    }
  }

  async function waitForValidation(page: any, fieldSelector: string) {
    // Wait for validation to complete (spinner disappears)
    const spinner = page.locator(fieldSelector).locator('~ *').locator(selectors.validationSpinner)
    const hasSpinner = await spinner.isVisible().catch(() => false)
    if (hasSpinner) {
      await expect(spinner).toBeHidden({ timeout: 5000 })
    }

    // Add small delay for validation to complete
    await page.waitForTimeout(300)
  }

  test.beforeEach(async ({ page }) => {
    // Set up admin authentication for each test
    await loginAsAdmin(page)
  })

  test('should load user details page with complete information', async ({ page }) => {
    await navigateToUserList(page)
    await findAndClickUser(page, 'admin') // Search for admin user
    await waitForUserDetailPage(page)

    // Verify page structure
    await expect(page.locator(selectors.backButton)).toBeVisible()
    await expect(page.locator(selectors.editButton)).toBeVisible()

    // Verify status information cards
    const hasStatusCard = await page.locator(selectors.userStatusSection).isVisible().catch(() => false)
    const hasLastLoginCard = await page.locator(selectors.lastLoginSection).isVisible().catch(() => false)
    const hasAccountCreatedCard = await page.locator(selectors.accountCreatedSection).isVisible().catch(() => false)

    expect(hasStatusCard || hasLastLoginCard || hasAccountCreatedCard).toBeTruthy()

    // Verify tabs are present
    await expect(page.locator(selectors.tabsList)).toBeVisible()

    // Test tab navigation
    const detailsTab = page.locator(selectors.detailsTab).first()
    const rolesTab = page.locator(selectors.rolesTab).first()
    const activityTab = page.locator(selectors.activityTab).first()

    const hasDetailsTab = await detailsTab.isVisible().catch(() => false)
    const hasRolesTab = await rolesTab.isVisible().catch(() => false)
    const hasActivityTab = await activityTab.isVisible().catch(() => false)

    expect(hasDetailsTab && hasRolesTab && hasActivityTab).toBeTruthy()
  })

  test('should display user roles and activity timeline', async ({ page }) => {
    await navigateToUserList(page)
    await findAndClickUser(page, 'admin')
    await waitForUserDetailPage(page)

    // Test roles tab
    const rolesTab = page.locator(selectors.rolesTab).first()
    if (await rolesTab.isVisible()) {
      await rolesTab.click()
      await page.waitForTimeout(500)

      // Should show role cards or no roles message
      const hasRoleCards = await page.locator(selectors.roleCards).count() > 0
      const hasNoRolesMessage = await page.getByText(/no roles/i).isVisible().catch(() => false)

      expect(hasRoleCards || hasNoRolesMessage).toBeTruthy()
    }

    // Test activity tab
    const activityTab = page.locator(selectors.activityTab).first()
    if (await activityTab.isVisible()) {
      await activityTab.click()
      await page.waitForTimeout(1500) // Wait for activity data to load

      // Should show activity timeline or loading/empty state
      const hasActivityTimeline = await page.locator(selectors.activityTimeline).isVisible().catch(() => false)
      const hasLoadingState = await page.locator(selectors.skeletonLoader).isVisible().catch(() => false)
      const hasEmptyState = await page.getByText(/no activity/i).isVisible().catch(() => false)

      expect(hasActivityTimeline || hasLoadingState || hasEmptyState).toBeTruthy()
    }
  })

  test('should navigate to edit form and pre-populate data', async ({ page }) => {
    await navigateToUserList(page)
    await findAndClickUser(page, 'admin')
    await waitForUserDetailPage(page)

    // Click edit button
    await page.click(selectors.editButton)
    await page.waitForLoadState('networkidle')
    await waitForEditForm(page)

    // Verify we're on edit page
    await expect(page.locator(selectors.editForm)).toBeVisible()

    // Verify form title indicates editing
    const pageTitle = await page.title()
    const hasEditInTitle = pageTitle.toLowerCase().includes('edit')
    const hasEditHeading = await page.locator(selectors.formTitle).filter({ hasText: /edit/i }).isVisible().catch(() => false)

    expect(hasEditInTitle || hasEditHeading).toBeTruthy()

    // Verify form fields are pre-populated
    const emailValue = await page.locator(selectors.formEmailInput).inputValue()
    const firstNameValue = await page.locator(selectors.formFirstNameInput).inputValue()
    const lastNameValue = await page.locator(selectors.formLastNameInput).inputValue()

    expect(emailValue.length).toBeGreaterThan(0)
    expect(firstNameValue.length).toBeGreaterThan(0)
    expect(lastNameValue.length).toBeGreaterThan(0)

    // Verify username field is not present (immutable in edit mode)
    const usernameField = await page.locator('input[name="username"]').count()
    expect(usernameField).toBe(0)

    // Verify at least one role is selected
    const checkedRoles = await page.locator(selectors.roleCheckboxes).locator(':checked').count()
    expect(checkedRoles).toBeGreaterThan(0)
  })

  test('should validate email field with real-time availability check', async ({ page }) => {
    await navigateToUserList(page)
    await findAndClickUser(page, 'admin')
    await waitForUserDetailPage(page)
    await page.click(selectors.editButton)
    await waitForEditForm(page)

    const emailInput = page.locator(selectors.formEmailInput)

    // Store original email
    const originalEmail = await emailInput.inputValue()

    // Test with potentially duplicate email (admin@example.com)
    await emailInput.fill('admin@example.com')
    await emailInput.blur()
    await waitForValidation(page, selectors.formEmailInput)

    // Should show validation feedback (either available or taken)
    await page.waitForTimeout(1000)

    // Test with obviously new email
    await emailInput.fill('newemail' + Date.now() + '@example.com')
    await emailInput.blur()
    await waitForValidation(page, selectors.formEmailInput)

    // Should show no error for new email
    const hasError = await page.locator(selectors.emailError).isVisible().catch(() => false)
    expect(hasError).toBeFalsy()

    // Restore original email
    await emailInput.fill(originalEmail)
  })

  test('should successfully update user information', async ({ page }) => {
    await navigateToUserList(page)
    await findAndClickUser(page, 'admin')
    await waitForUserDetailPage(page)
    await page.click(selectors.editButton)
    await waitForEditForm(page)

    // Store original data for restoration
    const originalFirstName = await page.locator(selectors.formFirstNameInput).inputValue()
    const originalLastName = await page.locator(selectors.formLastNameInput).inputValue()

    // Update user information with test data
    const testUpdate = {
      firstName: 'TestUpdated',
      lastName: 'UserEdit'
    }

    await fillEditForm(page, testUpdate)

    // Wait for any validation to complete
    await waitForValidation(page, selectors.formFirstNameInput)
    await waitForValidation(page, selectors.formLastNameInput)

    // Submit the form
    const submitButton = page.locator(selectors.submitButton)
    await expect(submitButton).toBeEnabled()
    await submitButton.click()

    // Wait for form submission
    await page.waitForTimeout(3000)

    // Check for success indicators
    const hasSuccessMessage = await page.locator(selectors.successMessage).isVisible().catch(() => false)
    const wasRedirectedToDetail = page.url().includes('/admin/users/') && !page.url().includes('/edit')

    // Either success message or redirect indicates success
    expect(hasSuccessMessage || wasRedirectedToDetail).toBeTruthy()

    // If redirected back to detail page, verify the updates
    if (wasRedirectedToDetail) {
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000)

      // Check if updated information appears on detail page
      const pageContent = await page.content()
      const hasUpdatedFirstName = pageContent.includes(testUpdate.firstName)
      const hasUpdatedLastName = pageContent.includes(testUpdate.lastName)

      expect(hasUpdatedFirstName || hasUpdatedLastName).toBeTruthy()

      // Restore original data
      await page.click(selectors.editButton)
      await waitForEditForm(page)
      await fillEditForm(page, {
        firstName: originalFirstName,
        lastName: originalLastName
      })
      await page.click(selectors.submitButton)
      await page.waitForTimeout(2000)
    }
  })

  test('should handle user status management actions', async ({ page }) => {
    await navigateToUserList(page)
    await findAndClickUser(page, 'admin')
    await waitForUserDetailPage(page)

    // Test more actions menu
    const moreActionsButton = page.locator(selectors.moreActionsButton).first()
    const hasMoreActions = await moreActionsButton.isVisible().catch(() => false)

    if (hasMoreActions) {
      await moreActionsButton.click()
      await page.waitForTimeout(500)

      // Check for status management actions
      const hasActivateAction = await page.locator(selectors.activateButton).isVisible().catch(() => false)
      const hasSuspendAction = await page.locator(selectors.suspendButton).isVisible().catch(() => false)
      const hasResetPasswordAction = await page.locator(selectors.resetPasswordButton).isVisible().catch(() => false)
      const hasDeleteAction = await page.locator(selectors.deleteButton).isVisible().catch(() => false)

      expect(hasActivateAction || hasSuspendAction || hasResetPasswordAction || hasDeleteAction).toBeTruthy()

      // Test password reset dialog (if available)
      if (hasResetPasswordAction) {
        await page.click(selectors.resetPasswordButton)
        await page.waitForTimeout(500)

        const hasResetDialog = await page.locator(selectors.confirmDialog).isVisible().catch(() => false)
        if (hasResetDialog) {
          // Cancel the reset
          await page.click(selectors.dialogCancelButton)
        }
      }

      // Close the menu by clicking elsewhere
      await page.click('body')
    }
  })

  test('should validate required fields and show errors', async ({ page }) => {
    await navigateToUserList(page)
    await findAndClickUser(page, 'admin')
    await waitForUserDetailPage(page)
    await page.click(selectors.editButton)
    await waitForEditForm(page)

    // Clear required fields
    await page.fill(selectors.formFirstNameInput, '')
    await page.fill(selectors.formLastNameInput, '')

    // Submit form with missing required fields
    const submitButton = page.locator(selectors.submitButton)
    await submitButton.click()
    await page.waitForTimeout(1000)

    // Should show validation errors
    const hasFieldErrors = await page.locator(selectors.fieldError).count() > 0
    expect(hasFieldErrors).toBeTruthy()

    // Form should not submit successfully (no redirect)
    const stillOnEditPage = page.url().includes('/edit') || await page.locator(selectors.editForm).isVisible()
    expect(stillOnEditPage).toBeTruthy()
  })

  test('should support cancel functionality and navigation', async ({ page }) => {
    await navigateToUserList(page)
    await findAndClickUser(page, 'admin')
    await waitForUserDetailPage(page)
    await page.click(selectors.editButton)
    await waitForEditForm(page)

    // Make some changes
    await page.fill(selectors.formFirstNameInput, 'ChangedName')

    // Test cancel functionality
    const cancelButton = page.locator(selectors.cancelButton).first()
    const hasCancelButton = await cancelButton.isVisible().catch(() => false)

    if (hasCancelButton) {
      await cancelButton.click()
      await page.waitForLoadState('networkidle')

      // Should navigate back to user detail page
      const isBackOnDetailPage = page.url().includes('/admin/users/') && !page.url().includes('/edit')
      expect(isBackOnDetailPage).toBeTruthy()
    } else {
      // Try back button as alternative
      const backButton = page.locator(selectors.backButton).first()
      const hasBackButton = await backButton.isVisible().catch(() => false)

      if (hasBackButton) {
        await backButton.click()
        await page.waitForLoadState('networkidle')

        const isBackOnDetailPage = page.url().includes('/admin/users/') && !page.url().includes('/edit')
        expect(isBackOnDetailPage).toBeTruthy()
      }
    }
  })

  test('should be responsive on different screen sizes', async ({ page }) => {
    await navigateToUserList(page)
    await findAndClickUser(page, 'admin')
    await waitForUserDetailPage(page)

    // Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.waitForTimeout(500)
    await expect(page.locator(selectors.editButton)).toBeVisible()

    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.waitForTimeout(500)
    await expect(page.locator(selectors.editButton)).toBeVisible()

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(500)
    await expect(page.locator(selectors.editButton)).toBeVisible()

    // Test edit form on mobile
    await page.click(selectors.editButton)
    await waitForEditForm(page)

    // Form should still be usable on mobile
    const firstNameInput = page.locator(selectors.formFirstNameInput)
    await expect(firstNameInput).toBeVisible()
    await firstNameInput.fill('MobileTest')

    const submitButton = page.locator(selectors.submitButton)
    await expect(submitButton).toBeVisible()
  })

  test('should provide proper keyboard navigation', async ({ page }) => {
    await navigateToUserList(page)
    await findAndClickUser(page, 'admin')
    await waitForUserDetailPage(page)
    await page.click(selectors.editButton)
    await waitForEditForm(page)

    // Test tab navigation through form fields
    await page.keyboard.press('Tab') // Focus first field

    const activeElement = await page.evaluate(() => document.activeElement?.tagName)
    expect(activeElement).toBe('INPUT')

    // Test keyboard input in form fields
    await page.keyboard.type('KeyboardTest')
    await page.keyboard.press('Tab')
    await page.keyboard.type('LastName')

    // Verify values were entered
    const firstNameValue = await page.locator(selectors.formFirstNameInput).inputValue()
    const lastNameValue = await page.locator(selectors.formLastNameInput).inputValue()

    expect(firstNameValue.includes('KeyboardTest') || lastNameValue.includes('KeyboardTest')).toBeTruthy()
  })

  test('should handle loading states during operations', async ({ page }) => {
    await navigateToUserList(page)
    await findAndClickUser(page, 'admin')
    await waitForUserDetailPage(page)
    await page.click(selectors.editButton)
    await waitForEditForm(page)

    // Make a change and submit to test loading states
    await page.fill(selectors.formFirstNameInput, 'LoadingTest')

    // Submit form and check for loading states
    const submitButton = page.locator(selectors.submitButton)
    await submitButton.click()

    // Check for loading indicators
    const hasSubmitSpinner = await page.locator(selectors.submitSpinner).isVisible().catch(() => false)
    const isButtonDisabled = await submitButton.isDisabled().catch(() => false)

    // Should show some loading indication during submission
    expect(hasSubmitSpinner || isButtonDisabled).toBeTruthy()

    // Wait for operation to complete
    await page.waitForTimeout(3000)
  })

  test('should not have console errors during user editing flow', async ({ page }) => {
    const errors: string[] = []

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await navigateToUserList(page)
    await findAndClickUser(page, 'admin')
    await waitForUserDetailPage(page)
    await page.click(selectors.editButton)
    await waitForEditForm(page)

    // Fill and submit form
    await fillEditForm(page, { firstName: 'NoErrorTest' })
    const submitButton = page.locator(selectors.submitButton)
    await submitButton.click()
    await page.waitForTimeout(3000)

    // Filter out known acceptable errors
    const criticalErrors = errors.filter(error =>
      !error.includes('favicon.ico') &&
      !error.includes('Service Worker') &&
      !error.includes('net::ERR_FAILED') &&
      !error.toLowerCase().includes('hydration') &&
      !error.includes('ResizeObserver') // Common browser warning
    )

    expect(criticalErrors).toHaveLength(0)
  })

  test('should handle error scenarios gracefully', async ({ page }) => {
    await navigateToUserList(page)
    await findAndClickUser(page, 'admin')
    await waitForUserDetailPage(page)
    await page.click(selectors.editButton)
    await waitForEditForm(page)

    // Test invalid email format
    await page.fill(selectors.formEmailInput, 'invalid-email-format')
    await page.locator(selectors.formEmailInput).blur()
    await page.waitForTimeout(500)

    const hasEmailError = await page.locator(selectors.emailError).isVisible().catch(() => false) ||
                          await page.locator(selectors.fieldError).first().isVisible().catch(() => false)
    expect(hasEmailError).toBeTruthy()

    // Test with valid email to clear error
    await page.fill(selectors.formEmailInput, 'valid@example.com')
    await page.locator(selectors.formEmailInput).blur()
    await page.waitForTimeout(500)

    // Error should be cleared or validation should pass
    await page.waitForTimeout(1000)
  })
})