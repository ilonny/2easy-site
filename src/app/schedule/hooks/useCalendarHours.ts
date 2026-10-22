"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export type CalendarHours = { start: number; end: number };

const STORAGE_KEY = "scheduleVisibleHours";
const EVENT_NAME = "schedule-visible-hours-change";
const DEFAULT_HOURS: CalendarHours = { start: 7, end: 23 };

const normalize = (value: Partial<CalendarHours> | null): CalendarHours => {
  const start = Math.max(0, Math.min(22, Number(value?.start)));
  const end = Math.max(1, Math.min(24, Number(value?.end)));
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return DEFAULT_HOURS;
  }
  return { start, end };
};

const readHours = () => {
  if (typeof window === "undefined") return DEFAULT_HOURS;
  try {
    return normalize(JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"));
  } catch {
    return DEFAULT_HOURS;
  }
};

export const useCalendarHours = () => {
  const [hours, setHoursState] = useState<CalendarHours>(DEFAULT_HOURS);

  useEffect(() => {
    setHoursState(readHours());
    const sync = () => setHoursState(readHours());
    window.addEventListener("storage", sync);
    window.addEventListener(EVENT_NAME, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(EVENT_NAME, sync);
    };
  }, []);

  const setHours = useCallback((next: CalendarHours) => {
    const normalized = normalize(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    setHoursState(normalized);
    window.dispatchEvent(new Event(EVENT_NAME));
  }, []);

  const visibleHours = useMemo(
    () =>
      Array.from(
        { length: hours.end - hours.start },
        (_, index) => hours.start + index,
      ),
    [hours],
  );

  return { hours, setHours, visibleHours };
};
