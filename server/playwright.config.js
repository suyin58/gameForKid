import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright配置文件
 * 用于E2E测试配置
 */
export default defineConfig({
  testDir: './e2e',

  // 测试超时时间
  timeout: 30 * 1000,

  // 期望超时时间
  expect: {
    timeout: 5 * 1000
  },

  // 失败时重试
  retries: 1,

  // 并发执行测试
  workers: 1,

  // 报告器配置
  reporter: [
    ['html'],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }]
  ],

  use: {
    // 基础URL
    baseURL: 'http://localhost:3001',

    // 追踪API请求
    trace: 'on-first-retry',

    // 截图配置
    screenshot: 'only-on-failure',

    // 视频录制
    video: 'retain-on-failure',
  },

  // 项目配置
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // 开发服务器配置
  // webServer: {
  //   command: 'npm start',
  //   url: 'http://localhost:3001',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120 * 1000,
  // },
});
