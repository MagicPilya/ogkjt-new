"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import type { Event } from "@/lib/strapi";

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

interface EventsCalendarProps {
  events: Event[];
  defaultMonth?: Date;
}

export function EventsCalendar({ events, defaultMonth }: EventsCalendarProps) {
  const router = useRouter();

  const eventDates = useMemo(
    () => events?.map((e) => new Date(e.date)) ?? [],
    [events]
  );

  const eventsByDay = useMemo(() => {
    const map = new Map<string, Event[]>();
    for (const e of events ?? []) {
      const key = toDateKey(new Date(e.date));
      const list = map.get(key) ?? [];
      list.push(e);
      map.set(key, list);
    }
    return map;
  }, [events]);

  const handleSelect = useCallback(
    (day: Date | undefined) => {
      if (!day) return;
      const key = toDateKey(day);
      const dayEvents = eventsByDay.get(key);
      if (dayEvents?.length) {
        router.push(`/events/${dayEvents[0].id}`);
      }
    },
    [eventsByDay, router]
  );

  return (
    <div className="border rounded-lg p-4 bg-white dark:bg-slate-950 shadow-sm w-full flex justify-center">
      <Calendar
        mode="single"
        defaultMonth={defaultMonth}
        selected={undefined}
        onSelect={handleSelect}
        modifiers={{
          eventDay: eventDates,
        }}
        modifiersClassNames={{
          eventDay:
            "relative after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:rounded-full after:bg-blue-600 cursor-pointer",
        }}
        className="rounded-md"
      />
    </div>
  );
}
