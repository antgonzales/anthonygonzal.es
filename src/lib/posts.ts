/**
 * Announcement posts. They stay in the writing index, in RSS, and at their
 * URLs — they are only held out of the homepage "Latest" list, which is for
 * technical writing. Case-study announcements move to /work when it ships.
 *
 * src/data/announcements.json is the one place to edit the exclusion.
 */
import announcementSlugs from "../data/announcements.json";

interface PostLike {
  id: string;
  data: { pubDate: Date };
}

/** Newest first. */
export function byNewest<T extends PostLike>(posts: T[]): T[] {
  return [...posts].sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );
}

/** The homepage list: the N most recent technical posts. */
export function getTechnicalPosts<T extends PostLike>(
  posts: T[],
  limit?: number,
): T[] {
  const technical = byNewest(posts).filter(
    (post) => !announcementSlugs.includes(post.id),
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
