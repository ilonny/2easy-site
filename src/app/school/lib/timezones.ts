import { COMMON_TIMEZONES } from "../types";

export const browserTimezone = () => {
  try {
    return (
      Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Moscow"
    );
  } catch {
    return "Europe/Moscow";
  }
};

export const timezoneOptions = () => {
  const browser = browserTimezone();
  const set = new Set(COMMON_TIMEZONES);
  if (browser) set.add(browser);
  return Array.from(set).sort((a, b) => a.localeCompare(b));
};

export const defaultMonFriHours = () =>
  [1, 2, 3, 4, 5].map((dow) => ({
    dow,
    start: "09:00",
    end: "18:00",
  }));
