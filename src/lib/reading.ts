interface BookLike {
  data: { finished?: Date };
}

/**
 * The book with no finish date. There should be at most one; the yaml is
 * newest-first, so the first match wins.
 */
export function currentlyReading<T extends BookLike>(
  books: T[],
): T | undefined {
  return books.find((book) => !book.data.finished);
}

/** Finished books, most recently finished first. */
export function finishedBooks<T extends BookLike>(
  books: T[],
  limit?: number,
): T[] {
  const finished = books
    .filter((book) => book.data.finished)
    .sort((a, b) => b.data.finished!.valueOf() - a.data.finished!.valueOf());
  return limit === undefined ? finished : finished.slice(0, limit);
}
