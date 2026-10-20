"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import type { ScheduleEvent } from "../types";
import { backgroundForColors, colorsForEvent } from "../types";
import { eventsOnDay, HOURS, nowScrollTop, weekDays } from "../utils/calendar";
import { eventChipText, eventMinHeight } from "./eventUi";
import styles from "../styles.module.css";

type TProps = {
  cursor: Dayjs;
  events: ScheduleEvent[];
  detailed?: boolean;
  nameById?: Map<number, string>;
  teacherById?: Map<number, string>;
  showTeacher?: boolean;
  onSlotClick: (day: Dayjs, hour: number) => void;
  onEventClick: (event: ScheduleEvent) => void;
};

export const WeekView = ({
  cursor,
  events,
  detailed,
  nameById,
  teacherById,
  showTeacher,
  onSlotClick,
  onEventClick,
}: TProps) => {
  const days = weekDays(cursor);
  const today = dayjs();
  const hourHeight = 52;
  const gridHeight = HOURS.length * hourHeight;
  const [now, setNow] = useState(dayjs());
  const scrollRef = useRef<HTMLDivElement>(null);
  const showNowLine = days.some((d) => d.isSame(today, "day"));

  useEffect(() => {
    const id = window.setInterval(() => setNow(dayjs()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTop = nowScrollTop(hourHeight);
    });
  }, [cursor, hourHeight]);

  const nowTop = useMemo(() => {
    if (!showNowLine) return null;
    const h = now.hour() + now.minute() / 60;
    if (h < HOURS[0] || h > HOURS[HOURS.length - 1] + 1) return null;
    return (h - HOURS[0]) * hourHeight;
  }, [now, hourHeight, showNowLine]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div
        className="grid shrink-0 border-b border-[#e8e8ed] bg-white"
        style={{ gridTemplateColumns: "52px repeat(7, minmax(0, 1fr))" }}
      >
        <div />
        {days.map((day) => {
          const isToday = day.isSame(today, "day");
          return (
            <div
              key={day.toISOString()}
              className="border-l border-[#e8e8ed] px-1 py-2 text-center"
            >
              <div
                className={`text-[11px] font-semibold uppercase tracking-wide ${
                  isToday ? "text-[#007AFF]" : "text-[#86868b]"
                }`}
              >
                {day.format("dd")}
              </div>
              <div
                className={`mx-auto mt-1 flex h-8 w-8 items-center justify-center rounded-full text-[17px] font-semibold ${
                  isToday ? "bg-[#007AFF] text-white" : "text-[#1d1d1f]"
                }`}
              >
                {day.date()}
              </div>
            </div>
          );
        })}
      </div>

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-auto overscroll-contain"
      >
        <div
          className="relative min-w-[680px] pb-5"
          style={{
            display: "grid",
            gridTemplateColumns: "52px repeat(7, minmax(0, 1fr))",
            height: gridHeight + 20,
          }}
        >
          <div className="relative" style={{ height: gridHeight }}>
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="absolute right-0 left-0 border-t border-[#f0f0f5] pr-2 text-right text-[11px] text-[#aeaeb2]"
                style={{
                  top: (hour - HOURS[0]) * hourHeight,
                  height: hourHeight,
                }}
              >
                <span className="relative -top-2">
                  {`${String(hour).padStart(2, "0")}:00`}
                </span>
              </div>
            ))}
            <div
              className="absolute right-0 left-0 pr-2 text-right text-[11px] text-[#aeaeb2]"
              style={{ top: gridHeight }}
            >
              <span className="relative -top-2">00:00</span>
            </div>
          </div>

          {days.map((day) => (
            <div
              key={day.toISOString()}
              className="relative border-l border-[#f0f0f5]"
              style={{ height: gridHeight }}
            >
              {HOURS.map((hour) => (
                <button
                  key={`${day.toISOString()}-${hour}`}
                  type="button"
                  onClick={() => onSlotClick(day, hour)}
                  className="absolute left-0 right-0 border-t border-[#f0f0f5] hover:bg-[#f8f8fa]"
                  style={{
                    top: (hour - HOURS[0]) * hourHeight,
                    height: hourHeight,
                  }}
                />
              ))}
              {eventsOnDay(events, day).map((event) => {
                const start = dayjs(event.starts_at);
                const end = dayjs(event.ends_at);
                const startHour = start.hour() + start.minute() / 60;
                const durationHours = Math.max(
                  end.diff(start, "minute") / 60,
                  event.type === "payment" ? 1 : 0.4,
                );
                const top = (startHour - HOURS[0]) * hourHeight;
                const height = Math.min(
                  durationHours * hourHeight,
                  gridHeight - top,
                );
                if (top >= gridHeight || height <= 0) return null;
                const colors = colorsForEvent(event);
                const chip = eventChipText(event, {
                  detailed: detailed || event.type === "payment",
                  time: start.format("HH:mm"),
                  nameById,
                  teacherById,
                  showTeacher,
                });
                const minH = eventMinHeight(event, hourHeight);
                const boxH = Math.max(height, minH);
                const tall = boxH >= 32;
                return (
                  <div
                    key={String(event.id)}
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") onEventClick(event);
                    }}
                    className="absolute left-0.5 right-0.5 z-[1] overflow-hidden rounded-[6px] px-1.5 py-0.5 text-left text-[11px] leading-tight text-white shadow-sm"
                    style={{
                      top: Math.max(top, 0),
                      height: boxH,
                      background: backgroundForColors(colors),
                    }}
                    title={chip.titleAttr}
                  >
                    <div className="truncate font-semibold">{chip.primary}</div>
                    {chip.secondary && tall ? (
                      <div className="truncate opacity-90">{chip.secondary}</div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ))}

          {nowTop != null && showNowLine && (
            <div
              className={styles.nowLine}
              style={{ top: nowTop, left: 52 }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
