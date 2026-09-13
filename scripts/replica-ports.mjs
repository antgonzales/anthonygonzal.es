#!/usr/bin/env node
/**
 * Generate the Neovim and Ghostty ports of Replica from src/data/replica.json.
 *
 *   pnpm replica:ports [path/to/dotfiles]
 *
 * Defaults to ~/code/dotfiles. Writes
 *   nvim/.config/nvim/colors/replica-{carbon,bone}.lua
 *   ghostty/.config/ghostty/themes/replica-{carbon,bone}
 *
 * Nothing here assigns a role by hand. `roles` in the JSON is Rosé Pine's
 * Neovim highlight table (main for Carbon, dawn for Bone; they share one
 * table) written in Rosé Pine's own token names, and `rosePine` says which
 * Replica ink stands in for each token. Every port is that table pushed
 * through that map. The ANSI slots follow Rosé Pine's terminal order, and are
 * written back into the JSON so /replica.json stays complete. Diff and other
 * blended backgrounds are computed the way Rosé Pine computes them (the ink
 * over base at the group's alpha) and never stored.
 *
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

/** A Rosé Pine token name to the Replica ink that stands in for it. */
function ink(token) {
  if (token === "NONE") return "NONE";
  const name = palette.rosePine[token];
  if (!name) throw new Error(`rosePine has no entry for "${token}"`);
  return name;
}

/* ---- derived values ---------------------------------------------------- */

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
/** Rosé Pine's blend(): fg over bg at alpha, rounded per channel. */
const blend = (fg, bg, alpha) =>
  "#" +
  hex(fg)
    .map((f, i) =>
      Math.round(alpha * f + (1 - alpha) * hex(bg)[i])
        .toString(16)
        .padStart(2, "0"),
    )
    .join("");

/** Rosé Pine's terminal order. Slots 8 to 15 repeat 0 to 7. */
const terminal = [
  "overlay",
  "love",
  "pine",
  "gold",
  "foam",
  "iris",
  "rose",
  "text",
];

function ansi16(mode) {
  const p = tokens(mode);
  const row = terminal.map((t) => p[ink(t)]);
  return [...row, ...row];
}

palette.ansi16 = Object.fromEntries(modes.map((m) => [m, ansi16(m)]));
writeFileSync(jsonPath, JSON.stringify(palette, null, 2) + "\n");
console.log(`derived ansi16 into ${jsonPath}`);

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

cursor-color = ${p.text}
cursor-text = ${p.base}

selection-background = ${p.highlightMed}
selection-foreground = ${p.text}

# normal
${[0, 1, 2, 3, 4, 5, 6, 7].map(slot).join("\n")}

# bright
${[8, 9, 10, 11, 12, 13, 14, 15].map(slot).join("\n")}
`;
}

/** One Rosé Pine highlight spec, as a Lua table in Replica inks. */
function luaSpec(role, p) {
  if (role.link) return `{ link = "${role.link}" }`;
  const parts = [];
  const ref = (t) => (t === "NONE" ? `"NONE"` : `p.${ink(t)}`);
  if (role.fg) parts.push(`fg = ${ref(role.fg)}`);
  if (role.bg) {
    if (role.blend != null && role.bg !== "NONE") {
      const over = blend(p[ink(role.bg)], p.base, role.blend / 100);
      parts.push(`bg = "${over}"`);
    } else parts.push(`bg = ${ref(role.bg)}`);
  }
  if (role.sp) parts.push(`sp = ${ref(role.sp)}`);
  for (const flag of [
    "bold",
    "italic",
    "underline",
    "undercurl",
    "strikethrough",
    "nocombine",
    "reverse",
  ]) {
    if (role[flag]) parts.push(`${flag} = true`);
  }
  return parts.length ? `{ ${parts.join(", ")} }` : "{}";
}

function neovim(mode) {
  const p = tokens(mode);
  const { type } = palette.modes[mode];
  const ansi = palette.ansi16[mode];
  const paletteLines = Object.entries(p).map(([k, v]) => `  ${k} = "${v}",`);
  const groupLines = [];
  for (const role of palette.roles) {
    const spec = luaSpec(role, p);
    for (const group of role.groups) {
      const key = /^[A-Za-z_]\w*$/.test(group) ? group : `["${group}"]`;
      groupLines.push(`  ${key} = ${spec},`);
    }
  }
  return `${header(mode, "--")}

vim.cmd("highlight clear")
if vim.fn.exists('syntax_on') == 1 then vim.cmd('syntax reset') end
vim.o.background = "${type}"
vim.g.colors_name = "replica-${mode}"

local p = {
${paletteLines.join("\n")}
}

-- Rosé Pine's highlight table, token for token, in Replica's inks.
local groups = {
${groupLines.join("\n")}
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
    SignColumn = p.text,
    FoldColumn = p.muted,
    EndOfBuffer = p.base,
    TabLineFill = p.muted,
  }
  for group, fg in pairs(seethrough) do
    vim.api.nvim_set_hl(0, group, { fg = fg, bg = "NONE" })
  end
end

-- Terminal colors, in Rosé Pine's order.
${ansi.map((h, i) => `vim.g.terminal_color_${i} = "${h}"`).join("\n")}
`;
}

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
