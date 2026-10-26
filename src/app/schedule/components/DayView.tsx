"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import type {
  ScheduleAvailability,
  ScheduleEvent,
  SelectedScheduleRange,
} from "../types";
import { backgroundForColors, colorsForEvent } from "../types";
import { eventsOnDay, nowScrollTop } from "../utils/calendar";
import { eventChipText, eventMinHeight } from "./eventUi";
import styles from "../styles.module.css";
import { useCalendarHours } from "../hooks/useCalendarHours";
import {
  rangeForHour,
  rangeKey,
  isNonWorkingSlot,
  slotAvailabilityStyle,
} from "./availabilityUi";

type TProps = {
  cursor: Dayjs;
  events: ScheduleEvent[];
  detailed?: boolean;
  nameById?: Map<number, string>;
  teacherById?: Map<number, string>;
  showTeacher?: boolean;
  availability?: ScheduleAvailability;
  selectionMode?: boolean;
  selectedRangeKeys?: Set<string>;
  onRangeToggle?: (range: SelectedScheduleRange, selected: boolean) => void;
  onSlotClick: (day: Dayjs, hour: number) => void;
  onEventClick: (event: ScheduleEvent) => void;
};

export const DayView = ({
  cursor,
  events,
  nameById,
  teacherById,
  showTeacher,
  availability,
  selectionMode,
  selectedRangeKeys,
  onRangeToggle,
  onSlotClick,
  onEventClick,
}: TProps) => {
  const dayEvents = eventsOnDay(events, cursor);
  const { hours: visibleWindow, visibleHours } = useCalendarHours();
  const hourHeight = 60;
  const gridHeight = visibleHours.length * hourHeight;
  const today = dayjs();
  const isToday = cursor.isSame(today, "day");
  const [now, setNow] = useState(dayjs());
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = window.setInterval(() => setNow(dayjs()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const periodKey = cursor.format("YYYY-MM-DD");
  const scrolledPeriodRef = useRef("");

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (scrolledPeriodRef.current === periodKey) return;
    scrolledPeriodRef.current = periodKey;
    const hours = visibleHours;
    const target = isToday
      ? nowScrollTop(hourHeight, 48, hours)
      : Math.max(0, (9 - visibleWindow.start) * hourHeight);
    requestAnimationFrame(() => {
      el.scrollTop = target;
    });
  }, [
    periodKey,
    isToday,
    hourHeight,
    visibleHours,
    visibleWindow.start,
  ]);

  const nowTop = useMemo(() => {
    if (!isToday) return null;
    const h = now.hour() + now.minute() / 60;
    if (h < visibleWindow.start || h > visibleWindow.end) return null;
    return (h - visibleWindow.start) * hourHeight;
  }, [now, isToday, hourHeight, visibleWindow]);

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
        className="min-h-0 flex-1 overflow-auto overscroll-contain [overflow-anchor:none]"
      >
        <div className="relative pb-5" style={{ height: gridHeight + 20 }}>
          {visibleHours.map((hour) => (
            <button
              key={hour}
              type="button"
              onClick={() => {
                if (
                  !selectionMode &&
                  !isNonWorkingSlot(cursor, hour, availability)
                ) {
                  onSlotClick(cursor, hour);
                }
              }}
              onPointerDown={(event) => {
                if (!selectionMode) return;
                event.preventDefault();
                const range = rangeForHour(cursor, hour);
                onRangeToggle?.(
                  range,
                  !selectedRangeKeys?.has(rangeKey(range)),
                );
              }}
              onPointerEnter={(event) => {
                if (!selectionMode || event.buttons !== 1) return;
                const range = rangeForHour(cursor, hour);
                if (!selectedRangeKeys?.has(rangeKey(range))) {
                  onRangeToggle?.(range, true);
                }
              }}
              aria-disabled={
                !selectionMode &&
                isNonWorkingSlot(cursor, hour, availability)
              }
              className={`absolute left-0 right-0 flex border-t border-[#f0f0f5] ${
                !selectionMode &&
                isNonWorkingSlot(cursor, hour, availability)
                  ? "cursor-not-allowed"
                  : "hover:bg-[#f8f8fa]"
              }`}
              style={{
                top: (hour - visibleWindow.start) * hourHeight,
                height: hourHeight,
                ...slotAvailabilityStyle(cursor, hour, availability),
                ...(selectedRangeKeys?.has(
                  rangeKey(rangeForHour(cursor, hour)),
                )
                  ? {
                      backgroundColor: "rgba(90,66,212,.22)",
                      boxShadow: "inset 0 0 0 2px #5a42d4",
                    }
                  : {}),
              }}
            >
              <div className="w-14 shrink-0 pr-2 text-right text-[11px] text-[#aeaeb2]">
                <span className="relative -top-2">
                  {`${String(hour).padStart(2, "0")}:00`}
                </span>
              </div>
              <div className="relative flex flex-1 items-center justify-center border-l border-[#f0f0f5]">
                {isNonWorkingSlot(cursor, hour, availability) ? (
                  <span className="pointer-events-none text-[15px] font-semibold leading-none text-[#8e8e93]">
                    ×
                  </span>
                ) : null}
              </div>
            </button>
          ))}
          <div
            className="pointer-events-none absolute left-0 w-14 pr-2 text-right text-[11px] text-[#aeaeb2]"
            style={{ top: gridHeight }}
          >
            <span className="relative -top-2">
              {`${String(visibleWindow.end).padStart(2, "0")}:00`}
            </span>
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
              const top = (startHour - visibleWindow.start) * hourHeight;
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
                teacherById,
                showTeacher,
              });
              const minH = eventMinHeight(event, hourHeight);
              const isPayment = event.type === "payment";
              return (
                <button
                  key={String(event.id)}
                  type="button"
                  className={`${
                    selectionMode
                      ? "pointer-events-none"
                      : "pointer-events-auto"
                  } absolute left-1 right-2 overflow-hidden rounded-[10px] px-3 py-2 text-left text-white shadow-sm`}
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
