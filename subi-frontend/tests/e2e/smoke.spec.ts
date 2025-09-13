import { expect, test } from '@playwright/test'

test.describe('Smoke Tests', () => {
  test('should load the application homepage', async ({ page }) => {
    await page.goto('/')
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle')
    
    // Check that we're redirected to login page or see the main content
    const hasLoginForm = await page.locator('input[type="password"]').count() > 0
    const hasMainContent = await page.locator('main, #root').count() > 0
    
    // Either we see a login form or main content
    expect(hasLoginForm || hasMainContent).toBeTruthy()
    
    // Page should have a title
    await expect(page).toHaveTitle(/.+/)
  })

  test('should have proper meta tags', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Check for viewport meta tag (responsive design)
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content')
    expect(viewport).toContain('width=device-width')
    
    // Check for charset
    const charset = await page.locator('meta[charset]').count()
    expect(charset).toBeGreaterThan(0)
  })

  test('should not have console errors on page load', async ({ page }) => {
    const errors: string[] = []
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Filter out known acceptable errors (if any)
    const criticalErrors = errors.filter(error => 
      !error.includes('favicon.ico') && // Favicon 404s are common and not critical
      !error.includes('Service Worker') // SW errors are acceptable in test environment
    )
    
    expect(criticalErrors).toHaveLength(0)
  })

  test('should be responsive on different screen sizes', async ({ page }) => {
    const sizes = [
      { width: 375, height: 667, name: 'iPhone' },
      { width: 768, height: 1024, name: 'iPad' },
      { width: 1920, height: 1080, name: 'Desktop' }
    ]

    for (const size of sizes) {
      await page.setViewportSize({ width: size.width, height: size.height })
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      // Check that content is visible and fits in viewport
      const body = page.locator('body')
      const bodyBox = await body.boundingBox()
      
      expect(bodyBox).toBeTruthy()
      if (bodyBox) {
        expect(bodyBox.width).toBeLessThanOrEqual(size.width)
      }
    }
  })
})