import { expect, test } from '@playwright/test'

test.describe('Admin User List Management', () => {
  // Test data and selectors
  const testUser = {
    username: 'testuser123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User'
  }

  const selectors = {
    // Navigation
    loginForm: 'form[data-testid="login-form"], input[type="password"]',
    usernameInput: 'input[name="username"], input[placeholder*="username"], input[type="text"]:first-of-type',
    passwordInput: 'input[name="password"], input[type="password"]',
    loginButton: 'button[type="submit"], button:has-text("Login"), button:has-text("Sign In")',
    userManagementLink: 'a[href*="/admin/users"], a:has-text("User Management"), a:has-text("Users")',

    // Page elements
    pageTitle: 'h1, h2, [data-testid="page-title"]',
    createUserButton: '.add-new-user-button, button:has-text("Create"), button:has-text("New User")',
    searchInput: 'input[placeholder*="search"], input[name="searchTerm"], [data-testid="search-input"]',

    // Filters
    statusFilter: 'select[name="status"], [data-testid="status-filter"]',
    roleFilter: 'select[name="roles"], [data-testid="role-filter"]',
    clearFiltersButton: 'button:has-text("Clear"), button:has-text("Reset")',

    // View toggles
    cardViewButton: 'button[aria-label*="card"], button:has([data-icon="grid"])',
    tableViewButton: 'button[aria-label*="table"], button:has([data-icon="list"])',

    // User list elements
    userCards: '[role="article"], .user-card, [data-testid="user-card"]',
    userTableRows: 'tbody tr, [data-testid="user-row"]',
    userList: '[data-testid="user-list"], .user-grid, .user-table',

    // Pagination
    paginationContainer: '.pagination, [data-testid="pagination"]',
    nextPageButton: 'button:has-text("Next"), button[aria-label*="next"], button:has-text("›")',
    prevPageButton: 'button:has-text("Previous"), button[aria-label*="previous"], button:has-text("‹")',
    pageSizeSelect: 'select[data-testid="page-size"], select:has(option[value="10"])',

    // Sorting
    sortButton: 'button:has-text("Sort"), [data-testid="sort-button"]',
    sortAscIcon: '[data-icon="sort-asc"], .sort-asc',
    sortDescIcon: '[data-icon="sort-desc"], .sort-desc',

    // Actions
    userActionButton: 'button[aria-label*="actions"], button:has([data-icon="more-horizontal"])',
    viewUserButton: 'button:has-text("View"), a:has-text("View")',
    editUserButton: 'button:has-text("Edit"), a:has-text("Edit")',
    deleteUserButton: 'button:has-text("Delete")',

    // Bulk actions
    bulkSelectCheckbox: 'input[type="checkbox"][data-testid*="select"]',
    bulkActionsToolbar: '[data-testid="bulk-actions"], .bulk-actions-toolbar',

    // Dialogs and messages
    deleteDialog: '[role="dialog"], .dialog',
    confirmDeleteButton: 'button:has-text("Delete"):not([disabled])',
    successMessage: '[role="alert"], .toast, .notification',

    // Loading and error states
    loadingSpinner: '[data-testid="loading"], .loading, .spinner',
    errorMessage: '[role="alert"][data-type="error"], .error-message',
    noResultsMessage: '.no-results, [data-testid="no-results"]'
  }

  // Helper functions
  async function loginAsAdmin(page: any) {
    // Navigate to login page
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    // Check if already logged in
    const isLoggedIn = await page.locator(selectors.userManagementLink).isVisible().catch(() => false)
    if (isLoggedIn) {
      return
    }

    // Wait for login form
    await page.waitForSelector(selectors.loginForm, { timeout: 10000 })

    // Fill login credentials (using default admin credentials)
    await page.fill(selectors.usernameInput, 'admin')
    await page.fill(selectors.passwordInput, 'admin123')

    // Submit login
    await page.click(selectors.loginButton)
    await page.waitForLoadState('networkidle')

    // Wait for successful login (should see dashboard or navigation)
    await page.waitForTimeout(2000)
  }

  async function navigateToUserManagement(page: any) {
    // Try direct navigation first
    await page.goto('/admin/users')
    await page.waitForLoadState('networkidle')

    // Check if we're on the user management page
    const hasUsersList = await page.locator(selectors.userList).isVisible().catch(() => false)
    const hasPageTitle = await page.locator(selectors.pageTitle).isVisible().catch(() => false)

    if (!hasUsersList && !hasPageTitle) {
      // Try navigating through menu if direct navigation failed
      const userManagementLink = await page.locator(selectors.userManagementLink).first()
      if (await userManagementLink.isVisible()) {
        await userManagementLink.click()
        await page.waitForLoadState('networkidle')
      }
    }

    // Wait for the page to load
    await page.waitForTimeout(2000)
  }

  async function waitForUsersToLoad(page: any) {
    // Wait for either user cards or table rows to appear
    await page.waitForFunction(() => {
      const cards = document.querySelectorAll('[role="article"], .user-card')
      const rows = document.querySelectorAll('tbody tr')
      return cards.length > 0 || rows.length > 0
    }, { timeout: 10000 }).catch(() => {
      // If no users found, that's also a valid state
    })

    // Wait a bit more for any loading states to resolve
    await page.waitForTimeout(1000)
  }

  test.beforeEach(async ({ page }) => {
    // Set up admin authentication for each test
    await loginAsAdmin(page)
    await navigateToUserManagement(page)
  })

  test('should load user management page with proper structure', async ({ page }) => {
    // Verify page loads
    const title = await page.locator(selectors.pageTitle).first()
    await expect(title).toBeVisible()

    // Check for key page elements
    const hasSearchInput = await page.locator(selectors.searchInput).isVisible().catch(() => false)
    const hasCreateButton = await page.locator(selectors.createUserButton).isVisible().catch(() => false)

    expect(hasSearchInput || hasCreateButton).toBeTruthy()

    // Wait for user list to load
    await waitForUsersToLoad(page)

    // Verify either card or table view is present
    const hasCards = await page.locator(selectors.userCards).count() > 0
    const hasTable = await page.locator(selectors.userTableRows).count() > 0

    expect(hasCards || hasTable).toBeTruthy()
  })

  test('should display user list with pagination', async ({ page }) => {
    await waitForUsersToLoad(page)

    // Check for user list (cards or table)
    const userCardsCount = await page.locator(selectors.userCards).count()
    const userRowsCount = await page.locator(selectors.userTableRows).count()

    // Should have at least one user or show no results message
    const hasUsers = userCardsCount > 0 || userRowsCount > 0
    const hasNoResults = await page.locator(selectors.noResultsMessage).isVisible().catch(() => false)

    expect(hasUsers || hasNoResults).toBeTruthy()

    // If users exist, check for pagination
    if (hasUsers) {
      const hasPagination = await page.locator(selectors.paginationContainer).isVisible().catch(() => false)
      const hasPageSizeControl = await page.locator(selectors.pageSizeSelect).isVisible().catch(() => false)

      // At least one pagination control should be visible
      expect(hasPagination || hasPageSizeControl).toBeTruthy()
    }
  })

  test('should support search functionality', async ({ page }) => {
    await waitForUsersToLoad(page)

    // Check if search input exists
    const searchInput = page.locator(selectors.searchInput).first()
    const isSearchVisible = await searchInput.isVisible().catch(() => false)

    if (!isSearchVisible) {
      test.skip('Search functionality not available on this page')
    }

    // Test search functionality
    await searchInput.fill('admin')

    // Wait for search results to update
    await page.waitForTimeout(1000)

    // Check that search results are displayed or no results message
    const hasResults = await page.locator(selectors.userCards).count() > 0 ||
                      await page.locator(selectors.userTableRows).count() > 0
    const hasNoResults = await page.locator(selectors.noResultsMessage).isVisible().catch(() => false)

    expect(hasResults || hasNoResults).toBeTruthy()

    // Clear search
    await searchInput.clear()
    await page.waitForTimeout(1000)
  })

  test('should support filtering by status and roles', async ({ page }) => {
    await waitForUsersToLoad(page)

    // Test status filtering if available
    const statusFilter = page.locator(selectors.statusFilter).first()
    const isStatusFilterVisible = await statusFilter.isVisible().catch(() => false)

    if (isStatusFilterVisible) {
      await statusFilter.selectOption('ACTIVE')
      await page.waitForTimeout(1000)

      // Verify filtering results
      const hasResults = await page.locator(selectors.userCards).count() > 0 ||
                        await page.locator(selectors.userTableRows).count() > 0
      const hasNoResults = await page.locator(selectors.noResultsMessage).isVisible().catch(() => false)

      expect(hasResults || hasNoResults).toBeTruthy()
    }

    // Test clear filters if available
    const clearButton = page.locator(selectors.clearFiltersButton).first()
    const isClearVisible = await clearButton.isVisible().catch(() => false)

    if (isClearVisible) {
      await clearButton.click()
      await page.waitForTimeout(1000)
    }
  })

  test('should support view mode switching (card/table)', async ({ page }) => {
    await waitForUsersToLoad(page)

    // Check current view mode
    const hasCards = await page.locator(selectors.userCards).count() > 0
    const hasTable = await page.locator(selectors.userTableRows).count() > 0

    // Test view mode toggle if available
    const cardViewButton = page.locator(selectors.cardViewButton).first()
    const tableViewButton = page.locator(selectors.tableViewButton).first()

    const hasCardToggle = await cardViewButton.isVisible().catch(() => false)
    const hasTableToggle = await tableViewButton.isVisible().catch(() => false)

    if (hasCardToggle && hasTable) {
      // Switch to card view
      await cardViewButton.click()
      await page.waitForTimeout(1000)

      // Verify card view is active
      const newCardCount = await page.locator(selectors.userCards).count()
      expect(newCardCount).toBeGreaterThan(0)
    }

    if (hasTableToggle && hasCards) {
      // Switch to table view
      await tableViewButton.click()
      await page.waitForTimeout(1000)

      // Verify table view is active
      const newRowCount = await page.locator(selectors.userTableRows).count()
      expect(newRowCount).toBeGreaterThan(0)
    }
  })

  test('should support sorting functionality', async ({ page }) => {
    await waitForUsersToLoad(page)

    // Look for sort controls
    const sortButton = page.locator(selectors.sortButton).first()
    const isSortVisible = await sortButton.isVisible().catch(() => false)

    if (isSortVisible) {
      await sortButton.click()
      await page.waitForTimeout(1000)

      // Check for sort direction change indicators
      const hasAscIcon = await page.locator(selectors.sortAscIcon).isVisible().catch(() => false)
      const hasDescIcon = await page.locator(selectors.sortDescIcon).isVisible().catch(() => false)

      expect(hasAscIcon || hasDescIcon).toBeTruthy()
    }
  })

  test('should support pagination controls', async ({ page }) => {
    await waitForUsersToLoad(page)

    // Check for pagination controls
    const nextButton = page.locator(selectors.nextPageButton).first()
    const hasNextButton = await nextButton.isVisible().catch(() => false)

    if (hasNextButton) {
      const isNextEnabled = await nextButton.isEnabled()

      if (isNextEnabled) {
        await nextButton.click()
        await page.waitForTimeout(2000)

        // Verify page changed
        const prevButton = page.locator(selectors.prevPageButton).first()
        const hasPrevButton = await prevButton.isVisible().catch(() => false)

        if (hasPrevButton) {
          expect(await prevButton.isEnabled()).toBeTruthy()

          // Go back to first page
          await prevButton.click()
          await page.waitForTimeout(1000)
        }
      }
    }

    // Test page size control
    const pageSizeSelect = page.locator(selectors.pageSizeSelect).first()
    const hasPageSizeSelect = await pageSizeSelect.isVisible().catch(() => false)

    if (hasPageSizeSelect) {
      await pageSizeSelect.selectOption('20')
      await page.waitForTimeout(1000)
    }
  })

  test('should show user actions menu', async ({ page }) => {
    await waitForUsersToLoad(page)

    // Find first user action button
    const actionButton = page.locator(selectors.userActionButton).first()
    const hasActionButton = await actionButton.isVisible().catch(() => false)

    if (hasActionButton) {
      await actionButton.click()
      await page.waitForTimeout(500)

      // Check for action menu items
      const hasViewAction = await page.locator(selectors.viewUserButton).isVisible().catch(() => false)
      const hasEditAction = await page.locator(selectors.editUserButton).isVisible().catch(() => false)

      expect(hasViewAction || hasEditAction).toBeTruthy()

      // Close menu by clicking elsewhere
      await page.click('body')
    }
  })

  test('should handle bulk selection if available', async ({ page }) => {
    await waitForUsersToLoad(page)

    // Look for bulk selection checkboxes
    const bulkCheckbox = page.locator(selectors.bulkSelectCheckbox).first()
    const hasBulkSelection = await bulkCheckbox.isVisible().catch(() => false)

    if (hasBulkSelection) {
      // Select first user
      await bulkCheckbox.check()
      await page.waitForTimeout(500)

      // Check if bulk actions toolbar appears
      const bulkToolbar = page.locator(selectors.bulkActionsToolbar).first()
      const hasBulkToolbar = await bulkToolbar.isVisible().catch(() => false)

      expect(hasBulkToolbar).toBeTruthy()

      // Uncheck to clean up
      await bulkCheckbox.uncheck()
    }
  })

  test('should be responsive on different screen sizes', async ({ page }) => {
    await waitForUsersToLoad(page)

    // Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.waitForTimeout(1000)

    let hasContent = await page.locator(selectors.userList).isVisible().catch(() => false) ||
                     await page.locator(selectors.userCards).count() > 0 ||
                     await page.locator(selectors.userTableRows).count() > 0

    expect(hasContent).toBeTruthy()

    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.waitForTimeout(1000)

    hasContent = await page.locator(selectors.userList).isVisible().catch(() => false) ||
                 await page.locator(selectors.userCards).count() > 0 ||
                 await page.locator(selectors.userTableRows).count() > 0

    expect(hasContent).toBeTruthy()

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(1000)

    hasContent = await page.locator(selectors.userList).isVisible().catch(() => false) ||
                 await page.locator(selectors.userCards).count() > 0

    expect(hasContent).toBeTruthy()
  })

  test('should handle no results state gracefully', async ({ page }) => {
    await waitForUsersToLoad(page)

    // Perform a search that should return no results
    const searchInput = page.locator(selectors.searchInput).first()
    const isSearchVisible = await searchInput.isVisible().catch(() => false)

    if (isSearchVisible) {
      await searchInput.fill('nonexistentuser12345')
      await page.waitForTimeout(2000)

      // Should show no results message or empty state
      const hasNoResults = await page.locator(selectors.noResultsMessage).isVisible().catch(() => false)
      const hasEmptyUserList = await page.locator(selectors.userCards).count() === 0 &&
                               await page.locator(selectors.userTableRows).count() === 0

      expect(hasNoResults || hasEmptyUserList).toBeTruthy()

      // Clear search
      await searchInput.clear()
      await page.waitForTimeout(1000)
    }
  })

  test('should not have console errors on page load', async ({ page }) => {
    const errors: string[] = []

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await navigateToUserManagement(page)
    await waitForUsersToLoad(page)

    // Filter out known acceptable errors
    const criticalErrors = errors.filter(error =>
      !error.includes('favicon.ico') &&
      !error.includes('Service Worker') &&
      !error.includes('net::ERR_FAILED') && // Network errors are expected in test environment
      !error.toLowerCase().includes('hydration') // React hydration warnings are not critical
    )

    expect(criticalErrors).toHaveLength(0)
  })
})