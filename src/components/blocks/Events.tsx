import { Card } from "@/components/ui/card";
import { MapPin, Clock } from "lucide-react";
import { getEvents, getEventsInRange } from "@/lib/strapi";
import { translateEventList } from "@/lib/translateEvent";
import Link from "next/link";
import { EventsCalendar } from "./EventsCalendar";
import { uiStrings } from "@/lib/ui-strings";
import { defaultLocale, type Locale } from "@/lib/i18n";

const INTL_LOCALE: Record<Locale, string> = { ru: "ru-RU", be: "be-BY", en: "en-US" };

function getMonthWithDayCase(date: Date, locale: string) {
  const formatter = new Intl.DateTimeFormat(locale, { day: "numeric", month: "long" });
  const monthPart = formatter.formatToParts(date).find((part) => part.type === "month");
  return monthPart?.value ?? date.toLocaleString(locale, { month: "long" });
}

function formatYYYYMMDD(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function Events({ locale }: { locale?: Locale }) {
  const now = new Date();
  const calendarStart = new Date(now.getFullYear(), now.getMonth() - 3, 1);
  const calendarEnd = new Date(now.getFullYear(), now.getMonth() + 3, 0);
  const intlLocale = locale ? INTL_LOCALE[locale] : "ru-RU";

  const [{ data: listData }, { data: calendarData }] = await Promise.all([
    getEvents(3, locale),
    getEventsInRange(calendarStart, calendarEnd, locale),
  ]);

  const loc = locale ?? "ru";
  const rawList = listData ?? [];
  const rawCalendar = calendarData ?? [];
  const events =
    loc !== defaultLocale
      ? await translateEventList(rawList, loc)
      : rawList;
  const calendarEvents =
    loc !== defaultLocale
      ? await translateEventList(rawCalendar, loc)
      : rawCalendar;

  return (
        <div className="flex flex-col gap-8">
            {/* Calendar Widget — только 3 месяца назад … 2 вперёд */}
            <div className="flex flex-col items-center text-center">
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-4">
                    {uiStrings.calendarTitle[loc]}
                </h2>
                <EventsCalendar
                    locale={loc}
                    events={calendarEvents ?? []}
                    defaultMonth={formatYYYYMMDD(now)}
                    startMonth={formatYYYYMMDD(calendarStart)}
                    endMonth={formatYYYYMMDD(new Date(now.getFullYear(), now.getMonth() + 2, 1))}
                />
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
                    {uiStrings.calendarHint[loc]}
                </p>
            </div>

            {/* Events List */}
            <div className="flex flex-col items-center text-center w-full">
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-4">
                    {uiStrings.upcomingEvents[loc]}
                </h2>
                
                {events.length === 0 ? (
                    <p className="text-slate-500">{uiStrings.noEvents[loc]}</p>
                ) : (
                    <div className="space-y-4 w-full">
                        {events.map((event) => {
                            const eventDate = new Date(event.date);
                            const day = eventDate.getDate();
                            const month = getMonthWithDayCase(eventDate, intlLocale);
                            const time = eventDate.toLocaleTimeString(intlLocale, { hour: "2-digit", minute: "2-digit" });
                            const eventsHref = `/${loc}/events/${event.id}`;

                            return (
                                <Link key={event.id} href={eventsHref}>
                                    <Card className="flex overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                                        <div className="bg-blue-600 text-white p-3 flex flex-col items-center justify-center min-w-[70px]">
                                            <span className="text-xl font-bold">{day}</span>
                                            <span className="text-xs uppercase">{month}</span>
                                        </div>
                                        <div className="p-3 flex-1 flex flex-col justify-center text-left">
                                            <h3 className="text-sm font-bold mb-1 leading-tight hover:text-blue-600">
                                                {event.title}
                                            </h3>
                                            <div className="flex flex-col gap-1 text-xs text-slate-500">
                                                <div className="flex items-center">
                                                    <Clock className="mr-1 h-3 w-3" />
                                                    {time}
                                                </div>
                                                {event.location && (
                                                    <div className="flex items-center">
                                                        <MapPin className="mr-1 h-3 w-3" />
                                                        {event.location}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
