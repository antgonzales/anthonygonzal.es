import { describe, it, expect } from "vitest";
import {
  color,
  replica,
  replicaBone,
  replicaCarbon,
  shikiTheme,
} from "./replica";

describe("replica.json", () => {
  it("has a value in both modes for every token", () => {
    for (const t of [...replica.neutrals, ...replica.accents]) {
      expect(t.carbon).toMatch(/^#[0-9a-f]{6}$/);
      expect(t.bone).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it("fills all sixteen ANSI slots in both modes from the palette", () => {
    for (const mode of ["carbon", "bone"] as const) {
      const ansi = replica.ansi16[mode];
      expect(ansi).toHaveLength(16);
      // The normal chromatic slots are the named accents, not new colors.
      expect(ansi[1]).toBe(color(mode, "oxide"));
      expect(ansi[2]).toBe(color(mode, "resin"));
      expect(ansi[3]).toBe(color(mode, "sulfur"));
      expect(ansi[4]).toBe(color(mode, "slate"));
      expect(ansi[5]).toBe(color(mode, "ash"));
      expect(ansi[6]).toBe(color(mode, "sage"));
    }
  });
});

describe("shikiTheme()", () => {
  const fg = (theme: ReturnType<typeof shikiTheme>, scope: string) =>
    theme.settings.find((s) => s.scope.includes(scope))?.settings.foreground;

  it("paints each syntax role with its named accent", () => {
    for (const mode of ["carbon", "bone"] as const) {
      const theme = shikiTheme(mode);
      expect(theme.colors["editor.background"]).toBe(color(mode, "base"));
      expect(fg(theme, "keyword")).toBe(color(mode, "clay"));
      expect(fg(theme, "string")).toBe(color(mode, "flax"));
      expect(fg(theme, "constant.numeric")).toBe(color(mode, "sulfur"));
      expect(fg(theme, "entity.name.type")).toBe(color(mode, "resin"));
      expect(fg(theme, "entity.name.function")).toBe(color(mode, "slate"));
      expect(fg(theme, "comment")).toBe(color(mode, "ash"));
      expect(fg(theme, "invalid")).toBe(color(mode, "oxide"));
    }
  });

  it("exports both modes with their Shiki type", () => {
    expect(replicaBone.type).toBe("light");
    expect(replicaCarbon.type).toBe("dark");
  });

  it("throws on an unknown token so a typo fails the build", () => {
    expect(() => color("carbon", "teal")).toThrow(/no token named "teal"/);
  });
});
