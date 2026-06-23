import "server-only";
import type { D1Database } from "@cloudflare/workers-types";

/**
 * Returns the Cloudflare D1 binding when running on Pages, or null when there
 * is none (e.g. `next start` on Node, or a deploy without the binding set).
 * Callers treat null as "no server storage" and fall back to localStorage.
 */
export async function getDB(): Promise<D1Database | null> {
  try {
    const { getRequestContext } = await import("@cloudflare/next-on-pages");
    const env = getRequestContext().env as { DB?: D1Database };
    return env.DB ?? null;
  } catch {
    return null;
  }
}
