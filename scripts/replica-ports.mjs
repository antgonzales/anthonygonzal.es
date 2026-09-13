#!/usr/bin/env node
/**
 * Write the Neovim and Ghostty ports of Replica into the dotfiles repo.
 *
 *   pnpm replica:ports [path/to/dotfiles]
 *
 * Defaults to ~/code/dotfiles. Writes
 *   nvim/.config/nvim/colors/replica-{carbon,bone}.lua
 *   ghostty/.config/ghostty/themes/replica-{carbon,bone}
 *
 * The rendering lives in src/lib/replicaPorts.ts, which the site also uses
 * to serve the same files under /replica/. This script only adds the
 * dotfiles paths, and writes the derived ANSI slots back into replica.json
 * so /replica.json stays complete. The files carry a "do not edit by hand"
 * header; change replica.json and rerun instead.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";
import { ansi16, ghostty, neovim } from "../src/lib/replicaPorts.ts";

const here = dirname(fileURLToPath(import.meta.url));
const jsonPath = join(here, "../src/data/replica.json");
const palette = JSON.parse(readFileSync(jsonPath, "utf8"));
const dotfiles = process.argv[2] ?? join(homedir(), "code/dotfiles");

palette.ansi16 = Object.fromEntries(
  ["carbon", "bone"].map((m) => [m, ansi16(palette, m)]),
);
writeFileSync(jsonPath, JSON.stringify(palette, null, 2) + "\n");
console.log(`derived ansi16 into ${jsonPath}`);

const files = {
  "nvim/.config/nvim/colors/replica-carbon.lua": neovim(palette, "carbon"),
  "nvim/.config/nvim/colors/replica-bone.lua": neovim(palette, "bone"),
  "ghostty/.config/ghostty/themes/replica-carbon": ghostty(palette, "carbon"),
  "ghostty/.config/ghostty/themes/replica-bone": ghostty(palette, "bone"),
};

for (const [rel, content] of Object.entries(files)) {
  const path = join(dotfiles, rel);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
  console.log(`wrote ${path}`);
}
