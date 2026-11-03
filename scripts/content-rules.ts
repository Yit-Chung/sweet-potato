// Reads every file in content/, checks it, and describes each problem in plain English
// with its file and line number. Used by `npm run check` and by the build.
import fs from 'node:fs';
import path from 'node:path';
import { LineCounter, parseDocument, type Document } from 'yaml';
import type { ZodIssue } from 'zod';
import { contentFiles, photoNamePattern, placeholders, type Content, type ContentKey } from '../src/content/schema.ts';

export type Problem = { file: string; line?: number; message: string };
export type CheckResult = { errors: Problem[]; warnings: Problem[]; content?: Content };

type Parsed = { doc: Document; lines: LineCounter; value: unknown };

export const contentDir = (root: string) => path.join(root, 'content');
export const photosDir = (root: string) => path.join(root, 'content', 'photos');

export function checkContent(root: string): CheckResult {
  const errors: Problem[] = [];
  const warnings: Problem[] = [];
  const data: Partial<Record<ContentKey, unknown>> = {};
  const parsed: Partial<Record<ContentKey, Parsed>> = {};

  for (const key of Object.keys(contentFiles) as ContentKey[]) {
    const { file, schema } = contentFiles[key];
    const rel = `content/${file}`;
    let source: string;
    try {
      source = fs.readFileSync(path.join(contentDir(root), file), 'utf8');
    } catch {
      errors.push({ file: rel, message: 'This file is missing. Restore it from GitHub history (open the file’s History).' });
      continue;
    }

    const lines = new LineCounter();
    const doc = parseDocument(source, { lineCounter: lines, uniqueKeys: true });
    if (doc.errors.length) {
      for (const e of doc.errors) errors.push({ file: rel, line: e.linePos?.[0].line, message: yamlProblem(e.code, e.message) });
      continue;
    }
    const value = doc.toJS();
    parsed[key] = { doc, lines, value };
    if (value == null) {
      errors.push({ file: rel, message: 'This file is empty.' });
      continue;
    }
    const result = schema.safeParse(value);
    if (!result.success) {
      for (const issue of result.error.issues) {
        errors.push({ file: rel, line: lineOf(parsed[key]!, issue.path), message: describeIssue(issue, value) });
      }
      continue;
    }
    data[key] = result.data;
  }

  if (errors.length) return { errors, warnings };
  const content = data as Content;
  crossCheck(root, content, parsed as Record<ContentKey, Parsed>, errors, warnings);
  return { errors, warnings, content: errors.length ? undefined : content };
}

