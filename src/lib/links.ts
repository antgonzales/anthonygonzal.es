/**
 * Outbound links carry `target="_blank" rel="nofollow noopener"`. The lists in
 * site.json and record.json mix internal and external hrefs, so the test has to
 * run per item rather than per list — /rss.xml and /blog/… stay in-tab.
 *
 * Markdown bodies are handled separately, by rehype-external-links in
 * astro.config.mjs. Keep the two in step.
 */
const SITE_HOST = "anthonygonzal.es";

export const EXTERNAL_LINK_ATTRS = {
  target: "_blank",
  rel: "nofollow noopener",
} as const;

/** True for an http(s) or protocol-relative URL pointing off this host. */
export function isExternal(href?: string | null): boolean {
  if (!href || !/^(https?:)?\/\//i.test(href)) return false;
  try {
    const { hostname } = new URL(href, `https://${SITE_HOST}`);
    return hostname !== SITE_HOST && !hostname.endsWith(`.${SITE_HOST}`);
  } catch {
    return false;
  }
}

/** Spread onto an anchor: the attributes above for external hrefs, else none. */
export function externalAttrs(href?: string | null) {
  return isExternal(href) ? EXTERNAL_LINK_ATTRS : {};
}
