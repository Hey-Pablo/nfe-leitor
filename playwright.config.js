/**
 * playwright.config.js — Configuração do Playwright para testes E2E do nfe-leitor.
 * Testes rodam em e2e/ para não interferir com npm test do núcleo.
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:18080',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'python3 -m http.server 18080',
    url: 'http://localhost:18080',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    cwd: '/paperclip/instances/default/isolated-workspaces/e33b41af-0507-40d6-a2db-89167b7d7c89/e0784c00-3cd7-4f6e-a303-b01e820f93c8/nfe-leitor',
  },
});