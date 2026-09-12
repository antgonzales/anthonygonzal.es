#!/usr/bin/env node
/**
 * Generate the Neovim and Ghostty ports of Replica from src/data/replica.json.
 *
 *   pnpm replica:ports [path/to/dotfiles]
 *
 * Defaults to ~/code/dotfiles. First derives the values that follow from the
 * materials (the sixteen ANSI slots and the Neovim diff backgrounds) and
 * writes them back into replica.json, so the JSON stays complete for anyone
 * porting from the URL. Then writes
 *   nvim/.config/nvim/colors/replica-{carbon,bone}.lua
 *   ghostty/.config/ghostty/themes/replica-{carbon,bone}
 * The files carry a "do not edit by hand" header; change replica.json and
 * rerun instead. Unknown keys in the JSON are ignored.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const jsonPath = join(here, "../src/data/replica.json");
const palette = JSON.parse(readFileSync(jsonPath, "utf8"));
const dotfiles = process.argv[2] ?? join(homedir(), "code/dotfiles");
const modes = ["carbon", "bone"];

const tokens = (mode) =>
  Object.fromEntries(
    [...palette.neutrals, ...palette.accents].map((t) => [t.name, t[mode]]),
  );

/* ---- derived values ---------------------------------------------------- */

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
/** Mix `a` toward `b` by `t` in sRGB, the same rule the 0.7 row was cut with. */
const mix = (a, b, t) =>
  "#" +
  hex(a)
    .map((x, i) =>
      Math.round(x + (hex(b)[i] - x) * t)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("");

const WHITE = "#ffffff";
const BLACK = "#000000";

function ansi16(mode) {
  const p = tokens(mode);
  const dark = mode === "carbon";
  const lift = (c) => (dark ? mix(c, WHITE, 0.14) : mix(c, BLACK, 0.12));
  return [
    dark ? p.overlay : p.text,
    p.oxide,
    p.resin,
    p.sulfur,
    p.slate,
    p.ash,
    p.sage,
    dark ? p.text : p.surface,
    p.subtle,
    lift(p.oxide),
    lift(p.resin),
    lift(p.sulfur),
    lift(p.slate),
    lift(p.ash),
    lift(p.sage),
    dark ? mix(p.text, WHITE, 0.12) : p.base,
  ];
}

function diff(mode) {
  const p = tokens(mode);
  const [a, c, t] = mode === "carbon" ? [0.16, 0.12, 0.24] : [0.18, 0.14, 0.26];
  return {
    add: mix(p.base, p.resin, a),
    delete: mix(p.base, p.oxide, a),
    change: mix(p.base, p.slate, c),
    text: mix(p.base, p.slate, t),
  };
}

palette.ansi16 = Object.fromEntries(modes.map((m) => [m, ansi16(m)]));
palette.diff = Object.fromEntries(modes.map((m) => [m, diff(m)]));
writeFileSync(jsonPath, JSON.stringify(palette, null, 2) + "\n");
console.log(`derived ansi16 and diff into ${jsonPath}`);

/* ---- ports ------------------------------------------------------------- */

const header = (mode, comment) => {
  const { displayName, type, reproduction } = palette.modes[mode];
  return [
    `${comment} ${displayName} — ${type}`,
    `${comment} ${reproduction}`,
    `${comment} Generated from replica.json v${palette.version}`,
    `${comment} (https://anthonygonzal.es/replica.json). Do not edit by hand.`,
  ].join("\n");
};

function ghostty(mode) {
  const p = tokens(mode);
  const ansi = palette.ansi16[mode];
  const slot = (i) => `palette = ${i}=${ansi[i]}`;
  return `${header(mode, "#")}

background = ${p.base}
foreground = ${p.text}

cursor-color = ${p.slate}
cursor-text = ${p.base}

selection-background = ${p.highlightMed}
selection-foreground = ${p.text}

# normal
${[0, 1, 2, 3, 4, 5, 6, 7].map(slot).join("\n")}

# bright
${[8, 9, 10, 11, 12, 13, 14, 15].map(slot).join("\n")}
`;
}

function neovim(mode) {
  const p = tokens(mode);
  const { type } = palette.modes[mode];
  const d = palette.diff[mode];
  const ansi = palette.ansi16[mode];
  const order = [
    "base",
    "surface",
    "overlay",
    "muted",
    "subtle",
    "text",
    "clay",
    "flax",
    "sulfur",
    "resin",
    "sage",
    "slate",
    "ash",
    "oxide",
    "highlightLow",
    "highlightMed",
    "highlightHigh",
  ];
  const paletteLines = order.map((k) => `  ${k} = "${p[k]}",`);
  const diffLines = Object.entries(d).map(
    ([k, v]) => `  diff${k[0].toUpperCase()}${k.slice(1)} = "${v}",`,
  );
  return `${header(mode, "--")}

vim.cmd("highlight clear")
if vim.fn.exists('syntax_on') == 1 then vim.cmd('syntax reset') end
vim.o.background = "${type}"
vim.g.colors_name = "replica-${mode}"

local p = {
${paletteLines.join("\n")}
${diffLines.join("\n")}
}

local groups = {
${GROUPS}
}

for group, spec in pairs(groups) do
  vim.api.nvim_set_hl(0, group, spec)
end

-- Opt-in transparency: let the terminal background through, so a
-- translucent/blurred terminal keeps working. Set before loading.
if vim.g.replica_transparent then
  local seethrough = {
    Normal = p.text,
    NormalNC = p.text,
    NormalFloat = p.text,
    SignColumn = p.muted,
    FoldColumn = p.muted,
    EndOfBuffer = p.base,
    TabLineFill = p.muted,
  }
  for group, fg in pairs(seethrough) do
    vim.api.nvim_set_hl(0, group, { fg = fg, bg = "NONE" })
  end
end

-- Terminal colors, from the palette's own ansi16 port values.
${ansi.map((h, i) => `vim.g.terminal_color_${i} = "${h}"`).join("\n")}
`;
}

const GROUPS = String.raw`  ["Normal"] = { fg = p.text, bg = p.base },
  ["NormalNC"] = { fg = p.text, bg = p.base },
  ["NormalFloat"] = { fg = p.text, bg = p.overlay },
  ["FloatBorder"] = { fg = p.highlightHigh, bg = p.overlay },
  ["FloatTitle"] = { fg = p.slate, bg = p.overlay, bold = true },
  ["Cursor"] = { fg = p.base, bg = p.slate },
  ["lCursor"] = { fg = p.base, bg = p.slate },
  ["TermCursor"] = { fg = p.base, bg = p.slate },
  ["CursorLine"] = { bg = p.highlightLow },
  ["CursorColumn"] = { bg = p.highlightLow },
  ["ColorColumn"] = { bg = p.surface },
  ["CursorLineNr"] = { fg = p.text, bold = true },
  ["LineNr"] = { fg = p.muted },
  ["SignColumn"] = { fg = p.muted },
  ["FoldColumn"] = { fg = p.muted },
  ["Folded"] = { fg = p.subtle, bg = p.surface },
  ["Visual"] = { bg = p.highlightMed },
  ["VisualNOS"] = { bg = p.highlightMed },
  ["Search"] = { fg = p.base, bg = p.sulfur },
  ["IncSearch"] = { fg = p.base, bg = p.clay },
  ["CurSearch"] = { fg = p.base, bg = p.clay },
  ["MatchParen"] = { fg = p.clay, bg = p.highlightHigh, bold = true },
  ["StatusLine"] = { fg = p.subtle, bg = p.surface },
  ["StatusLineNC"] = { fg = p.muted, bg = p.surface },
  ["WinBar"] = { fg = p.subtle },
  ["WinBarNC"] = { fg = p.muted },
  ["WinSeparator"] = { fg = p.highlightHigh },
  ["VertSplit"] = { fg = p.highlightHigh },
  ["TabLine"] = { fg = p.muted, bg = p.surface },
  ["TabLineSel"] = { fg = p.text, bg = p.overlay },
  ["TabLineFill"] = { bg = p.base },
  ["Pmenu"] = { fg = p.subtle, bg = p.overlay },
  ["PmenuSel"] = { fg = p.text, bg = p.highlightMed },
  ["PmenuSbar"] = { bg = p.overlay },
  ["PmenuThumb"] = { bg = p.highlightHigh },
  ["Directory"] = { fg = p.slate },
  ["Title"] = { fg = p.clay, bold = true },
  ["Question"] = { fg = p.resin },
  ["ModeMsg"] = { fg = p.subtle },
  ["MoreMsg"] = { fg = p.resin },
  ["ErrorMsg"] = { fg = p.oxide },
  ["WarningMsg"] = { fg = p.sulfur },
  ["NonText"] = { fg = p.muted },
  ["Whitespace"] = { fg = p.muted },
  ["SpecialKey"] = { fg = p.muted },
  ["EndOfBuffer"] = { fg = p.base },
  ["Conceal"] = { fg = p.subtle },
  ["QuickFixLine"] = { bg = p.highlightMed },
  ["Substitute"] = { fg = p.base, bg = p.clay },
  ["WildMenu"] = { fg = p.base, bg = p.clay },
  ["Comment"] = { fg = p.ash, italic = true },
  ["Constant"] = { fg = p.sulfur },
  ["String"] = { fg = p.flax },
  ["Character"] = { fg = p.flax },
  ["Number"] = { fg = p.sulfur },
  ["Boolean"] = { fg = p.sulfur },
  ["Float"] = { fg = p.sulfur },
  ["Identifier"] = { fg = p.text },
  ["Function"] = { fg = p.slate },
  ["Statement"] = { fg = p.clay },
  ["Conditional"] = { fg = p.clay },
  ["Repeat"] = { fg = p.clay },
  ["Label"] = { fg = p.clay },
  ["Operator"] = { fg = p.subtle },
  ["Keyword"] = { fg = p.clay },
  ["Exception"] = { fg = p.clay },
  ["PreProc"] = { fg = p.clay },
  ["Include"] = { fg = p.clay },
  ["Define"] = { fg = p.clay },
  ["Macro"] = { fg = p.clay },
  ["PreCondit"] = { fg = p.clay },
  ["Type"] = { fg = p.resin },
  ["StorageClass"] = { fg = p.clay },
  ["Structure"] = { fg = p.resin },
  ["Typedef"] = { fg = p.resin },
  ["Special"] = { fg = p.sulfur },
  ["SpecialChar"] = { fg = p.sulfur },
  ["Tag"] = { fg = p.resin },
  ["Delimiter"] = { fg = p.subtle },
  ["SpecialComment"] = { fg = p.ash, italic = true },
  ["Debug"] = { fg = p.oxide },
  ["Underlined"] = { fg = p.slate, underline = true },
  ["Ignore"] = { fg = p.muted },
  ["Error"] = { fg = p.oxide },
  ["Todo"] = { fg = p.base, bg = p.sulfur, bold = true },
  ["@comment"] = { fg = p.ash, italic = true },
  ["@keyword"] = { fg = p.clay },
  ["@keyword.function"] = { fg = p.clay },
  ["@keyword.operator"] = { fg = p.clay },
  ["@keyword.return"] = { fg = p.clay },
  ["@keyword.import"] = { fg = p.clay },
  ["@keyword.conditional"] = { fg = p.clay },
  ["@keyword.repeat"] = { fg = p.clay },
  ["@keyword.exception"] = { fg = p.clay },
  ["@string"] = { fg = p.flax },
  ["@string.escape"] = { fg = p.sulfur },
  ["@string.regexp"] = { fg = p.flax },
  ["@string.special"] = { fg = p.sulfur },
  ["@character"] = { fg = p.flax },
  ["@number"] = { fg = p.sulfur },
  ["@boolean"] = { fg = p.sulfur },
  ["@float"] = { fg = p.sulfur },
  ["@constant"] = { fg = p.sulfur },
  ["@constant.builtin"] = { fg = p.sulfur },
  ["@constant.macro"] = { fg = p.sulfur },
  ["@type"] = { fg = p.resin },
  ["@type.builtin"] = { fg = p.resin },
  ["@type.definition"] = { fg = p.resin },
  ["@attribute"] = { fg = p.flax },
  ["@property"] = { fg = p.text },
  ["@field"] = { fg = p.text },
  ["@variable"] = { fg = p.text },
  ["@variable.builtin"] = { fg = p.clay },
  ["@variable.parameter"] = { fg = p.text },
  ["@variable.member"] = { fg = p.text },
  ["@function"] = { fg = p.slate },
  ["@function.call"] = { fg = p.slate },
  ["@function.builtin"] = { fg = p.slate },
  ["@function.macro"] = { fg = p.slate },
  ["@method"] = { fg = p.slate },
  ["@method.call"] = { fg = p.slate },
  ["@constructor"] = { fg = p.resin },
  ["@module"] = { fg = p.resin },
  ["@namespace"] = { fg = p.resin },
  ["@label"] = { fg = p.clay },
  ["@operator"] = { fg = p.subtle },
  ["@punctuation.delimiter"] = { fg = p.subtle },
  ["@punctuation.bracket"] = { fg = p.subtle },
  ["@punctuation.special"] = { fg = p.clay },
  ["@tag"] = { fg = p.resin },
  ["@tag.builtin"] = { fg = p.resin },
  ["@tag.attribute"] = { fg = p.flax },
  ["@tag.delimiter"] = { fg = p.subtle },
  ["@markup.heading"] = { fg = p.clay, bold = true },
  ["@markup.strong"] = { fg = p.clay, bold = true },
  ["@markup.italic"] = { fg = p.flax, italic = true },
  ["@markup.link"] = { fg = p.slate, underline = true },
  ["@markup.link.url"] = { fg = p.slate, underline = true },
  ["@markup.raw"] = { fg = p.flax },
  ["@markup.list"] = { fg = p.subtle },
  ["@markup.quote"] = { fg = p.flax, italic = true },
  ["@diff.plus"] = { fg = p.resin },
  ["@diff.minus"] = { fg = p.oxide },
  ["@lsp.type.class"] = { fg = p.resin },
  ["@lsp.type.interface"] = { fg = p.resin },
  ["@lsp.type.enum"] = { fg = p.resin },
  ["@lsp.type.function"] = { fg = p.slate },
  ["@lsp.type.method"] = { fg = p.slate },
  ["@lsp.type.namespace"] = { fg = p.resin },
  ["@lsp.type.parameter"] = { fg = p.text },
  ["@lsp.type.property"] = { fg = p.text },
  ["@lsp.type.variable"] = { fg = p.text },
  ["@lsp.type.keyword"] = { fg = p.clay },
  ["@lsp.type.comment"] = { fg = p.ash, italic = true },
  ["DiagnosticError"] = { fg = p.oxide },
  ["DiagnosticVirtualTextError"] = { fg = p.oxide, bg = p.surface },
  ["DiagnosticUnderlineError"] = { sp = p.oxide, undercurl = true },
  ["DiagnosticWarn"] = { fg = p.sulfur },
  ["DiagnosticVirtualTextWarn"] = { fg = p.sulfur, bg = p.surface },
  ["DiagnosticUnderlineWarn"] = { sp = p.sulfur, undercurl = true },
  ["DiagnosticInfo"] = { fg = p.slate },
  ["DiagnosticVirtualTextInfo"] = { fg = p.slate, bg = p.surface },
  ["DiagnosticUnderlineInfo"] = { sp = p.slate, undercurl = true },
  ["DiagnosticHint"] = { fg = p.ash },
  ["DiagnosticVirtualTextHint"] = { fg = p.ash, bg = p.surface },
  ["DiagnosticUnderlineHint"] = { sp = p.ash, undercurl = true },
  ["DiffAdd"] = { bg = p.diffAdd },
  ["DiffDelete"] = { bg = p.diffDelete },
  ["DiffChange"] = { bg = p.diffChange },
  ["DiffText"] = { bg = p.diffText },
  ["GitSignsAdd"] = { fg = p.resin },
  ["GitSignsChange"] = { fg = p.sulfur },
  ["GitSignsDelete"] = { fg = p.oxide },`;

const files = {
  "nvim/.config/nvim/colors/replica-carbon.lua": neovim("carbon"),
  "nvim/.config/nvim/colors/replica-bone.lua": neovim("bone"),
  "ghostty/.config/ghostty/themes/replica-carbon": ghostty("carbon"),
  "ghostty/.config/ghostty/themes/replica-bone": ghostty("bone"),
};

for (const [rel, content] of Object.entries(files)) {
  const path = join(dotfiles, rel);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
  console.log(`wrote ${path}`);
}
