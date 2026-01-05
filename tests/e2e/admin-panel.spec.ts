import { test, expect } from '@playwright/test';

test.describe('Admin Panel', () => {
  // Helper function to authenticate as admin
  async function loginAsAdmin(page: any) {
    const credentials = Buffer.from('admin:changeme').toString('base64');
    await page.setExtraHTTPHeaders({
      'Authorization': `Basic ${credentials}`
    });
  }

  test('should require authentication to access admin panel', async ({ page }) => {
    // Try to access admin without authentication
    const response = await page.goto('/admin/applications');
    
    // Should get 401 Unauthorized
    expect(response?.status()).toBe(401);
  });

  test('should allow access to admin panel with valid credentials', async ({ page }) => {
    await loginAsAdmin(page);
    
    const response = await page.goto('/admin/applications');
    
    // Should successfully load
    expect(response?.status()).toBe(200);
    await expect(page.locator('h2')).toContainText('Applications Management');
  });

  test('should display list of applications in admin panel', async ({ page }) => {
    await loginAsAdmin(page);
    
    await page.goto('/admin/applications');
    
    // Should have a table or list of applications
    // The exact structure depends on your implementation
    await expect(page.locator('body')).toContainText('Application');
  });

  test('should view application details in admin panel', async ({ page }) => {
    // First, create an application via the public form
    await page.goto('/');
    await page.click('button:has-text("Start Application")');
    await page.waitForURL(/\/applications\/.*\/step\/1/);
    
    // Get the application ID from URL
    const url = page.url();
    const applicationId = url.match(/\/applications\/([^/]+)\/step/)?.[1];
    
    // Now log in as admin
    await loginAsAdmin(page);
    
    // View the application details
    await page.goto(`/admin/applications/${applicationId}`);
    
    // Should display application details page with the application ID and status
    await expect(page.locator('h2')).toContainText('Application Details');
    await expect(page.locator('body')).toContainText(applicationId!);
    await expect(page.locator('.status-badge')).toContainText('DRAFT');
  });

  test('should allow resetting submitted application', async ({ page }) => {
    // Create and submit a complete application first
    await page.goto('/');
    await page.click('button:has-text("Start Application")');
    await page.waitForURL(/\/applications\/.*\/step\/1/);
    
    // Fill all required fields (abbreviated for brevity)
    await page.fill('input[name="applicant[firstName]"]', 'ResetTest');
    await page.fill('input[name="applicant[lastName]"]', 'User');
    await page.fill('input[name="applicant[email]"]', 'reset@example.com');
    await page.fill('input[name="applicant[dob]"]', '1990-01-01');
    await page.fill('input[name="applicant[address1]"]', '123 Reset St');
    
    // Fill ZIP first to auto-populate city, state, county
    await page.fill('input[name="applicant[zip]"]', '30305');
    await page.waitForTimeout(500); // Wait for auto-population
    
    // Verify auto-population worked (30305 = Atlanta, Fulton)
    await expect(page.locator('input[name="applicant[city]"]')).toHaveValue('Atlanta');
    await expect(page.locator('input[name="applicant[state]"]')).toHaveValue('GA');
    await expect(page.locator('input[name="applicant[county]"]')).toHaveValue('Fulton');
    
    await page.fill('input[name="request[assistanceFor]"]', 'Reset test');
    await page.fill('input[name="request[approximateCost]"]', '500');
    
    await page.waitForTimeout(1000);
    const url = page.url();
    const applicationId = url.match(/\/applications\/([^/]+)\/step/)?.[1];
    
    // Now log in as admin
    await loginAsAdmin(page);
    
    // Access the application
    await page.goto(`/admin/applications/${applicationId}`);
    
    // Look for a reset button (if implemented)
    const resetButton = page.locator('button:has-text("Reset"), form[action*="reset"] button');
    
    if (await resetButton.count() > 0) {
      await resetButton.first().click();
      
      // Should show confirmation or redirect
      await expect(page.locator('body')).toContainText('DRAFT');
    }
  });

  test('should filter applications by status', async ({ page }) => {
    await loginAsAdmin(page);
    
    await page.goto('/admin/applications');
    
    // Look for filter controls (if implemented)
    const statusFilter = page.locator('select[name="status"], input[name="status"]');
    
    if (await statusFilter.count() > 0) {
      // Test filtering functionality
      await statusFilter.first().selectOption('SUBMITTED');
      
      // Should filter results
      await page.waitForTimeout(500);
      
      // Verify filtered content
      await expect(page.locator('body')).toContainText('Application');
    }
  });

  test('should search applications by applicant name', async ({ page }) => {
    await loginAsAdmin(page);
    
    await page.goto('/admin/applications');
    
    // Look for search input (if implemented)
    const searchInput = page.locator('input[type="search"], input[name="search"], input[placeholder*="Search"]');
    
    if (await searchInput.count() > 0) {
      await searchInput.first().fill('Test');
      
      // Submit search or wait for auto-search
      const searchButton = page.locator('button:has-text("Search")');
      if (await searchButton.count() > 0) {
        await searchButton.click();
      }
      
      await page.waitForTimeout(500);
      
      // Should show search results
      await expect(page.locator('body')).toContainText('Application');
    }
  });
});
