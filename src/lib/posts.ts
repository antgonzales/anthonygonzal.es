interface PostLike {
  id: string;
  data: { pubDate: Date; tags?: readonly string[] };
}

/** Newest first. */
export function byNewest<T extends PostLike>(posts: T[]): T[] {
  return [...posts].sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );
}

/**
 * The homepage Writing section: the N most recent technical posts.
 *
 * Drawn from posts tagged `technical`, so this is opt-in: an untagged post
 * will not appear here. Everything else — announcements included — still
 * shows in /blog/, in RSS, and at its URL. Case-study announcements move to
 * /work when it ships.
 */
export function getTechnicalPosts<T extends PostLike>(
  posts: T[],
  limit?: number,
): T[] {
  const technical = byNewest(posts).filter((post) =>
    post.data.tags?.includes("technical"),
  );
  return limit === undefined ? technical : technical.slice(0, limit);
}

/**
 * The entry date line — "AUG 10, 2026".
 * UTC throughout, so "2025-09-15" never renders as the 14th.
 */
export function entryDate(date: Date): string {
  return date
    .toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      timeZone: "UTC",
    })
    .toUpperCase();
}

/** "JUL 2026", for records that only know their month. */
export function monthYear(date: Date): string {
  return date
    .toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    })
    .toUpperCase();
}

/** Previous (older) and next (newer) post, for the postnav row. */
export function neighbors<T extends PostLike>(
  posts: T[],
  id: string,
): { previous?: T; next?: T } {
  const ordered = byNewest(posts);
  const index = ordered.findIndex((post) => post.id === id);
  if (index === -1) return {};
  return { previous: ordered[index + 1], next: ordered[index - 1] };
}
