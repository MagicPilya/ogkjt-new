/**
 * Перевод события (title, location, description) для отображения на be/en.
 */
import type { Event } from "./strapi";
import type { Locale } from "./i18n";
import { defaultLocale } from "./i18n";
import { translateText, translateLongText } from "./translate";
import { translateBatch } from "./translateArticle";

type DescBlock = {
  type?: string;
  text?: string;
  children?: DescBlock[];
  [key: string]: unknown;
};

function collectDescTexts(blocks: DescBlock[]): string[] {
  const out: string[] = [];
  function walk(nodes: DescBlock[] | undefined) {
    if (!nodes) return;
    for (const n of nodes) {
      if (typeof n.text === "string" && n.text.trim()) out.push(n.text);
      walk(n.children);
    }
  }
  walk(blocks);
  return out;
}

function fillDescTexts(blocks: DescBlock[], translated: string[]): void {
  let i = 0;
  function walk(nodes: DescBlock[] | undefined) {
    if (!nodes) return;
    for (const n of nodes) {
      if (typeof n.text === "string" && n.text.trim()) {
        if (translated[i] !== undefined) n.text = translated[i];
        i++;
      }
      walk(n.children);
    }
  }
  walk(blocks);
}

async function translateDescriptionBlocks(
  blocks: unknown[] | null | undefined,
  source: Locale,
  target: Locale
): Promise<string[]> {
  if (!blocks || !Array.isArray(blocks) || blocks.length === 0) return [];
  const texts = collectDescTexts(blocks as DescBlock[]);
  if (texts.length === 0) return [];
  return Promise.all(texts.map((t) => translateLongText(t, source, target)));
}

export async function translateEvent(event: Event, targetLocale: Locale): Promise<Event> {
  if (targetLocale === defaultLocale) return event;
  const source: Locale = defaultLocale;

  const [title, location, ...descResult] = await Promise.all([
    translateText(event.title, source, targetLocale),
    event.location && event.location.trim()
      ? translateText(event.location, source, targetLocale)
      : Promise.resolve(event.location ?? null),
    translateDescriptionBlocks(event.description, source, targetLocale),
  ]);

  let description = event.description;
  if (Array.isArray(description) && description.length > 0 && descResult[0]?.length) {
    const cloned = JSON.parse(JSON.stringify(description)) as DescBlock[];
    fillDescTexts(cloned, descResult[0]);
    description = cloned;
  }

  return {
    ...event,
    title,
    location: location ?? event.location,
    description,
  };
}

export interface TranslatedEventResult {
  event: Event;
  isTranslated: boolean;
}

export async function getEventForLocale(
  getEventById: (id: number | string, locale?: Locale) => Promise<Event | null>,
  id: number | string,
  locale: Locale
): Promise<TranslatedEventResult | null> {
  const event = await getEventById(id, defaultLocale);
  if (!event) return null;
  if (locale === defaultLocale) {
    return { event, isTranslated: false };
  }
  const translated = await translateEvent(event, locale);
  return { event: translated, isTranslated: true };
}

/** Пакетный перевод title и location для списка событий (лента, календарь). */
export async function translateEventList(
  events: Event[],
  targetLocale: Locale
): Promise<Event[]> {
  if (targetLocale === defaultLocale || events.length === 0) return events;
  const titles = events.map((e) => e.title);
  const locations = events.map((e) => e.location ?? "");
  const [translatedTitles, translatedLocations] = await Promise.all([
    translateBatch(titles, defaultLocale, targetLocale),
    translateBatch(locations, defaultLocale, targetLocale),
  ]);
  return events.map((e, i) => ({
    ...e,
    title: translatedTitles[i] ?? e.title,
    location: translatedLocations[i] || e.location,
  }));
}
