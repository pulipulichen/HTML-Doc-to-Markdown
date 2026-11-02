/* jshint esversion: 11, module: true */
import { test, expect } from '@playwright/test';

async function showGallery(page, count = 31) {
  await page.goto('http://localhost:8080');
  await page.evaluate(async (numberOfImages) => {
    const canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 2;
    const context = canvas.getContext('2d');
    context.fillStyle = '#ff0000';
    context.fillRect(0, 0, 1, 1);
    const transparentPng = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    currentData = {
      fileName: 'slides',
      extension: 'pptx',
      markdown: '# Demo\n\n' + 'Long text to scroll\n'.repeat(300),
      images: Array.from({ length: numberOfImages }, (_, i) => ({
        name: 'slide' + (i + 1) + '.png',
        blob: transparentPng
      }))
    };
    displayResult();
  }, count);
  await expect(page.locator('#imagePreview img')).toHaveCount(count);
}

for (const width of [1280, 390]) {
  test('all attachments stay in the page scroll at ' + width + 'px', async ({ page }) => {
    await page.setViewportSize({ width, height: 768 });
    await showGallery(page);
    const metrics = await page.evaluate(() => {
      const gallery = document.getElementById('imagePreview');
      const panel = document.getElementById('attachmentsPanel');
      const markdownBody = document.getElementById('markdownPanelBody');
      return {
        panelHeight: panel.getBoundingClientRect().height,
        galleryScrolls: gallery.scrollHeight > gallery.clientHeight + 2,
        pageScrolls: document.documentElement.scrollHeight > window.innerHeight,
        markdownScrolls: markdownBody.scrollHeight > markdownBody.clientHeight + 2
      };
    });
    expect(metrics.panelHeight).toBeGreaterThan(768 / 2);
    expect(metrics.galleryScrolls).toBe(false);
    expect(metrics.pageScrolls).toBe(true);
    expect(metrics.markdownScrolls).toBe(true);
    await page.locator('#imagePreview img').last().scrollIntoViewIfNeeded();
    await expect(page.locator('#imagePreview img').last()).toBeInViewport();
    await page.locator('#markdownPanelToggle').click();
    await expect(page.locator('#markdownPanelToggle')).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#imagePreview img')).toHaveCount(31);
    await page.locator('#markdownPanelToggle').click();
    await expect(page.locator('#markdownPanelToggle')).toHaveAttribute('aria-expanded', 'true');
  });
}

test('white-background PNG is opaque and preserves visible pixels', async ({ page }) => {
  await showGallery(page, 2);
  const pixels = await page.evaluate(async () => {
    const opaquePng = await createOpaquePng(currentData.images[0].blob);
    const bitmap = await createImageBitmap(opaquePng);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const context = canvas.getContext('2d');
      context.drawImage(bitmap, 0, 0);
      return {
        visible: [...context.getImageData(0, 0, 1, 1).data],
        transparent: [...context.getImageData(1, 1, 1, 1).data],
        type: opaquePng.type
      };
    } finally {
      bitmap.close();
    }
  });
  expect(pixels.visible).toEqual([255, 0, 0, 255]);
  expect(pixels.transparent).toEqual([255, 255, 255, 255]);
  expect(pixels.type).toBe('image/png');

  const singleDownload = page.waitForEvent('download');
  await page.locator('.attachment-opaque-download').first().click();
  expect((await singleDownload).suggestedFilename()).toBe('slides_slide1_white-bg.png');

  await page.locator('#imagePreview img').first().click();
  const modalDownload = page.waitForEvent('download');
  await page.locator('#imageModalDownloadOpaquePng').click();
  expect((await modalDownload).suggestedFilename()).toBe('slides_slide1_white-bg.png');
  await page.locator('#imageModalClose').click();

  const zipDownload = page.waitForEvent('download');
  await page.locator('#downloadOpaquePngZipBtn').click();
  expect((await zipDownload).suggestedFilename()).toBe('slides_opaque_png.zip');
});
