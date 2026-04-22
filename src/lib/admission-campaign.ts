import type { Locale } from "@/lib/i18n";
import type { GlobalSettings, MenuSection } from "@/lib/strapi";

export const admissionCampaignPath = "/applicants/admission-progress";

export const admissionCampaignTitle: Record<Locale, string> = {
  ru: "Ход приёма документов",
  be: "Ход приёма документов",
  en: "Ход приёма документов",
};

function parseDate(value?: string | null): Date | null {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00`);
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
  const day = normalizeDateRange(settings?.admissionDayStartDate, settings?.admissionDayEndDate);
  const partTime = normalizeDateRange(settings?.admissionPartTimeStartDate, settings?.admissionPartTimeEndDate);
  return { day, partTime };
}

export function isAdmissionCampaignActive(settings?: GlobalSettings | null, date: Date = new Date()): boolean {
  const now = new Date(date);
  now.setHours(0, 0, 0, 0);
  const { day, partTime } = getAdmissionPeriods(settings);
  const inRange = (range: { start: Date; end: Date } | null) => !!range && now >= range.start && now <= range.end;
  return inRange(day) || inRange(partTime);
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("ru-RU");
}

function getPeriodDays(start: Date, end: Date): number {
  const diff = end.getTime() - start.getTime();
  return Math.floor(diff / (24 * 60 * 60 * 1000)) + 1;
}

export function getAdmissionPeriodsSummary(settings?: GlobalSettings | null): { title: string; value: string }[] {
  const { day, partTime } = getAdmissionPeriods(settings);
  const formatRange = (range: { start: Date; end: Date }) =>
    `${formatDate(range.start)} - ${formatDate(range.end)} (${getPeriodDays(range.start, range.end)} дн.)`;

  const lines: { title: string; value: string }[] = [];
  if (day) lines.push({ title: "Дневное", value: formatRange(day) });
  if (partTime) lines.push({ title: "Заочное", value: formatRange(partTime) });
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
        id: Number.MAX_SAFE_INTEGER - 1,
        title: admissionCampaignTitle[locale],
        url: admissionCampaignPath,
      });
    }

    return { ...section, links };
  });
}

export function getAdmissionSheetUrl(settings?: GlobalSettings | null): string {
  const rawValue = settings?.admissionSheetUrl?.trim() || "";
  if (!rawValue) return "https://docs.google.com/spreadsheets/d/e/REPLACE_ME/pubhtml";

  const iframeSrcMatch = rawValue.match(/src\s*=\s*["']([^"']+)["']/i);
  if (iframeSrcMatch?.[1]) return iframeSrcMatch[1];

  return rawValue;
}

export function getAdmissionSheetOpenUrl(settings?: GlobalSettings | null): string {
  return settings?.admissionSheetOpenUrl?.trim() || getAdmissionSheetUrl(settings);
}

export function getAdmissionSheetDownloadUrl(settings?: GlobalSettings | null): string {
  const explicitValue = settings?.admissionSheetDownloadUrl?.trim();
  if (explicitValue) return explicitValue;

  const sheetUrl = getAdmissionSheetUrl(settings);
  const match = sheetUrl.match(/docs\.google\.com\/spreadsheets\/d\/([^/]+)/i);
  if (!match?.[1]) return sheetUrl;

  return `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=xlsx`;
}
