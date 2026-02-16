import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getStrapiMedia } from "@/lib/utils";
import type { AdministrationMember } from "@/lib/strapi";
import Image from "next/image";

interface AdministrationCardsProps {
  members: AdministrationMember[] | null | undefined;
}

/** Сетка карточек сотрудников администрации (ФИО, должность, контакты, фото). */
export function AdministrationCards({ members }: AdministrationCardsProps) {
  if (!members || members.length === 0) return null;

  return (
    <section className="mt-14 mb-10" aria-label="Администрация">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {members.map((member, index) => {
          const photo = member.photo as { url?: string; alternativeText?: string | null; data?: { url?: string; attributes?: { url?: string; alternativeText?: string } } } | null | undefined;
          const photoUrl = getStrapiMedia(
            photo?.url ?? photo?.data?.url ?? photo?.data?.attributes?.url ?? null
          );
          const photoAlt = photo?.alternativeText ?? photo?.data?.attributes?.alternativeText ?? member.fullName;
          return (
            <Card
              key={member.documentId ?? member.fullName + index}
              className="overflow-hidden flex flex-col hover:shadow-md transition-shadow"
            >
              <div className="relative aspect-[3/4] w-full bg-slate-100 dark:bg-slate-800">
                {photoUrl ? (
                  <Image
                    src={photoUrl}
                    alt={photoAlt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm">
                    Нет фото
                  </div>
                )}
              </div>
              <CardHeader className="pb-2">
                <p className="font-semibold text-lg text-slate-900 dark:text-slate-100 leading-tight">
                  {member.fullName}
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  {member.position}
                </p>
              </CardHeader>
              {member.contacts?.trim() ? (
                <CardContent className="pt-0 flex-1">
                  <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line">
                    {member.contacts.trim()}
                  </p>
                </CardContent>
              ) : null}
            </Card>
          );
        })}
      </div>
    </section>
  );
}
