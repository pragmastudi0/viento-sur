import { defineConfig, devices } from '@playwright/test';
import { loadLocalTestEnvironment } from './tests/local-env';
loadLocalTestEnvironment();
export default defineConfig({
  testDir: './tests/e2e', timeout: 60000, expect: { timeout: 15000 }, workers: 1,
  use: { baseURL: 'http://127.0.0.1:3005', trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
    { name: 'tablet', use: { ...devices['iPad Mini'], browserName: 'chromium' } },
  ],
  webServer: { command: 'npm run dev -- --webpack -p 3005', url: 'http://127.0.0.1:3005/admin/login', timeout: 180000, reuseExistingServer: !process.env.CI },
});
