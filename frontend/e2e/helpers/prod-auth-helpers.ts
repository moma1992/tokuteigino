import { Page, expect } from '@playwright/test';

export interface ProdTestUser {
  email: string;
  password: string;
  fullName: string;
  role: 'student' | 'teacher';
}

export class ProdAuthHelpers {
  constructor(private page: Page) {}

  /**
   * Generate a unique test user for production
   */
  generateTestUser(): ProdTestUser {
    const timestamp = Date.now();
    return {
      email: `e2etest-${timestamp}@example.com`,
      password: 'TestPassword123!',
      fullName: `E2Eテストユーザー ${timestamp}`,
      role: 'student'
    };
  }

  /**
   * Fill out the signup form (no test=true parameter)
   */
  async fillSignupForm(user: ProdTestUser) {
    await this.page.fill('input[name="fullName"], input[label="氏名"]', user.fullName);
    await this.page.fill('input[name="email"], input[label="メールアドレス"]', user.email);
    
    // Select role
    await this.page.click('div[role="button"]:has-text("役割")');
    await this.page.click(`li[role="option"]:has-text("${user.role === 'student' ? '学生' : '教師'}")`);
    
    await this.page.fill('input[name="password"]:first-of-type', user.password);
    await this.page.fill('input[name="confirmPassword"], input[name="password"]:last-of-type', user.password);
  }

  /**
   * Submit signup form and handle email confirmation
   */
  async submitSignupForm() {
    await this.page.click('button[type="submit"]:has-text("アカウント作成")');
    
    // Wait for redirect to email confirmation pending page or success
    await this.page.waitForTimeout(3000); // Allow time for API call
    
    // Check if we're on email confirmation page or if signup succeeded
    const currentUrl = this.page.url();
    if (currentUrl.includes('/email-confirmation-pending')) {
      await expect(this.page.getByRole('heading', { name: '確認メールを送信しました' })).toBeVisible();
    }
  }

  /**
   * Fill login form (no test=true parameter)
   */
  async fillLoginForm(email: string, password: string) {
    await this.page.getByLabel('メールアドレス').fill(email);
    await this.page.getByLabel('パスワード').fill(password);
  }

  /**
   * Submit login form
   */
  async submitLoginForm() {
    await this.page.click('button[type="submit"]:has-text("ログイン")');
    await this.page.waitForTimeout(2000); // Allow time for authentication
  }

  /**
   * Check if user is logged in by looking for user info in header
   */
  async expectLoggedIn(userName?: string) {
    // Wait for navigation after login
    await this.page.waitForLoadState('networkidle');
    
    // Look for user avatar or name in header
    const header = this.page.locator('header, [role="banner"]');
    
    // Check for logout button or user menu
    await expect(
      header.locator('button:has-text("ログアウト"), [aria-label*="profile"], [aria-label*="user"]')
    ).toBeVisible();

    if (userName) {
      await expect(header.locator(`:has-text("${userName}")`)).toBeVisible();
    }
  }

  /**
   * Check if user is logged out
   */
  async expectLoggedOut() {
    // Look for login/signup buttons in header
    const header = this.page.locator('header, [role="banner"]');
    
    await expect(
      header.locator('a:has-text("ログイン"), button:has-text("ログイン")')
    ).toBeVisible();
    
    await expect(
      header.locator('a:has-text("新規登録"), button:has-text("新規登録")')
    ).toBeVisible();
  }

  /**
   * Logout user
   */
  async logout() {
    // Click on user avatar/menu
    await this.page.click('[aria-label*="profile"], [aria-label*="user"], button:has([aria-label*="avatar"])');
    
    // Click logout button
    await this.page.click('button:has-text("ログアウト"), [role="menuitem"]:has-text("ログアウト")');
    
    // Wait for redirect to home page
    await this.page.waitForURL(/^.*\/$|^.*\/home$/);
  }

  /**
   * Navigate to signup page (no test=true parameter)
   */
  async goToSignup() {
    await this.page.goto('/signup');
    // MUI Typography with variant="h4" renders as h1 with heading role
    await expect(this.page.getByRole('heading', { name: '新規登録' })).toBeVisible();
  }

  /**
   * Navigate to login page (no test=true parameter)
   */
  async goToLogin() {
    await this.page.goto('/login');
    // MUI Typography with variant="h4" renders as h1 with heading role
    await expect(this.page.getByRole('heading', { name: 'ログイン' })).toBeVisible();
  }

  /**
   * Clean up test user from production database
   */
  async cleanupTestUser(email: string) {
    try {
      console.log(`Production cleanup for test user: ${email}`);
      // Note: This would require admin API access or direct database cleanup
      // For now, we'll rely on manual cleanup or auto-expiring test accounts
    } catch (error) {
      console.warn(`Failed to cleanup production test user ${email}:`, error);
    }
  }

  /**
   * Wait for and handle potential email confirmation
   */
  async handleEmailConfirmation() {
    // In production, email confirmation might be required
    // This is a placeholder for handling that flow
    await this.page.waitForTimeout(1000);
    
    const currentUrl = this.page.url();
    if (currentUrl.includes('/email-confirmation-pending')) {
      console.log('Email confirmation required - check your email and confirm manually for testing');
      // In a real scenario, you might want to use a test email service
      // or have a backdoor for email confirmation in test environment
    }
  }
}