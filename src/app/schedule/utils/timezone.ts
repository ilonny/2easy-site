import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

/** Browser IANA timezone, e.g. "Europe/Moscow". */
export const getLocalTimeZone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
};

const isValidTimeZone = (timeZone?: string | null) => {
  if (!timeZone) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone }).format();
    return true;
  } catch {
    return false;
  }
};

/** School wall-clock input → UTC instant, independent of browser timezone. */
export const scheduleWallClockToIso = (
  date: string,
  time: string,
  timeZone?: string | null,
) => {
  const value = `${date}T${time}`;
  if (isValidTimeZone(timeZone)) {
    return dayjs.tz(value, timeZone!).toISOString();
  }
  return dayjs(value).toISOString();
};

/** Format an absolute event instant in the selected school timezone. */
export const formatScheduleInstant = (
  value: string | Date,
  format: string,
  timeZone?: string | null,
) => {
  const parsed = dayjs(value);
  if (isValidTimeZone(timeZone)) {
    return parsed.tz(timeZone!).format(format);
  }
  return parsed.format(format);
};

/** Short offset label like "GMT+3" / "UTC". */
export const getLocalUtcOffsetLabel = (
  date = new Date(),
  timeZone?: string | null,
) => {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      ...(isValidTimeZone(timeZone) ? { timeZone: timeZone! } : {}),
      timeZoneName: "shortOffset",
    }).formatToParts(date);
    const raw =
      parts.find((p) => p.type === "timeZoneName")?.value ||
      `UTC${formatOffsetFallback(date)}`;
    return raw.replace("GMT", "UTC");
  } catch {
    return `UTC${formatOffsetFallback(date)}`;
  }
};

const formatOffsetFallback = (date: Date) => {
  const min = -date.getTimezoneOffset();
  const sign = min >= 0 ? "+" : "-";
  const abs = Math.abs(min);
  const hh = String(Math.floor(abs / 60)).padStart(2, "0");
  const mm = String(abs % 60).padStart(2, "0");
  return mm === "00" ? `${sign}${Number(hh)}` : `${sign}${hh}:${mm}`;
};

/** Human label for schedule UI: "Europe/Moscow (UTC+3)". */
export const getLocalTimeZoneLabel = () => {
  const tz = getLocalTimeZone();
  const offset = getLocalUtcOffsetLabel(new Date(), tz);
  if (tz === "UTC") return offset;
  return `${tz} (${offset})`;
};

export const getScheduleTimeZoneLabel = (timeZone?: string | null) => {
  const tz = isValidTimeZone(timeZone) ? timeZone! : getLocalTimeZone();
  const offset = getLocalUtcOffsetLabel(new Date(), tz);
  return tz === "UTC" ? offset : `${tz} (${offset})`;
};
