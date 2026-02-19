/**
 * Автоматический перевод текста для новостей (ru → be, en).
 * Используется LibreTranslate (опционально API ключ в LIBRETRANSLATE_API_KEY).
 */
import type { Locale } from "./i18n";

const LIBRETRANSLATE_URL =
  process.env.LIBRETRANSLATE_URL || "https://libretranslate.com";

/** Коды языков для LibreTranslate (совпадают с нашими локалями) */
const localeToCode: Record<Locale, string> = {
  ru: "ru",
  be: "be",
  en: "en",
};

/** Максимальная длина одного запроса (лимиты API) */
const CHUNK_SIZE = 4500;

/**
 * MyMemory (fallback): бесплатно без ключа, лимит по запросам в день.
 */
async function translateViaMyMemory(
  text: string,
  source: Locale,
  target: Locale
): Promise<string> {
  const langpair = `${localeToCode[source]}|${localeToCode[target]}`;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langpair}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) return text;
  const data = (await res.json()) as { responseData?: { translatedText?: string } };
  const translated = data.responseData?.translatedText;
  return translated && translated.trim() ? translated : text;
}

/**
 * Переводит текст с source на target: сначала LibreTranslate, при ошибке — MyMemory.
 */
export async function translateText(
  text: string,
  source: Locale,
  target: Locale
): Promise<string> {
  const t = text.trim();
  if (!t || source === target) return text;

  const apiKey = process.env.LIBRETRANSLATE_API_KEY;
  const url = `${LIBRETRANSLATE_URL}/translate`;
  const body: Record<string, string> = {
    q: t,
    source: localeToCode[source],
    target: localeToCode[target],
  };
  if (apiKey) body.api_key = apiKey;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    });

    if (res.ok) {
      const data = (await res.json()) as { translatedText?: string };
      if (data.translatedText) return data.translatedText;
    }
  } catch (err) {
    console.warn("[translate] LibreTranslate failed:", err);
  }

  try {
    return await translateViaMyMemory(t, source, target);
  } catch (err) {
    console.warn("[translate] MyMemory fallback failed:", err);
    return text;
  }
}

/**
 * Переводит длинный текст по частям и склеивает результат.
 */
export async function translateLongText(
  text: string,
  source: Locale,
  target: Locale
): Promise<string> {
  if (!text.trim() || source === target) return text;
  if (text.length <= CHUNK_SIZE) return translateText(text, source, target);

  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    let end = start + CHUNK_SIZE;
    if (end < text.length) {
      const lastSpace = text.lastIndexOf(" ", end);
      if (lastSpace > start) end = lastSpace;
    }
    chunks.push(text.slice(start, end));
    start = end;
  }

  const results = await Promise.all(
    chunks.map((chunk) => translateText(chunk, source, target))
  );
  return results.join("");
}
