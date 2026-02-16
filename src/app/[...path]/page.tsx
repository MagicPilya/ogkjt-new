import { Metadata } from "next";
import { notFound } from "next/navigation";
import SectionPage, { getSectionPageMetadata } from "@/components/layout/SectionPage";

interface Props {
  params: Promise<{ path?: string[] }>;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { path: pathSegments } = await params;
  const path = pathSegments?.join("/") ?? "";
  if (!path) return {};
  const { title, description } = await getSectionPageMetadata(path);
  return { title, description };
}

export default async function CatchAllSectionPage({ params }: Props) {
  const { path: pathSegments } = await params;
  const path = pathSegments?.join("/") ?? "";
  if (!path) notFound();
  return <SectionPage path={path} />;
}
