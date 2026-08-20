interface BookLike {
  data: { started: Date; finished?: Date };
}

/** The book with no finish date. There should be at most one. */
export function currentlyReading<T extends BookLike>(
  books: T[],
): T | undefined {
  return books
    .filter((book) => !book.data.finished)
    .sort((a, b) => b.data.started.valueOf() - a.data.started.valueOf())[0];
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
