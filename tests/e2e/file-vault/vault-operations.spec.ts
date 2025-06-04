import { test, expect } from '@playwright/test';

test.describe('File Vault Operations', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@shielddesk.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should navigate to file vault', async ({ page }) => {
    await page.click('text=File Vault');
    await expect(page).toHaveURL('/enhanced-file-vault');
    await expect(page.locator('h2')).toContainText('Secure File Vault');
  });

  test('should display vault statistics', async ({ page }) => {
    await page.goto('/enhanced-file-vault');
    
    await expect(page.locator('text=Total Files')).toBeVisible();
    await expect(page.locator('text=Storage Used')).toBeVisible();
    await expect(page.locator('text=Shared Files')).toBeVisible();
    await expect(page.locator('text=Recent Uploads')).toBeVisible();
  });

  test('should show file list', async ({ page }) => {
    await page.goto('/enhanced-file-vault');
    
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('th:has-text("Name")')).toBeVisible();
    await expect(page.locator('th:has-text("Type")')).toBeVisible();
    await expect(page.locator('th:has-text("Size")')).toBeVisible();
    await expect(page.locator('th:has-text("Modified")')).toBeVisible();
    await expect(page.locator('th:has-text("Status")')).toBeVisible();
    await expect(page.locator('th:has-text("Actions")')).toBeVisible();
  });

  test('should allow file download', async ({ page }) => {
    await page.goto('/enhanced-file-vault');
    
    // Wait for files to load
    await page.waitForSelector('table tbody tr');
    
    // Click download button for first file
    const downloadPromise = page.waitForEvent('download');
    await page.click('button[aria-label*="download"]:first-of-type');
    
    // Verify download started
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBeTruthy();
  });

  test('should allow file sharing', async ({ page }) => {
    await page.goto('/enhanced-file-vault');
    
    // Wait for files to load
    await page.waitForSelector('table tbody tr');
    
    // Click share button for first file
    await page.click('button[aria-label*="share"]:first-of-type');
    
    // Verify share link was created (toast notification)
    await expect(page.locator('text=Share link created')).toBeVisible();
  });

  test('should support search functionality', async ({ page }) => {
    await page.goto('/enhanced-file-vault');
    
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('policy');
    
    // Verify search results
    await page.waitForTimeout(500); // Allow for debounced search
    await expect(page.locator('table tbody tr')).toHaveCount(1);
  });

  test('should toggle between grid and list view', async ({ page }) => {
    await page.goto('/enhanced-file-vault');
    
    // Click grid view button
    await page.click('button[aria-label*="grid"]');
    await expect(page.locator('.grid')).toBeVisible();
    
    // Click list view button
    await page.click('button[aria-label*="list"]');
    await expect(page.locator('table')).toBeVisible();
  });

  test('@smoke should load file vault without errors', async ({ page }) => {
    await page.goto('/enhanced-file-vault');
    
    // Verify no console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.waitForLoadState('networkidle');
    expect(errors.filter(error => !error.includes('404'))).toHaveLength(0);
  });
});