#!/usr/bin/env node
/**
 * Rebuild `roles` in src/data/replica.json from Rosé Pine's Neovim source.
 *
 *   pnpm replica:roles
 *
 * Fetches lua/rose-pine.lua at a pinned commit, reads its highlight table
 * (legacy, default and plugin groups; the transparency table is skipped,
 * as it is in Rosé Pine when transparency is off) and writes every group
 * back in Rosé Pine's own token names, grouped by identical spec, with the
 * Replica ink beside each token. The generators push this table through
 * the `rosePine` map; nothing assigns a role by hand.
 *
 * Two override lists sit below. ROLE_MAP is where the 0.9.0 role map
 * departs from Rosé Pine main. CHROME is the one place the table is
 * overridden on purpose: Rosé Pine gives its chrome accent to foam, and
 * Replica does not carry that through. Chrome carries no pigment; clay
 * marks what can be acted on. Icons keep a color because a file type is
 * information; labels and folder names do not.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROSE_PINE_SHA = "ff483051a47e27d84bdef47703538df1ed9f4a47";
const SOURCE = `https://raw.githubusercontent.com/rose-pine/neovim/${ROSE_PINE_SHA}/lua/rose-pine.lua`;

/** Rosé Pine's config.options.groups defaults, resolved to palette tokens. */
const GROUPS = {
  border: "muted",
  link: "iris",
  panel: "surface",
  error: "love",
  hint: "iris",
  info: "foam",
  ok: "leaf",
  warn: "gold",
  note: "pine",
  todo: "rose",
  git_add: "foam",
  git_change: "rose",
  git_delete: "love",
  git_dirty: "rose",
  git_ignore: "muted",
  git_merge: "iris",
  git_rename: "pine",
  git_stage: "iris",
  git_text: "rose",
  git_untracked: "subtle",
  h1: "iris",
  h2: "foam",
  h3: "rose",
  h4: "gold",
  h5: "pine",
  h6: "leaf",
};

const PALETTE_ALIAS = {
  highlight_low: "highlightLow",
  highlight_med: "highlightMed",
  highlight_high: "highlightHigh",
  _nc: "base",
};

/** Where the 0.9.0 role map departs from Rosé Pine main. */
const ROLE_MAP = {
  Comment: { fg: "muted", italic: true },
  "@constant.builtin": { fg: "love", bold: true },
  "@function.builtin": { fg: "love", bold: true },
  CurSearch: { fg: "base", bg: "rose" },
  "@markup.raw": { fg: "gold" },
  "@label": { fg: "iris" },
  "@function.macro": { fg: "iris" },
  "@markup.link": { fg: "iris" },
  SpellBad: { sp: "love", undercurl: true },
};

const text = { fg: "text" };
const textBold = { fg: "text", bold: true };
const muted = { fg: "muted" };

/** The chrome override. Tokens are Rosé Pine's; rose is clay, pine slate,
 *  gold sulfur, foam resin, iris ash, love oxide. */
const CHROME = {
  // Titles: text, normal weight.
  Title: text,
  FloatTitle: { fg: "text", bg: "surface" },
  WinBar: { fg: "text", bg: "surface" },
  NeoTreeTitleBar: text,
  SnacksDashboardTitle: text,
  // Directories: text, bold.
  Directory: textBold,
  NeoTreeDirectoryName: textBold,
  NeoTreeRootName: textBold,
  SnacksPickerDirectory: textBold,
  SnacksPickerFile: text,
  SnacksPickerDir: muted,
  SnacksPickerPathHidden: muted,
  SnacksPickerPathIgnored: muted,
  // Chrome that carries no pigment.
  NeoTreeDirectoryIcon: muted,
  SnacksDashboardIcon: muted,
  SnacksDashboardDesc: muted,
  SnacksDashboardFooter: muted,
  Special: { fg: "subtle" },
  // What can be acted on.
  SnacksDashboardHeader: { fg: "rose" },
  SnacksDashboardKey: { fg: "rose" },
  // Git modified and error markers.
  NeoTreeGitModified: { fg: "love" },
  NeoTreeGitConflict: { fg: "love" },
  SnacksPickerGitStatusModified: { fg: "love" },
  // mini.icons paints by category, so the two categories Replica needs to
  // move are steered here; the dotfiles mini.icons config steers file types
  // between categories.
  MiniIconsAzure: { fg: "pine" },
  MiniIconsGrey: muted,
  // nvim-web-devicons, onto the six inks.
  ...icons(["TypeScript", "Tsx", "TSConfig"], { fg: "pine" }),
  ...icons(["Js", "Mjs", "Cjs"], { fg: "gold" }),
  ...icons(["Json", "PackageJson"], { fg: "foam" }),
  ...icons(["Md", "Mdx", "Txt"], muted),
  ...icons(
    [
      "Yaml",
      "Yml",
      "Toml",
      "Lock",
      "PackageLockJson",
      "PNPMLock",
      "BunLockfile",
    ],
    { fg: "iris" },
  ),
  ...icons(
    [
      "Env",
      "Conf",
      "Sh",
      "Bash",
      "Zsh",
      "Zshrc",
      "Bashrc",
      "Zshprofile",
      "BashProfile",
      "GitIgnore",
      "GitConfig",
      "GitAttributes",
      "GitModules",
      "EditorConfig",
      "PrettierConfig",
      "NPMrc",
      "Eslintrc",
    ],
    muted,
  ),
};

