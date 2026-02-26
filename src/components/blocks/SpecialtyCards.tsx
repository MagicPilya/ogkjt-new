import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { SpecialtyItem } from "@/lib/strapi";
import { uiStrings } from "@/lib/ui-strings";
import type { Locale } from "@/lib/i18n";

interface SpecialtyCardsProps {
  items: SpecialtyItem[] | null | undefined;
  locale?: Locale;
}

/** Сетка карточек специальностей (название, шифр, специализации, квалификация, профессии рабочего). */
export function SpecialtyCards({ items, locale = "ru" }: SpecialtyCardsProps) {
  if (!items || items.length === 0) return null;

  const codeLabel = uiStrings.specialtyCode[locale];
  const specLabel = uiStrings.specialtySpecialization[locale];
  const qualLabel = uiStrings.specialtyQualification[locale];
  const workerLabel = uiStrings.specialtyWorkerProfession[locale];

  return (
    <section className="mt-14 mb-10" aria-label={specLabel}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, index) => {
          const specializations = item.specializations ?? [];
          const workerProfessions = item.workerProfessions ?? [];
          return (
            <Card
              key={item.code ?? item.name + index}
              className="overflow-hidden flex flex-col hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-2">
                <p className="font-semibold text-lg text-slate-900 dark:text-slate-100 leading-tight">
                  {item.name}
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  {codeLabel}: {item.code}
                </p>
              </CardHeader>
              <CardContent className="pt-0 flex-1 space-y-3">
                {specializations.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
                      {specLabel}
                    </p>
                    <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-0.5">
                      {specializations.map((s, i) => (
                        <li key={i}>
                          {s.name} — {s.code}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {item.qualification?.trim() && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
                      {qualLabel}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line">
                      {item.qualification.trim()}
                    </p>
                  </div>
                )}
                {workerProfessions.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
                      {workerLabel}
                    </p>
                    <ul className="text-sm text-slate-600 dark:text-slate-400 list-disc list-inside space-y-0.5">
                      {workerProfessions.map((w, i) => (
                        <li key={i}>{w.title}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
