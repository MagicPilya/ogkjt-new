import { NextRequest, NextResponse } from "next/server";
import {
  getAdmissionSheetPubHtmlBaseUrl,
  resolveAdmissionSheetHtml,
} from "@/lib/admission-campaign";
import { enhanceAdmissionSheetHtml } from "@/lib/admission-sheet-html";
import { isValidLocale, type Locale } from "@/lib/i18n";
import { getGlobalSettings } from "@/lib/strapi";
import type { GlobalSettings } from "@/lib/strapi";

const REVALIDATE_SECONDS = 60;
const FALLBACK_LOCALE: Locale = "ru";

function errorHtml(locale: Locale): string {
  const message: Record<Locale, string> = {
    ru: "Не удалось загрузить таблицу хода приёма документов. Попробуйте обновить страницу позже.",
    be: "Не ўдалося загрузіць табліцу ходу прыёму дакументаў. Паспрабуйце абнавіць старонку пазней.",
    en: "Could not load the document admission progress table. Please try again later.",
  };
  return `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Sheet unavailable</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 2rem; color: #0f172a; line-height: 1.5; }
  </style>
</head>
<body>
  <p>${message[locale]}</p>
</body>
</html>`;
}

async function fetchGoogleHtml(url: string): Promise<Response> {
  return fetch(url, {
    next: { revalidate: REVALIDATE_SECONDS },
    headers: {
      Accept: "text/html,application/xhtml+xml",
      "User-Agent": "Mozilla/5.0 (compatible; OGKJTBot/1.0; +https://ogkjt.by)",
    },
  });
}

async function loadSettingsWithSheetUrl(locale: Locale): Promise<GlobalSettings | null> {
  const primary = await getGlobalSettings(locale, { revalidateSeconds: REVALIDATE_SECONDS });
  if (getAdmissionSheetPubHtmlBaseUrl(primary)) return primary;

  if (locale !== FALLBACK_LOCALE) {
    const fallback = await getGlobalSettings(FALLBACK_LOCALE, { revalidateSeconds: REVALIDATE_SECONDS });
    if (getAdmissionSheetPubHtmlBaseUrl(fallback)) return fallback;
  }

  return primary;
}

export async function GET(request: NextRequest) {
  const localeParam = request.nextUrl.searchParams.get("locale") ?? "ru";
  const locale: Locale = isValidLocale(localeParam) ? localeParam : "ru";
  const preferredGid = request.nextUrl.searchParams.get("gid");

  const settings = await loadSettingsWithSheetUrl(locale);
  const resolved = await resolveAdmissionSheetHtml(settings, {
    preferredGid,
    fetchImpl: fetchGoogleHtml,
  });

  if (!resolved || resolved.htmlUrl.includes("REPLACE_ME")) {
    return new NextResponse(errorHtml(locale), {
      status: 503,
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
    });
  }

  try {
    const upstream = await fetchGoogleHtml(resolved.htmlUrl);

    if (!upstream.ok) {
      return new NextResponse(errorHtml(locale), {
        status: 502,
        headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
      });
    }

    const html = enhanceAdmissionSheetHtml(await upstream.text(), {
      tabs: resolved.tabs,
      activeGid: resolved.activeGid,
      locale,
    });
    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": `public, s-maxage=${REVALIDATE_SECONDS}, stale-while-revalidate=300`,
        "X-Frame-Options": "SAMEORIGIN",
      },
    });
  } catch {
    return new NextResponse(errorHtml(locale), {
      status: 502,
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
    });
  }
}
