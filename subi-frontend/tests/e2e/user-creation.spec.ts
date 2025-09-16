import { expect, test } from '@playwright/test'

test.describe('User Creation and Validation Workflow', () => {
  // Test data for various scenarios
  const validTestUser = {
    username: 'newuser123',
    email: 'newuser@example.com',
    firstName: 'New',
    lastName: 'User',
    password: 'SecurePass123!'
  }

  const invalidTestCases = {
    shortUsername: 'ab',
    longUsername: 'a'.repeat(51),
    invalidUsernameChars: 'user@#$',
    invalidEmail: 'invalid-email',
    weakPassword: '123',
    emptyFields: {
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      password: ''
    }
  }

  const selectors = {
    // Navigation and authentication
    loginForm: 'form[data-testid="login-form"], input[type="password"]',
    usernameInput: 'input[name="username"], input[placeholder*="username"], input[type="text"]:first-of-type',
    passwordInput: 'input[name="password"], input[type="password"]',
    loginButton: 'button[type="submit"], button:has-text("Login"), button:has-text("Sign In")',
    userManagementLink: 'a[href*="/admin/users"], a:has-text("User Management"), a:has-text("Users")',

    // User management page
    createUserButton: '.add-new-user-button, button:has-text("Create"), button:has-text("New User"), button:has-text("Add User")',
    backButton: 'button:has-text("Back"), a:has-text("Back"), button:has([data-icon="arrow-left"])',

    // User creation form
    userForm: 'form[data-testid="user-form"], form.user-form, form',

    // Form fields
    formUsernameInput: 'input[name="username"], input[data-testid="username"], #username',
    formEmailInput: 'input[name="email"], input[data-testid="email"], #email, input[type="email"]',
    formFirstNameInput: 'input[name="firstName"], input[data-testid="firstName"], #firstName',
    formLastNameInput: 'input[name="lastName"], input[data-testid="lastName"], #lastName',
    formPasswordInput: 'input[name="password"], input[data-testid="password"], #password',
    confirmPasswordInput: 'input[name="confirmPassword"], input[data-testid="confirmPassword"], #confirmPassword',

    // Role selection
    roleCheckboxes: 'input[type="checkbox"][name*="role"], .role-checkbox',
    userRoleCheckbox: 'input[type="checkbox"][value="USER"], input[type="checkbox"] + label:has-text("USER")',
    adminRoleCheckbox: 'input[type="checkbox"][value="ADMIN"], input[type="checkbox"] + label:has-text("ADMIN")',

    // Form validation
    fieldError: '.error-message, .field-error, [data-testid*="error"], .text-red-500, .text-destructive',
    usernameError: '[data-testid="username-error"], .username-error, #username + .error-message',
    emailError: '[data-testid="email-error"], .email-error, #email + .error-message',
    passwordError: '[data-testid="password-error"], .password-error, #password + .error-message',

    // Real-time validation indicators
    validationSpinner: '[data-testid*="loading"], .loading-spinner, .animate-spin',
    validationSuccess: '[data-testid*="success"], .validation-success, .text-green-500, [data-icon="check"]',
    validationError: '[data-testid*="validation-error"], .validation-error, .text-red-500, [data-icon="x"]',

    // Form actions
    submitButton: 'button[type="submit"], button:has-text("Create"), button:has-text("Save"), button:has-text("Submit")',
    cancelButton: 'button:has-text("Cancel"), button[type="button"]:has-text("Cancel")',
    resetButton: 'button:has-text("Reset"), button[type="reset"]',

    // Success and error states
    successMessage: '[role="alert"]:has-text("success"), .toast-success, .alert-success, .notification-success',
    errorMessage: '[role="alert"]:has-text("error"), .toast-error, .alert-error, .notification-error',
    serverError: '.server-error, [data-testid="server-error"]',

    // Loading states
    submitSpinner: 'button[type="submit"] [data-testid="loading"], button[type="submit"] .animate-spin',
    pageLoader: '[data-testid="page-loading"], .page-spinner, .loading-overlay',

    // Form help text
    passwordHelpText: '.password-help, [data-testid="password-help"], .password-requirements',
    fieldHelpText: '.field-help, .help-text, .form-description'
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

  async function navigateToUserCreation(page: any) {
    // Navigate to user management
    await page.goto('/admin/users')
    await page.waitForLoadState('networkidle')

    // Click create user button
    const createButton = page.locator(selectors.createUserButton).first()
    await expect(createButton).toBeVisible({ timeout: 10000 })
    await createButton.click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  }

  async function waitForFormLoad(page: any) {
    // Wait for form to be visible
    await expect(page.locator(selectors.userForm)).toBeVisible({ timeout: 10000 })

    // Wait for form fields to be interactive
    await expect(page.locator(selectors.formUsernameInput)).toBeVisible()
    await expect(page.locator(selectors.formEmailInput)).toBeVisible()

    // Wait a bit more for any dynamic loading
    await page.waitForTimeout(1000)
  }

  async function fillUserForm(page: any, userData: any) {
    // Fill basic information
    await page.fill(selectors.formUsernameInput, userData.username)
    await page.fill(selectors.formEmailInput, userData.email)
    await page.fill(selectors.formFirstNameInput, userData.firstName)
    await page.fill(selectors.formLastNameInput, userData.lastName)

    // Fill password if provided
    if (userData.password) {
      await page.fill(selectors.formPasswordInput, userData.password)

      // Fill confirm password if field exists
      const confirmPasswordExists = await page.locator(selectors.confirmPasswordInput).isVisible().catch(() => false)
      if (confirmPasswordExists) {
        await page.fill(selectors.confirmPasswordInput, userData.password)
      }
    }

    // Select USER role by default
    const userRoleCheckbox = page.locator(selectors.userRoleCheckbox).first()
    const isUserRoleVisible = await userRoleCheckbox.isVisible().catch(() => false)
    if (isUserRoleVisible) {
      const isChecked = await userRoleCheckbox.isChecked()
      if (!isChecked) {
        await userRoleCheckbox.check()
      }
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

  test('should load user creation form with all required fields', async ({ page }) => {
    await navigateToUserCreation(page)
    await waitForFormLoad(page)

    // Verify form is displayed
    await expect(page.locator(selectors.userForm)).toBeVisible()

    // Verify required form fields are present
    await expect(page.locator(selectors.formUsernameInput)).toBeVisible()
    await expect(page.locator(selectors.formEmailInput)).toBeVisible()
    await expect(page.locator(selectors.formFirstNameInput)).toBeVisible()
    await expect(page.locator(selectors.formLastNameInput)).toBeVisible()
    await expect(page.locator(selectors.formPasswordInput)).toBeVisible()

    // Verify form actions are present
    await expect(page.locator(selectors.submitButton)).toBeVisible()

    // Check for cancel or back button
    const hasCancelButton = await page.locator(selectors.cancelButton).isVisible().catch(() => false)
    const hasBackButton = await page.locator(selectors.backButton).isVisible().catch(() => false)
    expect(hasCancelButton || hasBackButton).toBeTruthy()

    // Verify role selection is available
    const hasRoleCheckboxes = await page.locator(selectors.roleCheckboxes).count() > 0
    expect(hasRoleCheckboxes).toBeTruthy()
  })

  test('should validate username field with real-time feedback', async ({ page }) => {
    await navigateToUserCreation(page)
    await waitForFormLoad(page)

    const usernameInput = page.locator(selectors.formUsernameInput)

    // Test short username validation
    await usernameInput.fill(invalidTestCases.shortUsername)
    await usernameInput.blur()
    await waitForValidation(page, selectors.formUsernameInput)

    const hasShortUsernameError = await page.locator(selectors.usernameError).isVisible().catch(() => false) ||
                                  await page.locator(selectors.fieldError).first().isVisible().catch(() => false)
    expect(hasShortUsernameError).toBeTruthy()

    // Test long username validation
    await usernameInput.fill(invalidTestCases.longUsername)
    await usernameInput.blur()
    await waitForValidation(page, selectors.formUsernameInput)

    const hasLongUsernameError = await page.locator(selectors.usernameError).isVisible().catch(() => false) ||
                                 await page.locator(selectors.fieldError).first().isVisible().catch(() => false)
    expect(hasLongUsernameError).toBeTruthy()

    // Test invalid characters
    await usernameInput.fill(invalidTestCases.invalidUsernameChars)
    await usernameInput.blur()
    await waitForValidation(page, selectors.formUsernameInput)

    const hasInvalidCharsError = await page.locator(selectors.usernameError).isVisible().catch(() => false) ||
                                 await page.locator(selectors.fieldError).first().isVisible().catch(() => false)
    expect(hasInvalidCharsError).toBeTruthy()

    // Test valid username with real-time availability check
    await usernameInput.fill(validTestUser.username)
    await usernameInput.blur()
    await waitForValidation(page, selectors.formUsernameInput)

    // Should show success indicator or no error
    const hasError = await page.locator(selectors.usernameError).isVisible().catch(() => false)
    expect(hasError).toBeFalsy()
  })

  test('should validate email field with real-time availability check', async ({ page }) => {
    await navigateToUserCreation(page)
    await waitForFormLoad(page)

    const emailInput = page.locator(selectors.formEmailInput)

    // Test invalid email format
    await emailInput.fill(invalidTestCases.invalidEmail)
    await emailInput.blur()
    await waitForValidation(page, selectors.formEmailInput)

    const hasInvalidEmailError = await page.locator(selectors.emailError).isVisible().catch(() => false) ||
                                 await page.locator(selectors.fieldError).first().isVisible().catch(() => false)
    expect(hasInvalidEmailError).toBeTruthy()

    // Test valid email format
    await emailInput.fill(validTestUser.email)
    await emailInput.blur()
    await waitForValidation(page, selectors.formEmailInput)

    // Should show no error for valid email
    const hasError = await page.locator(selectors.emailError).isVisible().catch(() => false)
    expect(hasError).toBeFalsy()
  })

  test('should validate password field with strength requirements', async ({ page }) => {
    await navigateToUserCreation(page)
    await waitForFormLoad(page)

    const passwordInput = page.locator(selectors.formPasswordInput)

    // Test weak password
    await passwordInput.fill(invalidTestCases.weakPassword)
    await passwordInput.blur()
    await page.waitForTimeout(500)

    const hasWeakPasswordError = await page.locator(selectors.passwordError).isVisible().catch(() => false) ||
                                 await page.locator(selectors.fieldError).first().isVisible().catch(() => false)
    expect(hasWeakPasswordError).toBeTruthy()

    // Test strong password
    await passwordInput.fill(validTestUser.password)
    await passwordInput.blur()
    await page.waitForTimeout(500)

    // Should show no error for strong password
    const hasError = await page.locator(selectors.passwordError).isVisible().catch(() => false)
    expect(hasError).toBeFalsy()
  })

  test('should validate required fields on form submission', async ({ page }) => {
    await navigateToUserCreation(page)
    await waitForFormLoad(page)

    // Submit empty form
    const submitButton = page.locator(selectors.submitButton)
    await submitButton.click()
    await page.waitForTimeout(1000)

    // Should show validation errors for required fields
    const hasFieldErrors = await page.locator(selectors.fieldError).count() > 0
    expect(hasFieldErrors).toBeTruthy()

    // Form should not submit successfully
    const hasSuccessMessage = await page.locator(selectors.successMessage).isVisible().catch(() => false)
    expect(hasSuccessMessage).toBeFalsy()
  })

  test('should successfully create a new user with valid data', async ({ page }) => {
    await navigateToUserCreation(page)
    await waitForFormLoad(page)

    // Fill form with valid user data
    await fillUserForm(page, validTestUser)

    // Wait for real-time validations to complete
    await waitForValidation(page, selectors.formUsernameInput)
    await waitForValidation(page, selectors.formEmailInput)

    // Submit the form
    const submitButton = page.locator(selectors.submitButton)
    await expect(submitButton).toBeEnabled()
    await submitButton.click()

    // Wait for form submission
    await page.waitForTimeout(3000)

    // Check for success indicators
    const hasSuccessMessage = await page.locator(selectors.successMessage).isVisible().catch(() => false)
    const wasRedirected = page.url().includes('/admin/users') && !page.url().includes('/create')

    // Either success message or redirect to user list indicates success
    expect(hasSuccessMessage || wasRedirected).toBeTruthy()

    // If redirected to user list, verify the new user appears
    if (wasRedirected) {
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000)

      // Search for the newly created user
      const searchInput = page.locator('input[placeholder*="search"], input[name="searchTerm"]').first()
      const hasSearchInput = await searchInput.isVisible().catch(() => false)

      if (hasSearchInput) {
        await searchInput.fill(validTestUser.username)
        await page.waitForTimeout(1000)

        // Check if user appears in search results
        const pageContent = await page.content()
        expect(pageContent).toContain(validTestUser.username)
      }
    }
  })

  test('should handle server errors gracefully', async ({ page }) => {
    await navigateToUserCreation(page)
    await waitForFormLoad(page)

    // Fill form with data that might cause server error (duplicate user)
    const duplicateUser = {
      ...validTestUser,
      username: 'admin', // This username likely exists
      email: 'admin@example.com' // This email likely exists
    }

    await fillUserForm(page, duplicateUser)

    // Submit the form
    const submitButton = page.locator(selectors.submitButton)
    await submitButton.click()
    await page.waitForTimeout(3000)

    // Should show error message (either validation error or server error)
    const hasErrorMessage = await page.locator(selectors.errorMessage).isVisible().catch(() => false) ||
                           await page.locator(selectors.serverError).isVisible().catch(() => false) ||
                           await page.locator(selectors.fieldError).count() > 0

    expect(hasErrorMessage).toBeTruthy()

    // Form should still be visible (not redirected)
    await expect(page.locator(selectors.userForm)).toBeVisible()
  })

  test('should support form reset functionality', async ({ page }) => {
    await navigateToUserCreation(page)
    await waitForFormLoad(page)

    // Fill some form data
    await page.fill(selectors.formUsernameInput, 'testuser')
    await page.fill(selectors.formEmailInput, 'test@example.com')
    await page.fill(selectors.formFirstNameInput, 'Test')

    // Check if reset button exists and use it
    const resetButton = page.locator(selectors.resetButton).first()
    const hasResetButton = await resetButton.isVisible().catch(() => false)

    if (hasResetButton) {
      await resetButton.click()
      await page.waitForTimeout(500)

      // Verify fields are cleared
      const usernameValue = await page.locator(selectors.formUsernameInput).inputValue()
      const emailValue = await page.locator(selectors.formEmailInput).inputValue()
      const firstNameValue = await page.locator(selectors.formFirstNameInput).inputValue()

      expect(usernameValue).toBe('')
      expect(emailValue).toBe('')
      expect(firstNameValue).toBe('')
    }
  })

  test('should support cancel/back navigation', async ({ page }) => {
    await navigateToUserCreation(page)
    await waitForFormLoad(page)

    // Fill some form data
    await page.fill(selectors.formUsernameInput, 'testuser')

    // Try cancel button first
    const cancelButton = page.locator(selectors.cancelButton).first()
    const hasCancelButton = await cancelButton.isVisible().catch(() => false)

    if (hasCancelButton) {
      await cancelButton.click()
      await page.waitForLoadState('networkidle')

      // Should navigate back to user list
      expect(page.url()).toContain('/admin/users')
      expect(page.url()).not.toContain('/create')
      return
    }

    // Try back button if cancel not available
    const backButton = page.locator(selectors.backButton).first()
    const hasBackButton = await backButton.isVisible().catch(() => false)

    if (hasBackButton) {
      await backButton.click()
      await page.waitForLoadState('networkidle')

      // Should navigate back to user list
      expect(page.url()).toContain('/admin/users')
      expect(page.url()).not.toContain('/create')
    }
  })

  test('should be responsive on different screen sizes', async ({ page }) => {
    await navigateToUserCreation(page)
    await waitForFormLoad(page)

    // Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.waitForTimeout(500)
    await expect(page.locator(selectors.userForm)).toBeVisible()

    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.waitForTimeout(500)
    await expect(page.locator(selectors.userForm)).toBeVisible()

    // Form fields should still be accessible
    await expect(page.locator(selectors.formUsernameInput)).toBeVisible()
    await expect(page.locator(selectors.formEmailInput)).toBeVisible()

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(500)
    await expect(page.locator(selectors.userForm)).toBeVisible()

    // Form should still be usable on mobile
    const usernameInput = page.locator(selectors.formUsernameInput)
    await expect(usernameInput).toBeVisible()
    await usernameInput.fill('mobiletest')

    const submitButton = page.locator(selectors.submitButton)
    await expect(submitButton).toBeVisible()
  })

  test('should provide proper keyboard navigation', async ({ page }) => {
    await navigateToUserCreation(page)
    await waitForFormLoad(page)

    // Test tab navigation through form fields
    await page.keyboard.press('Tab') // Focus first field

    const activeElement = await page.evaluate(() => document.activeElement?.tagName)
    expect(activeElement).toBe('INPUT')

    // Fill form using keyboard
    await page.keyboard.type(validTestUser.username)
    await page.keyboard.press('Tab')
    await page.keyboard.type(validTestUser.email)
    await page.keyboard.press('Tab')
    await page.keyboard.type(validTestUser.firstName)
    await page.keyboard.press('Tab')
    await page.keyboard.type(validTestUser.lastName)

    // Verify values were entered correctly
    const usernameValue = await page.locator(selectors.formUsernameInput).inputValue()
    expect(usernameValue).toBe(validTestUser.username)
  })

  test('should handle loading states during form submission', async ({ page }) => {
    await navigateToUserCreation(page)
    await waitForFormLoad(page)

    // Fill valid form data
    await fillUserForm(page, validTestUser)

    // Submit form and check for loading states
    const submitButton = page.locator(selectors.submitButton)
    await submitButton.click()

    // Check for loading indicator on submit button
    const hasSubmitSpinner = await page.locator(selectors.submitSpinner).isVisible().catch(() => false)
    const isButtonDisabled = await submitButton.isDisabled().catch(() => false)

    // Should show some loading indication
    expect(hasSubmitSpinner || isButtonDisabled).toBeTruthy()

    // Wait for submission to complete
    await page.waitForTimeout(3000)
  })

  test('should not have console errors during user creation flow', async ({ page }) => {
    const errors: string[] = []

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await navigateToUserCreation(page)
    await waitForFormLoad(page)

    // Fill and submit form
    await fillUserForm(page, validTestUser)
    const submitButton = page.locator(selectors.submitButton)
    await submitButton.click()
    await page.waitForTimeout(3000)

    // Filter out known acceptable errors
    const criticalErrors = errors.filter(error =>
      !error.includes('favicon.ico') &&
      !error.includes('Service Worker') &&
      !error.includes('net::ERR_FAILED') &&
      !error.toLowerCase().includes('hydration')
    )

    expect(criticalErrors).toHaveLength(0)
  })
})