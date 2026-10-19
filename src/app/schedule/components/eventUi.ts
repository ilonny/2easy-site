import i18n from "@/i18n/config";
import type { ScheduleEvent } from "../types";

export {
  colorForStudent,
  colorsForEvent,
  backgroundForColors,
  eventStudentIds,
} from "../types";

export const formatMoneySafe = (
  amount: number,
  currency = "RUB",
) =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount || 0);

/** Placeholder labels like "Ученик #51" / "Ученик 51" / "#51" — not a real FIO. */
export const isPlaceholderStudentName = (name?: string | null) => {
  const t = String(name || "").trim();
  if (!t) return true;
  return /^(ученик|student)\s*#?\s*\d+$/i.test(t) || /^#\d+$/.test(t);
};

export const eventStudentLabel = (
  event: ScheduleEvent,
  nameById?: Map<number, string>,
) => {
  const ids =
    Array.isArray(event.student_ids) && event.student_ids.length
      ? event.student_ids
      : event.student_id
        ? [event.student_id]
        : [];

  if (nameById?.size && ids.length) {
    const resolved = ids
      .map((id) => {
        const fromMap = String(nameById.get(Number(id)) || "").trim();
        if (fromMap && !isPlaceholderStudentName(fromMap)) return fromMap;
        return "";
      })
      .filter(Boolean);
    if (resolved.length) return resolved.join(", ");
  }

  const fromApi = (
    event.student_names?.filter((n) => !isPlaceholderStudentName(n)).join(", ") ||
    (isPlaceholderStudentName(event.student_name) ? "" : event.student_name) ||
    ""
  ).trim();
  return fromApi;
};

export const eventPlaceLabel = (event: ScheduleEvent) => {
  if (event.type === "payment") return "";
  if (event.location_type === "lesson") {
    return String(event.lesson_title || "").trim();
  }
  return String(event.location_text || "").trim();
};

const isGenericTitle = (title?: string | null) => {
  const t = String(title || "").trim();
  if (!t) return true;
  const generic = i18n.t("schedule.defaultLessonTitle");
  return t === generic || /^Занятие$/i.test(t) || /^Lesson$/i.test(t);
};

/** e.g. "2/8" or "2/8 · 1/10" for multi-student packages */
export const packageProgressLabel = (event: ScheduleEvent) => {
  const rows = event.package_progress;
  if (!Array.isArray(rows) || !rows.length) return "";
  return rows
    .map((row) => {
      const index = Number(row.index);
      const total = Number(row.total);
      if (!Number.isFinite(index) || !Number.isFinite(total) || total < 1) {
        return "";
      }
      return `${index}/${total}`;
    })
    .filter(Boolean)
    .join(" · ");
};

/** Primary/secondary lines for calendar event plaques. */
export const eventChipText = (
  event: ScheduleEvent,
  opts?: {
    detailed?: boolean;
    time?: string;
    nameById?: Map<number, string>;
  },
) => {
  const time = opts?.time || "";
  if (event.type === "payment") {
    const student = eventStudentLabel(event, opts?.nameById);
    const amount =
      event.amount != null
        ? formatMoneySafe(Number(event.amount), event.currency || "RUB")
        : "";
    const prefix = event.is_overdue
      ? i18n.t("schedule.paymentOverdueShort")
      : i18n.t("schedule.paymentMarker");
    const primary = student ? `${prefix}: ${student}` : prefix;
    const secondary = [
      time,
      amount,
      event.is_overdue ? i18n.t("schedule.askForPayment") : "",
    ]
      .filter(Boolean)
      .join(" · ");
    const titleAttr = [primary, secondary].filter(Boolean).join(" · ");
    return { primary, secondary, titleAttr };
  }

  const students = eventStudentLabel(event, opts?.nameById);
  const rawTitle = String(event.title || "").trim();
  const customTitle =
    isGenericTitle(rawTitle) ||
    isPlaceholderStudentName(rawTitle) ||
    (students && rawTitle.toLowerCase() === students.toLowerCase())
      ? ""
      : rawTitle;
  const place = eventPlaceLabel(event);
  const packageLabel = packageProgressLabel(event);
  const nameOrTitle =
    students || customTitle || i18n.t("schedule.defaultLessonTitle");

  if (!opts?.detailed) {
    const primary = [time, nameOrTitle, packageLabel]
      .filter(Boolean)
      .join(" ");
    return { primary, secondary: "", titleAttr: primary };
  }

  const primary = [time, nameOrTitle, packageLabel]
    .filter(Boolean)
    .join(" ");
  const secondary = [students ? customTitle : "", place]
    .filter(Boolean)
    .join(" · ");
  const titleAttr = [primary, secondary].filter(Boolean).join(" · ");
  return { primary, secondary, titleAttr };
};

/** Min plaque height so two text lines stay readable. */
export const eventMinHeight = (event: ScheduleEvent, hourHeight: number) => {
  if (event.type === "payment") return Math.max(52, Math.round(hourHeight * 0.85));
  return 34;
};
