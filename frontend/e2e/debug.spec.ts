import { test, expect } from '@playwright/test';

test.describe('Debug Tests', () => {
  test('should inspect login page content', async ({ page }) => {
    // Go to login page
    await page.goto('/login');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/login-page-debug.png' });
    
    // Get page content
    const content = await page.content();
    console.log('Page title:', await page.title());
    console.log('Page URL:', page.url());
    
    // Check what h4 elements exist
    const h4Elements = await page.locator('h4').all();
    console.log('Found h4 elements:', h4Elements.length);
    
    for (let i = 0; i < h4Elements.length; i++) {
      const text = await h4Elements[i].textContent();
      console.log(`h4[${i}]:`, text);
    }
    
    // Check specifically for the login h4
    const loginH4 = await page.locator('h4:has-text("ログイン")').count();
    console.log('Login h4 count:', loginH4);
    
    // Check for any Typography variant h4
    const typographyH4 = await page.locator('[variant="h4"]').count();
    console.log('Typography h4 count:', typographyH4);
    
    // Check for the specific login header
    const loginHeader = await page.locator('Typography:has-text("ログイン"), h4:has-text("ログイン"), [role="heading"]:has-text("ログイン")').count();
    console.log('Login header count:', loginHeader);
    
    // Check for any loading states
    const loadingElements = await page.locator('text=読み込み').all();
    console.log('Loading elements found:', loadingElements.length);
    
    // Check if there are any errors
    const errorElements = await page.locator('[role="alert"]').all();
    console.log('Error elements found:', errorElements.length);
    
    // Check if React app is loaded
    const reactRoot = await page.locator('#root').count();
    console.log('React root found:', reactRoot);
    
    // Get the current body content
    const bodyText = await page.locator('body').textContent();
    console.log('Body text length:', bodyText?.length || 0);
    console.log('Body text preview:', bodyText?.substring(0, 200) || 'No body text');
    
    // Check the actual HTML structure
    const loginContainer = await page.locator('text=ログイン').first();
    if (await loginContainer.count() > 0) {
      const tagName = await loginContainer.evaluate(el => el.tagName);
      console.log('Login text tag name:', tagName);
      
      // Get the actual login header element
      const loginHeaderEl = await page.locator('text=ログイン >> .. >> *').first();
      if (await loginHeaderEl.count() > 0) {
        const headerTagName = await loginHeaderEl.evaluate(el => el.tagName);
        console.log('Login header container tag:', headerTagName);
      }
    }
  });
});