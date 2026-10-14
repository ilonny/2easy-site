"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import type { ScheduleEvent } from "../types";
import { backgroundForColors, colorsForEvent } from "../types";
import { eventsOnDay, HOURS, nowScrollTop } from "../utils/calendar";
import { eventChipText, eventMinHeight } from "./eventUi";
import styles from "../styles.module.css";

type TProps = {
  cursor: Dayjs;
  events: ScheduleEvent[];
  detailed?: boolean;
  nameById?: Map<number, string>;
  onSlotClick: (day: Dayjs, hour: number) => void;
  onEventClick: (event: ScheduleEvent) => void;
};

export const DayView = ({
  cursor,
  events,
  detailed,
  nameById,
  onSlotClick,
  onEventClick,
}: TProps) => {
  const dayEvents = eventsOnDay(events, cursor);
  const hourHeight = 60;
  const gridHeight = HOURS.length * hourHeight;
  const today = dayjs();
  const isToday = cursor.isSame(today, "day");
  const [now, setNow] = useState(dayjs());
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = window.setInterval(() => setNow(dayjs()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const target = isToday
      ? nowScrollTop(hourHeight)
      : Math.max(0, (9 - HOURS[0]) * hourHeight);
    requestAnimationFrame(() => {
      el.scrollTop = target;
    });
  }, [cursor, isToday, hourHeight]);

  const nowTop = useMemo(() => {
    if (!isToday) return null;
    const h = now.hour() + now.minute() / 60;
    if (h < HOURS[0] || h > HOURS[HOURS.length - 1] + 1) return null;
    return (h - HOURS[0]) * hourHeight;
  }, [now, isToday, hourHeight]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div className="shrink-0 border-b border-[#e8e8ed] px-4 py-3">
        <div
          className={`text-[11px] font-semibold uppercase tracking-wide ${
            isToday ? "text-[#007AFF]" : "text-[#86868b]"
          }`}
        >
          {cursor.format("dddd")}
        </div>
        <div
          className={`mt-1 inline-flex h-11 w-11 items-center justify-center rounded-full text-[22px] font-semibold ${
            isToday ? "bg-[#007AFF] text-white" : "text-[#1d1d1f]"
          }`}
        >
          {cursor.date()}
        </div>
      </div>

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-auto overscroll-contain"
      >
        <div className="relative pb-5" style={{ height: gridHeight + 20 }}>
          {HOURS.map((hour) => (
            <button
              key={hour}
              type="button"
              onClick={() => onSlotClick(cursor, hour)}
              className="absolute left-0 right-0 flex border-t border-[#f0f0f5] hover:bg-[#f8f8fa]"
              style={{
                top: (hour - HOURS[0]) * hourHeight,
                height: hourHeight,
              }}
            >
              <div className="w-14 shrink-0 pr-2 text-right text-[11px] text-[#aeaeb2]">
                <span className="relative -top-2">
                  {`${String(hour).padStart(2, "0")}:00`}
                </span>
              </div>
              <div className="relative flex-1 border-l border-[#f0f0f5]" />
            </button>
          ))}
          <div
            className="pointer-events-none absolute left-0 w-14 pr-2 text-right text-[11px] text-[#aeaeb2]"
            style={{ top: gridHeight }}
          >
            <span className="relative -top-2">00:00</span>
          </div>
          <div className="pointer-events-none absolute inset-0 left-14">
            {dayEvents.map((event) => {
              const start = dayjs(event.starts_at);
              const end = dayjs(event.ends_at);
              const startHour = start.hour() + start.minute() / 60;
              const durationHours = Math.max(
                end.diff(start, "minute") / 60,
                event.type === "payment" ? 1 : 0.45,
              );
              const top = (startHour - HOURS[0]) * hourHeight;
              const height = Math.min(
                durationHours * hourHeight,
                gridHeight - top,
              );
              if (top >= gridHeight || height <= 0) return null;
              const colors = colorsForEvent(event);
              const chip = eventChipText(event, {
                detailed: true,
                time: `${start.format("HH:mm")} – ${end.format("HH:mm")}`,
                nameById,
              });
              const minH = eventMinHeight(event, hourHeight);
              const isPayment = event.type === "payment";
              return (
                <button
                  key={String(event.id)}
                  type="button"
                  className="pointer-events-auto absolute left-1 right-2 overflow-hidden rounded-[10px] px-3 py-2 text-left text-white shadow-sm"
                  style={{
                    top: Math.max(top, 0),
                    height: Math.max(height, minH),
                    background: backgroundForColors(colors),
                    boxShadow:
                      isPayment && event.is_overdue
                        ? "inset 0 0 0 1px rgba(255,255,255,0.55)"
                        : undefined,
                  }}
                  onClick={() => onEventClick(event)}
                  title={chip.titleAttr}
                >
                  <div className="text-sm font-semibold truncate">
                    {chip.primary}
                  </div>
                  {chip.secondary ? (
                    <div className="text-xs opacity-90 truncate">
                      {chip.secondary}
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>
          {nowTop != null && (
            <div className={styles.nowLine} style={{ top: nowTop, left: 56 }} />
          )}
        </div>
      </div>
    </div>
  );
};
