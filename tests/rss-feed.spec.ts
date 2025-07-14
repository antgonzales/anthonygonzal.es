import { test, expect } from '@playwright/test';

test.describe('RSS Feed', () => {
  test('should serve RSS feed at /feed.xml', async ({ page }) => {
    const response = await page.goto('/feed.xml');
    
    // Should return 200
    expect(response?.status()).toBe(200);
    
    // Should have correct content type
    const contentType = response?.headers()['content-type'];
    expect(contentType).toContain('xml');
  });

  test('should have valid RSS structure', async ({ page }) => {
    await page.goto('/feed.xml');
    
    const content = await page.textContent('body');
    
    // Check RSS structure
    expect(content).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(content).toContain('<rss version="2.0">');
    expect(content).toContain('<channel>');
    expect(content).toContain('<title>AnthonyGonzales.dev</title>');
    expect(content).toContain('<description>');
    expect(content).toContain('<link>https://www.anthonygonzales.dev/</link>');
    
    // Should have items
    expect(content).toContain('<item>');
    expect(content).toContain('<guid>');
    expect(content).toContain('<pubDate>');
  });

  test('should include recent blog posts in RSS', async ({ page }) => {
    await page.goto('/feed.xml');
    
    const content = await page.textContent('body');
    
    // Should include recent posts
    expect(content).toContain('Building a transaction dashboard on Compass');
    expect(content).toContain('Introducing Compass One');
    
    // Should not include archived posts
    expect(content).not.toContain('Hello World');
  });

  test('should have proper RSS item structure', async ({ page }) => {
    await page.goto('/feed.xml');
    
    const content = await page.textContent('body');
    
    // Check item structure
    expect(content).toMatch(/<item>.*<title>.*<\/title>.*<link>.*<\/link>.*<guid.*>.*<\/guid>.*<description>.*<\/description>.*<pubDate>.*<\/pubDate>.*<\/item>/s);
    
    // Check URLs are absolute
    expect(content).toContain('https://www.anthonygonzales.dev/blog/');
  });
});