import { test, expect } from '@playwright/test';
import { AuthHelpers } from '../helpers/auth-helpers';

test.describe('Email Confirmation Authentication Flow', () => {
  let authHelpers: AuthHelpers;

  test.beforeEach(async ({ page }) => {
    authHelpers = new AuthHelpers(page);
  });

  test('should redirect to email confirmation page after signup', async ({ page }) => {
    const testUser = authHelpers.generateTestUser();

    // Go to signup page
    await authHelpers.goToSignup();

    // Fill and submit signup form
    await authHelpers.fillSignupForm(testUser);
    await authHelpers.submitSignupForm();

    // Verify we're on email confirmation pending page
    await expect(page.locator('h4:has-text("確認メールを送信しました")')).toBeVisible();
    
    // Verify user email is displayed
    await expect(page.locator(`:has-text("${testUser.email}")`)).toBeVisible();

    // Verify guidance steps are shown
    await expect(page.locator('text=次の手順')).toBeVisible();
    await expect(page.locator('text=メールボックス')).toBeVisible();
    await expect(page.locator('text=確認リンクをクリック')).toBeVisible();
  });

  test('should show different role selection for teacher', async ({ page }) => {
    const testUser = authHelpers.generateTestUser();
    testUser.role = 'teacher';
    testUser.fullName = 'テスト教師';

    await authHelpers.goToSignup();

    // Fill form with teacher role
    await authHelpers.fillSignupForm(testUser);
    
    // Verify teacher role is selected
    await expect(page.locator('div[role="button"]:has-text("教師")')).toBeVisible();

    await authHelpers.submitSignupForm();

    // Should still redirect to email confirmation page
    await expect(page.locator('h4:has-text("確認メールを送信しました")')).toBeVisible();
  });

  test('should validate required fields in signup form', async ({ page }) => {
    await authHelpers.goToSignup();

    // Try to submit empty form
    await page.click('button[type="submit"]:has-text("アカウント作成")');

    // Should show validation errors
    await expect(page.locator('text=氏名を入力してください')).toBeVisible();
    await expect(page.locator('text=メールアドレス')).toBeVisible();
    await expect(page.locator('text=パスワード')).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    await authHelpers.goToSignup();

    // Fill form with invalid email
    await page.fill('input[label="氏名"]', 'テストユーザー');
    await page.fill('input[label="メールアドレス"]', 'invalid-email');
    await page.fill('input[name="password"]:first-of-type', 'password123');
    await page.fill('input[name="password"]:last-of-type', 'password123');

    await page.click('button[type="submit"]:has-text("アカウント作成")');

    // Should show email validation error
    await expect(page.locator('text=正しいメールアドレスを入力してください')).toBeVisible();
  });

  test('should validate password confirmation', async ({ page }) => {
    await authHelpers.goToSignup();

    const testUser = authHelpers.generateTestUser();

    // Fill form with mismatched passwords
    await page.fill('input[label="氏名"]', testUser.fullName);
    await page.fill('input[label="メールアドレス"]', testUser.email);
    await page.fill('input[name="password"]:first-of-type', testUser.password);
    await page.fill('input[name="password"]:last-of-type', 'different-password');

    await page.click('button[type="submit"]:has-text("アカウント作成")');

    // Should show password confirmation error
    await expect(page.locator('text=パスワードが一致しません')).toBeVisible();
  });

  test('should validate minimum password length', async ({ page }) => {
    await authHelpers.goToSignup();

    const testUser = authHelpers.generateTestUser();
    testUser.password = '123'; // Too short

    await page.fill('input[label="氏名"]', testUser.fullName);
    await page.fill('input[label="メールアドレス"]', testUser.email);
    await page.fill('input[name="password"]:first-of-type', testUser.password);
    await page.fill('input[name="password"]:last-of-type', testUser.password);

    await page.click('button[type="submit"]:has-text("アカウント作成")');

    // Should show password length error
    await expect(page.locator('text=パスワードは6文字以上で入力してください')).toBeVisible();
  });

  test('should navigate between login and signup pages', async ({ page }) => {
    // Start on signup page
    await authHelpers.goToSignup();

    // Click login link
    await page.click('a:has-text("ログイン"), button:has-text("ログイン")');
    await page.waitForURL('**/login');
    await expect(page.locator('h4:has-text("ログイン")')).toBeVisible();

    // Click signup link
    await page.click('a:has-text("新規登録"), button:has-text("新規登録")');
    await page.waitForURL('**/signup');
    await expect(page.locator('h4:has-text("新規登録")')).toBeVisible();
  });

  test('should handle duplicate email registration', async ({ page }) => {
    const testUser = authHelpers.generateTestUser();

    // First registration
    await authHelpers.goToSignup();
    await authHelpers.fillSignupForm(testUser);
    await authHelpers.submitSignupForm();

    // Go back to signup for second attempt
    await authHelpers.goToSignup();
    await authHelpers.fillSignupForm(testUser); // Same email
    await page.click('button[type="submit"]:has-text("アカウント作成")');

    // Should show duplicate email error
    await expect(page.locator('text=このメールアドレスは既に登録されています')).toBeVisible();
  });

  test('should show loading state during signup', async ({ page }) => {
    const testUser = authHelpers.generateTestUser();

    await authHelpers.goToSignup();
    await authHelpers.fillSignupForm(testUser);

    // Check that submit button shows loading state
    const submitButton = page.locator('button[type="submit"]:has-text("アカウント作成")');
    await submitButton.click();

    // Should show loading spinner or disabled state
    await expect(
      page.locator('button[disabled], [role="progressbar"], .MuiCircularProgress-root')
    ).toBeVisible();
  });

  test('should provide navigation options on email confirmation page', async ({ page }) => {
    const testUser = authHelpers.generateTestUser();

    await authHelpers.goToSignup();
    await authHelpers.fillSignupForm(testUser);
    await authHelpers.submitSignupForm();

    // Verify navigation buttons are present
    await expect(page.locator('a:has-text("ログインページへ"), button:has-text("ログインページへ")')).toBeVisible();
    await expect(page.locator('a:has-text("別のメールで登録"), button:has-text("別のメールで登録")')).toBeVisible();

    // Test navigation to login page
    await page.click('a:has-text("ログインページへ"), button:has-text("ログインページへ")');
    await page.waitForURL('**/login');
    await expect(page.locator('h4:has-text("ログイン")')).toBeVisible();
  });
});