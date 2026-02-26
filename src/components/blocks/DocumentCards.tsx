import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FileText } from "lucide-react";
import type { AdmissionDocuments } from "@/lib/strapi";
import { uiStrings } from "@/lib/ui-strings";
import type { Locale } from "@/lib/i18n";

interface DocumentCardsProps {
  data: AdmissionDocuments | null | undefined;
  locale?: Locale;
}

/** Две карточки документов приёмной комиссии: Очная форма и Заочная форма — каждая со списком названий документов. */
export function DocumentCards({ data, locale = "ru" }: DocumentCardsProps) {
  if (!data) return null;

  const fullTime = data.fullTimeItems ?? [];
  const partTime = data.partTimeItems ?? [];
  const fullTimeBase = data.fullTimeBase?.trim();
  const partTimeBase = data.partTimeBase?.trim();

  const fullTimeTitle = uiStrings.admissionDocumentsFullTime[locale];
  const partTimeTitle = uiStrings.admissionDocumentsPartTime[locale];
  const baseLabel = uiStrings.admissionDocumentsBase[locale];

  return (
    <section className="mt-14 mb-10" aria-label={fullTimeTitle}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="overflow-hidden flex flex-col border-2 border-blue-100 dark:border-blue-900/50 hover:shadow-lg transition-shadow">
          <CardHeader className="bg-blue-50/80 dark:bg-blue-950/30 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
                <FileText className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {fullTimeTitle}
              </h2>
            </div>
            {fullTimeBase ? (
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {baseLabel}: {fullTimeBase}
              </p>
            ) : null}
          </CardHeader>
          <CardContent className="pt-6 flex-1">
            {fullTime.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Список документов будет добавлен.
              </p>
            ) : (
              <ul className="list-disc list-outside pl-6 space-y-2">
                {fullTime.map((item, index) => (
                  <li key={item.id ?? index} className="text-slate-700 dark:text-slate-300">
                    {item.name}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden flex flex-col border-2 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
          <CardHeader className="bg-slate-50/80 dark:bg-slate-900/30 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-600 text-white">
                <FileText className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {partTimeTitle}
              </h2>
            </div>
            {partTimeBase ? (
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {baseLabel}: {partTimeBase}
              </p>
            ) : null}
          </CardHeader>
          <CardContent className="pt-6 flex-1">
            {partTime.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Список документов будет добавлен.
              </p>
            ) : (
              <ul className="list-disc list-outside pl-6 space-y-2">
                {partTime.map((item, index) => (
                  <li key={item.id ?? index} className="text-slate-700 dark:text-slate-300">
                    {item.name}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
