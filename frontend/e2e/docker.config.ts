import { defineConfig, devices } from '@playwright/test';

/**
 * Docker environment specific Playwright configuration
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // Sequential in Docker to avoid conflicts
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 3 : 1,
  workers: 1, // Single worker in Docker
  reporter: [
    ['html', { outputFolder: 'test-results/playwright-report' }],
    ['junit', { outputFile: 'test-results/junit-results.xml' }],
    ['json', { outputFile: 'test-results/test-results.json' }]
  ],
  
  use: {
    baseURL: 'http://frontend:5173', // Docker service name
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Slower timeouts for Docker environment
    actionTimeout: 30000,
    navigationTimeout: 30000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    }
  ],

  // No webServer in Docker - services are managed by docker-compose
  expect: {
    timeout: 10000
  },

  timeout: 60000, // Increased timeout for Docker
});