import { FullConfig } from '@playwright/test';
import fs from 'fs';

async function globalTeardown(config: FullConfig) {
  try {
    // Clean up authentication state
    if (fs.existsSync('tests/e2e/auth-state.json')) {
      fs.unlinkSync('tests/e2e/auth-state.json');
    }
    
    // Clean up any test artifacts
    console.log('Global teardown completed successfully');
  } catch (error) {
    console.error('Global teardown failed:', error);
  }
}

export default globalTeardown;