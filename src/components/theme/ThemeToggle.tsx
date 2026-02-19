"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "./ThemeProvider";
import type { Locale } from "@/lib/i18n";
import { uiStrings } from "@/lib/ui-strings";

export function ThemeToggle({ locale = "ru" }: { locale?: Locale }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 text-slate-600 dark:text-slate-300"
      onClick={toggleTheme}
      aria-label={
        theme === "dark"
          ? uiStrings.switchToLightTheme[locale]
          : uiStrings.switchToDarkTheme[locale]
      }
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 sm:mr-2" />
      ) : (
        <Moon className="h-4 w-4 sm:mr-2" />
      )}
      <span className="hidden sm:inline">
        {theme === "dark" ? uiStrings.lightTheme[locale] : uiStrings.darkTheme[locale]}
      </span>
    </Button>
  );
}
