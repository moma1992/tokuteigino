import { FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  // Wait for the dev server to be ready
  const maxRetries = 30;
  const retryDelay = 2000;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch('http://localhost:5173');
      if (response.ok) {
        console.log('Dev server is ready');
        break;
      }
    } catch (error) {
      if (i === maxRetries - 1) {
        throw new Error('Dev server failed to start');
      }
      console.log(`Waiting for dev server... (${i + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
}

export default globalSetup;