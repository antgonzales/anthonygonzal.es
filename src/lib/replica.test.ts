import { describe, it, expect } from "vitest";
import {
  color,
  ink,
  replica,
  replicaBone,
  replicaCarbon,
  shikiTheme,
} from "./replica";

describe("replica.json", () => {
  it("has six materials with a value in both modes", () => {
    expect(replica.accents.map((t) => t.name)).toEqual([
      "clay",
      "sulfur",
      "resin",
      "slate",
      "ash",
      "oxide",
    ]);
    for (const t of [...replica.neutrals, ...replica.accents]) {
      expect(t.carbon).toMatch(/^#[0-9a-f]{6}$/);
      expect(t.bone).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it("maps every Rosé Pine token to a token that exists", () => {
    for (const name of Object.values(replica.rosePine)) {
      expect(() => color("carbon", name)).not.toThrow();
    }
  });

  it("fills the sixteen ANSI slots by hue, bright repeating normal", () => {
    for (const mode of ["carbon", "bone"] as const) {
      const ansi = replica.ansi16[mode];
      expect(ansi).toHaveLength(16);
      expect(ansi.slice(0, 9)).toEqual(
        [
          "overlay",
          "oxide",
          "resin",
          "sulfur",
          "slate",
          "ash",
          "clay",
          "text",
          "muted",
        ].map((n) => color(mode, n)),
      );
      expect(ansi.slice(9)).toEqual(ansi.slice(1, 8));
    }
  });

  it("lands each named highlight group on the ink the role map says", () => {
    const want: Record<string, string> = {
      Comment: "muted",
      "@keyword": "slate",
      Include: "slate",
      "@string.escape": "slate",
      "@markup.list": "slate",
      "@function": "clay",
      "@function.method": "clay",
      Changed: "clay",
      "@string": "sulfur",
      "@number": "sulfur",
      "@constant": "sulfur",
      "@markup.raw": "sulfur",
      DiagnosticWarn: "sulfur",
      "@type": "resin",
      "@property": "resin",
      "@variable.member": "resin",
      "@constructor": "resin",
      "@tag": "resin",
      "@markup.heading": "resin",
      DiagnosticInfo: "resin",
      Added: "resin",
      "@variable.parameter": "ash",
      "@tag.attribute": "ash",
      "@attribute": "ash",
      "@label": "ash",
      "@function.macro": "ash",
      "@markup.link": "ash",
      DiagnosticHint: "ash",
      "@variable.builtin": "oxide",
      "@constant.builtin": "oxide",
      "@function.builtin": "oxide",
      Error: "oxide",
      DiagnosticError: "oxide",
      Removed: "oxide",
      "@operator": "subtle",
      "@punctuation.delimiter": "subtle",
      "@tag.delimiter": "subtle",
      "@keyword.operator": "subtle",
      "@variable": "text",
      "@module": "text",
      Normal: "text",
      CursorLineNr: "text",
    };
    // Resolve a group's foreground through links, as Neovim does.
    const byGroup = new Map(
      replica.roles.flatMap((r) => r.groups.map((g) => [g, r] as const)),
    );
    const fg = (group: string): string | undefined => {
      const role = byGroup.get(group);
      if (!role) return undefined;
      if ("link" in role && role.link) return fg(role.link);
      return "fg" in role && role.fg ? ink(role.fg) : undefined;
    };
    for (const [group, want_] of Object.entries(want)) {
      expect(fg(group), group).toBe(want_);
    }
    // Chrome carries no pigment; clay marks what can be acted on.
    const chrome: Record<string, string> = {
      Title: "text",
      FloatTitle: "text",
      WinBar: "text",
      NeoTreeTitleBar: "text",
      SnacksDashboardTitle: "text",
      Directory: "text",
      NeoTreeDirectoryName: "text",
      NeoTreeRootName: "text",
      SnacksPickerDirectory: "text",
      NeoTreeDirectoryIcon: "muted",
      SnacksDashboardIcon: "muted",
      SnacksDashboardDesc: "text",
      SnacksDashboardFooter: "muted",
      Special: "subtle",
      SnacksDashboardHeader: "clay",
      SnacksDashboardKey: "clay",
      DevIconTypeScript: "slate",
      DevIconTsx: "slate",
      DevIconJs: "sulfur",
      DevIconJson: "resin",
      DevIconMd: "muted",
      DevIconYaml: "ash",
      DevIconToml: "ash",
      NeoTreeGitModified: "oxide",
      MiniIconsAzure: "slate",
      MiniIconsGrey: "muted",
    };
    for (const [group, want_] of Object.entries(chrome)) {
      expect(fg(group), group).toBe(want_);
    }
    for (const group of ["Title", "Directory", "Special"]) {
      const role = byGroup.get(group)!;
      expect("bold" in role && role.bold, `${group} bold`).toBe(
        group === "Directory",
      );
    }
    expect(ink(byGroup.get("CurSearch")!.bg!)).toBe("clay");
    expect(ink(byGroup.get("SpellBad")!.sp!)).toBe("oxide");
  });

  it("stores the Replica ink beside every Rosé Pine token", () => {
    for (const role of replica.roles) {
      for (const k of ["fg", "bg", "sp"] as const) {
        const token = (role as Record<string, unknown>)[k];
        if (typeof token !== "string") continue;
        const want = token === "NONE" ? "NONE" : ink(token);
        expect(role.ink?.[k]).toBe(want);
      }
    }
  });
});

describe("shikiTheme()", () => {
  const fg = (theme: ReturnType<typeof shikiTheme>, scope: string) =>
    theme.settings.find((s) => s.scope.includes(scope))?.settings.foreground;

  it("paints each syntax role with the ink the role map says", () => {
    for (const mode of ["carbon", "bone"] as const) {
      const theme = shikiTheme(mode);
      expect(theme.colors["editor.background"]).toBe(color(mode, "base"));
      expect(fg(theme, "comment")).toBe(color(mode, "muted"));
      expect(fg(theme, "keyword")).toBe(color(mode, "slate"));
      expect(fg(theme, "storage.type")).toBe(color(mode, "slate"));
      expect(fg(theme, "string")).toBe(color(mode, "sulfur"));
      expect(fg(theme, "constant.numeric")).toBe(color(mode, "sulfur"));
      expect(fg(theme, "entity.name")).toBe(color(mode, "clay"));
      expect(fg(theme, "entity.name.type")).toBe(color(mode, "resin"));
      expect(fg(theme, "support")).toBe(color(mode, "resin"));
      expect(fg(theme, "variable.other.property")).toBe(color(mode, "resin"));
      expect(fg(theme, "variable.parameter")).toBe(color(mode, "ash"));
      expect(fg(theme, "entity.other.attribute-name")).toBe(color(mode, "ash"));
      expect(fg(theme, "invalid")).toBe(color(mode, "oxide"));
    }
  });

  it("exports both modes with their Shiki type", () => {
    expect(replicaBone.type).toBe("light");
    expect(replicaCarbon.type).toBe("dark");
  });

  it("throws on a retired or unknown token so a typo fails the build", () => {
    expect(() => color("carbon", "flax")).toThrow(/no token named "flax"/);
    expect(() => ink("leaf2")).toThrow(/no entry/);
  });
});
