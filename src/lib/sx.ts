import type { CSSProperties } from 'react';

const cache = new Map<string, CSSProperties>();

/**
 * Turns a CSS declaration string into a React style object, so styles can be
 * copied from the wireframes as written (e.g. sx('display: flex; gap: 8px')).
 */
export function sx(css: string): CSSProperties {
  const hit = cache.get(css);
  if (hit) return hit;
  const out: Record<string, string> = {};
  for (const decl of css.split(';')) {
    const i = decl.indexOf(':');
    if (i < 0) continue;
    const prop = decl.slice(0, i).trim().replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    const value = decl.slice(i + 1).trim();
    if (prop && value) out[prop] = value;
  }
  cache.set(css, out);
  return out;
}
