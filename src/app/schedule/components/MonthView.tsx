"use client";

import dayjs, { Dayjs } from "dayjs";
import type { ScheduleEvent } from "../types";
import { eventsOnDay, monthMatrix } from "../utils/calendar";
import { ScheduleEventChip } from "./ScheduleEventChip";
import { T } from "@/i18n/T";

type TProps = {
  cursor: Dayjs;
  events: ScheduleEvent[];
  detailed?: boolean;
  nameById?: Map<number, string>;
  teacherById?: Map<number, string>;
  showTeacher?: boolean;
  onDayClick: (day: Dayjs) => void;
  onEventClick: (event: ScheduleEvent) => void;
};

const WEEKDAYS = [
  "schedule.weekdayMon",
  "schedule.weekdayTue",
  "schedule.weekdayWed",
  "schedule.weekdayThu",
  "schedule.weekdayFri",
  "schedule.weekdaySat",
  "schedule.weekdaySun",
];

export const MonthView = ({
  cursor,
  events,
  detailed,
  nameById,
  teacherById,
  showTeacher,
  onDayClick,
  onEventClick,
}: TProps) => {
  const weeks = monthMatrix(cursor);
  const today = dayjs();

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div className="grid shrink-0 grid-cols-7 border-b border-[#e8e8ed]">
        {WEEKDAYS.map((key) => (
          <div
            key={key}
            className="px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-[#86868b]"
          >
            <T k={key} />
          </div>
        ))}
      </div>
      <div className="grid min-h-0 flex-1 grid-rows-6 overflow-auto overscroll-contain">
        {weeks.map((week, wi) => (
          <div
            key={wi}
            className="grid min-h-[84px] grid-cols-7 border-b border-[#f0f0f5] last:border-b-0"
          >
            {week.map((day) => {
              const dayEvents = eventsOnDay(events, day);
              const inMonth = day.month() === cursor.month();
              const isToday = day.isSame(today, "day");
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => onDayClick(day)}
                  className={`min-h-0 overflow-hidden border-r border-[#f0f0f5] p-1 text-left last:border-r-0 hover:bg-[#f8f8fa] ${
                    inMonth ? "bg-white" : "bg-[#fafafa]"
                  }`}
                >
                  <div
                    className={`mb-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                      isToday
                        ? "bg-[#007AFF] text-white"
                        : inMonth
                          ? "text-[#1d1d1f]"
                          : "text-[#aeaeb2]"
                    }`}
                  >
                    {day.date()}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {dayEvents.slice(0, 3).map((event) => (
                      <ScheduleEventChip
                        key={String(event.id)}
                        event={event}
                        compact
                        detailed={detailed}
                        nameById={nameById}
                        teacherById={teacherById}
                        showTeacher={showTeacher}
                        onClick={onEventClick}
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="px-1 text-[10px] text-[#86868b]">
                        +{dayEvents.length - 3}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
