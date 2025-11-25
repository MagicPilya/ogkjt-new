import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Clock } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { getEvents } from "@/lib/strapi";
import { formatDate } from "@/lib/utils";

export async function Events() {
    const { data: events } = await getEvents(3);

    return (
        <div className="flex flex-col gap-8">
            {/* Calendar Widget */}
            <div className="flex flex-col items-center text-center">
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-4">
                    Календарь
                </h2>
                <div className="border rounded-lg p-4 bg-white dark:bg-slate-950 shadow-sm w-full flex justify-center">
                    <Calendar
                        mode="single"
                        selected={new Date()}
                        className="rounded-md"
                    />
                </div>
            </div>

            {/* Events List */}
            <div className="flex flex-col items-center text-center w-full">
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-4">
                    Ближайшие события
                </h2>
                
                {!events || events.length === 0 ? (
                    <p className="text-slate-500">Событий пока нет.</p>
                ) : (
                    <div className="space-y-4 w-full">
                        {events.map((event) => {
                            const eventDate = new Date(event.date);
                            const day = eventDate.getDate();
                            const month = eventDate.toLocaleString('ru-RU', { month: 'short' });
                            const time = eventDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

                            return (
                                <Card key={event.id} className="flex overflow-hidden hover:shadow-md transition-shadow">
                                    <div className="bg-blue-600 text-white p-3 flex flex-col items-center justify-center min-w-[70px]">
                                        <span className="text-xl font-bold">{day}</span>
                                        <span className="text-xs uppercase">{month}</span>
                                    </div>
                                    <div className="p-3 flex-1 flex flex-col justify-center">
                                        <h3 className="text-sm font-bold mb-1 leading-tight">{event.title}</h3>
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
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
