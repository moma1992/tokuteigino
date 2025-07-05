import { Page, expect } from '@playwright/test';

export interface TestUser {
  email: string;
  password: string;
  fullName: string;
  role: 'student' | 'teacher';
}

export class AuthHelpers {
  constructor(private page: Page) {}

  /**
   * Generate a unique test user
   */
  generateTestUser(): TestUser {
    const timestamp = Date.now();
    return {
      email: `test-${timestamp}@example.com`,
      password: 'test123456',
      fullName: `テストユーザー ${timestamp}`,
      role: 'student'
    };
  }

  /**
   * Fill out the signup form
   */
  async fillSignupForm(user: TestUser) {
    await this.page.fill('input[name="fullName"], input[label="氏名"]', user.fullName);
    await this.page.fill('input[name="email"], input[label="メールアドレス"]', user.email);
    
    // Select role
    await this.page.click('div[role="button"]:has-text("役割")');
    await this.page.click(`li[role="option"]:has-text("${user.role === 'student' ? '学生' : '教師'}")`);
    
    await this.page.fill('input[name="password"]:first-of-type', user.password);
    await this.page.fill('input[name="confirmPassword"], input[name="password"]:last-of-type', user.password);
  }

  /**
   * Submit signup form and expect redirect to email confirmation page
   */
  async submitSignupForm() {
    await this.page.click('button[type="submit"]:has-text("アカウント作成")');
    
    // Wait for redirect to email confirmation pending page
    await this.page.waitForURL('**/email-confirmation-pending');
    
    // Verify we're on the email confirmation page (MUI Typography renders as h1 with heading role)
    await expect(this.page.getByRole('heading', { name: '確認メールを送信しました' })).toBeVisible();
  }

  /**
   * Fill login form
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
   * Navigate to signup page
   */
  async goToSignup() {
    await this.page.goto('/signup?test=true');
    // MUI Typography with variant="h4" renders as h1 with heading role
    await expect(this.page.getByRole('heading', { name: '新規登録' })).toBeVisible();
  }

  /**
   * Navigate to login page  
   */
  async goToLogin() {
    await this.page.goto('/login?test=true');
    // MUI Typography with variant="h4" renders as h1 with heading role
    await expect(this.page.getByRole('heading', { name: 'ログイン' })).toBeVisible();
  }

  /**
   * Clean up test user from database via API call
   */
  async cleanupTestUser(email: string) {
    try {
      // This would typically call a test cleanup API endpoint
      // For now, we'll rely on database cleanup between tests
      console.log(`Cleanup test user: ${email}`);
    } catch (error) {
      console.warn(`Failed to cleanup test user ${email}:`, error);
    }
  }
}