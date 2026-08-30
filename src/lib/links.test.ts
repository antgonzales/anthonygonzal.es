import { describe, it, expect } from "vitest";
import { EXTERNAL_LINK_ATTRS, externalAttrs, isExternal } from "./links";

describe("isExternal()", () => {
  it("calls an http(s) URL on another host external", () => {
    expect(isExternal("https://github.com/antgonzales")).toBe(true);
    expect(isExternal("http://nicolasgallagher.com")).toBe(true);
  });

  it("calls a protocol-relative URL on another host external", () => {
    expect(isExternal("//example.com/thing")).toBe(true);
  });

  it("keeps a root-relative path internal", () => {
    expect(isExternal("/rss.xml")).toBe(false);
    expect(isExternal("/blog/dont-nest-css/")).toBe(false);
  });

  it("keeps this site's own absolute URLs internal", () => {
    expect(isExternal("https://anthonygonzal.es/blog/")).toBe(false);
  });

  it("does not mistake a lookalike host for this site", () => {
    expect(isExternal("https://notanthonygonzal.es/")).toBe(true);
  });

  it("treats a missing href as internal, so nothing is spread onto it", () => {
    expect(isExternal(undefined)).toBe(false);
    expect(isExternal(null)).toBe(false);
    expect(isExternal("")).toBe(false);
  });
});

describe("externalAttrs()", () => {
  it("returns the blank-target attributes for an outbound link", () => {
    expect(externalAttrs("https://astro.build")).toEqual(EXTERNAL_LINK_ATTRS);
  });

  it("returns nothing to spread for an internal link", () => {
    expect(externalAttrs("/reading/")).toEqual({});
  });
});
