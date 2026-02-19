import { Logo } from "./Logo";
import { GlobalSettings, MenuSection } from "@/lib/strapi";
import { collegeNamesFallback, siteDefaults } from "@/lib/site-defaults";
import type { Locale } from "@/lib/i18n";
import { uiStrings } from "@/lib/ui-strings";
import Link from "next/link";

/* Брендовые иконки соцсетей (SVG) */
const TelegramIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
);
const InstagramIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
);
const TikTokIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
);
/* Официальный логотип VK (ВКонтакте), брендовый синий #0077FF */
const VKIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4.03 8.57 4.03 8.096c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.677.863 2.49 2.303 4.675 3.118 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.203.17-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.254-1.406 2.151-3.574 2.151-3.574.119-.254.322-.491.763-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.49-.085.744-.576.744z" />
    </svg>
);

interface FooterProps {
  settings?: GlobalSettings | null;
  menu?: MenuSection[] | null;
  locale?: Locale;
}

const fallbackResources: Record<Locale, Array<{ title: string; url: string }>> = {
  ru: [
    { title: "Сайт Президента РБ", url: "https://president.gov.by" },
    { title: "Министерство образования", url: "https://edu.gov.by" },
    { title: "Белорусская железная дорога", url: "https://rw.by" },
    { title: "Обращения.бел", url: "https://обращения.бел" },
  ],
  be: [
    { title: "Сайт Прэзідэнта РБ", url: "https://president.gov.by" },
    { title: "Міністэрства адукацыі", url: "https://edu.gov.by" },
    { title: "Беларуская чыгунка", url: "https://rw.by" },
    { title: "Звароты.бел", url: "https://обращения.бел" },
  ],
  en: [
    { title: "President of Belarus", url: "https://president.gov.by" },
    { title: "Ministry of Education", url: "https://edu.gov.by" },
    { title: "Belarusian Railway", url: "https://rw.by" },
    { title: "Appeals.bel", url: "https://обращения.бел" },
  ],
};

export function Footer({ settings, menu, locale = "ru" }: FooterProps) {
  const fallback = collegeNamesFallback[locale];
  const address = settings?.address || siteDefaults.address;
  const phoneReception = settings?.phoneReception || siteDefaults.phoneReception;
  const phoneDirector = settings?.phoneDirector || siteDefaults.phoneDirector;
  const email = settings?.email || siteDefaults.email;
  const fullCollegeName = settings?.collegeFullName || fallback.full;
  const shortCollegeName = settings?.collegeShortName || fallback.short;
  const logoLine1 = settings?.collegeMainName || fallback.main;
  const logoLine2 = settings?.collegeBranchShortName || fallback.branchShort;
  const resourcesRaw = settings?.resources as unknown;
  const normalizedResources = Array.isArray(resourcesRaw)
    ? resourcesRaw
        .map((item) => {
          const entry = item as
            | { title?: string; url?: string; attributes?: { title?: string; url?: string } }
            | null
            | undefined;
          const title = entry?.title || entry?.attributes?.title;
          const url = entry?.url || entry?.attributes?.url;
          return title && url ? { title, url } : null;
        })
        .filter((item): item is { title: string; url: string } => Boolean(item))
    : [];
  const resources = normalizedResources.length > 0 ? normalizedResources : fallbackResources[locale];
  const navigation = (menu ?? []).filter((item) => !!item.url);
  const prefix = (url: string) => (url?.startsWith("/") ? `/${locale}${url}` : `/${locale}/${url}`);

  return (
    <footer className="bg-slate-50 border-t dark:bg-slate-950">
      <div className="w-full px-4 md:px-8 max-w-[1600px] mx-auto py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          <div className="col-span-1 md:col-span-1 flex flex-col items-center justify-center w-full">
            <Logo
              variant="footer"
              locale={locale}
              line1={logoLine1}
              line2={logoLine2}
              fullName={fullCollegeName}
              shortName={shortCollegeName}
            />

                        {/* Соцсети */}
            <h3 className="font-semibold mt-6 mb-3 text-lg text-slate-700 dark:text-slate-300">
              {uiStrings.footerFollowUs[locale]}
            </h3>
            <div className="flex gap-4 justify-center">
              {settings?.instagramLink && (
                <a href={settings.instagramLink} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-pink-600 transition-colors" aria-label="Instagram">
                  <InstagramIcon className="h-6 w-6" />
                </a>
              )}
              {settings?.telegramLink && (
                <a href={settings.telegramLink} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#0088cc] transition-colors" aria-label="Telegram">
                  <TelegramIcon className="h-6 w-6" />
                </a>
              )}
              {settings?.tiktokLink && (
                <a href={settings.tiktokLink} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-black dark:hover:text-white transition-colors" aria-label="TikTok">
                  <TikTokIcon className="h-6 w-6" />
                </a>
              )}
              {settings?.vkLink && (
                <a href={settings.vkLink} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#0077FF] transition-colors" aria-label="ВКонтакте">
                  <VKIcon className="h-6 w-6" />
                </a>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center">
            <h3 className="font-semibold mb-4 text-lg">{uiStrings.footerNavigation[locale]}</h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              {navigation.map((item) => (
                <li key={item.id}>
                  <Link href={prefix(item.url || "/")} className="hover:text-blue-600">
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col items-center">
            <h3 className="font-semibold mb-4 text-lg">{uiStrings.footerResources[locale]}</h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              {resources.map((resource, index) => (
                <li key={`${resource.url}-${index}`}>
                  <a href={resource.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                    {resource.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col items-center">
            <h3 className="font-semibold mb-4 text-lg">{uiStrings.footerContacts[locale]}</h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>{address}</li>
              <li>
                <span className="block text-xs text-slate-400">{uiStrings.receptionLabel[locale]}</span>
                <a href={`tel:${phoneReception}`} className="hover:text-blue-600">{phoneReception}</a>
              </li>
              {phoneDirector && (
                <li>
                  <span className="block text-xs text-slate-400">{uiStrings.directorLabel[locale]}</span>
                  <a href={`tel:${phoneDirector}`} className="hover:text-blue-600">{phoneDirector}</a>
                </li>
              )}
              <li>
                <a href={`mailto:${email}`} className="hover:text-blue-600">{email}</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800 text-center text-sm text-slate-500 dark:text-slate-400">
          {uiStrings.footerYearPrefix[locale]} {new Date().getFullYear()} {fullCollegeName}. {uiStrings.allRightsReserved[locale]}
        </div>
      </div>
    </footer>
  );
}
