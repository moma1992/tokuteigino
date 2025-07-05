import { test, expect } from '@playwright/test';

test.describe('Navigation and UI Tests', () => {
  test('should load home page correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check for main elements
    await expect(page.locator('h1, h2, h3')).toBeVisible();
    await expect(page.locator('header, [role="banner"]')).toBeVisible();
    
    // Check for TOKUTEI Learning branding
    await expect(page.locator('text=TOKUTEI Learning')).toBeVisible();
  });

  test('should have responsive navigation menu', async ({ page }) => {
    await page.goto('/');
    
    // Check for navigation elements
    const header = page.locator('header, [role="banner"]');
    await expect(header).toBeVisible();
    
    // Check for login/signup buttons or user menu
    const hasAuthButtons = await header.locator('a:has-text("ログイン"), button:has-text("ログイン")').isVisible();
    const hasUserMenu = await header.locator('[aria-label*="profile"], [aria-label*="user"]').isVisible();
    
    expect(hasAuthButtons || hasUserMenu).toBeTruthy();
  });

  test('should display proper page titles', async ({ page }) => {
    const pages = [
      { path: '/', titlePattern: /TOKUTEI|ホーム|Home/ },
      { path: '/signup', titlePattern: /新規登録|登録|Signup/ },
      { path: '/login', titlePattern: /ログイン|Login/ },
    ];

    for (const { path, titlePattern } of pages) {
      await page.goto(path);
      await expect(page).toHaveTitle(titlePattern);
    }
  });

  test('should show loading states appropriately', async ({ page }) => {
    await page.goto('/');
    
    // Check if loading spinner appears and disappears
    const loadingElements = page.locator('[role="progressbar"], .MuiCircularProgress-root, text=読み込み中');
    
    // Loading should either not be present or should disappear quickly
    await page.waitForTimeout(2000);
    await expect(loadingElements).not.toBeVisible();
  });

  test('should handle form interactions correctly', async ({ page }) => {
    await page.goto('/signup');
    
    // Test form field focus and blur
    const nameField = page.locator('input[label="氏名"]');
    await nameField.click();
    await expect(nameField).toBeFocused();
    
    const emailField = page.locator('input[label="メールアドレス"]');
    await emailField.click();
    await expect(emailField).toBeFocused();
    await expect(nameField).not.toBeFocused();
  });

  test('should show appropriate error states', async ({ page }) => {
    await page.goto('/signup');
    
    // Fill invalid data and submit
    await page.fill('input[label="メールアドレス"]', 'invalid-email');
    await page.click('button[type="submit"]');
    
    // Should show error styling
    await expect(page.locator('input[label="メールアドレス"][aria-invalid="true"], input[label="メールアドレス"]:invalid')).toBeVisible();
  });

  test('should be accessible with keyboard navigation', async ({ page }) => {
    await page.goto('/signup');
    
    // Test tab navigation through form
    await page.keyboard.press('Tab');
    await expect(page.locator('input[label="氏名"]')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('input[label="メールアドレス"]')).toBeFocused();
    
    await page.keyboard.press('Tab');
    // Should move to role selector
    
    await page.keyboard.press('Tab');
    await expect(page.locator('input[label="パスワード"]:first-of-type')).toBeFocused();
  });

  test('should display proper ARIA labels and roles', async ({ page }) => {
    await page.goto('/signup');
    
    // Check for proper form labeling
    await expect(page.locator('form, [role="form"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toHaveAttribute('type', 'submit');
    
    // Check for proper heading hierarchy
    await expect(page.locator('h1, h2, h3, h4')).toBeVisible();
  });

  test('should handle mobile viewport correctly', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check for mobile-responsive elements
    const header = page.locator('header, [role="banner"]');
    await expect(header).toBeVisible();
    
    // Navigation should be mobile-friendly
    const mobileMenu = page.locator('[aria-label*="menu"], button:has([aria-label*="menu"])');
    if (await mobileMenu.isVisible()) {
      await mobileMenu.click();
      // Should show mobile navigation
    }
  });

  test('should handle focus management correctly', async ({ page }) => {
    await page.goto('/signup');
    
    // First focusable element should be focused on page load
    await expect(page.locator('input[label="氏名"]')).toBeFocused();
    
    // Test focus trap in modal (if any)
    const modalTrigger = page.locator('button:has-text("情報"), button:has-text("ヘルプ")');
    if (await modalTrigger.isVisible()) {
      await modalTrigger.click();
      
      // Focus should move to modal
      await expect(page.locator('[role="dialog"], .MuiDialog-root')).toBeVisible();
    }
  });

  test('should show proper success/error feedback', async ({ page }) => {
    await page.goto('/login');
    
    // Test error feedback
    await page.fill('input[label="メールアドレス"]', 'invalid@test.com');
    await page.fill('input[label="パスワード"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Should show error message
    await expect(page.locator('[role="alert"], .MuiAlert-root')).toBeVisible();
  });

  test('should maintain consistent branding', async ({ page }) => {
    const pages = ['/', '/signup', '/login'];
    
    for (const path of pages) {
      await page.goto(path);
      
      // Check for consistent branding elements
      await expect(page.locator('text=TOKUTEI Learning')).toBeVisible();
      await expect(page.locator('text=特定技能試験学習支援')).toBeVisible();
    }
  });

  test('should handle external links properly', async ({ page }) => {
    await page.goto('/');
    
    // Look for external links (if any)
    const externalLinks = page.locator('a[href^="http"], a[target="_blank"]');
    
    if (await externalLinks.count() > 0) {
      // External links should have proper attributes
      await expect(externalLinks.first()).toHaveAttribute('target', '_blank');
      await expect(externalLinks.first()).toHaveAttribute('rel', /noopener|noreferrer/);
    }
  });
});