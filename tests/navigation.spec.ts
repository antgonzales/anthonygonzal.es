import { test, expect } from '@playwright/test';

test.describe('User can navigate the site', () => {
  test('visitor can access the home page', async ({ page }) => {
    await page.goto('/');
    
    // Test user-facing content, not implementation details
    await expect(page).toHaveTitle('Anthony Gonzales');
    await expect(page.getByRole('heading', { name: 'Latest post' })).toBeVisible();
  });

  test('visitor can browse blog posts', async ({ page }) => {
    await page.goto('/');
    
    // Use semantic navigation - how a real user would interact
    await page.getByRole('link', { name: 'Blog' }).click();
    await expect(page).toHaveURL('/blog');
    await expect(page).toHaveTitle(/Blog/);
    
    // Verify blog content is accessible
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('visitor can read latest post from home page', async ({ page }) => {
    await page.goto('/');
    
    // Test actual user journey - seeing and clicking latest post
    const latestPostHeading = page.getByRole('heading', { level: 2 }).nth(1); // First h2 after "Latest post"
    await expect(latestPostHeading).toBeVisible();
    
    // User can see preview content
    await expect(page.getByRole('img').first()).toBeVisible();
    
    // User can click through to read full post
    await latestPostHeading.getByRole('link').click();
    
    // Should arrive at the full blog post
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('visitor can return home from any page', async ({ page }) => {
    await page.goto('/blog');
    
    // Use accessible navigation - test clicking the logo
    await page.locator('.nav-logo a').click();
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'Latest post' })).toBeVisible();
  });

  test('navigation is keyboard accessible', async ({ page }) => {
    await page.goto('/');
    
    // Test keyboard navigation directly to Blog link
    await page.getByRole('link', { name: 'Blog' }).focus();
    await page.keyboard.press('Enter');
    
    await expect(page).toHaveURL('/blog');
  });
});