import type { Locale } from "@/lib/i18n";
import type { GlobalSettings, MenuSection } from "@/lib/strapi";

export const admissionCampaignPath = "/applicants/admission-progress";

export const admissionCampaignTitle: Record<Locale, string> = {
  ru: "Ход приёма документов",
  be: "Ход прыёму дакументаў",
  en: "Document admission progress",
};

function parseDate(value?: string | null): Date | null {
  if (!value) return null;
  const trimmed = value.trim();
  const dateOnly = trimmed.match(/^(\d{4}-\d{2}-\d{2})/)?.[1];
  const parsed = new Date(dateOnly ? `${dateOnly}T00:00:00` : trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function normalizeDateRange(start?: string | null, end?: string | null) {
  const parsedStart = parseDate(start);
  const parsedEnd = parseDate(end);
  if (!parsedStart || !parsedEnd) return null;
  if (parsedStart <= parsedEnd) return { start: parsedStart, end: parsedEnd };
  return {
    start: parsedEnd,
    end: parsedStart,
  };
}

export function getAdmissionPeriods(settings?: GlobalSettings | null) {
  const campaign = settings?.admissionCampaign;
  const day = normalizeDateRange(campaign?.dayStartDate, campaign?.dayEndDate);
  const partTime = normalizeDateRange(campaign?.partTimeStartDate, campaign?.partTimeEndDate);
  return { day, partTime };
}

export function isAdmissionCampaignActive(settings?: GlobalSettings | null, date: Date = new Date()): boolean {
  const now = new Date(date);
  now.setHours(0, 0, 0, 0);
  const { day, partTime } = getAdmissionPeriods(settings);
  const inRange = (range: { start: Date; end: Date } | null) => !!range && now >= range.start && now <= range.end;
  return inRange(day) || inRange(partTime);
}

function formatDate(date: Date, locale: Locale): string {
  const localeTag: Record<Locale, string> = {
    ru: "ru-RU",
    be: "be-BY",
    en: "en-GB",
  };
  return date.toLocaleDateString(localeTag[locale]);
}

function getPeriodDays(start: Date, end: Date): number {
  const diff = end.getTime() - start.getTime();
  return Math.floor(diff / (24 * 60 * 60 * 1000)) + 1;
}

export function getAdmissionPeriodsSummary(
  settings: GlobalSettings | null | undefined,
  locale: Locale
): { title: string; value: string }[] {
  const { day, partTime } = getAdmissionPeriods(settings);
  const labels: Record<
    Locale,
    { dayTitle: string; partTimeTitle: string; daysUnit: string }
  > = {
    ru: { dayTitle: "Дневное", partTimeTitle: "Заочное", daysUnit: "дн." },
    be: { dayTitle: "Дзённае", partTimeTitle: "Завочнае", daysUnit: "дз." },
    en: { dayTitle: "Full-time", partTimeTitle: "Part-time", daysUnit: "days" },
  };
  const formatRange = (range: { start: Date; end: Date }) =>
    `${formatDate(range.start, locale)} - ${formatDate(range.end, locale)} (${getPeriodDays(range.start, range.end)} ${
      labels[locale].daysUnit
    })`;

  const lines: { title: string; value: string }[] = [];
  if (day) lines.push({ title: labels[locale].dayTitle, value: formatRange(day) });
  if (partTime) lines.push({ title: labels[locale].partTimeTitle, value: formatRange(partTime) });
  return lines;
}

export function withAdmissionCampaignLink(menu: MenuSection[], locale: Locale, active: boolean): MenuSection[] {
  if (!active) return menu;

  return menu.map((section) => {
    const isApplicantsSection = section.url === "/applicants";
    if (!isApplicantsSection) return section;

    const links = Array.isArray(section.links) ? [...section.links] : [];
    const exists = links.some((link) => link.url === admissionCampaignPath);
    if (!exists) {
      links.unshift({
            id: Number.MAX_SAFE_INTEGER - 2,
            title: admissionCampaignTitle[locale],
            url: admissionCampaignPath,
          });
    }

    return { ...section, links };
  });
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function extractRawSheetUrl(rawValue: string): string {
  const trimmed = rawValue.trim();
  if (!trimmed) return "";
  const iframeSrcMatch = trimmed.match(/src\s*=\s*["']([^"']+)["']/i);
  return decodeHtmlEntities(iframeSrcMatch?.[1] || trimmed);
}

function tryParseUrl(rawValue: string): URL | null {
  try {
    return new URL(extractRawSheetUrl(rawValue));
  } catch {
    return null;
  }
}

export function extractGidFromSheetUrl(rawValue?: string | null): string | null {
  if (!rawValue?.trim()) return null;
  return extractGid(tryParseUrl(rawValue));
}

function extractGid(url: URL | null): string | null {
  if (!url) return null;
  const fromQuery = url.searchParams.get("gid");
  if (fromQuery) return fromQuery;
  const hashMatch = url.hash.match(/(?:^|[&#])gid=(\d+)/);
  return hashMatch?.[1] ?? null;
}

function isGoogleSpreadsheetsUrl(url: URL): boolean {
  return /(^|\.)docs\.google\.com$/i.test(url.hostname) && /\/spreadsheets\//i.test(url.pathname);
}

/** Базовый pubhtml без single=true (single без gid даёт HTTP 400). */
export function getAdmissionSheetPubHtmlBaseUrl(settings?: GlobalSettings | null): string | null {
  const rawEmbed = settings?.admissionCampaign?.sheetUrl?.trim() || "";
  if (!rawEmbed) return null;

  const embedUrl = tryParseUrl(rawEmbed);
  if (!embedUrl || !isGoogleSpreadsheetsUrl(embedUrl)) return null;
  if (!/\/pubhtml/i.test(embedUrl.pathname)) return null;

  const base = new URL(embedUrl.toString());
  base.search = "";
  base.hash = "";
  return base.toString();
}

export function buildAdmissionSheetStaticHtmlUrl(pubHtmlBase: string, gid: string): string {
  const url = new URL(pubHtmlBase);
  url.search = "";
  url.searchParams.set("gid", gid);
  url.searchParams.set("single", "true");
  url.searchParams.set("widget", "false");
  url.searchParams.set("headers", "false");
  return url.toString();
}

/** gid из HTML оболочки pubhtml (порядок вкладок). */
export function extractSheetGidsFromPubHtmlShell(html: string): string[] {
  return extractSheetTabsFromPubHtmlShell(html).map((tab) => tab.gid);
}

/** Вкладки листа: имя + gid из оболочки pubhtml. */
export function extractSheetTabsFromPubHtmlShell(html: string): { name: string; gid: string }[] {
  const pairs = [...html.matchAll(/name:\s*"((?:\\.|[^"\\])*)"[^}]{0,240}gid:\s*"(\d+)"/g)];
  const seen = new Set<string>();
  const tabs: { name: string; gid: string }[] = [];
  for (const match of pairs) {
    const gid = match[2];
    if (seen.has(gid)) continue;
    seen.add(gid);
    tabs.push({ name: decodeJsString(match[1]), gid });
  }
  if (tabs.length > 0) return tabs;

  // fallback: только gid, имена — порядковые
  return extractRawGids(html).map((gid, index) => ({ name: String(index + 1), gid }));
}

function extractRawGids(html: string): string[] {
  const matches = [...html.matchAll(/(?:[?&#]|^|[^a-zA-Z0-9_])gid=(\d+)/g)].map((m) => m[1]);
  return [...new Set(matches)];
}

function decodeJsString(value: string): string {
  return value
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex: string) => String.fromCharCode(Number.parseInt(hex, 16)))
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\");
}

export type ResolveAdmissionSheetResult = {
  htmlUrl: string;
  tabs: { name: string; gid: string }[];
  activeGid: string;
};

/**
 * URL статической HTML-таблицы + список вкладок.
 * preferredGid — выбранная вкладка (?gid=); иначе gid из настроек или первая вкладка.
 */
export async function resolveAdmissionSheetHtml(
  settings?: GlobalSettings | null,
  options: { preferredGid?: string | null; fetchImpl?: typeof fetch } = {}
): Promise<ResolveAdmissionSheetResult | null> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const base = getAdmissionSheetPubHtmlBaseUrl(settings);
  if (!base) return null;

  const rawEmbed = settings?.admissionCampaign?.sheetUrl?.trim() || "";
  const rawOpen = settings?.admissionCampaign?.sheetOpenUrl?.trim() || "";
  const configuredGid =
    extractGid(tryParseUrl(rawEmbed)) ||
    extractGid(tryParseUrl(rawOpen));

  let tabs: { name: string; gid: string }[] = [];
  const probeUrl = new URL(base);
  probeUrl.searchParams.set("widget", "true");
  probeUrl.searchParams.set("headers", "false");
  const probe = await fetchImpl(probeUrl.toString(), {
    headers: {
      Accept: "text/html",
      "User-Agent": "Mozilla/5.0 (compatible; OGKJTBot/1.0; +https://ogkjt.by)",
    },
  });
  if (probe.ok) {
    tabs = extractSheetTabsFromPubHtmlShell(await probe.text());
  }

  const preferred = options.preferredGid?.trim() || "";
  const activeGid =
    (preferred && tabs.some((t) => t.gid === preferred) ? preferred : null) ||
    (preferred && !tabs.length ? preferred : null) ||
    configuredGid ||
    tabs[0]?.gid ||
    null;

  if (!activeGid) return null;
  if (!tabs.length) {
    tabs = [{ name: "1", gid: activeGid }];
  }

  return {
    htmlUrl: buildAdmissionSheetStaticHtmlUrl(base, activeGid),
    tabs,
    activeGid,
  };
}

/**
 * URL статической HTML-таблицы для прокси.
 * При отсутствии gid сначала читает оболочку pubhtml и берёт первую вкладку.
 */
export async function resolveAdmissionSheetHtmlUrl(
  settings?: GlobalSettings | null,
  fetchImpl: typeof fetch = fetch,
  preferredGid?: string | null
): Promise<string | null> {
  const resolved = await resolveAdmissionSheetHtml(settings, { preferredGid, fetchImpl });
  return resolved?.htmlUrl ?? null;
}

/**
 * Синхронный URL (если gid уже известен). Без gid — оболочка widget (не для CSS-доработки).
 * Для прокси предпочтителен resolveAdmissionSheetHtmlUrl.
 */
export function getAdmissionSheetFetchUrl(settings?: GlobalSettings | null): string {
  const base = getAdmissionSheetPubHtmlBaseUrl(settings);
  if (!base) {
    const rawEmbed = settings?.admissionCampaign?.sheetUrl?.trim() || "";
    if (!rawEmbed) return "https://docs.google.com/spreadsheets/d/e/REPLACE_ME/pubhtml";
    return extractRawSheetUrl(rawEmbed);
  }

  const rawEmbed = settings?.admissionCampaign?.sheetUrl?.trim() || "";
  const rawOpen = settings?.admissionCampaign?.sheetOpenUrl?.trim() || "";
  const gid = extractGid(tryParseUrl(rawEmbed)) || extractGid(tryParseUrl(rawOpen));
  if (gid) return buildAdmissionSheetStaticHtmlUrl(base, gid);

  const shell = new URL(base);
  shell.searchParams.set("widget", "true");
  shell.searchParams.set("headers", "false");
  return shell.toString();
}

/** Same-origin страница таблицы: iframe и «открыть в новой вкладке» (без диалога приложений на мобильных). */
export function getAdmissionSheetViewPath(locale: Locale = "ru"): string {
  return `/api/admission-sheet?locale=${locale}`;
}

export function getAdmissionSheetUrl(settings?: GlobalSettings | null): string {
  return getAdmissionSheetFetchUrl(settings);
}

/**
 * Ссылка для открытия в браузере (не /edit и не .xlsx — иначе Android предлагает «Открыть с помощью»).
 * Предпочтительно same-origin view; эта функция — Google fallback.
 */
export function getAdmissionSheetOpenUrl(settings?: GlobalSettings | null): string {
  const fetchUrl = getAdmissionSheetFetchUrl(settings);
  const rawOpen = settings?.admissionCampaign?.sheetOpenUrl?.trim() || "";
  const openUrl = rawOpen ? tryParseUrl(rawOpen) : null;

  if (openUrl && isGoogleSpreadsheetsUrl(openUrl)) {
    const gid = extractGid(openUrl);
    if (/\/(edit|preview)/i.test(openUrl.pathname)) {
      const idMatch = openUrl.pathname.match(/\/spreadsheets\/d\/([^/]+)/i);
      if (idMatch?.[1] && idMatch[1] !== "e") {
        const htmlview = new URL(`https://docs.google.com/spreadsheets/d/${idMatch[1]}/htmlview`);
        if (gid) htmlview.searchParams.set("gid", gid);
        return htmlview.toString();
      }
    }
    if (/\/pubhtml/i.test(openUrl.pathname) || /\/htmlview/i.test(openUrl.pathname)) {
      return decodeHtmlEntities(openUrl.toString());
    }
  }

  return fetchUrl;
}
