"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

function shouldTrackLinkClick(event: MouseEvent): HTMLAnchorElement | null {
  if (event.defaultPrevented || event.button !== 0) return null;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return null;

  const target = event.target;
  if (!(target instanceof Element)) return null;

  const link = target.closest("a");
  if (!(link instanceof HTMLAnchorElement)) return null;
  if (!link.href) return null;
  if (link.hasAttribute("download")) return null;

  const linkTarget = link.getAttribute("target");
  if (linkTarget && linkTarget !== "_self") return null;

  return link;
}

export function RouteChangeIndicator() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const link = shouldTrackLinkClick(event);
      if (!link) return;

      const nextUrl = new URL(link.href, window.location.href);
      const currentUrl = new URL(window.location.href);

      if (nextUrl.origin !== currentUrl.origin) return;
      if (nextUrl.pathname === currentUrl.pathname && nextUrl.search === currentUrl.search) return;

      setIsLoading(true);
    };

    const onPopState = () => {
      setIsLoading(true);
    };

    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPopState);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed left-0 top-0 z-[100] h-0.5 w-full bg-transparent transition-opacity duration-150",
        isLoading ? "opacity-100" : "opacity-0"
      )}
    >
      <div className="h-full w-full origin-left bg-gradient-to-r from-blue-500 via-sky-400 to-blue-500 animate-pulse" />
    </div>
  );
}
