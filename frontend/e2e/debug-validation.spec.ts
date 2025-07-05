import { test, expect } from '@playwright/test';

test('debug validation messages', async ({ page }) => {
  // Listen to network requests
  const requests: string[] = [];
  page.on('request', (request) => {
    requests.push(`${request.method()} ${request.url()}`);
  });
  
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  
  // Fill with clearly invalid email and valid password
  await page.getByLabel('メールアドレス').fill('notanemail');
  await page.getByLabel('パスワード').fill('password123');
  
  // Submit form to trigger validation
  await page.click('button[type="submit"]:has-text("ログイン")');
  
  // Wait a bit for any validation messages or network requests
  await page.waitForTimeout(3000);
  
  console.log('Network requests made:', requests.filter(r => !r.includes('/_next/') && !r.includes('.js') && !r.includes('.css')));
  
  // Take screenshot
  await page.screenshot({ path: 'test-results/validation-debug.png' });
  
  // Check what helper text exists (including error states)
  const helperTexts = await page.locator('.MuiFormHelperText-root, .Mui-error').allTextContents();
  console.log('Helper texts found:', helperTexts);
  
  // Check for any visible error indicators
  const errorInputs = await page.locator('input.Mui-error, .MuiTextField-root.Mui-error').count();
  console.log('Error inputs found:', errorInputs);
  
  // Check for any error messages
  const errorElements = await page.locator('[role="alert"], .Mui-error, .MuiAlert-message').allTextContents();
  console.log('Error messages found:', errorElements);
  
  // Check for specific validation text
  const validationText = await page.locator('text=正しいメールアドレス').count();
  console.log('Validation text count:', validationText);
});