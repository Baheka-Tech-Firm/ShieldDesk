import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Wait for the application to be ready
    await page.goto(baseURL!);
    await page.waitForLoadState('networkidle');
    
    // Pre-authenticate for faster tests
    await page.goto(`${baseURL}/login`);
    await page.fill('input[type="email"]', 'admin@shielddesk.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Save authentication state
    await page.context().storageState({ path: 'tests/e2e/auth-state.json' });
    
    console.log('Global setup completed successfully');
  } catch (error) {
    console.error('Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;