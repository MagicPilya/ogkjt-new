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

export function getAdmissionSheetUrl(settings?: GlobalSettings | null): string {
  const rawValue = settings?.admissionCampaign?.sheetUrl?.trim() || "";
  if (!rawValue) return "https://docs.google.com/spreadsheets/d/e/REPLACE_ME/pubhtml";

  const iframeSrcMatch = rawValue.match(/src\s*=\s*["']([^"']+)["']/i);
  if (iframeSrcMatch?.[1]) return iframeSrcMatch[1];

  return rawValue;
}

export function getAdmissionSheetOpenUrl(settings?: GlobalSettings | null): string {
  return settings?.admissionCampaign?.sheetOpenUrl?.trim() || getAdmissionSheetUrl(settings);
}
