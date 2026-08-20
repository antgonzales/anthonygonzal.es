import { describe, it, expect } from "vitest";
import { currentlyReading, finishedBooks } from "./reading";

function makeBook(title: string, started: string, finished?: string) {
  return {
    id: title,
    data: {
      title,
      started: new Date(started),
      finished: finished ? new Date(finished) : undefined,
    },
  };
}

const books = [
  makeBook("Stoner", "2025-02-16", "2025-03-22"),
  makeBook("The Periodic Table", "2026-08-02"),
  makeBook("Notes from Underground", "2026-06-14", "2026-07-21"),
];

describe("currentlyReading()", () => {
  it("is the book with no finish date", () => {
    expect(currentlyReading(books)?.data.title).toBe("The Periodic Table");
  });

  it("is undefined when everything is finished", () => {
    expect(
      currentlyReading(books.filter((b) => b.data.finished)),
    ).toBeUndefined();
  });
});

describe("finishedBooks()", () => {
  it("orders by finish date, most recent first", () => {
    expect(finishedBooks(books).map((b) => b.data.title)).toEqual([
      "Notes from Underground",
      "Stoner",
    ]);
  });

  it("takes the most recent N when limited", () => {
    expect(finishedBooks(books, 1).map((b) => b.data.title)).toEqual([
      "Notes from Underground",
    ]);
  });
});