/** Checks that need more than one file: stops, categories, photos, dates and {placeholders}. */
function crossCheck(root: string, c: Content, parsed: Record<ContentKey, Parsed>, errors: Problem[], warnings: Problem[]) {
  const at = (key: ContentKey, p: (string | number)[]) => lineOf(parsed[key], p);
  const err = (key: ContentKey, p: (string | number)[], message: string) => errors.push({ file: `content/${contentFiles[key].file}`, line: at(key, p), message });
  const warn = (key: ContentKey, p: (string | number)[], message: string) => warnings.push({ file: `content/${contentFiles[key].file}`, line: at(key, p), message });

  // Stops
  const stopNames = c.trip.stops.map((s) => s.name);
  const seenStops = new Set<string>();
  let lastLeave = '';
  c.trip.stops.forEach((s, i) => {
    const where = `Stop "${s.name}"`;
    if (seenStops.has(s.name)) err('trip', ['stops', i, 'name'], `${where} is listed twice. Each stop name must be different.`);
    seenStops.add(s.name);
    if (!!s.arrive !== !!s.leave) err('trip', ['stops', i], `${where} needs both "arrive" and "leave", or neither (for a city that isn't on the trip route).`);
    for (const f of ['arrive', 'leave'] as const) {
      if (s[f] && !realDate(s[f]!)) err('trip', ['stops', i, f], `${where}: "${f}" is ${s[f]}, which isn't a real date.`);
    }
    if (s.arrive && s.leave && s.leave < s.arrive) err('trip', ['stops', i, 'leave'], `${where}: "leave" (${s.leave}) is before "arrive" (${s.arrive}).`);
    if (s.arrive && lastLeave && s.arrive < lastLeave) warn('trip', ['stops', i, 'arrive'], `${where} starts before the stop above it ends. Stops should be in trip order.`);
    if (s.leave) lastLeave = s.leave;
    if ((s.map_x == null) !== (s.map_y == null)) err('trip', ['stops', i], `${where} needs both "map_x" and "map_y", or neither (to hide it from Explore).`);
  });
  if (!c.trip.stops.some((s) => s.arrive)) err('trip', ['stops'], 'At least one stop needs "arrive" and "leave" dates.');
  if (!c.trip.stops.some((s) => s.map_x != null)) err('trip', ['stops'], 'At least one stop needs "map_x" and "map_y" so Explore has a city to show.');

  // Categories
  const categories = c.trip.categories.map((k) => k.english);
  if (new Set(categories).size !== categories.length) err('trip', ['categories'], 'A category is listed twice.');

  // Places
  const photoFiles = listPhotos(root);
  const usedPhotos = new Set<string>();
  const seenPlaces = new Set<string>();
  c.places.forEach((p, i) => {
    const where = `Place "${p.name}"`;
    if (!stopNames.includes(p.stop)) {
      const close = closest(p.stop, stopNames);
      err('places', [i, 'stop'], `${where}: stop "${p.stop}" isn't a stop in content/trip.yaml.${close ? ` Did you mean "${close}"?` : ''} Stops: ${stopNames.join(', ')}.`);
    }
    if (!categories.includes(p.category)) {
      const close = closest(p.category, categories);
      err('places', [i, 'category'], `${where}: category "${p.category}" isn't allowed.${close ? ` Did you mean "${close}"?` : ''} Use one of: ${categories.join(', ')}.`);
    }
    if (p.type === 'friend-pick' && !p.recommended_by) err('places', [i], `${where} is a friend-pick, so it needs "recommended_by" (who recommends it).`);
    const id = `${p.stop}/${p.name}`.toLowerCase();
    if (seenPlaces.has(id)) err('places', [i, 'name'], `${where} appears twice in ${p.stop}. Remove one of them.`);
    seenPlaces.add(id);
    if (p.date) {
      if (!realDate(p.date)) err('places', [i, 'date'], `${where}: "date" is ${p.date}, which isn't a real date.`);
      const stop = c.trip.stops.find((s) => s.name === p.stop);
      if (stop?.arrive && stop.leave && (p.date < stop.arrive || p.date > stop.leave)) {
        warn('places', [i, 'date'], `${where}: date ${p.date} is outside the ${p.stop} stop (${stop.arrive} to ${stop.leave}).`);
      }
    }
    if (p.photo) {
      usedPhotos.add(p.photo);
      const wrongCase = photoFiles.find((f) => f.toLowerCase() === p.photo!.toLowerCase());
      if (/\.(heic|heif)$/i.test(p.photo)) err('places', [i, 'photo'], `${where}: "${p.photo}" is an iPhone HEIC photo, which browsers can't show. Save it as JPG and upload that instead.`);
      else if (!photoFiles.includes(p.photo)) {
        err('places', [i, 'photo'], wrongCase
          ? `${where}: photo "${p.photo}" isn't in content/photos, but "${wrongCase}" is. Capitals must match exactly.`
          : `${where}: photo "${p.photo}" isn't in content/photos. Upload it there, or check the spelling.`);
      } else if (!photoNamePattern.test(p.photo)) {
        err('places', [i, 'photo'], `${where}: rename the photo "${p.photo}" to lowercase words joined by dashes, like jiufen-amei-teahouse.jpg (jpg, png or webp).`);
      }
    }
    if ((p.latitude == null) !== (p.longitude == null)) err('places', [i], `${where} needs both "latitude" and "longitude", or neither.`);
  });
  if (!c.places.some((p) => p.type === 'friend-pick')) err('places', [], 'There must be at least one friend-pick.');
  if (!c.places.some((p) => p.type === 'my-place')) err('places', [], 'There must be at least one my-place.');
  for (const f of photoFiles) {
    if (!usedPhotos.has(f)) warnings.push({ file: `content/photos/${f}`, message: 'This photo isn’t used by any place, so it won’t appear in the app.' });
  }

  // Phrases
  if (c.phrases.filter((p) => p.open_on_start).length > 1) warn('phrases', [], 'More than one phrase has "open_on_start: yes". Only the first one opens.');

  // Wording
  walkText(c.text, [], (value, p) => {
    for (const m of value.matchAll(/\{([^}]*)\}/g)) {
      if (!placeholders.includes(m[1])) {
        const close = closest(m[1], placeholders);
        err('text', p, `"${p.join('.')}" uses {${m[1]}}, which the app doesn't fill in.${close ? ` Did you mean {${close}}?` : ''}`);
      }
    }
  });
  for (const lang of ['en', 'zh'] as const) {
    const sentence = c.text.keep_place[lang].sentence;
    for (const blank of ['stop', 'place', 'why', 'what', 'when']) {
      if (!sentence.includes(`{${blank}}`)) err('text', ['keep_place', lang, 'sentence'], `"keep_place.${lang}.sentence" must contain {${blank}}.`);
    }
  }
  if (!categories.includes(c.text.keep_place.example_category)) {
    err('text', ['keep_place', 'example_category'], `"keep_place.example_category" must be one of: ${categories.join(', ')}.`);
  }
}

