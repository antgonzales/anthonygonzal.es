/**
 * Extract the first non-heading paragraph from a raw markdown string,
 * stripping inline markdown syntax (links, bold, italic, code).
 */
export function getExcerpt(body: string): string {
  const paragraphs = body.split(/\n\n+/);
  const first = paragraphs.find((p) => p.trim() && !p.trim().startsWith('#'));
  if (!first) return '';
  return first
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // [text](url) → text
    .replace(/[*_`]{1,2}([^*_`]+)[*_`]{1,2}/g, '$1') // bold/italic/code → text
    .replace(/\n/g, ' ')
    .trim();
}
