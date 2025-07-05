import { test, expect } from '@playwright/test';
import { ProdAuthHelpers } from '../helpers/prod-auth-helpers';

test.describe('Production Login and Logout Flow', () => {
  let authHelpers: ProdAuthHelpers;

  test.beforeEach(async ({ page }) => {
    authHelpers = new ProdAuthHelpers(page);
  });

  test('should show error for invalid credentials in production', async ({ page }) => {
    await authHelpers.goToLogin();

    await authHelpers.fillLoginForm('nonexistent@example.com', 'wrongpassword');
    await authHelpers.submitLoginForm();

    // Should show invalid credentials error (exact message may vary in production)
    await expect(
      page.locator('div[role="alert"], .MuiAlert-root').filter({ hasText: /無効|正しくありません|Invalid|incorrect/i })
    ).toBeVisible();
  });

  test('should validate required fields in login form', async ({ page }) => {
    await authHelpers.goToLogin();

    // Try to submit without filling fields
    await authHelpers.submitLoginForm();

    // Should show validation errors
    await expect(
      page.locator('text=メールアドレスを入力してください, text=パスワードを入力してください').first()
    ).toBeVisible();
  });

  test('should show loading state during login', async ({ page }) => {
    await authHelpers.goToLogin();

    await authHelpers.fillLoginForm('test@example.com', 'password123');
    
    // Check for loading state
    const loginButton = page.locator('button[type="submit"]:has-text("ログイン")');
    await loginButton.click();
    
    // Loading indicator should appear briefly
    await expect(page.locator('.MuiCircularProgress-root, [role="progressbar"]')).toBeVisible({ timeout: 1000 });
  });

  test('should navigate to signup from login page', async ({ page }) => {
    await authHelpers.goToLogin();

    await page.click('a:has-text("新規登録"), button:has-text("新規登録")');
    
    await expect(page.getByRole('heading', { name: '新規登録' })).toBeVisible();
    expect(page.url()).toContain('/signup');
  });

  test('should navigate to password reset from login page', async ({ page }) => {
    await authHelpers.goToLogin();

    await page.click('a:has-text("パスワードを忘れた"), button:has-text("パスワードを忘れた")');
    
    expect(page.url()).toContain('/reset-password');
  });

  test('should protect routes that require authentication', async ({ page }) => {
    // Ensure user is logged out by going to home page first
    await page.goto('/');
    
    const protectedRoutes = ['/study', '/practice', '/profile'];
    
    for (const route of protectedRoutes) {
      await page.goto(route);
      
      // Should redirect to login page
      await page.waitForTimeout(1000); // Wait for potential redirect
      
      // Check if we're on login page (which means protection is working)
      const currentUrl = page.url();
      if (currentUrl.includes('/login')) {
        await expect(page.getByRole('heading', { name: 'ログイン' })).toBeVisible();
      } else {
        // Or check if there's a login prompt in header
        const headerLoginLink = page.locator('header a:has-text("ログイン")');
        await expect(headerLoginLink).toBeVisible();
      }
    }
  });

  test('should allow access to public routes', async ({ page }) => {
    const publicRoutes = ['/', '/login', '/signup'];
    
    for (const route of publicRoutes) {
      await page.goto(route);
      
      // Should not redirect to login page
      await page.waitForTimeout(500);
      
      const currentUrl = page.url();
      expect(currentUrl).toContain(route === '/' ? '' : route);
      
      // Should show expected content
      if (route === '/login') {
        await expect(page.getByRole('heading', { name: 'ログイン' })).toBeVisible();
      } else if (route === '/signup') {
        await expect(page.getByRole('heading', { name: '新規登録' })).toBeVisible();
      }
    }
  });

  // Note: We skip actual user registration/login tests in production to avoid creating test data
  // These tests focus on UI behavior, validation, and navigation
  test.skip('should create new user account', async ({ page }) => {
    // This test is skipped in production to avoid creating real user accounts
    // Uncomment and modify if you have a test environment or cleanup strategy
    
    const testUser = authHelpers.generateTestUser();
    
    await authHelpers.goToSignup();
    await authHelpers.fillSignupForm(testUser);
    await authHelpers.submitSignupForm();
    
    // Handle email confirmation if required
    await authHelpers.handleEmailConfirmation();
    
    // Cleanup
    await authHelpers.cleanupTestUser(testUser.email);
  });

  test.skip('should login with valid credentials', async ({ page }) => {
    // This test is skipped in production to avoid using real credentials
    // Uncomment and modify if you have test credentials available
    
    await authHelpers.goToLogin();
    await authHelpers.fillLoginForm('your-test-email@example.com', 'your-test-password');
    await authHelpers.submitLoginForm();
    
    await authHelpers.expectLoggedIn();
  });
});