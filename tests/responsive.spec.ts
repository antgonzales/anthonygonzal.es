import { test, expect } from '@playwright/test';

test.describe('Responsive Design', () => {
  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto('/');
    
    // Header should be visible and properly sized
    const header = page.locator('.header');
    await expect(header).toBeVisible();
    
    // Navigation should work on mobile
    const navLogo = page.locator('.nav-logo');
    await expect(navLogo).toBeVisible();
    
    // Content should not overflow
    const container = page.locator('main.container').first();
    const boundingBox = await container.boundingBox();
    expect(boundingBox?.width).toBeLessThanOrEqual(375);
  });

  test('should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad
    await page.goto('/blog');
    
    // Blog posts should display properly
    const posts = page.locator('.blog-post');
    await expect(posts.first()).toBeVisible();
    
    // Images should not overflow
    const images = page.locator('img');
    if (await images.count() > 0) {
      const img = images.first();
      const imgBox = await img.boundingBox();
      expect(imgBox?.width).toBeLessThanOrEqual(768);
    }
  });

  test('should work on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    
    // Layout should use max-width
    const container = page.locator('.max-width');
    await expect(container).toBeVisible();
    
    // Content should be centered
    const containerBox = await container.boundingBox();
    expect(containerBox?.width).toBeLessThanOrEqual(1200); // Based on max-width in CSS
  });

  test('should have readable text on all screen sizes', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667 },   // Mobile
      { width: 768, height: 1024 },  // Tablet
      { width: 1920, height: 1080 }  // Desktop
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/blog/2025-03-25-building-a-transaction-dashboard-on-compass/');
      
      // Text should be readable
      const postContent = page.locator('.post-content');
      await expect(postContent).toBeVisible();
      
      // Font size should be appropriate
      const fontSize = await postContent.evaluate(el => window.getComputedStyle(el).fontSize);
      const fontSizeValue = parseInt(fontSize);
      expect(fontSizeValue).toBeGreaterThan(14); // Minimum readable size
    }
  });
});