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

export const slotAvailabilityStyle = (
  day: Dayjs,
  hour: number,
  availability?: ScheduleAvailability,
): CSSProperties | undefined => {
  if (!availability?.supported) return undefined;
  const slotStart = day.hour(hour).minute(0).second(0).millisecond(0);
  const slotEnd = slotStart.add(1, "hour");
  const unavailable = availability.unavailable.some((item) => {
    const start = dayjs(item.starts_at);
    const end = dayjs(item.ends_at);
    return start.isBefore(slotEnd) && end.isAfter(slotStart);
  });
  const weekly = availability.workingHours.filter(
    (item) => Number(item.dow) === day.day(),
  );
  const hhmm = `${String(hour).padStart(2, "0")}:00`;
  const working =
    !availability.workingHours.length ||
    weekly.some((item) => item.start <= hhmm && item.end > hhmm);
  if (!unavailable && working) return undefined;
  return {
    backgroundColor: unavailable ? "rgba(120,120,128,0.18)" : "rgba(120,120,128,0.1)",
    backgroundImage:
      "repeating-linear-gradient(135deg, transparent 0, transparent 7px, rgba(120,120,128,.16) 7px, rgba(120,120,128,.16) 9px)",
  };
};
