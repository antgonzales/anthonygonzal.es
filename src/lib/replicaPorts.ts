/**
 * The Neovim and Ghostty ports of Replica, rendered from the palette.
 *
 * Nothing here assigns a role by hand. `roles` in replica.json is Rosé
 * Pine's Neovim highlight table (main for Carbon, dawn for Bone; they share
 * one table) written in Rosé Pine's own token names, and `rosePine` says
 * which Replica ink stands in for each token. Every port is that table
 * pushed through that map. The ANSI slots are the one part mapped by hue
 * instead, see ANSI below. Blended backgrounds are computed the way Rosé Pine computes them
 * (the ink over base at the group's alpha) and never stored.
 *
 * Used twice: the site serves the files under /replica/, and
 * scripts/replica-ports.mjs writes the same bytes into the dotfiles repo.
 */
import type { Mode } from "./replica";

type Token = { name: string; carbon: string; bone: string };
type Role = {
  fg?: string;
  bg?: string;
  sp?: string;
  blend?: number;
  link?: string;
  groups: string[];
} & Partial<Record<Flag, boolean>>;
type Flag =
  | "bold"
  | "italic"
  | "underline"
  | "undercurl"
  | "strikethrough"
  | "nocombine"
  | "reverse";

export type Palette = {
  version: string;
  modes: Record<
    Mode,
    { displayName: string; type: string; reproduction: string }
  >;
  neutrals: Token[];
  accents: Token[];
  rosePine: Record<string, string>;
  roles: Role[];
};

const FLAGS: Flag[] = [
  "bold",
  "italic",
  "underline",
  "undercurl",
  "strikethrough",
  "nocombine",
  "reverse",
];

/**
 * The 16 ANSI slots, by hue rather than by Rosé Pine's slot table (which
 * would put resin on blue and turn every directory listing green). Cyan on
 * clay is the one warm light, the same move as the dashboard keys. Bright
 * slots repeat the normal ones so nothing glows; 8 is muted.
 */
const ANSI = [
  "overlay",
  "oxide",
  "resin",
  "sulfur",
  "slate",
  "ash",
  "clay",
  "text",
  "muted",
];

const tokens = (palette: Palette, mode: Mode): Record<string, string> =>
  Object.fromEntries(
    [...palette.neutrals, ...palette.accents].map((t) => [t.name, t[mode]]),
  );

/** A Rosé Pine token name to the Replica ink that stands in for it. */
function ink(palette: Palette, token: string): string {
  if (token === "NONE") return "NONE";
  const name = palette.rosePine[token];
  if (!name) throw new Error(`rosePine has no entry for "${token}"`);
  return name;
}

const hex = (h: string) =>
  [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));

/** Rosé Pine's blend(): fg over bg at alpha, rounded per channel. */
export const blend = (fg: string, bg: string, alpha: number): string =>
  "#" +
  hex(fg)
    .map((f, i) =>
      Math.round(alpha * f + (1 - alpha) * hex(bg)[i])
        .toString(16)
        .padStart(2, "0"),
    )
    .join("");

/** The sixteen ANSI slots for one mode. */
export function ansi16(palette: Palette, mode: Mode): string[] {
  const p = tokens(palette, mode);
  const row = ANSI.map((t) => p[t]);
  return [...row, ...row.slice(1, 8)];
}

const header = (palette: Palette, mode: Mode, comment: string) => {
  const { displayName, type, reproduction } = palette.modes[mode];
  return [
    `${comment} ${displayName} — ${type}`,
    `${comment} ${reproduction}`,
    `${comment} Generated from replica.json v${palette.version}`,
    `${comment} (https://anthonygonzal.es/replica.json). Do not edit by hand.`,
  ].join("\n");
};

/** A Ghostty theme file for one mode. Ghostty's bold-is-bright default
 *  (false) is what we want, so it is not emitted. */
export function ghostty(palette: Palette, mode: Mode): string {
  const p = tokens(palette, mode);
  const ansi = ansi16(palette, mode);
  return `${header(palette, mode, "#")}

background = ${p.base}
foreground = ${p.text}
cursor-color = ${p.text}
cursor-text = ${p.base}
selection-background = ${p.highlightMed}
selection-foreground = ${p.text}

${ansi.map((h, i) => `palette = ${i}=${h}`).join("\n")}
`;
}

/** One Rosé Pine highlight spec, as a Lua table in Replica inks. */
function luaSpec(palette: Palette, role: Role, p: Record<string, string>) {
  if (role.link) return `{ link = "${role.link}" }`;
  const parts: string[] = [];
  const ref = (t: string) => (t === "NONE" ? `"NONE"` : `p.${ink(palette, t)}`);
  if (role.fg) parts.push(`fg = ${ref(role.fg)}`);
  if (role.bg) {
    if (role.blend != null && role.bg !== "NONE") {
      const over = blend(p[ink(palette, role.bg)], p.base, role.blend / 100);
      parts.push(`bg = "${over}"`);
    } else parts.push(`bg = ${ref(role.bg)}`);
  }
  if (role.sp) parts.push(`sp = ${ref(role.sp)}`);
  for (const flag of FLAGS) if (role[flag]) parts.push(`${flag} = true`);
  return parts.length ? `{ ${parts.join(", ")} }` : "{}";
}

/** A Neovim colorscheme for one mode. */
export function neovim(palette: Palette, mode: Mode): string {
  const p = tokens(palette, mode);
  const { type } = palette.modes[mode];
  const ansi = ansi16(palette, mode);
  const paletteLines = Object.entries(p).map(([k, v]) => `  ${k} = "${v}",`);
  const groupLines: string[] = [];
  for (const role of palette.roles) {
    const spec = luaSpec(palette, role, p);
    for (const group of role.groups) {
      const key = /^[A-Za-z_]\w*$/.test(group) ? group : `["${group}"]`;
      groupLines.push(`  ${key} = ${spec},`);
    }
  }
  return `${header(palette, mode, "--")}

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

-- Terminal colors, the same slots as the Ghostty port.
${ansi.map((h, i) => `vim.g.terminal_color_${i} = "${h}"`).join("\n")}
`;
}
