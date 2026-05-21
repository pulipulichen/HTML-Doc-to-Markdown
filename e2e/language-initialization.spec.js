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