/** Formats problems for the terminal, and for the GitHub build log. */
export function formatProblems({ errors, warnings }: CheckResult): string {
  const line = (p: Problem, mark: string) => `${mark} ${p.file}${p.line ? `, line ${p.line}` : ''}\n    ${p.message}`;
  const out: string[] = [];
  if (errors.length) {
    out.push(`Content check found ${errors.length} problem${errors.length === 1 ? '' : 's'}. The site was NOT updated. Fix ${errors.length === 1 ? 'it' : 'them'} and save again:\n`);
    out.push(...errors.map((p) => line(p, '✖')));
  }
  if (warnings.length) {
    out.push(`${errors.length ? '\n' : ''}Worth a look (these don't stop the site from updating):\n`);
    out.push(...warnings.map((p) => line(p, '⚠')));
  }
  if (!errors.length && !warnings.length) out.push('Content check passed: all content files look good.');
  return out.join('\n');
}

export function listPhotos(root: string): string[] {
  try {
    return fs.readdirSync(photosDir(root)).filter((f) => !f.startsWith('.'));
  } catch {
    return [];
  }
}

function yamlProblem(code: string, message: string): string {
  const first = message.split('\n')[0].replace(/ at line \d+, column \d+:?$/, '');
  const tip = code === 'DUPLICATE_KEY'
    ? 'The same field name appears twice in one entry. Remove one of them.'
    : 'Usually the spaces at the start of a line don’t line up with the lines above, a "- " is missing, or text that contains ": " or # isn’t inside "double quotes".';
  return `The file couldn't be read (${first}). ${tip}`;
}

/** Plain-English version of one rule failure, naming the entry it's in. */
function describeIssue(issue: ZodIssue, root: unknown): string {
  const field = [...issue.path].reverse().find((p) => typeof p === 'string');
  const where = entryLabel(issue.path, root);
  const prefix = where ? `${where}: ` : '';
  const f = field ? `"${field}"` : 'This';
  switch (issue.code) {
    case 'invalid_type':
      if (issue.received === 'undefined') return `${prefix}${f} is missing.`;
      if (issue.message.startsWith('Expected')) return `${prefix}${f} should be ${friendlyType(issue.expected)}, not ${friendlyType(issue.received)}.`;
      return `${prefix}${f} ${issue.message}.`;
    case 'invalid_enum_value':
      return `${prefix}${f} is "${String(issue.received)}", but must be one of: ${issue.options.join(', ')}.`;
    case 'unrecognized_keys':
      return `${prefix}${issue.keys.map((k) => {
        const close = closest(k, knownKeys(issue.path, root));
        return `unknown field "${k}"${close ? ` (did you mean "${close}"?)` : ''}`;
      }).join(', ')}. Field names must be spelled exactly as in the sample at the top of the file.`;
    default:
      return `${prefix}${f} ${issue.message}.`;
  }
}

