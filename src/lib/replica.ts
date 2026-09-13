/**
 * Replica, the site's syntax palette, in one place. `replica.json` is the
 * source of truth; this module derives the Shiki themes from it so the code
 * blocks and the /replica/ page can never disagree about a value.
 *
 * Roles are not assigned here. The scopes below are Rosé Pine's VS Code
 * theme written in Rosé Pine's token names; `rosePine` in the JSON says which
 * Replica ink stands in for each token. The Neovim and Ghostty ports in the
 * dotfiles repo are built from the same map by scripts/replica-ports.mjs.
 */
import palette from "../data/replica.json";

export type Mode = "carbon" | "bone";

export const replica = palette;

type Token = { name: string; carbon: string; bone: string };

/** Look a color up by token name, for one mode. */
export function color(mode: Mode, name: string): string {
  const token = [...palette.neutrals, ...palette.accents].find(
    (t: Token) => t.name === name,
  );
  if (!token) throw new Error(`Replica has no token named "${name}"`);
  return token[mode];
}

/** A Rosé Pine token name to the Replica ink that stands in for it. */
export function ink(token: string): string {
  const name = (palette.rosePine as Record<string, string>)[token];
  if (!name) throw new Error(`rosePine has no entry for "${token}"`);
  return name;
}

type Scope = { scope: string[]; token?: string; fontStyle?: string };

/**
 * Rosé Pine's VS Code scopes (rose-pine/vscode, themes/rose-pine-color-theme),
 * in token names. Three departures carry Replica's role map into places the
 * VS Code theme leaves to `variable` or `rose`: numbers and language constants
 * print as literals (gold), and object properties as members (foam).
 */
const rosePineScopes: Scope[] = [
  { scope: ["comment"], token: "muted", fontStyle: "italic" },
  { scope: ["constant"], token: "gold" },
  { scope: ["constant.numeric", "constant.language"], token: "gold" },
  { scope: ["entity.name"], token: "rose" },
  {
    scope: [
      "entity.name.section",
      "entity.name.tag",
      "entity.name.namespace",
      "entity.name.type",
    ],
    token: "foam",
  },
  {
    scope: ["entity.other.attribute-name", "entity.other.inherited-class"],
    token: "iris",
    fontStyle: "italic",
  },
  { scope: ["invalid"], token: "love" },
  { scope: ["invalid.deprecated"], token: "subtle" },
  { scope: ["keyword", "variable.language.this"], token: "pine" },
  { scope: ["markup.inserted.diff"], token: "foam" },
  { scope: ["markup.deleted.diff"], token: "love" },
  { scope: ["markup.heading"], fontStyle: "bold" },
  { scope: ["markup.bold.markdown"], fontStyle: "bold" },
  { scope: ["markup.italic.markdown"], fontStyle: "italic" },
  { scope: ["meta.diff.range"], token: "iris" },
  { scope: ["meta.tag", "meta.brace"], token: "text" },
  { scope: ["meta.import", "meta.export"], token: "pine" },
  { scope: ["meta.directive.vue"], token: "iris", fontStyle: "italic" },
  { scope: ["meta.property-name.css"], token: "foam" },
  { scope: ["meta.property-value.css"], token: "gold" },
  { scope: ["meta.tag.other.html"], token: "subtle" },
  { scope: ["punctuation"], token: "subtle" },
  { scope: ["punctuation.accessor"], token: "pine" },
  { scope: ["punctuation.definition.string"], token: "gold" },
  { scope: ["punctuation.definition.tag"], token: "muted" },
  { scope: ["storage.type", "storage.modifier"], token: "pine" },
  { scope: ["string"], token: "gold" },
  { scope: ["support"], token: "foam" },
  { scope: ["support.constant"], token: "gold" },
  { scope: ["support.function"], token: "love", fontStyle: "italic" },
  { scope: ["variable"], token: "rose", fontStyle: "italic" },
  {
    scope: [
      "variable.other",
      "variable.language",
      "variable.function",
      "variable.argument",
    ],
    token: "text",
  },
  { scope: ["variable.other.property"], token: "foam" },
  { scope: ["variable.parameter"], token: "iris" },
];

/** A Shiki/VS Code theme for one mode, built from the palette. */
export function shikiTheme(mode: Mode) {
  const p = (token: string) => color(mode, ink(token));
  const { type } = palette.modes[mode];
  return {
    name: `replica-${mode}`,
    displayName: palette.modes[mode].displayName,
    type: type as "light" | "dark",
    colors: {
      "editor.background": p("base"),
      "editor.foreground": p("text"),
      "editor.selectionBackground": p("highlightMed"),
      "editor.selectionHighlightBackground": p("highlightMed"),
      "editorCursor.foreground": p("text"),
      "editorLineNumber.foreground": p("muted"),
      "editorWhitespace.foreground": p("muted"),
    },
    settings: rosePineScopes.map(({ scope, token, fontStyle }) => ({
      scope,
      settings: {
        ...(token ? { foreground: p(token) } : {}),
        ...(fontStyle ? { fontStyle } : {}),
      },
    })),
  };
}

export const replicaBone = shikiTheme("bone");
export const replicaCarbon = shikiTheme("carbon");
