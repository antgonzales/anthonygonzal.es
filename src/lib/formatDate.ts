/**
 * Format a Date as a human-readable string in UTC.
 * Using timeZone: 'UTC' prevents off-by-one date shifts when
 * z.coerce.date() parses "2025-09-15" as UTC midnight and the
 * local timezone renders it as the previous day.
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
