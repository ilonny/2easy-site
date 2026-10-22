import dayjs, { Dayjs } from "dayjs";
import type { CSSProperties } from "react";
import type {
  ScheduleAvailability,
  SelectedScheduleRange,
} from "../types";

export const rangeForHour = (
  day: Dayjs,
  hour: number,
): SelectedScheduleRange => ({
  starts_at: day.hour(hour).minute(0).second(0).millisecond(0).toISOString(),
  ends_at: day
    .hour(hour)
    .minute(0)
    .second(0)
    .millisecond(0)
    .add(1, "hour")
    .toISOString(),
});

export const rangeKey = (range: SelectedScheduleRange) =>
  `${range.starts_at}|${range.ends_at}`;

export const isUnavailableSlot = (
  day: Dayjs,
  hour: number,
  availability?: ScheduleAvailability,
) => {
  if (!availability?.supported) return false;
  const slotStart = day.hour(hour).minute(0).second(0).millisecond(0);
  const slotEnd = slotStart.add(1, "hour");
  return availability.unavailable.some((item) => {
    const start = dayjs(item.starts_at);
    const end = dayjs(item.ends_at);
    return start.isBefore(slotEnd) && end.isAfter(slotStart);
  });
};

export const isOutsideWorkingHours = (
  day: Dayjs,
  hour: number,
  availability?: ScheduleAvailability,
) => {
  if (!availability?.supported) return false;
  const hours = availability.workingHours || [];
  if (!hours.length) return false;
  const weekly = hours.filter((item) => Number(item.dow) === day.day());
  if (!weekly.length) return true;
  const hhmm = `${String(hour).padStart(2, "0")}:00`;
  return !weekly.some((item) => item.start <= hhmm && item.end > hhmm);
};

export const isNonWorkingSlot = (
  day: Dayjs,
  hour: number,
  availability?: ScheduleAvailability,
) =>
  isUnavailableSlot(day, hour, availability) ||
  isOutsideWorkingHours(day, hour, availability);

export const slotAvailabilityStyle = (
  day: Dayjs,
  hour: number,
  availability?: ScheduleAvailability,
): CSSProperties | undefined => {
  if (!isNonWorkingSlot(day, hour, availability)) return undefined;
  const marked = isUnavailableSlot(day, hour, availability);
  return {
    backgroundColor: marked ? "rgba(120,120,128,0.22)" : "rgba(120,120,128,0.14)",
    backgroundImage:
      "repeating-linear-gradient(135deg, transparent 0, transparent 7px, rgba(120,120,128,.18) 7px, rgba(120,120,128,.18) 9px)",
  };
};
