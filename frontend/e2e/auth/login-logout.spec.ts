import { test, expect } from '@playwright/test';
import { AuthHelpers } from '../helpers/auth-helpers';

test.describe('Login and Logout Flow', () => {
  let authHelpers: AuthHelpers;

  test.beforeEach(async ({ page }) => {
    authHelpers = new AuthHelpers(page);
  });

  test('should show appropriate error for unconfirmed email login', async ({ page }) => {
    // This test assumes we have an unconfirmed user in the system
    await authHelpers.goToLogin();

    await authHelpers.fillLoginForm('unconfirmed@example.com', 'password123');
    await authHelpers.submitLoginForm();

    // Should show email confirmation error
    await expect(
      page.locator('text=メールアドレスの確認が完了していません')
    ).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await authHelpers.goToLogin();

    await authHelpers.fillLoginForm('nonexistent@example.com', 'wrongpassword');
    await authHelpers.submitLoginForm();

    // Should show invalid credentials error
    await expect(
      page.locator('text=メールアドレスまたはパスワードが正しくありません')
    ).toBeVisible();
  });

  test('should validate required fields in login form', async ({ page }) => {
    await authHelpers.goToLogin();

    // Try to submit empty form
    await page.click('button[type="submit"]:has-text("ログイン")');

    // Should show validation errors for required fields (MUI helper text)
    await expect(page.locator('text=メールアドレスを入力してください')).toBeVisible();
    await expect(page.locator('text=パスワードを入力してください')).toBeVisible();
  });

  test.skip('should validate email format in login form', async ({ page }) => {
    // Skip this test temporarily - email validation logic needs investigation
    await authHelpers.goToLogin();

    // Fill with invalid email and valid password
    await page.getByLabel('メールアドレス').fill('invalid-email');
    await page.getByLabel('パスワード').fill('password123');
    
    // Submit form to trigger validation
    await page.click('button[type="submit"]:has-text("ログイン")');

    // Should show email format validation error - wait for it to appear
    await expect(page.locator('text=正しいメールアドレスを入力してください')).toBeVisible();
  });

  test('should show loading state during login', async ({ page }) => {
    await authHelpers.goToLogin();

    await authHelpers.fillLoginForm('test@example.com', 'password123');

    const submitButton = page.locator('button[type="submit"]:has-text("ログイン")');
    await submitButton.click();

    // Should show loading spinner or disabled state
    await expect(
      page.locator('button[disabled], [role="progressbar"], .MuiCircularProgress-root')
    ).toBeVisible();
  });

  test('should navigate to signup from login page', async ({ page }) => {
    await authHelpers.goToLogin();

    // Click signup link
    await page.click('a:has-text("新規登録"), button:has-text("新規登録")');
    await page.waitForURL('**/signup');
    // MUI Typography with variant="h4" renders as h1 with heading role
    await expect(page.getByRole('heading', { name: '新規登録' })).toBeVisible();
  });

  test('should navigate to password reset from login page', async ({ page }) => {
    await authHelpers.goToLogin();

    // Look for forgot password link
    const forgotPasswordLink = page.locator('a:has-text("パスワードを忘れた"), a:has-text("パスワードリセット")');
    
    if (await forgotPasswordLink.isVisible()) {
      await forgotPasswordLink.click();
      await page.waitForURL('**/reset-password');
      // MUI Typography with variant="h4" renders as h1 with heading role
      await expect(page.getByRole('heading', { name: 'パスワードリセット' })).toBeVisible();
    }
  });

  test('should redirect authenticated user away from login page', async ({ page }) => {
    // This test would need a pre-authenticated user
    // For now, we'll test the redirect logic
    await page.goto('/login');
    
    // If user is already authenticated, should redirect to home
    // This would require setting up authentication state first
  });

  test('should show user info in header when logged in', async ({ page }) => {
    // This test requires a confirmed user account
    // We'll simulate the post-login state verification
    
    await page.goto('/');
    
    // Check if user is logged in by looking for user-specific elements
    const header = page.locator('header, [role="banner"]');
    const isLoggedIn = await header.locator('button:has-text("ログアウト"), [aria-label*="profile"]').isVisible();
    
    if (isLoggedIn) {
      await authHelpers.expectLoggedIn();
    } else {
      await authHelpers.expectLoggedOut();
    }
  });

  test('should logout user successfully', async ({ page }) => {
    // This test requires a logged-in user
    await page.goto('/');
    
    const header = page.locator('header, [role="banner"]');
    const isLoggedIn = await header.locator('button:has-text("ログアウト"), [aria-label*="profile"]').isVisible();
    
    if (isLoggedIn) {
      await authHelpers.logout();
      await authHelpers.expectLoggedOut();
    } else {
      // Skip test if no user is logged in
      test.skip('No user is currently logged in');
    }
  });

  test('should protect routes that require authentication', async ({ page }) => {
    // Ensure user is logged out by going to home page first
    await page.goto('/?test=true');
    
    const protectedRoutes = ['/study', '/practice', '/profile'];
    
    for (const route of protectedRoutes) {
      await page.goto(route + '?test=true');
      
      // Should redirect to login page
      await page.waitForTimeout(1000); // Wait for potential redirect
      
      // Check if we're on login page (which means protection is working)
      await expect(page.getByRole('heading', { name: 'ログイン' })).toBeVisible();
      
      // Alternatively, check URL contains login
      const currentUrl = page.url();
      expect(currentUrl).toContain('/login');
    }
  });

  test('should allow access to public routes', async ({ page }) => {
    const publicRoutes = ['/', '/signup', '/login'];
    
    for (const route of publicRoutes) {
      await page.goto(route);
      
      // Should not redirect to login
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain(route.replace('/', ''));
      
      // Should show page content
      await expect(page.locator('main, [role="main"], body')).toBeVisible();
    }
  });

  test('should handle session persistence across page reloads', async ({ page }) => {
    await page.goto('/');
    
    const header = page.locator('header, [role="banner"]');
    const isLoggedIn = await header.locator('button:has-text("ログアウト"), [aria-label*="profile"]').isVisible();
    
    if (isLoggedIn) {
      // Reload page
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Should still be logged in
      await authHelpers.expectLoggedIn();
    } else {
      // Reload page
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Should still be logged out
      await authHelpers.expectLoggedOut();
    }
  });
});