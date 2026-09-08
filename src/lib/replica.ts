/**
 * Replica, the site's syntax palette, in one place. `replica.json` is the
 * source of truth; this module derives the Shiki themes from it so the code
 * blocks and the /replica/ page can never disagree about a value.
 *
 * The Neovim and Ghostty ports in the dotfiles repo are generated from the
 * same data. Keep them in step when a value changes here.
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

/** The TextMate scopes each accent paints, shared by both modes. */
const scopes = (p: (name: string) => string) => [
  {
    scope: ["comment", "punctuation.definition.comment"],
    settings: { foreground: p("ash"), fontStyle: "italic" },
  },
  {
    scope: [
      "keyword",
      "keyword.control",
      "storage",
      "storage.type",
      "storage.modifier",
    ],
    settings: { foreground: p("clay") },
  },
  {
    scope: ["string", "string.quoted", "string.template", "string.regexp"],
    settings: { foreground: p("flax") },
  },
  {
    scope: [
      "constant.numeric",
      "constant.language",
      "constant.character",
      "support.constant",
    ],
    settings: { foreground: p("sulfur") },
  },
  {
    scope: [
      "constant.character.escape",
      "constant.other.character-class.regexp",
      "keyword.control.anchor.regexp",
    ],
    settings: { foreground: p("sulfur") },
  },
  {
    scope: [
      "entity.name.type",
      "entity.name.class",
      "entity.name.interface",
      "support.type",
      "support.class",
      "storage.type.class",
    ],
    settings: { foreground: p("resin") },
  },
  {
    scope: [
      "entity.name.function",
      "entity.name.function.preprocessor",
      "support.function",
      "variable.function",
      "meta.function-call",
    ],
    settings: { foreground: p("slate") },
  },
  {
    scope: [
      "variable",
      "variable.other",
      "variable.parameter",
      "support.variable",
      "meta.object-literal.key",
    ],
    settings: { foreground: p("text") },
  },
  {
    scope: ["punctuation", "keyword.operator", "meta.brace", "meta.delimiter"],
    settings: { foreground: p("subtle") },
  },
  {
    scope: [
      "punctuation.definition.template-expression.begin",
      "punctuation.definition.template-expression.end",
    ],
    settings: { foreground: p("clay") },
  },
  {
    scope: [
      "entity.name.tag",
      "support.class.component",
      "meta.tag.sgml.doctype",
    ],
    settings: { foreground: p("resin") },
  },
  {
    scope: [
      "entity.other.attribute-name",
      "meta.attribute",
      "string.quoted.double.html",
      "string.quoted.single.html",
    ],
    settings: { foreground: p("flax") },
  },
  {
    scope: [
      "support.type.property-name.json",
      "meta.object-literal.key.json",
      "string.quoted.double.json meta.structure.dictionary.json",
    ],
    settings: { foreground: p("slate") },
  },
  {
    scope: ["markup.inserted", "markup.inserted.diff"],
    settings: { foreground: p("resin") },
  },
  {
    scope: [
      "markup.deleted",
      "markup.deleted.diff",
      "invalid",
      "invalid.illegal",
    ],
    settings: { foreground: p("oxide") },
  },
  {
    scope: ["markup.heading", "markup.bold"],
    settings: { foreground: p("clay") },
  },
  {
    scope: [
      "markup.italic",
      "markup.quote",
      "markup.inline.raw",
      "markup.fenced_code.block",
    ],
    settings: { foreground: p("flax") },
  },
];

/** A Shiki/VS Code theme for one mode, built from the palette. */
export function shikiTheme(mode: Mode) {
  const p = (name: string) => color(mode, name);
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
      "editorCursor.foreground": p("slate"),
      "editorLineNumber.foreground": p("muted"),
      "editorWhitespace.foreground": p("muted"),
    },
    settings: scopes(p),
  };
}

export const replicaBone = shikiTheme("bone");
export const replicaCarbon = shikiTheme("carbon");
