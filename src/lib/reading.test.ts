import { describe, it, expect } from "vitest";
import { currentlyReading, finishedBooks } from "./reading";

function book(title: string, finished?: string) {
  return {
    id: title,
    data: { title, finished: finished ? new Date(finished) : undefined },
  };
}

describe("currentlyReading()", () => {
  it("finds the book with no finish date", () => {
    const books = [
      book("Angel Down", "2026-08"),
      book("Notes of a Native Son"),
    ];
    expect(currentlyReading(books)?.data.title).toBe("Notes of a Native Son");
  });

  it("finds nothing when every book is finished", () => {
    expect(currentlyReading([book("Angel Down", "2026-08")])).toBeUndefined();
  });

  it("takes the first unfinished book, since the file lists them newest first", () => {
    const books = [book("Started later"), book("Started earlier")];
    expect(currentlyReading(books)?.data.title).toBe("Started later");
  });
});

describe("finishedBooks()", () => {
  it("puts the most recently finished first", () => {
    const books = [book("Stoner", "2026-01"), book("Angel Down", "2026-08")];
    expect(finishedBooks(books).map((entry) => entry.data.title)).toEqual([
      "Angel Down",
      "Stoner",
    ]);
  });

  it("leaves out the book still being read", () => {
    const books = [book("Notes of a Native Son"), book("Stoner", "2026-01")];
    expect(finishedBooks(books).map((entry) => entry.data.title)).toEqual([
      "Stoner",
    ]);
  });

  it("keeps books finished the same month in the order given", () => {
    const books = [
      book("Dungeon Crawler Carl", "2026-07"),
      book("Interpreter of Maladies", "2026-07"),
    ];
    expect(finishedBooks(books).map((entry) => entry.data.title)).toEqual([
      "Dungeon Crawler Carl",
      "Interpreter of Maladies",
    ]);
  });

  it("returns no more than the limit it is given", () => {
    const books = [book("Angel Down", "2026-08"), book("Stoner", "2026-01")];
    expect(finishedBooks(books, 1).map((entry) => entry.data.title)).toEqual([
      "Angel Down",
    ]);
  });
});
