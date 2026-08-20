import { describe, it, expect } from "vitest";
import { currentlyReading, finishedBooks } from "./reading";

function makeBook(title: string, finished?: string) {
  return {
    id: title,
    data: { title, finished: finished ? new Date(finished) : undefined },
  };
}

// Newest first, as the yaml is written.
const books = [
  makeBook("Notes of a Native Son"),
  makeBook("Angel Down", "2026-08"),
  makeBook("Dungeon Crawler Carl", "2026-07"),
  makeBook("Interpreter of Maladies", "2026-07"),
];

describe("currentlyReading()", () => {
  it("is the book with no finish date", () => {
    expect(currentlyReading(books)?.data.title).toBe("Notes of a Native Son");
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
      "Angel Down",
      "Dungeon Crawler Carl",
      "Interpreter of Maladies",
    ]);
  });

  it("is stable within a month, since dates carry no day", () => {
    const july = finishedBooks(books).slice(1);
    expect(july.map((b) => b.data.title)).toEqual([
      "Dungeon Crawler Carl",
      "Interpreter of Maladies",
    ]);
  });

  it("takes the most recent N when limited", () => {
    expect(finishedBooks(books, 1).map((b) => b.data.title)).toEqual([
      "Angel Down",
    ]);
  });
});
