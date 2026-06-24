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

/** Глубокое копирование блоков контента */
function cloneBlocks(blocks: unknown[]): DescBlock[] {
  return JSON.parse(JSON.stringify(blocks)) as DescBlock[];
}

/**
 * Рекурсивно переводит текст в узлах, сохраняя структуру и форматирование.
 */
async function translateNodeRecursive(
  node: DescBlock,
  source: Locale,
  target: Locale
): Promise<DescBlock> {
  const translatedNode: DescBlock = { ...node };

  // Переводим текстовое поле, если оно есть
  if (typeof node.text === "string") {
    if (node.text.trim()) {
      translatedNode.text = await translateLongText(node.text, source, target);
    }
  }

  // Рекурсивно обрабатываем дочерние узлы
  if (Array.isArray(node.children) && node.children.length > 0) {
    translatedNode.children = await Promise.all(
      node.children.map((child) => translateNodeRecursive(child, source, target))
    );
  }

  return translatedNode;
}

/**
 * Переводит все контентные блоки с сохранением структуры и форматирования.
 */
async function translateDescriptionBlocks(
  blocks: unknown[] | null | undefined,
  source: Locale,
  target: Locale
): Promise<DescBlock[]> {
  if (!blocks || !Array.isArray(blocks) || blocks.length === 0) return [];

  const cloned = cloneBlocks(blocks);
  return Promise.all(cloned.map((block) => translateNodeRecursive(block, source, target)));
}

export async function translateEvent(event: Event, targetLocale: Locale): Promise<Event> {
  if (targetLocale === defaultLocale) return event;
  const source: Locale = defaultLocale;

  const [title, location, description] = await Promise.all([
    translateText(event.title, source, targetLocale),
    event.location && event.location.trim()
      ? translateText(event.location, source, targetLocale)
      : Promise.resolve(event.location ?? null),
    translateDescriptionBlocks(event.description, source, targetLocale),
  ]);

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
