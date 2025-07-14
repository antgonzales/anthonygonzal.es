import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = await getCollection('blog');
  
  // Sort posts by date, newest first
  const sortedPosts = posts
    .filter(post => !post.data.draft)
    .sort((a, b) => new Date(b.data.date) - new Date(a.data.date));

  return rss({
    title: 'AnthonyGonzales.dev',
    description: 'The personal site, blog, and portfolio of Anthony Gonzales, a developer who cares about the code.',
    site: context.site || 'https://www.anthonygonzales.dev',
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description,
      link: `/blog/${post.slug}/`,
    })),
    customData: `<language>en-us</language>`,
  });
}