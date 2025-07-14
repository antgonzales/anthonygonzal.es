import { test, expect } from '@playwright/test';

test.describe('Visitors can read blog content', () => {
  test('reader can browse all blog posts', async ({ page }) => {
    await page.goto('/blog');
    
    await expect(page).toHaveTitle(/Blog/);
    
    // Test that blog posts are accessible and readable
    const blogPosts = page.getByRole('listitem');
    const postCount = await blogPosts.count();
    expect(postCount).toBeGreaterThan(0);
    
    // Each post should have accessible content
    const firstPost = blogPosts.first();
    await expect(firstPost.getByRole('link')).toBeVisible();
    await expect(firstPost.getByText(/\d{4}/)).toBeVisible(); // Date should be visible
  });

  test('reader can access and read full blog post', async ({ page }) => {
    await page.goto('/blog/2025-03-25-building-a-transaction-dashboard-on-compass/');
    
    // Test page accessibility and content
    await expect(page).toHaveTitle('Building a transaction dashboard on Compass | Anthony Gonzales');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Building a transaction dashboard');
    
    // Content should be readable
    await expect(page.getByRole('main')).toBeVisible();
    
    // Images should be accessible with alt text
    const images = page.getByRole('img');
    const imageCount = await images.count();
    if (imageCount > 0) {
      const firstImage = images.first();
      await expect(firstImage).toBeVisible();
      await expect(firstImage).toHaveAttribute('alt');
    }
  });

  test('reader can navigate within long posts using table of contents', async ({ page }) => {
    await page.goto('/blog/2025-03-25-building-a-transaction-dashboard-on-compass/');
    
    // Find TOC by looking for "Contents" text (user-facing, not implementation)
    const contentsSection = page.locator('text=Contents').first();
    await expect(contentsSection).toBeVisible();
    
    // Test TOC navigation works for users
    const tocLinks = page.locator('a[href^="#"]');
    if (await tocLinks.count() > 0) {
      const firstTocLink = tocLinks.first();
      const linkText = await firstTocLink.textContent();
      await firstTocLink.click();
      
      // Should navigate to the section
      const heading = page.getByRole('heading', { name: linkText?.trim() });
      await expect(heading).toBeInViewport();
    }
  });

  test('reader is informed about outdated content', async ({ page }) => {
    // Test user experience with archived content
    await page.goto('/blog');
    
    // Look for any archived posts and test user experience
    const oldPostLinks = page.getByRole('link').filter({ hasText: /hello world/i });
    const oldPostCount = await oldPostLinks.count();
    
    if (oldPostCount > 0) {
      await oldPostLinks.first().click();
      
      // User should see clear warning about archived content
      await expect(page.getByText(/archived/i)).toBeVisible();
      await expect(page.getByText(/outdated/i)).toBeVisible();
    }
  });

  test('content is accessible to screen readers', async ({ page }) => {
    await page.goto('/blog/2025-03-25-building-a-transaction-dashboard-on-compass/');
    
    // Test semantic structure
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    
    // Test that links are descriptive
    const links = page.getByRole('link');
    const linkCount = await links.count();
    
    // Sample a few links to ensure they have meaningful text
    if (linkCount > 0) {
      const firstLink = links.first();
      const linkText = await firstLink.textContent();
      expect(linkText).toBeTruthy();
      expect(linkText!.trim().length).toBeGreaterThan(1);
    }
  });

  test('social sharing metadata is present', async ({ page }) => {
    await page.goto('/blog/2025-03-25-building-a-transaction-dashboard-on-compass/');
    
    // Test that content can be properly shared (user benefit)
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /.+/);
  });
});