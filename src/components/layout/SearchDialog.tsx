"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Loader2, FileText, Newspaper, Users, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { SearchResultItem } from "@/app/api/search/route";

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;
const PLACEHOLDER_MOBILE = "Поиск (2+ символа)";
const PLACEHOLDER_DESKTOP = "Введите запрос (минимум 2 символа)...";
const PLACEHOLDER_BREAKPOINT_PX = 768;

/** Экранирует спецсимволы для RegExp. */
function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Разбивает текст по запросу (регистронезависимо) и выделяет совпадения <mark>. */
function highlightSnippet(snippet: string, query: string): React.ReactNode[] {
  if (!query.trim()) return [snippet];
  const re = new RegExp(`(${escapeRegex(query)})`, "gi");
  const parts = snippet.split(re);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} className="rounded bg-amber-200/80 dark:bg-amber-500/40 px-0.5 font-medium">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export function SearchDialog() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [debouncedQuery, setDebouncedQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResultItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [placeholder, setPlaceholder] = React.useState(PLACEHOLDER_MOBILE);

  React.useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${PLACEHOLDER_BREAKPOINT_PX}px)`);
    const update = () => setPlaceholder(mql.matches ? PLACEHOLDER_DESKTOP : PLACEHOLDER_MOBILE);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  React.useEffect(() => {
    if (!query.trim()) {
      setDebouncedQuery("");
      return;
    }
    const t = setTimeout(() => setDebouncedQuery(query.trim()), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query]);

  React.useEffect(() => {
    if (debouncedQuery.length < MIN_QUERY_LENGTH) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && Array.isArray(data.results)) setResults(data.results);
      })
      .catch(() => {
        if (!cancelled) setResults([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setQuery("");
      setDebouncedQuery("");
      setResults([]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-slate-600 dark:text-slate-300"
        >
          <Search className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Поиск</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl pr-12">
        <DialogTitle className="sr-only">Поиск по сайту</DialogTitle>
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder={placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
              autoFocus
              autoComplete="off"
              aria-label="Поиск"
            />
          </div>

          <div className="max-h-[70vh] overflow-y-auto rounded-md border bg-muted/30 p-2">
            {debouncedQuery.length > 0 && debouncedQuery.length < MIN_QUERY_LENGTH && (
              <p className="px-2 py-4 text-sm text-muted-foreground">
                Введите минимум {MIN_QUERY_LENGTH} символа
              </p>
            )}
            {debouncedQuery.length >= MIN_QUERY_LENGTH && loading && (
              <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">Поиск...</span>
              </div>
            )}
            {debouncedQuery.length >= MIN_QUERY_LENGTH && !loading && results.length === 0 && (
              <p className="px-2 py-8 text-center text-sm text-muted-foreground">
                Ничего не найдено
              </p>
            )}
            {!loading && results.length > 0 && (
              <ul className="flex flex-col gap-1">
                {results.map((item) => (
                  <li key={`${item.type}-${item.id}`}>
                    <Link
                      href={item.url}
                      onClick={() => setOpen(false)}
                      className="flex gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none min-w-0"
                    >
                      {item.type === "article" ? (
                        <Newspaper className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                      ) : item.type === "administration" ? (
                        <Users className="mt-0.5 h-4 w-4 shrink-0 text-violet-600 dark:text-violet-400" />
                      ) : item.type === "specialty" ? (
                        <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <FileText className="mt-0.5 h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400" />
                      )}
                      <div className="min-w-0 flex-1 min-h-0 max-w-full">
                        <div className="font-medium break-words" title={item.title}>
                          {item.title}
                        </div>
                        {item.snippet && (
                          <div className="mt-0.5 text-xs text-muted-foreground break-words w-full [overflow-wrap:anywhere]">
                            {highlightSnippet(item.snippet, debouncedQuery)}
                          </div>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
