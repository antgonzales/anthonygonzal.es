import type { APIRoute } from "astro";
import { replica } from "../lib/replica";

/** The palette as data, so ports can be generated from a URL. */
export const GET: APIRoute = () =>
  new Response(JSON.stringify(replica, null, 2), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
