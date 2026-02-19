import { Metadata } from "next";
import { notFound } from "next/navigation";
import SectionPage, { getSectionPageMetadata } from "@/components/layout/SectionPage";
import type { Locale } from "@/lib/i18n";

interface Props {
  params: Promise<{ path?: string[]; locale: Locale }>;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { path: pathSegments, locale } = await params;
  const path = pathSegments?.join("/") ?? "";
  if (!path) return {};
  const { title, description } = await getSectionPageMetadata(path, locale);
  return { title, description };
}

export default async function CatchAllSectionPage({ params }: Props) {
  const { path: pathSegments, locale } = await params;
  const path = pathSegments?.join("/") ?? "";
  if (!path) notFound();
  return <SectionPage path={path} locale={locale} />;
}
