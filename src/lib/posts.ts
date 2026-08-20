/**
 * Announcement posts. They stay in the writing index, in RSS, and at their
 * URLs — they are only held out of the homepage "Latest" list, which is for
 * technical writing. Case-study announcements move to /work when it ships.
 *
 * This is the one place to edit the exclusion.
 */
export const announcementSlugs = [
  "home-platform-launch",
  "promoted-to-staff-engineer",
  "compass-one-inman-awards",
  "introducing-compass-one",
  "building-a-transaction-dashboard-on-compass",
];

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
 * The stacked two-line entry date: month-day over year.
 * UTC throughout, so "2025-09-15" never renders as the 14th.
 */
export function entryDate(date: Date): { line: string; year: string } {
  const line = date
    .toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      timeZone: "UTC",
    })
    .toUpperCase();
  return { line, year: String(date.getUTCFullYear()) };
}

/** Month over year, for records that only know their month. */
export function monthYear(date: Date): { line: string; year: string } {
  const line = date
    .toLocaleDateString("en-US", { month: "short", timeZone: "UTC" })
    .toUpperCase();
  return { line, year: String(date.getUTCFullYear()) };
}

/** Right-hand entry meta. 200 words a minute, floor of one. */
export function readingTime(body: string): string {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
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
