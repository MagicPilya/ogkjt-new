"use client";

import { useEffect } from "react";
import type { Locale } from "@/lib/i18n";

const LANG_MAP: Record<Locale, string> = {
  ru: "ru",
  be: "be",
  en: "en",
};

export function HtmlLang({ locale }: { locale: Locale }) {
  useEffect(() => {
    document.documentElement.setAttribute("lang", LANG_MAP[locale] ?? "ru");
  }, [locale]);
  return null;
}