function entryLabel(p: (string | number)[], root: unknown): string {
  if (typeof p[0] === 'number' && Array.isArray(root)) {
    const e = root[p[0]] as Record<string, unknown> | undefined;
    const name = e && (e.name ?? e.item ?? e.english);
    return `Entry ${p[0] + 1}${typeof name === 'string' ? ` ("${name}")` : ''}`;
  }
  const at = p.filter((x) => typeof x === 'string').slice(0, -1);
  if (p[0] === 'stops' && typeof p[1] === 'number') return `Stop ${p[1] + 1}`;
  if (p[0] === 'categories' && typeof p[1] === 'number') return `Category ${p[1] + 1}`;
  return at.length ? `In "${at.join('.')}"` : '';
}

/** The field names that would have been allowed where an unknown one was found. */
function knownKeys(p: (string | number)[], root: unknown): string[] {
  const samples: Record<string, string[]> = {
    place: ['type', 'name', 'name_zh', 'stop', 'date', 'category', 'recommended_by', 'about_recommender', 'why', 'what', 'when', 'translated_from', 'photo', 'google_maps', 'latitude', 'longitude'],
    stop: ['name', 'name_zh', 'long_name', 'arrive', 'leave', 'map_x', 'map_y'],
    item: ['item', 'hint', 'ticked'],
    phrase: ['group', 'english', 'chinese', 'pinyin', 'pinned', 'open_on_start'],
  };
  if (Array.isArray(root)) {
    const first = root[0] as Record<string, unknown> | undefined;
    return first && 'item' in first ? samples.item : first && 'group' in first ? samples.phrase : samples.place;
  }
  if (p[0] === 'stops') return samples.stop;
  let node: unknown = root;
  for (const k of p) node = (node as Record<string | number, unknown>)?.[k];
  return node && typeof node === 'object' ? Object.keys(node) : [];
}

function friendlyType(t: string): string {
  return ({ string: 'text', number: 'a number', boolean: 'yes or no', array: 'a list', object: 'a group of fields', null: 'empty' } as Record<string, string>)[t] ?? t;
}

function lineOf(parsed: Parsed, p: (string | number)[]): number | undefined {
  for (let n = p.length; n >= 0; n--) {
    const node = n === 0 ? parsed.doc.contents : parsed.doc.getIn(p.slice(0, n), true);
    const range = (node as { range?: [number, number, number] } | null)?.range;
    if (range) return parsed.lines.linePos(range[0]).line;
  }
  return undefined;
}

function walkText(node: unknown, p: string[], visit: (value: string, path: string[]) => void) {
  if (typeof node === 'string') visit(node, p);
  else if (node && typeof node === 'object') for (const [k, v] of Object.entries(node)) walkText(v, [...p, k], visit);
}

function realDate(s: string): boolean {
  const [y, m, d] = s.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

/** The most similar option, if one is close enough to be a likely typo. */
function closest(word: string, options: string[]): string | undefined {
  const dist = (a: string, b: string) => {
    a = a.toLowerCase(); b = b.toLowerCase();
    const row = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      let prev = row[0]; row[0] = i;
      for (let j = 1; j <= b.length; j++) {
        const tmp = row[j];
        row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
        prev = tmp;
      }
    }
    return row[b.length];
  };
  let best: string | undefined, bestD = Infinity;
  for (const o of options) { const d = dist(word, o); if (d < bestD) { best = o; bestD = d; } }
  return best && bestD <= Math.max(2, Math.floor(word.length / 3)) ? best : undefined;
}
