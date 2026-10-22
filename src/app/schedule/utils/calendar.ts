import dayjs, { Dayjs } from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import type { ScheduleEvent } from "../types";

dayjs.extend(isoWeek);

/** Default visible calendar window. Components can override it from local prefs. */
export const HOURS = Array.from({ length: 16 }, (_, i) => i + 7); // 07:00–23:00

/** Pixel offset of "now" within the hour grid; clamped to grid bounds. */
export const nowScrollTop = (
  hourHeight: number,
  pad = 48,
  hours: number[] = HOURS,
) => {
  const now = dayjs();
  const h = now.hour() + now.minute() / 60;
  const start = hours[0] ?? 7;
  const end = (hours[hours.length - 1] ?? 22) + 1;
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
  const n = typeof amount === "number" ? amount : Number(amount);
  const safe = Number.isFinite(n) ? n : 0;
  try {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: String(currency || "RUB"),
      maximumFractionDigits: 0,
    }).format(safe);
  } catch {
    return `${safe} ${currency || "RUB"}`;
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
  if (typeof value === "number" && Number.isFinite(value) && value !== 0) {
    return [{ currency: fallbackCurrency, amount: value }];
  }
  return [];
};

/**
 * Prefer multi-currency breakdown; fall back to legacy numeric total.
 * Works with both old backends (numbers only) and new (`by_currency`).
 */
export const resolveStatsMoney = (
  byCurrency: MoneyByCurrency[] | null | undefined,
  legacy: number | MoneyByCurrency[] | null | undefined,
  fallbackCurrency = "RUB",
): MoneyByCurrency[] => {
  if (Array.isArray(byCurrency) && byCurrency.length) {
    return asMoneyList(byCurrency, fallbackCurrency);
  }
  if (Array.isArray(legacy)) {
    return asMoneyList(legacy, fallbackCurrency);
  }
  return asMoneyList(legacy ?? 0, fallbackCurrency);
};

export const formatMoneyList = (
  value: number | MoneyByCurrency[] | null | undefined,
  fallbackCurrency = "RUB",
) => {
  const list = asMoneyList(value, fallbackCurrency);
  if (!list.length) return formatMoney(0, fallbackCurrency);
  return list.map((row) => formatMoney(row.amount, row.currency)).join(" · ");
};
