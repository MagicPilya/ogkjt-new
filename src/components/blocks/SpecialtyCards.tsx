import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { SpecialtyItem } from "@/lib/strapi";

interface SpecialtyCardsProps {
  items: SpecialtyItem[] | null | undefined;
}

/** Сетка карточек специальностей (название, шифр, специализации, квалификация, профессии рабочего). */
export function SpecialtyCards({ items }: SpecialtyCardsProps) {
  if (!items || items.length === 0) return null;

  return (
    <section className="mt-14 mb-10" aria-label="Специальности">
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
                  Шифр: {item.code}
                </p>
              </CardHeader>
              <CardContent className="pt-0 flex-1 space-y-3">
                {specializations.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
                      Специализация
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
                      Квалификация специалиста
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line">
                      {item.qualification.trim()}
                    </p>
                  </div>
                )}
                {workerProfessions.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
                      Профессия рабочего
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
