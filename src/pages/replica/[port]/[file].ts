import type { APIRoute, GetStaticPaths } from "astro";
import { replica, shikiTheme, type Mode } from "../../../lib/replica";
import { ghostty, neovim } from "../../../lib/replicaPorts";

/**
 * The ports as files, so a machine can fetch them the way it fetches
 * /replica.json:
 *
 *   /replica/neovim/replica-carbon.lua
 *   /replica/ghostty/replica-carbon.conf
 *   /replica/shiki/replica-carbon.json
 *
 * and the same for bone. The Neovim and Ghostty bytes are the ones
 * scripts/replica-ports.mjs writes into the dotfiles repo; Shiki is the
 * theme the site's own code blocks use.
 */
const modes: Mode[] = ["carbon", "bone"];

const ports = {
  neovim: {
    ext: "lua",
    type: "text/x-lua; charset=utf-8",
    render: (m: Mode) => neovim(replica, m),
  },
  ghostty: {
    ext: "conf",
    type: "text/plain; charset=utf-8",
    render: (m: Mode) => ghostty(replica, m),
  },
  shiki: {
    ext: "json",
    type: "application/json; charset=utf-8",
    render: (m: Mode) => JSON.stringify(shikiTheme(m), null, 2) + "\n",
  },
} as const;

type Port = keyof typeof ports;

export const files = Object.entries(ports).flatMap(([port, { ext }]) =>
  modes.map((mode) => ({ port, mode, file: `replica-${mode}.${ext}` })),
);

export const getStaticPaths = (() =>
  files.map(({ port, file, mode }) => ({
    params: { port, file },
    props: { mode },
  }))) satisfies GetStaticPaths;

export const GET: APIRoute = ({ params, props }) => {
  const { render, type } = ports[params.port as Port];
  return new Response(render(props.mode as Mode), {
    headers: { "Content-Type": type },
  });
};
