import dayjs, { Dayjs } from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import type { ScheduleEvent } from "../types";

dayjs.extend(isoWeek);

export const HOURS = Array.from({ length: 24 }, (_, i) => i); // 00:00–23:00

/** Pixel offset of "now" within the hour grid; clamped to grid bounds. */
export const nowScrollTop = (hourHeight: number, pad = 48) => {
  const now = dayjs();
  const h = now.hour() + now.minute() / 60;
  const start = HOURS[0];
  const end = HOURS[HOURS.length - 1] + 1;
  const clamped = Math.min(Math.max(h, start), end);
  return Math.max(0, (clamped - start) * hourHeight - pad);
};

export const rangeForView = (cursor: Dayjs, view: "month" | "week" | "day") => {
  if (view === "month") {
    return {
      from: cursor.startOf("month").startOf("isoWeek").toISOString(),
      to: cursor.endOf("month").endOf("isoWeek").toISOString(),
    };
  }
  if (view === "week") {
    return {
      from: cursor.startOf("isoWeek").toISOString(),
      to: cursor.endOf("isoWeek").toISOString(),
    };
  }
  return {
    from: cursor.startOf("day").toISOString(),
    to: cursor.endOf("day").toISOString(),
  };
};

export const eventsOnDay = (events: ScheduleEvent[], day: Dayjs) =>
  events.filter((e) => dayjs(e.starts_at).isSame(day, "day"));

export const monthMatrix = (cursor: Dayjs) => {
  const start = cursor.startOf("month").startOf("isoWeek");
  const weeks: Dayjs[][] = [];
  let day = start;
  for (let w = 0; w < 6; w++) {
    const row: Dayjs[] = [];
    for (let d = 0; d < 7; d++) {
      row.push(day);
      day = day.add(1, "day");
    }
    weeks.push(row);
  }
  return weeks;
};

export const weekDays = (cursor: Dayjs) => {
  const start = cursor.startOf("isoWeek");
  return Array.from({ length: 7 }, (_, i) => start.add(i, "day"));
};

export const formatMoney = (amount: number, currency = "RUB") => {
  try {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  } catch {
    return `${amount || 0} ${currency}`;
  }
};

export type MoneyByCurrency = { currency: string; amount: number };

/** Normalize API money field (array or legacy number) into a list. */
export const asMoneyList = (
  value: number | MoneyByCurrency[] | null | undefined,
  fallbackCurrency = "RUB",
): MoneyByCurrency[] => {
  if (Array.isArray(value)) {
    return value
      .map((row) => ({
        currency: String(row?.currency || fallbackCurrency).toUpperCase(),
        amount: Number(row?.amount) || 0,
      }))
      .filter((row) => row.amount !== 0);
  }
  if (typeof value === "number" && value !== 0) {
    return [{ currency: fallbackCurrency, amount: value }];
  }
  return [];
};

export const formatMoneyList = (
  value: number | MoneyByCurrency[] | null | undefined,
  fallbackCurrency = "RUB",
) => {
  const list = asMoneyList(value, fallbackCurrency);
  if (!list.length) return formatMoney(0, fallbackCurrency);
  return list.map((row) => formatMoney(row.amount, row.currency)).join(" · ");
};
