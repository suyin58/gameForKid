import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright 测试配置
 * 用于前后端联调测试
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: false,
  retries: 1,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173', // uni-app H5 默认端口
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // 测试超时设置
  timeout: 30000,
});
