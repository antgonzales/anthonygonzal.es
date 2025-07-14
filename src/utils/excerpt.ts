import type { CollectionEntry } from 'astro:content';

export async function getExcerpt(post: CollectionEntry<'blog'>): Promise<string> {
  const { body } = post;
  
  // Look for <!-- excerpt --> marker
  const excerptMarker = '<!-- excerpt -->';
  const excerptIndex = body.indexOf(excerptMarker);
  
  if (excerptIndex !== -1) {
    // Return content up to the excerpt marker
    return body.slice(0, excerptIndex).trim();
  }
  
  // Fallback: return first paragraph or description
  const firstParagraphMatch = body.match(/^(.+?)(?:\n\n|\r\n\r\n)/s);
  if (firstParagraphMatch) {
    return firstParagraphMatch[1].trim();
  }
  
  // Final fallback: return description
  return post.data.description;
}

export async function renderExcerpt(post: CollectionEntry<'blog'>): Promise<any> {
  const excerptContent = await getExcerpt(post);
  
  // Render the excerpt markdown
  const { Content } = await post.render();
  
  // For now, we'll create a simple wrapper that only renders excerpt content
  // This is a simplified approach - in a full implementation, you'd want to
  // parse and render only the excerpt portion of the markdown
  return excerptContent;
}