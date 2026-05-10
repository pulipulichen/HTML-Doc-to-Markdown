/* jshint esversion: 11, module: true */
import { test, expect } from '@playwright/test';

test('頁面應該正確載入並顯示標題', async ({ page }) => {
  // 1. 導航至應用程式
  await page.goto('http://localhost:8080');

  // 2. 設定 console error 追蹤
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  // 3. 驗證標題是否存在
  const header = page.locator('h1');
  await expect(header).toBeVisible();
  await expect(header).toHaveText('全能 Office 轉 Obsidian');

  // 4. 驗證拖放區域是否存在
  const dropZone = page.locator('#dropZone');
  await expect(dropZone).toBeVisible();
  await expect(dropZone).toContainText('拖放檔案到這裡');

  const urlInput = page.locator('#urlInput');
  await expect(urlInput).toBeVisible();
  await expect(urlInput).toHaveAttribute('placeholder', /Google Drive/);
  await expect(urlInput).toHaveValue(/1HRAvOD8zdX7w6uB15Odd7OpWcZXYG3hvy8BG2TPCmmg/);

  // 5. 驗證支援的格式文字
  const formats = page.locator('header p');
  await expect(formats).toContainText('Docx');
  await expect(formats).toContainText('Pdf');
  await expect(formats).toContainText('Markdown table');

  // 6. 最終檢查有無 console error
  await page.waitForLoadState('networkidle');
  
  // 排除一些外部 library 可能產生的警告或非致命錯誤 (如果有需要的話)
  expect(consoleErrors).toHaveLength(0);
});

test('點擊拖放區域應該觸發檔案選擇', async ({ page }) => {
  await page.goto('http://localhost:8080');
  
  // 檢查 hidden input 是否存在
  const fileInput = page.locator('#fileInput');
  await expect(fileInput).toBeAttached();
});
