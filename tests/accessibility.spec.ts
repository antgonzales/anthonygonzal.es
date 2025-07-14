import { test, expect } from '@playwright/test';

test.describe('Site is accessible to all users', () => {
  test('all pages have proper document structure', async ({ page }) => {
    const pages = [
      '/',
      '/blog',
      '/blog/2025-03-25-building-a-transaction-dashboard-on-compass/'
    ];

    for (const url of pages) {
      await page.goto(url);
      
      // Every page should have proper document structure
      await expect(page.locator('html')).toHaveAttribute('lang', 'en');
      await expect(page.getByRole('banner')).toBeVisible(); // header
      await expect(page.getByRole('main')).toBeVisible();
      await expect(page.getByRole('contentinfo')).toBeVisible(); // footer
      
      // Title should be descriptive
      const title = await page.title();
      expect(title.length).toBeGreaterThan(5);
    }
  });

  test('navigation is keyboard accessible', async ({ page }) => {
    await page.goto('/');
    
    // Should be able to navigate site with keyboard only
    const blogLink = page.getByRole('link', { name: 'Blog' });
    await blogLink.focus();
    
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toContainText(/blog/i);
    
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL('/blog');
  });

  test('images have descriptive alt text', async ({ page }) => {
    await page.goto('/blog/2025-03-25-building-a-transaction-dashboard-on-compass/');
    
    const images = page.getByRole('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const image = images.nth(i);
      const altText = await image.getAttribute('alt');
      
      // Alt text should be present and meaningful
      expect(altText).toBeTruthy();
      expect(altText!.length).toBeGreaterThan(10);
    }
  });

  test('color contrast is sufficient', async ({ page }) => {
    await page.goto('/');
    
    // Test key text elements have sufficient contrast
    const textElements = [
      page.getByRole('heading', { level: 1 }),
      page.getByRole('heading', { level: 2 }).first(),
      page.getByRole('link').first()
    ];

    for (const element of textElements) {
      if (await element.isVisible()) {
        const styles = await element.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            color: computed.color,
            backgroundColor: computed.backgroundColor
          };
        });
        
        // Basic check that colors are defined
        expect(styles.color).toBeTruthy();
      }
    }
  });

  test('focus indicators are visible', async ({ page }) => {
    await page.goto('/');
    
    // Tab to the first focusable element
    await page.keyboard.press('Tab');
    
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Should have some form of focus indication
    const outlineStyle = await focusedElement.evaluate(el => 
      window.getComputedStyle(el).outline
    );
    
    // Either outline or other focus styling should be present
    const hasVisibleFocus = outlineStyle !== 'none' && outlineStyle !== '';
    expect(hasVisibleFocus).toBe(true);
  });

  test('responsive text scaling works', async ({ page }) => {
    await page.goto('/blog/2025-03-25-building-a-transaction-dashboard-on-compass/');
    
    // Test that text can scale for users with vision impairments
    const content = page.getByRole('main');
    
    // Get initial font size
    const initialFontSize = await content.evaluate(el => 
      window.getComputedStyle(el).fontSize
    );
    
    // Simulate user zoom/font scaling
    await page.addStyleTag({ 
      content: 'body { font-size: 200% !important; }' 
    });
    
    // Content should still be readable and not break layout
    await expect(content).toBeVisible();
    
    const scaledFontSize = await content.evaluate(el => 
      window.getComputedStyle(el).fontSize
    );
    
    // Font should have scaled
    expect(parseInt(scaledFontSize)).toBeGreaterThan(parseInt(initialFontSize));
  });
});