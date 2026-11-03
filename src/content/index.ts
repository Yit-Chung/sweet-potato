// Everything the screens show comes from content/ through this file: the data itself,
// plus small helpers for dates, stops and filling {placeholders} in the wording.
import placesData from '../../content/places.yaml';
import tripData from '../../content/trip.yaml';
import checklistData from '../../content/checklist.yaml';
import phrasesData from '../../content/phrases.yaml';
import textData from '../../content/text.yaml';
import type { ChecklistItem, Phrase, Place, Stop, Text, Trip } from './schema.ts';

export type { Place, Stop };

export const places = placesData as Place[];
export const trip = tripData as Trip;
export const checklist = checklistData as ChecklistItem[];
export const phrases = phrasesData as Phrase[];
export const text = textData as Text;

/** Places with their position in places.yaml, which the app uses as the place's id. */
const indexed = places.map((place, id) => ({ place, id }));
export const myPlaces = indexed.filter((p) => p.place.type === 'my-place');
export const picksForStop = (stop: string) => indexed.filter((p) => p.place.type === 'friend-pick' && p.place.stop === stop);
export const friendPickCount = indexed.filter((p) => p.place.type === 'friend-pick').length;
/** A place's lasting key ("Jiufen/Amei Teahouse") for what's saved on the phone. Unlike the id,
 *  it doesn't change when places are added or moved in places.yaml. */
export const placeKey = (p: Place) => `${p.stop}/${p.name}`;

/** Stops with dates (the trip route), and stops with a pin on the Explore map. */
export const routeStops = trip.stops.filter((s) => s.arrive && s.leave);
export const mapStops = trip.stops.filter((s) => s.map_x != null && s.map_y != null);
export const stopId = (s: Stop) => s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const stopZh = (name: string) => trip.stops.find((s) => s.name === name)?.name_zh ?? '';

// Dates: content uses 2026-11-22; screens show "Nov 22" or "Sun, Nov 22".
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const toDate = (s: string) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const daysBetween = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / 86400000);
const shortDate = (d: Date) => `${MONTHS[d.getMonth()]} ${d.getDate()}`;
export const weekdayDate = (d: Date) => `${DAYS[d.getDay()]}, ${shortDate(d)}`;
/** "Nov 22 – 23" within a month, "Nov 28 – Dec 1" across months. */
export const dateRange = (a: Date, b: Date) =>
  a.getMonth() === b.getMonth() ? `${shortDate(a)} – ${b.getDate()}` : `${shortDate(a)} – ${shortDate(b)}`;

export const tripStart = toDate(routeStops[0].arrive!);
const tripEnd = toDate(routeStops[routeStops.length - 1].leave!);
const tripDays = daysBetween(tripStart, tripEnd) + 1;
const tripDates = dateRange(tripStart, tripEnd);
const tripMonth = `${MONTHS[tripStart.getMonth()]} ${tripStart.getFullYear()}`;
/** Day index from the first day of the trip (0 = first day). */
export const tripDayIndex = (s: string) => daysBetween(tripStart, toDate(s));

/** Replaces {name} in a piece of wording with the matching value. */
export function fill(template: string, vars: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (all, k: string) => (k in vars ? String(vars[k]) : all));
}

/** Values every piece of wording can use. */
export const tripVars = {
  traveller: trip.traveller,
  country: trip.country,
  friends: trip.friends.join(', '),
  stops: routeStops.length,
  dates: tripDates,
  days: tripDays,
  month: tripMonth,
};

/** "1 place" / "4 places", using the words in text.yaml. */
export const countPlaces = (n: number) => `${n} ${n === 1 ? text.common.place_one : text.common.place_other}`;

/** Chip text like "九份 Jiufen · Day 1 · Sun, Nov 22". */
export function placeChip(p: Place): string {
  const stop = `${stopZh(p.stop)} ${p.stop}`.trim();
  if (!p.date) return stop;
  return `${stop} · ${fill(text.common.day_chip, { day: tripDayIndex(p.date) + 1, date: weekdayDate(toDate(p.date)) })}`;
}

/** Google Maps link for a place: its own link, else its coordinates, else a search by name. */
export function directionsUrl(p: Place): string {
  if (p.google_maps) return p.google_maps;
  const query = p.latitude != null && p.longitude != null ? `${p.latitude},${p.longitude}` : [p.name_zh, p.name, p.stop].filter(Boolean).join(' ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export const photoUrl = (file: string) => `${import.meta.env.BASE_URL}photos/${file}`;
