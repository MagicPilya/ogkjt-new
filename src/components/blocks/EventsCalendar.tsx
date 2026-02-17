"use client";

import { useCallback, useMemo, useRef, useState, type ComponentProps } from "react";
import { useRouter } from "next/navigation";
import { isSameDay } from "date-fns";
import { ru } from "date-fns/locale";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import type { Event } from "@/lib/strapi";

const dotClassEvent =
  "relative after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:rounded-full after:bg-blue-600 cursor-pointer";
const dotClassPast =
  "relative after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:rounded-full after:bg-slate-400 after:opacity-60 cursor-pointer";
const CURSOR_OFFSET = 12;
const POPOVER_MAX_WIDTH = 280;
const POPOVER_MAX_HEIGHT = 320;

function clampPopoverPosition(x: number, y: number) {
  if (typeof window === "undefined") return { x, y };
  const w = window.innerWidth;
  const h = window.innerHeight;
  return {
    x: Math.max(8, Math.min(x + CURSOR_OFFSET, w - POPOVER_MAX_WIDTH - 8)),
    y: Math.max(8, Math.min(y + CURSOR_OFFSET, h - POPOVER_MAX_HEIGHT - 8)),
  };
}

function getPopoverPositionCenter() {
  if (typeof window === "undefined") return { x: 0, y: 0 };
  const w = window.innerWidth;
  const h = window.innerHeight;
  return {
    x: Math.max(8, (w - POPOVER_MAX_WIDTH) / 2),
    y: Math.max(8, Math.min((h - POPOVER_MAX_HEIGHT) / 2, h - POPOVER_MAX_HEIGHT - 8)),
  };
}

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const todayKey = () => toDateKey(new Date());

function parseLocalYYYYMMDD(s: string): Date {
  const [y, m, d] = s.slice(0, 10).split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

interface EventsCalendarProps {
  events: Event[];
  /** ISO string — начальный месяц навигации (3 месяца назад) */
  startMonth?: string;
  /** ISO string — конечный месяц навигации (2 месяца вперёд) */
  endMonth?: string;
  /** ISO string — какой месяц показать по умолчанию */
  defaultMonth?: string;
}

export function EventsCalendar({ events, defaultMonth, startMonth, endMonth }: EventsCalendarProps) {
  const router = useRouter();
  const lastClickRef = useRef<{ x: number; y: number } | null>(null);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<{ x: number; y: number } | null>(null);

  const { eventDatesFuture, eventDatesPast, eventsByDay } = useMemo(() => {
    const future: Date[] = [];
    const past: Date[] = [];
    const byDay = new Map<string, Event[]>();
    const today = todayKey();

    for (const e of events ?? []) {
      const date = new Date(e.date);
      const key = toDateKey(date);
      const list = byDay.get(key) ?? [];
      list.push(e);
      byDay.set(key, list);
      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      if (key < today) {
        past.push(startOfDay);
      } else {
        future.push(startOfDay);
      }
    }
    return { eventDatesFuture: future, eventDatesPast: past, eventsByDay: byDay };
  }, [events]);

  const openPopover = useCallback((day: Date) => {
    setSelectedDay(day);
    const pos = lastClickRef.current;
    setPopoverPosition(pos ? clampPopoverPosition(pos.x, pos.y) : getPopoverPositionCenter());
    lastClickRef.current = null;
  }, []);

  const closePopover = useCallback(() => {
    setSelectedDay(null);
    setPopoverPosition(null);
  }, []);

  const handleSelect = useCallback(
    (day: Date | undefined) => {
      if (!day) return;
      const key = toDateKey(day);
      if (!eventsByDay.get(key)?.length) return;
      openPopover(day);
    },
    [eventsByDay, openPopover]
  );

  const selectedKey = selectedDay ? toDateKey(selectedDay) : null;
  const selectedEvents = selectedKey ? eventsByDay.get(selectedKey) ?? [] : [];

  const startMonthDate = startMonth ? parseLocalYYYYMMDD(startMonth) : undefined;
  const endMonthDate = endMonth ? parseLocalYYYYMMDD(endMonth) : undefined;
  const defaultMonthDate = defaultMonth ? parseLocalYYYYMMDD(defaultMonth) : undefined;

  const DayButtonWithDots = useCallback(
    (props: ComponentProps<typeof CalendarDayButton>) => {
      const { modifiers, className, onClick, ...rest } = props;
      const dotClass =
        modifiers?.eventDay ? dotClassEvent : modifiers?.eventDayPast ? dotClassPast : undefined;
      return (
        <CalendarDayButton
          {...rest}
          modifiers={modifiers}
          className={cn(className, dotClass)}
          onClick={(e) => {
            lastClickRef.current = { x: e.clientX, y: e.clientY };
            onClick?.(e);
          }}
        />
      );
    },
    []
  );

  return (
    <div className="relative w-full flex flex-col items-center">
      <div className="border rounded-lg p-4 bg-white dark:bg-slate-950 shadow-sm w-full flex justify-center">
        <Calendar
          mode="single"
          locale={ru}
          defaultMonth={defaultMonthDate}
          startMonth={startMonthDate}
          endMonth={endMonthDate}
          selected={undefined}
          onSelect={handleSelect}
          formatters={{
            formatCaption: (month) =>
              month.toLocaleDateString("ru-RU", { month: "long", year: "numeric" }),
            formatMonthDropdown: (month) =>
              month.toLocaleDateString("ru-RU", { month: "short" }),
            formatWeekdayName: (weekday) =>
              weekday.toLocaleDateString("ru-RU", { weekday: "short" }),
          }}
          modifiers={{
            eventDay: (date: Date) => eventDatesFuture.some((d) => isSameDay(date, d)),
            eventDayPast: (date: Date) => eventDatesPast.some((d) => isSameDay(date, d)),
          }}
          modifiersClassNames={{
            eventDay: "cursor-pointer",
            eventDayPast: "cursor-pointer",
          }}
          className="rounded-md"
          components={{ DayButton: DayButtonWithDots }}
        />
      </div>

      {selectedEvents.length > 0 && selectedDay && popoverPosition && (
        <div
          className="fixed z-50 min-w-[200px] max-w-[90vw] rounded-lg border bg-white dark:bg-slate-900 shadow-lg py-2 px-3"
          style={{
            left: popoverPosition.x,
            top: popoverPosition.y,
            maxHeight: POPOVER_MAX_HEIGHT,
            minWidth: 200,
            maxWidth: POPOVER_MAX_WIDTH,
          }}
          onMouseLeave={closePopover}
        >
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <p className="text-xs text-slate-500 dark:text-slate-400 px-0.5 shrink-0">
              {selectedDay.toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
            <button
              type="button"
              onClick={closePopover}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-sm shrink-0"
              aria-label="Закрыть"
            >
              Закрыть
            </button>
          </div>
          <ul className="space-y-1 overflow-y-auto max-h-[260px]">
            {selectedEvents.map((event) => {
              const eventDate = new Date(event.date);
              const time = eventDate.toLocaleTimeString("ru-RU", {
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <li key={event.id}>
                  <button
                    type="button"
                    onClick={() => router.push(`/events/${event.id}`)}
                    className="w-full text-left text-sm py-1.5 px-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                  >
                    <span className="block truncate">{event.title}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {time}
                      {event.location ? ` · ${event.location}` : ""}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
