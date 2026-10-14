/** Browser IANA timezone, e.g. "Europe/Moscow". */
export const getLocalTimeZone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
};

/** Short offset label like "GMT+3" / "UTC". */
export const getLocalUtcOffsetLabel = (date = new Date()) => {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
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
  const offset = getLocalUtcOffsetLabel();
  if (tz === "UTC") return offset;
  return `${tz} (${offset})`;
};
