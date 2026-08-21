import { describe, it, expect } from "vitest";
import announcements from "../data/announcements.json";
import {
  byNewest,
  entryDate,
  getTechnicalPosts,
  monthYear,
  neighbors,
  readingTime,
} from "./posts";

function post(id: string, pubDate: string) {
  return { id, data: { pubDate: new Date(pubDate) } };
}

describe("byNewest()", () => {
  it("puts the most recent post first", () => {
    const posts = [post("older", "2020-01-01"), post("newer", "2026-01-01")];
    expect(byNewest(posts).map((entry) => entry.id)).toEqual([
      "newer",
      "older",
    ]);
  });

  it("leaves the list it was given untouched", () => {
    const posts = [post("older", "2020-01-01"), post("newer", "2026-01-01")];
    byNewest(posts);
    expect(posts.map((entry) => entry.id)).toEqual(["older", "newer"]);
  });

  it("keeps posts sharing a date in the order given", () => {
    const posts = [post("first", "2026-01-01"), post("second", "2026-01-01")];
    expect(byNewest(posts).map((entry) => entry.id)).toEqual([
      "first",
      "second",
    ]);
  });
});

describe("getTechnicalPosts()", () => {
  it("lists posts newest first", () => {
    const posts = [post("older", "2014-09-28"), post("newer", "2026-08-10")];
    expect(getTechnicalPosts(posts).map((entry) => entry.id)).toEqual([
      "newer",
      "older",
    ]);
  });

  it("leaves out announcements", () => {
    const posts = [
      post(announcements[0], "2026-09-15"),
      post("a-technical-post", "2026-08-10"),
    ];
    expect(getTechnicalPosts(posts).map((entry) => entry.id)).toEqual([
      "a-technical-post",
    ]);
  });

  it("returns no more than the limit it is given", () => {
    const posts = [post("newer", "2026-08-10"), post("older", "2014-09-28")];
    expect(getTechnicalPosts(posts, 1).map((entry) => entry.id)).toEqual([
      "newer",
    ]);
  });
});

describe("entryDate()", () => {
  it("renders the month and day", () => {
    expect(entryDate(new Date("2026-08-10")).line).toBe("AUG 10");
  });

  it("renders the year on its own line", () => {
    expect(entryDate(new Date("2026-08-10")).year).toBe("2026");
  });

  it("pads a single-digit day, so the column stays aligned", () => {
    expect(entryDate(new Date("2026-08-01")).line).toBe("AUG 01");
  });

  it("renders a midnight UTC date as that day, not the day before", () => {
    expect(entryDate(new Date("2025-09-15")).line).toBe("SEP 15");
  });
});

describe("monthYear()", () => {
  it("renders the month without a day", () => {
    expect(monthYear(new Date("2026-07-21")).line).toBe("JUL");
  });

  it("renders the year on its own line", () => {
    expect(monthYear(new Date("2026-07-21")).year).toBe("2026");
  });

  it("keeps the first of January in the year it falls in", () => {
    expect(monthYear(new Date("2026-01-01")).year).toBe("2026");
  });
});

describe("readingTime()", () => {
  it("reads 150 words a minute", () => {
    expect(readingTime("word ".repeat(300))).toBe("2 min read");
  });

  it("rounds to the nearest minute", () => {
    expect(readingTime("word ".repeat(380))).toBe("3 min read");
  });

  it("claims a minute for a post of a few words", () => {
    expect(readingTime("short")).toBe("1 min read");
  });

  it("claims a minute for an empty post", () => {
    expect(readingTime("")).toBe("1 min read");
  });
});

describe("neighbors()", () => {
  function archive() {
    return [
      post("newest", "2026-01-01"),
      post("middle", "2025-01-01"),
      post("oldest", "2024-01-01"),
    ];
  }

  it("finds the older post as previous", () => {
    expect(neighbors(archive(), "middle").previous?.id).toBe("oldest");
  });

  it("finds the newer post as next", () => {
    expect(neighbors(archive(), "middle").next?.id).toBe("newest");
  });

  it("orders the posts itself, whatever order they arrive in", () => {
    const shuffled = [
      post("oldest", "2024-01-01"),
      post("newest", "2026-01-01"),
      post("middle", "2025-01-01"),
    ];
    expect(neighbors(shuffled, "middle").next?.id).toBe("newest");
  });

  it("finds nothing newer than the newest post", () => {
    expect(neighbors(archive(), "newest").next).toBeUndefined();
  });

  it("finds nothing older than the oldest post", () => {
    expect(neighbors(archive(), "oldest").previous).toBeUndefined();
  });

  it("finds no neighbours for a post that was never published", () => {
    expect(neighbors(archive(), "never-published")).toEqual({});
  });
});
