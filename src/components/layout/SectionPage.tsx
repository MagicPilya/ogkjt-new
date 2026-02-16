import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { getMenu, getPageByPath, getArticles } from "@/lib/strapi";
import { defaultMenu, normalizeMenu, getSectionByPath, getTitleForPath } from "@/lib/menu-sections";
import { SubSectionLinks } from "@/components/blocks/SubSectionLinks";
import { ContentBlocks } from "@/components/blocks/ContentBlocks";
import { Events } from "@/components/blocks/Events";
import { formatDate, getStrapiMedia } from "@/lib/utils";

const SITE_TITLE = "Оршанский колледж – филиал БелГУТа";

interface SectionPageProps {
  /** Путь без ведущего слэша, например about, about/administration */
  path: string;
}

export default async function SectionPage({ path }: SectionPageProps) {
  const pathname = "/" + path;
  const menuData = await getMenu();
  const menu = normalizeMenu(menuData?.mainMenu) ?? defaultMenu;
  const sectionResult = getSectionByPath(pathname, menu);
  if (!sectionResult) notFound();

  const { section, sectionUrl, isRootSection } = sectionResult;
  const pageData = await getPageByPath(path);
  const feedSection = pageData?.articleFeedSection;
  const showArticleFeed = !!feedSection && feedSection !== "Не показывать";
  const { data: articles } = showArticleFeed
    ? await getArticles(1, 50, feedSection)
    : { data: [] };

  const title = pageData?.title ?? getTitleForPath(pathname, menu);

  return (
    <div className="w-full px-4 md:px-8 max-w-[1600px] mx-auto py-12">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-4">
          {title}
        </h1>
        {pageData?.content && pageData.content.length > 0 ? (
          <div className="prose prose-slate dark:prose-invert max-w-3xl mx-auto text-left">
            <ContentBlocks blocks={pageData.content} className="text-lg text-slate-600 dark:text-slate-400" />
          </div>
        ) : null}
      </div>

      {isRootSection && section.links && section.links.length > 0 && (
        <SubSectionLinks
          links={section.links}
          title="Подразделы"
          variant="cards"
          className="mb-10"
        />
      )}

      {showArticleFeed && (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12">
        <div className="lg:col-span-8 xl:col-span-9">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {articles.map((item) => {
              const imageUrl = getStrapiMedia(item.cover?.url || null);
              return (
                <Card key={item.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow text-center">
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={item.cover?.alternativeText || item.title}
                        loading="lazy"
                        className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        Нет фото
                      </div>
                    )}
                  </div>
                  <CardHeader>
                    <div className="flex items-center justify-center text-sm text-slate-500 mb-2">
                      <Calendar className="mr-2 h-4 w-4" />
                      {item.date ? formatDate(item.date) : "Без даты"}
                    </div>
                    <CardTitle className="line-clamp-2 hover:text-blue-600 transition-colors">
                      <Link href={`/news/${item.slug}`}>
                        {item.title}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-slate-600 dark:text-slate-400 line-clamp-3">
                      {item.announcement}
                    </p>
                  </CardContent>
                  <CardFooter className="justify-center">
                    <Button variant="link" className="p-0 h-auto font-semibold text-blue-600" asChild>
                      <Link href={`/news/${item.slug}`}>
                        Читать далее
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-4 xl:col-span-3">
          <Events />
        </div>
      </div>
      )}
    </div>
  );
}

export async function getSectionPageMetadata(path: string) {
  const pathname = "/" + path.replace(/^\//, "").trim();
  const menuData = await getMenu();
  const menu = normalizeMenu(menuData?.mainMenu) ?? defaultMenu;
  const pageData = await getPageByPath(path);
  const menuTitle = pageData?.title ?? getTitleForPath(pathname, menu);
  const title = `${menuTitle} | ${SITE_TITLE}`;
  const description =
    pageData?.metaDescription ??
    (pageData?.content && Array.isArray(pageData.content)
      ? extractTextFromBlocks(pageData.content).slice(0, 160)
      : undefined);
  return { title, description };
}

function extractTextFromBlocks(blocks: any[]): string {
  let text = "";
  for (const block of blocks) {
    if (block.children) {
      for (const child of block.children) {
        if (child.text) text += child.text;
        if (child.children) {
          for (const c of child.children) if (c.text) text += c.text;
        }
      }
    }
  }
  return text.trim();
}
