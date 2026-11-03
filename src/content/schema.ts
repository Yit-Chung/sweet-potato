// The shape of every file in content/. The safety check (scripts/check-content.ts)
// tests the files against these rules, and the screens get their types from here.
import { z } from 'zod';

const blankToUndefined = (v: unknown) => (v === null || v === '' ? undefined : v);
const numberToText = (v: unknown) => (typeof v === 'number' || typeof v === 'boolean' ? String(v) : v);

const text = z.preprocess(
  numberToText,
  z.string({ invalid_type_error: 'must be text. If it starts with { [ * & ! or contains ": ", put it in "double quotes"' })
    .trim()
    .min(1, 'is empty'),
);
const optional = <T extends z.ZodTypeAny>(schema: T) => z.preprocess(blankToUndefined, schema.optional());
const optionalText = optional(text);
const date = z.preprocess(
  numberToText,
  z.string({ invalid_type_error: 'must be a date like 2026-11-22' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'must be a date like 2026-11-22 (year-month-day)'),
);
const yesNo = optional(z.preprocess(
  (v) => (v === 'yes' ? true : v === 'no' ? false : v),
  z.boolean({ invalid_type_error: 'must be yes or no' }),
));
const number = (min: number, max: number) =>
  z.number({ invalid_type_error: `must be a number from ${min} to ${max}` }).min(min, `must be ${min} or more`).max(max, `must be ${max} or less`);

export const placeSchema = z.object({
  type: z.enum(['friend-pick', 'my-place']),
  name: text,
  name_zh: optionalText,
  stop: text,
  date: optional(date),
  category: text,
  recommended_by: optionalText,
  about_recommender: optionalText,
  why: optionalText,
  what: optionalText,
  when: optionalText,
  translated_from: optionalText,
  photo: optionalText,
  google_maps: optional(z.string().url('must be a full web link starting with https://')),
  latitude: optional(number(-90, 90)),
  longitude: optional(number(-180, 180)),
}).strict();

export const stopSchema = z.object({
  name: text,
  name_zh: text,
  long_name: optionalText,
  arrive: optional(date),
  leave: optional(date),
  map_x: optional(number(0, 350)),
  map_y: optional(number(0, 540)),
}).strict();

export const tripSchema = z.object({
  country: text,
  traveller: text,
  traveller_from: text,
  friends: z.array(text).min(1, 'needs at least one friend'),
  stops: z.array(stopSchema).min(1, 'needs at least one stop'),
  categories: z.array(z.object({ english: text, chinese: text }).strict()).min(1, 'needs at least one category'),
}).strict();

export const checklistItemSchema = z.object({
  item: text,
  hint: optionalText,
  ticked: yesNo,
}).strict();

export const phraseSchema = z.object({
  group: text,
  english: text,
  chinese: text,
  pinyin: text,
  pinned: yesNo,
  open_on_start: yesNo,
}).strict();

/** A section of text.yaml: every listed name must be present (as text); unknown names are flagged. */
const section = <K extends string>(...keys: K[]) =>
  z.object(Object.fromEntries(keys.map((k) => [k, text])) as Record<K, typeof text>).strict();

const keepPlaceLanguage = z.object({
  ...section(
    'title', 'sentence', 'blank_stop', 'blank_place', 'blank_why', 'blank_what', 'blank_when',
    'filling_stop', 'filling_place', 'filling_why', 'filling_what', 'filling_when',
    'link_label', 'link_placeholder', 'name_label', 'name_placeholder', 'name_placeholder_instagram',
    'from_link_tag', 'type_label', 'type_from_link', 'type_pick_one', 'answer_placeholder',
    'photo_button', 'photo_optional', 'save_button', 'leave_title', 'leave_text', 'leave_save',
    'leave_discard', 'leave_keep_editing',
  ).shape,
  required_note: optional(z.string()),
}).strict();

export const textSchema = z.object({
  common: section('app_name', 'app_initials', 'place_one', 'place_other', 'day_chip'),
  tabs: section('explore', 'trip', 'phrases', 'note'),
  welcome: section(
    'hero_title', 'hero_text', 'feature_1_title', 'feature_1_text', 'feature_2_title', 'feature_2_text',
    'feature_3_title', 'feature_3_text', 'private_link_note', 'start_button', 'trip_title', 'trip_summary',
    'trip_wrong_note', 'trip_confirm_button', 'install_title', 'install_text', 'install_step_1',
    'install_step_2', 'install_step_3', 'install_done_button', 'install_later_button', 'open_title',
    'open_text', 'open_note', 'saving_title', 'saved_title', 'saving_text_app', 'saving_text_browser',
    'saving_item_maps', 'saving_item_places', 'saving_item_saved', 'saving_item_phrases', 'saved_badge_app',
    'saved_badge_browser', 'saved_note_app', 'saved_note_browser', 'saving_button', 'go_button',
  ),
  explore: section(
    'news_label', 'news_title', 'news_text', 'after_trip_label', 'after_trip_title', 'after_trip_text',
    'after_trip_button', 'picked_by', 'title', 'view_label', 'map_button', 'cards_button', 'photo_placeholder',
    'city_card_line', 'map_note', 'city_subtitle', 'recommended_by', 'add_recommendation',
  ),
  profile: section(
    'title', 'text', 'name_label', 'name_placeholder', 'from_label', 'from_placeholder', 'intro_label',
    'intro_optional', 'intro_placeholder', 'preview_label', 'preview_line', 'preview_name_empty',
    'preview_from_empty', 'preview_intro_empty', 'once_note', 'continue_button',
  ),
  pick: section(
    'saved_offline', 'recommends', 'photo_placeholder', 'photo_credit', 'why_label', 'what_label', 'when_label',
    'translated_note', 'see_original', 'save_button', 'saved_button', 'visited_button', 'been_button',
    'directions_button',
  ),
  checklist: section('title', 'subtitle', 'progress', 'stays_note', 'add_placeholder', 'add_button'),
  phrases: section(
    'title', 'new_button', 'pinned_label', 'food_card_title', 'food_card_text', 'close_button', 'edit_button',
    'done_editing_button', 'full_screen_button', 'add_phrase_button', 'done_button',
  ),
  note: section(
    'title', 'placeholder', 'example_entry', 'place_label', 'place_saved', 'private_note', 'see_saved_link',
    'keep_button', 'keep_another_button',
  ),
  keep_place: z.object({
    example_link: text,
    example_place_en: text,
    example_place_zh: text,
    example_category: text,
    en: keepPlaceLanguage,
    zh: keepPlaceLanguage,
  }).strict(),
  saved: section(
    'title', 'count', 'add_button', 'why_label', 'what_label', 'when_label', 'preview_note', 'delete_button',
    'edit_button', 'delete_title', 'delete_text', 'cancel_button', 'deleted_toast',
  ),
  share: section(
    'trip_line', 'title', 'intro', 'footnote', 'share_button', 'pick_button', 'not_now_button', 'thanks_title',
    'thanks_text_one', 'thanks_text_other', 'done_button',
  ),
}).strict();

/** Each content file, and the rules it must follow. */
export const contentFiles = {
  places: { file: 'places.yaml', schema: z.array(placeSchema, { invalid_type_error: 'must be a list of places, each starting with "- type:"' }) },
  trip: { file: 'trip.yaml', schema: tripSchema },
  checklist: { file: 'checklist.yaml', schema: z.array(checklistItemSchema, { invalid_type_error: 'must be a list of items, each starting with "- item:"' }) },
  phrases: { file: 'phrases.yaml', schema: z.array(phraseSchema, { invalid_type_error: 'must be a list of phrases, each starting with "- group:"' }) },
  text: { file: 'text.yaml', schema: textSchema },
} as const;

export type ContentKey = keyof typeof contentFiles;
export type Place = z.infer<typeof placeSchema>;
export type Stop = z.infer<typeof stopSchema>;
export type Trip = z.infer<typeof tripSchema>;
export type ChecklistItem = z.infer<typeof checklistItemSchema>;
export type Phrase = z.infer<typeof phraseSchema>;
export type Text = z.infer<typeof textSchema>;
export type Content = { places: Place[]; trip: Trip; checklist: ChecklistItem[]; phrases: Phrase[]; text: Text };

/** Words the app fills in inside {curly brackets} in text.yaml. */
export const placeholders = [
  'traveller', 'country', 'friends', 'stops', 'dates', 'days', 'places', 'city', 'city_zh', 'count', 'by',
  'name', 'from', 'month', 'language', 'day', 'date', 'done', 'total', 'stop', 'place', 'why', 'what', 'when',
];

/** Photo file names: lowercase letters, numbers and dashes, e.g. jiufen-amei-teahouse.jpg */
export const photoNamePattern = /^[a-z0-9]+(-[a-z0-9]+)*\.(jpg|jpeg|png|webp)$/;
