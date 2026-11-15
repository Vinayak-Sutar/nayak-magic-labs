/**
 * Base-path helper. When the site is served from a sub-path (the GitHub Pages
 * project URL /nayak-magic-labs/), every internal link has to carry that prefix
 * or it points at the wrong place. `withBase` adds it. On the domain root the
 * base is "/" and this is a no-op, so links written as "/apps/" keep working.
 *
 * It is idempotent: a path that already starts with the base is returned as-is,
 * so it is safe to wrap a value that may or may not already be prefixed.
 *
 * No server-only imports here, so client scripts can use it too.
 */
export const BASE = import.meta.env.BASE_URL; // from `base` in astro.config, always ends in "/"

export function withBase(path: string): string {
  if (/^(https?:|mailto:|tel:|#)/.test(path)) return path;
  if (BASE !== '/' && (path === BASE.slice(0, -1) || path.startsWith(BASE))) return path;
  return BASE + path.replace(/^\//, '');
}
