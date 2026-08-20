/**
 * The homepage Record section. Hand-maintained — these are milestones, not
 * content. Home Platform and Compass One point at their launch posts until
 * /work and its case studies exist.
 */
export interface RecordEntry {
  year: string;
  title: string;
  href?: string;
  who: string;
}

export const record: RecordEntry[] = [
  {
    year: "2026",
    title: "Home Platform",
    href: "/blog/home-platform-launch/",
    who: "Rollout across four Compass brands",
  },
  {
    year: "2025",
    title: "Promoted to Staff Engineer",
    who: "Compass",
  },
  {
    year: "2025",
    title: "Compass One",
    href: "/blog/introducing-compass-one/",
    who: "Client dashboard, launched · Inman Innovator Award",
  },
  {
    year: "—",
    title: "bettertests.js.org",
    href: "https://bettertests.js.org",
    who: "Open source, ongoing",
  },
];
