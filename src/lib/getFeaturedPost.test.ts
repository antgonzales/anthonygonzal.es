import { describe, it, expect } from "vitest";
import { getFeaturedPost } from "./getFeaturedPost";

function makePost(title: string, pubDate: string, featured = false) {
  return {
    id: title.toLowerCase().replace(/\s+/g, "-"),
    data: { title, pubDate: new Date(pubDate), featured },
  };
}

describe("getFeaturedPost()", () => {
  it("returns the featured post when one exists", () => {
    const posts = [
      makePost("Regular", "2024-01-01"),
      makePost("Featured", "2024-02-01", true),
    ];
    expect(getFeaturedPost(posts)?.data.title).toBe("Featured");
  });

  it("returns undefined when no post is featured", () => {
    const posts = [
      makePost("Post A", "2024-01-01"),
      makePost("Post B", "2024-02-01"),
    ];
    expect(getFeaturedPost(posts)).toBeUndefined();
  });

  it("returns the most recent when multiple posts are featured", () => {
    const posts = [
      makePost("Older Featured", "2024-01-01", true),
      makePost("Newer Featured", "2024-06-01", true),
    ];
    expect(getFeaturedPost(posts)?.data.title).toBe("Newer Featured");
  });

  it("does not return non-featured posts", () => {
    const posts = [makePost("Not Featured", "2024-03-01")];
    expect(getFeaturedPost(posts)).toBeUndefined();
  });
});