function icons(names, spec) {
  return Object.fromEntries(names.map((n) => [`DevIcon${n}`, spec]));
}

/* ---- parse ------------------------------------------------------------- */

function token(v) {
  v = v.trim();
  if (v.startsWith("palette.")) {
    const t = v.slice(8);
    return PALETTE_ALIAS[t] ?? t;
  }
  if (v.startsWith("groups.")) {
    const k = v.slice(7);
    const t = GROUPS[k] ?? GROUPS[`git_${k}`];
    if (!t) throw new Error(`unknown groups.${k}`);
    return t;
  }
  if (v === '"NONE"') return "NONE";
  throw new Error(`unexpected value ${v}`);
}

function parse(lua) {
  const lines = lua.split("\n");
  const start = lines.findIndex((l) =>
    l.includes("local legacy_highlights = {"),
  );
  const end = lines.findIndex((l) =>
    l.includes("local transparency_highlights = {"),
  );
  const entries = new Map();
  let buf = "";
  for (const raw of lines.slice(start, end)) {
    let s = raw.trim();
    if (
      !s ||
      s.startsWith("--") ||
      s.startsWith("local ") ||
      s === "}" ||
      s === "},"
    )
      continue;
    if (buf) s = `${buf} ${s}`;
    const open = (s.match(/\{/g) ?? []).length;
    const close = (s.match(/\}/g) ?? []).length;
    if (open !== close) {
      buf = s;
      continue;
    }
    buf = "";
    const m = s.match(
      /^(?:\["([^"]+)"\]|([A-Za-z_]\w*))\s*=\s*(?:\{(.*)\}|make_border\((.*)\)),?\s*(?:--.*)?$/,
    );
    if (!m) continue;
    const group = m[1] ?? m[2];
    const e = {};
    if (m[4] !== undefined) {
      const arg = m[4].trim();
      e.fg = arg ? token(arg) : "muted";
      e.bg = "surface";
    } else {
      const body = (m[3] ?? "").trim();
      if (body.includes("config.options.dim_inactive_windows")) {
        e.fg = "text";
        e.bg = "base";
      } else {
        for (const part of body
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean)) {
          const [k, ...rest] = part.split("=");
          const key = k.trim();
          const v = rest.join("=").trim();
          if (key === "link") e.link = v.replace(/^"|"$/g, "");
          else if (key === "fg" || key === "bg" || key === "sp")
            e[key] = token(v);
          else if (key === "blend") e.blend = Number(v);
          else if (v.startsWith("styles.") || v === "true") e[key] = true;
          else if (v !== "false") throw new Error(`${group}: ${part}`);
        }
      }
    }
    entries.set(group, e); // a later table (default over legacy) wins
  }
  return entries;
}

/* ---- build ------------------------------------------------------------- */

const here = dirname(fileURLToPath(import.meta.url));
const jsonPath = join(here, "../src/data/replica.json");
const palette = JSON.parse(readFileSync(jsonPath, "utf8"));

const lua = await (await fetch(SOURCE)).text();
const entries = parse(lua);
console.log(
  `${entries.size} groups from rose-pine ${ROSE_PINE_SHA.slice(0, 7)}`,
);
for (const [g, e] of Object.entries({ ...ROLE_MAP, ...CHROME }))
  entries.set(g, e);

const KEYS = [
  "fg",
  "bg",
  "sp",
  "blend",
  "bold",
  "italic",
  "underline",
  "undercurl",
  "strikethrough",
  "nocombine",
  "reverse",
  "link",
];
const ink = (t) => (t === "NONE" ? "NONE" : palette.rosePine[t]);
const roles = [];
const index = new Map();
for (const [group, e] of entries) {
  const key = JSON.stringify(KEYS.map((k) => e[k]));
  if (!index.has(key)) {
    const role = {};
    for (const k of KEYS) if (e[k] !== undefined) role[k] = e[k];
    const inks = {};
    for (const k of ["fg", "bg", "sp"]) {
      if (e[k] === undefined) continue;
      const i = ink(e[k]);
      if (!i) throw new Error(`rosePine has no entry for "${e[k]}" (${group})`);
      inks[k] = i;
    }
    if (Object.keys(inks).length) role.ink = inks;
    role.groups = [];
    index.set(key, role);
    roles.push(role);
  }
  index.get(key).groups.push(group);
}

palette.roles = roles;
writeFileSync(jsonPath, JSON.stringify(palette, null, 2) + "\n");
console.log(
  `wrote ${roles.length} roles (${entries.size} groups) into ${jsonPath}`,
);
