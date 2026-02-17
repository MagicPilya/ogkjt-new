import { Card } from "@/components/ui/card";
import { MapPin, Clock } from "lucide-react";
import { getEvents, getEventsInRange } from "@/lib/strapi";
import Link from "next/link";
import { EventsCalendar } from "./EventsCalendar";

export async function Events() {
    const [{ data: listEvents }, { data: calendarEvents }] = await Promise.all([
        getEvents(3),
        (() => {
            const now = new Date();
            const start = new Date(now.getFullYear(), now.getMonth(), 1);
            const end = new Date(now.getFullYear(), now.getMonth() + 2, 0);
            return getEventsInRange(start, end);
        })(),
    ]);

    const events = listEvents ?? [];

    return (
        <div className="flex flex-col gap-8">
            {/* Calendar Widget — клик по дню с событием ведёт на страницу события */}
            <div className="flex flex-col items-center text-center">
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-4">
                    Календарь
                </h2>
                <EventsCalendar
                    events={calendarEvents ?? []}
                    defaultMonth={new Date()}
                />
            </div>

            {/* Events List */}
            <div className="flex flex-col items-center text-center w-full">
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-4">
                    Ближайшие события
                </h2>
                
                {events.length === 0 ? (
                    <p className="text-slate-500">Событий пока нет.</p>
                ) : (
                    <div className="space-y-4 w-full">
                        {events.map((event) => {
                            const eventDate = new Date(event.date);
                            const day = eventDate.getDate();
                            const month = eventDate.toLocaleString('ru-RU', { month: 'short' });
                            const time = eventDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

                            return (
                                <Link key={event.id} href={`/events/${event.id}`}>
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
