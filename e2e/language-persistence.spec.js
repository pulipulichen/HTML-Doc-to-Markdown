/* jshint esversion: 11, module: true */
/* global window */
import { test, expect } from '@playwright/test';

test('Selected language remains after page reload', async ({ page }) => {
  // 1. Force stored language as zh-TW before first load
  await page.addInitScript(() => {
    window.localStorage.setItem('htmlDocToMarkdown_language', 'zh-TW');
  });

  // 2. Setup console error tracking and navigate
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  await page.goto('http://localhost:8080');

  // 3. Verify language before reload
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-TW');
  await expect(page.locator('#languageSelect')).toHaveValue('zh-TW');
  await expect(page.locator('h1')).toHaveText('全能 Document 格式 轉 Markdown');

  // 4. Reload and verify the same language remains
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-TW');
  await expect(page.locator('#languageSelect')).toHaveValue('zh-TW');
  await expect(page.locator('h1')).toHaveText('全能 Document 格式 轉 Markdown');

  // 5. Final check: no console errors
  await page.waitForLoadState('networkidle');
  expect(consoleErrors).toHaveLength(0);
});
