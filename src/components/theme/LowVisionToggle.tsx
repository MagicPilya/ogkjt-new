"use client";

import * as React from "react";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/i18n";
import { uiStrings } from "@/lib/ui-strings";

export const LOW_VISION_STORAGE_KEY = "a11y-low-vision";

function getStored(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(LOW_VISION_STORAGE_KEY) === "1";
}

function applyLowVision(enabled: boolean) {
  const root = document.documentElement;
  if (enabled) {
    root.setAttribute("data-a11y", "low-vision");
    localStorage.setItem(LOW_VISION_STORAGE_KEY, "1");
  } else {
    root.removeAttribute("data-a11y");
    localStorage.removeItem(LOW_VISION_STORAGE_KEY);
  }
}

export function LowVisionToggle({ locale = "ru" }: { locale?: Locale }) {
  const [active, setActive] = React.useState(false);

  React.useEffect(() => {
    const stored = getStored();
    setActive(stored);
    if (stored) applyLowVision(true);
  }, []);

  const toggle = React.useCallback(() => {
    setActive((prev) => {
      const next = !prev;
      applyLowVision(next);
      return next;
    });
  }, []);

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={toggle}
      aria-label={active ? uiStrings.disableLowVision[locale] : uiStrings.enableLowVision[locale]}
      aria-pressed={active}
      className="h-11 min-h-[44px] min-w-[44px] px-3 sm:px-4 3xl:h-12 4xl:h-14 3xl:text-sm 4xl:text-lg 4xl:px-5 text-slate-600 dark:text-slate-300 focus-visible:ring-2 focus-visible:ring-offset-2"
    >
      <Eye className="mr-2 h-4 w-4 3xl:h-5 3xl:w-5 4xl:h-6 4xl:w-6 shrink-0" aria-hidden />
      <span className="hidden md:inline header-tool-label">{uiStrings.lowVisionLabel[locale]}</span>
    </Button>
  );
}
