import { NextRequest, NextResponse } from "next/server";
import { getArticleBreadcrumbTitle } from "@/lib/breadcrumb-article-title";
import { isValidLocale } from "@/lib/i18n";
import { normalizeMenu } from "@/lib/menu-sections";
import { getMenu } from "@/lib/strapi";

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get("path")?.trim() ?? "";
  const localeParam = request.nextUrl.searchParams.get("locale") ?? "ru";

  if (!path || !isValidLocale(localeParam)) {
    return NextResponse.json({ title: null });
  }

  const menuData = await getMenu(localeParam);
  const menu = normalizeMenu(menuData?.mainMenu, localeParam) ?? [];
  const title = await getArticleBreadcrumbTitle(path, localeParam, menu);

  return NextResponse.json({ title });
}
