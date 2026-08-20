import { describe, it, expect } from "vitest";
import {
  announcementSlugs,
  byNewest,
  entryDate,
  getTechnicalPosts,
  monthYear,
  neighbors,
  readingTime,
} from "./posts";

function makePost(id: string, pubDate: string) {
  return { id, data: { title: id, pubDate: new Date(pubDate) } };
}

describe("byNewest()", () => {
  it("sorts newest first without mutating the input", () => {
    const posts = [
      makePost("old", "2020-01-01"),
      makePost("new", "2026-01-01"),
    ];
    expect(byNewest(posts).map((p) => p.id)).toEqual(["new", "old"]);
    expect(posts.map((p) => p.id)).toEqual(["old", "new"]);
  });
});

describe("getTechnicalPosts()", () => {
  const posts = [
    makePost("promoted-to-staff-engineer", "2026-09-15"),
    makePost("stop-branching-on-environment", "2026-08-10"),
    makePost("dont-nest-css", "2014-09-28"),
  ];

  it("drops announcement posts", () => {
    expect(getTechnicalPosts(posts).map((p) => p.id)).toEqual([
      "stop-branching-on-environment",
      "dont-nest-css",
    ]);
  });

  it("takes the most recent N when limited", () => {
    expect(getTechnicalPosts(posts, 1).map((p) => p.id)).toEqual([
      "stop-branching-on-environment",
    ]);
  });

  it("keeps the exclusion list in one place", () => {
    expect(announcementSlugs).toContain("promoted-to-staff-engineer");
  });
});

describe("entryDate()", () => {
  it("splits a date into the two stacked lines", () => {
    expect(entryDate(new Date("2026-08-10"))).toEqual({
      line: "AUG 10",
      year: "2026",
    });
  });

  it("reads dates in UTC, so midnight does not slip a day", () => {
    expect(entryDate(new Date("2025-09-15")).line).toBe("SEP 15");
  });
});

describe("monthYear()", () => {
  it("drops the day", () => {
    expect(monthYear(new Date("2026-07-21"))).toEqual({
      line: "JUL",
      year: "2026",
    });
  });
});

describe("readingTime()", () => {
  it("rounds to whole minutes at 200 words a minute", () => {
    expect(readingTime("word ".repeat(400))).toBe("2 min read");
  });

  it("never reports zero minutes", () => {
    expect(readingTime("short")).toBe("1 min read");
  });
});

describe("neighbors()", () => {
  const posts = [
    makePost("newest", "2026-01-01"),
    makePost("middle", "2025-01-01"),
    makePost("oldest", "2024-01-01"),
  ];

  it("returns the older post as previous and the newer as next", () => {
    const { previous, next } = neighbors(posts, "middle");
    expect(previous?.id).toBe("oldest");
    expect(next?.id).toBe("newest");
  });

  it("leaves the ends open", () => {
    expect(neighbors(posts, "newest").next).toBeUndefined();
    expect(neighbors(posts, "oldest").previous).toBeUndefined();
  });

  it("returns nothing for an unknown id", () => {
    expect(neighbors(posts, "nope")).toEqual({});
  });
});
