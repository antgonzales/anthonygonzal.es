import { describe, it, expect } from "vitest";
import { parseReadingYaml, slugify } from "./parseReadingYaml";

describe("parseReadingYaml()", () => {
  it("reads entries, skipping comments and blank lines", () => {
    const books = parseReadingYaml(`# a comment

- title: Notes of a Native Son
  author: James Baldwin

- title: Angel Down
  author: Daniel Kraus
  finished: 2026-08
`);
    expect(books).toEqual([
      {
        id: "notes-of-a-native-son",
        title: "Notes of a Native Son",
        author: "James Baldwin",
      },
      {
        id: "angel-down",
        title: "Angel Down",
        author: "Daniel Kraus",
        finished: "2026-08",
      },
    ]);
  });

  it("splits on the first colon, so titles may contain one", () => {
    const [book] = parseReadingYaml(
      "- title: Dune: Messiah\n  author: Frank Herbert\n",
    );
    expect(book.title).toBe("Dune: Messiah");
  });

  it("accepts quoted values and keeps # inside them", () => {
    const [book] = parseReadingYaml(
      '- title: "Bleak House # 1"\n  author: Dickens\n',
    );
    expect(book.title).toBe("Bleak House # 1");
  });

  it("throws with a line number on a malformed line", () => {
    expect(() => parseReadingYaml("- title: Stoner\n  author\n")).toThrow(
      /line 2/,
    );
  });

  it("throws on a field with no value", () => {
    expect(() => parseReadingYaml("- title: Stoner\n  author:\n")).toThrow(
      /"author" has no value/,
    );
  });

  it("throws on a field before the first entry", () => {
    expect(() => parseReadingYaml("  author: Nobody\n")).toThrow(
      /before the first/,
    );
  });

  it("throws on an entry with no title", () => {
    expect(() => parseReadingYaml("- author: Nobody\n")).toThrow(/no title/);
  });

  it("gives a re-read its own id, keeping the plain slug on the first read", () => {
    // Newest first, as the file is written: the re-read is appended on top.
    const books = parseReadingYaml(`- title: Huckleberry Finn
  author: Mark Twain
  finished: 2028-03

- title: Huckleberry Finn
  author: Mark Twain
  finished: 2025-12
`);
    expect(books.map((b) => b.id)).toEqual([
      "huckleberry-finn-2028",
      "huckleberry-finn",
    ]);
  });

  it("keeps a book read twice in one year distinct", () => {
    const books = parseReadingYaml(`- title: Stoner
  author: John Williams
  finished: 2026-09

- title: Stoner
  author: John Williams
  finished: 2026-01
`);
    expect(new Set(books.map((b) => b.id)).size).toBe(2);
    expect(books[1].id).toBe("stoner");
  });

  it("treats a re-read in progress as the most recent reading", () => {
    const books = parseReadingYaml(`- title: Stoner
  author: John Williams

- title: Stoner
  author: John Williams
  finished: 2026-01
`);
    expect(books.map((b) => b.id)).toEqual(["stoner-current", "stoner"]);
  });
});

describe("slugify()", () => {
  it("makes a url-safe id from a title", () => {
    expect(slugify("The Adventures of Huckleberry Finn")).toBe(
      "the-adventures-of-huckleberry-finn",
    );
    expect(slugify("J.M. Coetzee’s Disgrace")).toBe("j-m-coetzees-disgrace");
  });
});
