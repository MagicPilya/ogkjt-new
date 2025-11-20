import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, MapPin, Clock } from "lucide-react";
import { events } from "@/lib/mock-data";
import { Calendar } from "@/components/ui/calendar";

export function Events() {
    return (
        <section className="py-16 container">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Events List */}
                <div className="lg:col-span-2">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-8">
                        Ближайшие события
                    </h2>
                    <div className="space-y-4">
                        {events.map((event) => (
                            <Card key={event.id} className="flex flex-col sm:flex-row overflow-hidden">
                                <div className="bg-blue-600 text-white p-6 flex flex-col items-center justify-center min-w-[120px]">
                                    <span className="text-3xl font-bold">{event.date.split('.')[0]}</span>
                                    <span className="text-sm uppercase">{event.date.split('.')[1] === '11' ? 'Ноя' : 'Дек'}</span>
                                </div>
                                <div className="p-6 flex-1 flex flex-col justify-center">
                                    <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                                    <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                                        <div className="flex items-center">
                                            <Clock className="mr-2 h-4 w-4" />
                                            {event.time}
                                        </div>
                                        <div className="flex items-center">
                                            <MapPin className="mr-2 h-4 w-4" />
                                            {event.location}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 flex items-center justify-center border-t sm:border-t-0 sm:border-l bg-slate-50 dark:bg-slate-900">
                                    <Button variant="outline" size="sm">
                                        Подробнее
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Calendar Widget */}
                <div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-8">
                        Календарь
                    </h2>
                    <div className="border rounded-lg p-4 bg-white dark:bg-slate-950 shadow-sm">
                        <Calendar
                            mode="single"
                            selected={new Date()}
                            className="rounded-md border"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
