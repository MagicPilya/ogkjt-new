import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLocale, isValidLocale } from "@/lib/i18n";

/**
 * Next.js 16: логика локалей перенесена в proxy.
 * Редирект / → /ru и добавление локали к путям без префикса (ru, be, en).
 */
export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];

  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  if (pathname === "/" || pathname === "") {
    return NextResponse.redirect(new URL(`/${defaultLocale}`, request.url));
  }

  if (isValidLocale(first)) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL(`/${defaultLocale}${pathname}`, request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
