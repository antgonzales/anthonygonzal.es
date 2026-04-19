import { describe, it, expect } from "vitest";
import { getExcerpt } from "./getExcerpt";

describe("getExcerpt()", () => {
  describe("with a simple paragraph", () => {
    it("returns the first paragraph", () => {
      const body =
        "This is the first paragraph.\n\nThis is the second paragraph.";
      expect(getExcerpt(body)).toBe("This is the first paragraph.");
    });
  });

  describe("when the first block is a heading", () => {
    it("skips headings and returns the first paragraph", () => {
      const body = "# My Heading\n\nThis is the first paragraph.";
      expect(getExcerpt(body)).toBe("This is the first paragraph.");
    });

    it("skips h2 headings", () => {
      const body = "## Subheading\n\nFirst real paragraph.";
      expect(getExcerpt(body)).toBe("First real paragraph.");
    });
  });

  describe("with inline markdown syntax", () => {
    it("strips markdown links", () => {
      const body =
        "I am a [Product Engineer](https://example.com) based in New York.";
      expect(getExcerpt(body)).toBe(
        "I am a Product Engineer based in New York.",
      );
    });

    it("strips bold text", () => {
      const body = "This is **very important** content.";
      expect(getExcerpt(body)).toBe("This is very important content.");
    });

    it("strips italic text", () => {
      const body = "This is _emphasized_ content.";
      expect(getExcerpt(body)).toBe("This is emphasized content.");
    });

    it("strips inline code", () => {
      const body = "Use `npm install` to install dependencies.";
      expect(getExcerpt(body)).toBe("Use npm install to install dependencies.");
    });
  });

  describe("with line breaks within a paragraph", () => {
    it("collapses newlines into spaces", () => {
      const body = "This is a paragraph\nthat spans multiple\nlines.";
      expect(getExcerpt(body)).toBe(
        "This is a paragraph that spans multiple lines.",
      );
    });
  });

  describe("with an empty body", () => {
    it("returns an empty string", () => {
      expect(getExcerpt("")).toBe("");
    });
  });

  describe("with only headings", () => {
    it("returns an empty string", () => {
      const body = "# Heading One\n\n## Heading Two";
      expect(getExcerpt(body)).toBe("");
    });
  });
});
