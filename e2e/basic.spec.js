/* jshint esversion: 11, module: true */
/* global window */
import { test, expect } from '@playwright/test';

test('Page initializes in English when language is stored as en', async ({ page }) => {
  // 1. Force stored language before the app initializes
  await page.addInitScript(() => {
    window.localStorage.setItem('htmlDocToMarkdown_language', 'en');
  });

  // 2. Setup console error tracking and navigate
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  await page.goto('http://localhost:8080');

  // 3. Verify language state and translated UI in English
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('#languageSelect')).toHaveValue('en');
  await expect(page.locator('h1')).toHaveText('Multi-Format Document to Markdown');
  await expect(page.locator('#dropZone p').first()).toHaveText('Drop files here');
  await expect(page.locator('#urlInput')).toHaveAttribute('placeholder', /Google Drive \/ Docs \/ Slides link/);

  // 4. Final check: no console errors
  await page.waitForLoadState('networkidle');
  expect(consoleErrors).toHaveLength(0);
});

test('Manual language switch updates UI and persists to localStorage', async ({ page }) => {
  // 1. Start from English to ensure deterministic state
  await page.addInitScript(() => {
    window.localStorage.setItem('htmlDocToMarkdown_language', 'en');
  });

  // 2. Setup console error tracking and navigate
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  await page.goto('http://localhost:8080');

  // 3. Switch language to zh-TW
  await page.selectOption('#languageSelect', 'zh-TW');

  // 4. Verify language state and translated UI in zh-TW
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-TW');
  await expect(page.locator('#languageSelect')).toHaveValue('zh-TW');
  await expect(page.locator('h1')).toHaveText('全能 Document 格式 轉 Markdown');
  await expect(page.locator('#dropZone p').first()).toHaveText('拖放檔案到這裡');
  await expect(page.locator('#urlInput')).toHaveAttribute('placeholder', /Google Drive \/ Docs \/ Slides 連結/);

  // 5. Verify persistence is written to localStorage
  const storedLanguage = await page.evaluate(() => window.localStorage.getItem('htmlDocToMarkdown_language'));
  expect(storedLanguage).toBe('zh-TW');

  // 6. Final check: no console errors
  await page.waitForLoadState('networkidle');
  expect(consoleErrors).toHaveLength(0);
});

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
