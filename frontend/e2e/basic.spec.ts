import { test, expect } from '@playwright/test';

test.describe('Basic App Tests', () => {
  test('should load the home page', async ({ page }) => {
    // Go to the home page
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check that the page loaded successfully
    await expect(page.locator('#root')).toBeVisible();
    
    // Check that the page has a title
    await expect(page).toHaveTitle(/Vite/);
  });

  test('should have responsive design', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('#root')).toBeVisible();
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('#root')).toBeVisible();
  });

  test('should handle navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Try to navigate to login if it exists
    const loginLink = page.locator('a[href*="login"], button:has-text("ログイン"), button:has-text("Login")');
    if (await loginLink.count() > 0) {
      await loginLink.first().click();
      await page.waitForLoadState('networkidle');
      
      // Should be on login page
      expect(page.url()).toContain('login');
    }
  });
});